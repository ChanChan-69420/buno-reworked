import type { Category, Transaction } from './types'

const TIME_ZONE = 'Asia/Kolkata'

const partsFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
})

export interface CalendarDay {
  year: number
  month: number
  day: number
}

export function toCalendarDay(date: Date): CalendarDay {
  const parts = partsFormatter.formatToParts(date)
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0)
  return { year: get('year'), month: get('month'), day: get('day') }
}

export function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

export function previousMonth(year: number, month: number) {
  return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 }
}

function isExpense(t: Transaction) {
  return Number.isFinite(t.amount) && t.amount > 0
}

function expensesInMonth(
  transactions: Transaction[],
  year: number,
  month: number,
) {
  return transactions.filter((t) => {
    if (!isExpense(t)) return false
    const d = toCalendarDay(new Date(t.date))
    return d.year === year && d.month === month
  })
}

export interface MonthSeries {
  year: number
  month: number
  totalDays: number
  points: { day: number; cumulative: number }[]
  total: number
  hasData: boolean
}

function cumulativeSeries(
  transactions: Transaction[],
  year: number,
  month: number,
  throughDay: number,
): MonthSeries {
  const totalDays = daysInMonth(year, month)
  const lastDay = Math.min(throughDay, totalDays)
  const daily = new Array<number>(totalDays + 1).fill(0)
  const expenses = expensesInMonth(transactions, year, month)

  for (const t of expenses) {
    const { day } = toCalendarDay(new Date(t.date))
    if (day <= lastDay) daily[day] += t.amount
  }

  const points: MonthSeries['points'] = []
  let running = 0
  for (let day = 1; day <= lastDay; day++) {
    running += daily[day]
    points.push({ day, cumulative: running })
  }

  return {
    year,
    month,
    totalDays,
    points,
    total: running,
    hasData: expenses.length > 0,
  }
}

export function monthComparison(transactions: Transaction[], today: Date) {
  const now = toCalendarDay(today)
  const prev = previousMonth(now.year, now.month)
  return {
    current: cumulativeSeries(transactions, now.year, now.month, now.day),
    previous: cumulativeSeries(
      transactions,
      prev.year,
      prev.month,
      daysInMonth(prev.year, prev.month),
    ),
  }
}

export type InsightCategory =
  | 'housing'
  | 'food'
  | 'transport'
  | 'shopping'
  | 'entertainment'
  | 'other'

const CATEGORY_GROUP: Record<Category, InsightCategory> = {
  bills: 'housing',
  food: 'food',
  transport: 'transport',
  shopping: 'shopping',
  entertainment: 'entertainment',
  other: 'other',
}

export const INSIGHT_CATEGORIES: InsightCategory[] = [
  'housing',
  'food',
  'transport',
  'shopping',
  'entertainment',
  'other',
]

export function categoryBreakdown(transactions: Transaction[], today: Date) {
  const now = toCalendarDay(today)
  const expenses = expensesInMonth(transactions, now.year, now.month)
  const totals = Object.fromEntries(
    INSIGHT_CATEGORIES.map((c) => [c, 0]),
  ) as Record<InsightCategory, number>

  for (const t of expenses) totals[CATEGORY_GROUP[t.category]] += t.amount

  const total = expenses.reduce((sum, t) => sum + t.amount, 0)

  return {
    total,
    items: INSIGHT_CATEGORIES.map((category) => ({
      category,
      amount: totals[category],
      percent: total > 0 ? (totals[category] / total) * 100 : 0,
    })),
  }
}
