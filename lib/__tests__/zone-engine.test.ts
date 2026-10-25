import { describe, it } from 'node:test'
import assert from 'node:assert'
import { calculateZone, clamp } from '../zone-engine.ts'
import type { Transaction } from '../types.ts'

function makeTransactions(amounts: number[]): Transaction[] {
  return amounts.map((amount, idx) => ({
    id: `tx-${idx}`,
    description: `Tx ${idx}`,
    category: 'other',
    amount,
    date: '2026-10-25T12:00:00Z',
    source: 'bank',
  }))
}

describe('BUNO Runway Bar — Zone Engine & Regression Tests', () => {
  const BUDGET = 25000

  it('Verifies Table Row 1: Spent ₹0, Remaining ₹25,000 => Fill 100%, State Safe', () => {
    const res = calculateZone(BUDGET, makeTransactions([0]))
    assert.strictEqual(res.spent, 0)
    assert.strictEqual(res.remaining, 25000)
    assert.strictEqual(res.fillPct, 100)
    assert.strictEqual(res.pctSpent, 0)
    assert.strictEqual(res.zone, 'safe')
    assert.strictEqual(res.state, 'safe')
    assert.strictEqual(res.isDepleted, false)
    assert.strictEqual(res.isOverspent, false)
    assert.strictEqual(res.overspent, 0)
  })

  it('Verifies Table Row 2: Spent ₹10,000, Remaining ₹15,000 => Fill 60%, State Cautious', () => {
    const res = calculateZone(BUDGET, makeTransactions([10000]))
    assert.strictEqual(res.spent, 10000)
    assert.strictEqual(res.remaining, 15000)
    assert.strictEqual(res.fillPct, 60)
    assert.strictEqual(res.pctRemaining, 60)
    assert.strictEqual(res.zone, 'cautious')
    assert.strictEqual(res.state, 'cautious')
    assert.strictEqual(res.isDepleted, false)
    assert.strictEqual(res.isOverspent, false)
  })

  it('Verifies Table Row 3: Spent ₹20,000, Remaining ₹5,000 => Fill 20%, State Cautious', () => {
    const res = calculateZone(BUDGET, makeTransactions([20000]))
    assert.strictEqual(res.spent, 20000)
    assert.strictEqual(res.remaining, 5000)
    assert.strictEqual(res.fillPct, 20)
    assert.strictEqual(res.pctRemaining, 20)
    assert.strictEqual(res.zone, 'cautious')
    assert.strictEqual(res.state, 'cautious')
    assert.strictEqual(res.isDepleted, false)
    assert.strictEqual(res.isOverspent, false)
  })

  it('Verifies Table Row 4: Spent ₹22,000, Remaining ₹3,000 => Fill 12%, State Danger', () => {
    const res = calculateZone(BUDGET, makeTransactions([22000]))
    assert.strictEqual(res.spent, 22000)
    assert.strictEqual(res.remaining, 3000)
    assert.strictEqual(res.fillPct, 12)
    assert.strictEqual(res.pctRemaining, 12)
    assert.strictEqual(res.zone, 'critical') // Critical is the danger zone
    assert.strictEqual(res.state, 'danger')
    assert.strictEqual(res.isDepleted, false)
    assert.strictEqual(res.isOverspent, false)
  })

  it('Verifies Table Row 5: Spent ₹24,999, Remaining ₹1 => Fill 0.004%, State Danger (NOT Depleted)', () => {
    const res = calculateZone(BUDGET, makeTransactions([24999]))
    assert.strictEqual(res.spent, 24999)
    assert.strictEqual(res.remaining, 1)
    const expectedPct = (1 / 25000) * 100 // 0.004
    assert.strictEqual(res.fillPct, expectedPct)
    assert.strictEqual(res.pctRemaining, expectedPct)
    assert.strictEqual(res.zone, 'critical')
    // Crucial requirement: The ₹24,999 case must remain in Danger rather than Depleted, even if fill appears nearly empty
    assert.strictEqual(res.state, 'danger')
    assert.strictEqual(res.isDepleted, false)
    assert.strictEqual(res.isOverspent, false)
  })

  it('Verifies Table Row 6: Spent ₹25,000, Remaining ₹0 => Fill 0%, State Depleted', () => {
    const res = calculateZone(BUDGET, makeTransactions([25000]))
    assert.strictEqual(res.spent, 25000)
    assert.strictEqual(res.remaining, 0)
    assert.strictEqual(res.fillPct, 0)
    assert.strictEqual(res.pctRemaining, 0)
    assert.strictEqual(res.zone, 'critical')
    assert.strictEqual(res.state, 'depleted')
    assert.strictEqual(res.isDepleted, true)
    assert.strictEqual(res.isOverspent, false)
    assert.strictEqual(res.overspent, 0)
  })

  it('Verifies Table Row 7: Spent ₹27,000, Remaining −₹2,000 => Fill 0%, State Overspent', () => {
    const res = calculateZone(BUDGET, makeTransactions([27000]))
    assert.strictEqual(res.spent, 27000)
    assert.strictEqual(res.remaining, -2000)
    assert.strictEqual(res.fillPct, 0) // Clamped at 0%
    assert.strictEqual(res.zone, 'critical')
    assert.strictEqual(res.state, 'overspent')
    assert.strictEqual(res.isDepleted, false)
    assert.strictEqual(res.isOverspent, true)
    assert.strictEqual(res.overspent, 2000) // Available for display
  })

  it('Verifies boundary edge cases at exactly 60% and 20%', () => {
    // Exactly 60.0001% is Safe
    const resAbove60 = calculateZone(10000, makeTransactions([3999])) // 60.01% remaining
    assert.strictEqual(resAbove60.zone, 'safe')
    assert.strictEqual(resAbove60.state, 'safe')

    // Exactly 60% is Cautious
    const resExact60 = calculateZone(10000, makeTransactions([4000])) // 60% remaining
    assert.strictEqual(resExact60.zone, 'cautious')
    assert.strictEqual(resExact60.state, 'cautious')

    // Exactly 20% is Cautious
    const resExact20 = calculateZone(10000, makeTransactions([8000])) // 20% remaining
    assert.strictEqual(resExact20.zone, 'cautious')
    assert.strictEqual(resExact20.state, 'cautious')

    // Exactly 19.99% is Danger
    const resBelow20 = calculateZone(10000, makeTransactions([8001])) // 19.99% remaining
    assert.strictEqual(resBelow20.zone, 'critical')
    assert.strictEqual(resBelow20.state, 'danger')
  })

  it('Verifies refunds restore the runway health and remove overspending warnings', () => {
    // Start overspent: ₹27,000 spent on ₹25,000 budget
    const overspentTx = makeTransactions([27000])
    const resOverspent = calculateZone(BUDGET, overspentTx)
    assert.strictEqual(resOverspent.state, 'overspent')
    assert.strictEqual(resOverspent.fillPct, 0)
    assert.strictEqual(resOverspent.isOverspent, true)

    // Add refund of ₹3,000 -> spending drops to ₹24,000, remaining ₹1,000 (4%)
    const withRefund = [
      ...overspentTx,
      {
        id: 'refund-1',
        description: 'Refund',
        category: 'shopping' as const,
        amount: -3000,
        date: '2026-10-25T14:00:00Z',
        source: 'bank' as const,
      },
    ]
    const resRefund1 = calculateZone(BUDGET, withRefund)
    assert.strictEqual(resRefund1.spent, 24000)
    assert.strictEqual(resRefund1.remaining, 1000)
    assert.strictEqual(resRefund1.fillPct, 4)
    assert.strictEqual(resRefund1.isOverspent, false)
    assert.strictEqual(resRefund1.state, 'danger')

    // Add further refund of ₹10,000 -> spending drops to ₹14,000, remaining ₹11,000 (44%)
    const withBigRefund = [
      ...withRefund,
      {
        id: 'refund-2',
        description: 'Big refund',
        category: 'shopping' as const,
        amount: -10000,
        date: '2026-10-25T15:00:00Z',
        source: 'bank' as const,
      },
    ]
    const resRefund2 = calculateZone(BUDGET, withBigRefund)
    assert.strictEqual(resRefund2.spent, 14000)
    assert.strictEqual(resRefund2.remaining, 11000)
    assert.strictEqual(resRefund2.fillPct, 44)
    assert.strictEqual(resRefund2.state, 'cautious')
    assert.strictEqual(resRefund2.zone, 'cautious')
  })

  it('Verifies changing budget updates remaining budget, fill, and state accurately', () => {
    const tx = makeTransactions([12000])

    // Budget ₹15,000 => Remaining ₹3,000 (20%) => Cautious
    const res1 = calculateZone(15000, tx)
    assert.strictEqual(res1.remaining, 3000)
    assert.strictEqual(res1.fillPct, 20)
    assert.strictEqual(res1.state, 'cautious')

    // Changed to Budget ₹40,000 => Remaining ₹28,000 (70%) => Safe
    const res2 = calculateZone(40000, tx)
    assert.strictEqual(res2.remaining, 28000)
    assert.strictEqual(res2.fillPct, 70)
    assert.strictEqual(res2.state, 'safe')

    // Changed to Budget ₹10,000 => Remaining -₹2,000 => Overspent
    const res3 = calculateZone(10000, tx)
    assert.strictEqual(res3.remaining, -2000)
    assert.strictEqual(res3.fillPct, 0)
    assert.strictEqual(res3.state, 'overspent')
    assert.strictEqual(res3.overspent, 2000)
  })

  it('Verifies clamp utility behavior', () => {
    assert.strictEqual(clamp(-10, 0, 100), 0)
    assert.strictEqual(clamp(0, 0, 100), 0)
    assert.strictEqual(clamp(50, 0, 100), 50)
    assert.strictEqual(clamp(100, 0, 100), 100)
    assert.strictEqual(clamp(120, 0, 100), 100)
  })
})
