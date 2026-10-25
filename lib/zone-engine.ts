import type { BudgetState, Transaction, ZoneId, ZoneResult } from './types'

export const SAFE_THRESHOLD = 60
export const CAUTIOUS_THRESHOLD = 20

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function calculateZone(
  budget: number,
  transactions: Transaction[],
): ZoneResult {
  const spent = transactions.reduce((sum, t) => sum + t.amount, 0)
  const remaining = budget - spent
  const overspent = remaining < 0 ? Math.abs(remaining) : 0

  const rawRemainingPct = budget > 0 ? (remaining / budget) * 100 : 0
  const fillPct = clamp(rawRemainingPct, 0, 100)
  const rawSpentPct = budget > 0 ? (spent / budget) * 100 : 0
  const pctSpent = clamp(rawSpentPct, 0, 100)

  const isDepleted = budget > 0 ? remaining === 0 : spent === 0
  const isOverspent = remaining < 0

  let state: BudgetState
  if (isOverspent) {
    state = 'overspent'
  } else if (isDepleted) {
    state = 'depleted'
  } else if (fillPct > SAFE_THRESHOLD) {
    state = 'safe'
  } else if (fillPct >= CAUTIOUS_THRESHOLD) {
    state = 'cautious'
  } else {
    state = 'danger'
  }

  const zone: ZoneId =
    isOverspent || fillPct < CAUTIOUS_THRESHOLD
      ? 'critical'
      : fillPct > SAFE_THRESHOLD
        ? 'safe'
        : 'cautious'

  return {
    budget,
    spent,
    remaining,
    overspent,
    pctSpent,
    pctRemaining: rawRemainingPct,
    fillPct,
    zone,
    state,
    isDepleted,
    isOverspent,
  }
}
