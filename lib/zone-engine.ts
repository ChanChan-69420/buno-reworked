import type { Transaction, ZoneResult } from './types'

export const SAFE_THRESHOLD = 60
export const CAUTIOUS_THRESHOLD = 20

export function calculateZone(
  budget: number,
  transactions: Transaction[],
): ZoneResult {
  const spent = transactions.reduce((sum, t) => sum + t.amount, 0)
  const remaining = budget - spent
  const pctRemaining = budget > 0 ? (remaining / budget) * 100 : 0
  const pctSpent = Math.min(100, Math.max(0, 100 - pctRemaining))

  const zone =
    pctRemaining > SAFE_THRESHOLD
      ? 'safe'
      : pctRemaining >= CAUTIOUS_THRESHOLD
        ? 'cautious'
        : 'critical'

  return { spent, remaining, pctSpent, pctRemaining, zone }
}
