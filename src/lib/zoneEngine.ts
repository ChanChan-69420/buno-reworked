import type { Transaction, ZoneCalculation, ZoneType } from '../types';

export function calculateZone(budget: number, transactions: Transaction[]): ZoneCalculation {
  const spent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const remaining = budget - spent;
  const pct = budget > 0 ? (remaining / budget) * 100 : 0;

  let zone: ZoneType;
  let zoneLabel: string;

  if (pct <= 0) {
    zone = 'depleted';
    zoneLabel = 'Depleted';
  } else if (pct < 20) {
    zone = 'danger';
    zoneLabel = 'Danger';
  } else if (pct <= 60) {
    zone = 'cautious';
    zoneLabel = 'Cautious';
  } else {
    zone = 'safe';
    zoneLabel = 'Safe';
  }

  return {
    budget,
    spent,
    remaining,
    pct,
    zone,
    zoneLabel,
  };
}
