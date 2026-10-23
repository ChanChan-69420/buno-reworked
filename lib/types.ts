export type Category =
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

export interface ZoneResult {
  spent: number
  remaining: number
  pctSpent: number
  pctRemaining: number
  zone: ZoneId
}
