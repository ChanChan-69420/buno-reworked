export type Category =
  | 'housing'
  | 'food'
  | 'transport'
  | 'shopping'
  | 'bills'
  | 'entertainment'
  | 'other'

export type TransactionSource = 'bank' | 'cash'

export interface Transaction {
  id: string
  description: string
  category: Category
  amount: number
  date: string
  source: TransactionSource
}

export type ZoneId = 'safe' | 'cautious' | 'critical'

export type BudgetState = 'safe' | 'cautious' | 'danger' | 'depleted' | 'overspent'

export interface ZoneResult {
  budget: number
  spent: number
  remaining: number
  overspent: number
  pctSpent: number
  pctRemaining: number
  fillPct: number
  zone: ZoneId
  state: BudgetState
  isDepleted: boolean
  isOverspent: boolean
}
