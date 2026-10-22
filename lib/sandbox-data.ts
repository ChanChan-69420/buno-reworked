import type { Transaction } from './types'

export const MONTHLY_BUDGET = 25000

// Pseudo-bank sandbox: fixed seed so the demo is consistent between loads.
export const SANDBOX_TRANSACTIONS: Transaction[] = [
  { id: 't01', description: 'Swiggy', category: 'food', amount: 640, date: '2026-10-21T20:14:00+05:30', source: 'bank' },
  { id: 't02', description: 'Uber ride', category: 'transport', amount: 285, date: '2026-10-21T09:02:00+05:30', source: 'bank' },
  { id: 't03', description: 'Chai and samosa', category: 'food', amount: 60, date: '2026-10-20T17:30:00+05:30', source: 'cash' },
  { id: 't04', description: 'Amazon', category: 'shopping', amount: 1299, date: '2026-10-19T13:45:00+05:30', source: 'bank' },
  { id: 't05', description: 'Netflix', category: 'entertainment', amount: 649, date: '2026-10-18T00:05:00+05:30', source: 'bank' },
  { id: 't06', description: 'BESCOM electricity', category: 'bills', amount: 1120, date: '2026-10-17T11:20:00+05:30', source: 'bank' },
  { id: 't07', description: 'Zomato', category: 'food', amount: 520, date: '2026-10-16T21:10:00+05:30', source: 'bank' },
  { id: 't08', description: 'Metro card top-up', category: 'transport', amount: 500, date: '2026-10-15T08:40:00+05:30', source: 'bank' },
  { id: 't09', description: 'Auto rickshaw', category: 'transport', amount: 120, date: '2026-10-14T18:05:00+05:30', source: 'cash' },
  { id: 't10', description: 'BookMyShow', category: 'entertainment', amount: 760, date: '2026-10-13T19:30:00+05:30', source: 'bank' },
  { id: 't11', description: 'BigBasket groceries', category: 'food', amount: 1340, date: '2026-10-11T10:15:00+05:30', source: 'bank' },
  { id: 't12', description: 'Airtel recharge', category: 'bills', amount: 399, date: '2026-10-09T09:00:00+05:30', source: 'bank' },
  { id: 't13', description: 'Myntra', category: 'shopping', amount: 899, date: '2026-10-07T16:25:00+05:30', source: 'bank' },
  { id: 't14', description: 'Flower seller', category: 'other', amount: 150, date: '2026-10-06T07:50:00+05:30', source: 'cash' },
  { id: 't15', description: 'Spotify', category: 'entertainment', amount: 119, date: '2026-10-04T00:10:00+05:30', source: 'bank' },
  { id: 't16', description: 'Pharmacy', category: 'other', amount: 380, date: '2026-10-03T12:35:00+05:30', source: 'bank' },
]
