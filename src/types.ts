export type ZoneType = 'safe' | 'cautious' | 'danger' | 'depleted';

export type Category = 'food' | 'transport' | 'shopping' | 'bills' | 'entertainment' | 'other';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category?: Category;
  source: 'bank' | 'cash';
}

export interface ZoneCalculation {
  budget: number;
  spent: number;
  remaining: number;
  pct: number;
  zone: ZoneType;
  zoneLabel: string;
}
