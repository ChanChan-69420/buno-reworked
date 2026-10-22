import {
  Car,
  Clapperboard,
  Home,
  Package,
  ShoppingBag,
  Utensils,
  type LucideIcon,
} from 'lucide-react'
import type { InsightCategory } from '@/lib/spending-insights'

const CATEGORY_META: Record<
  InsightCategory,
  { label: string; icon: LucideIcon; color: string }
> = {
  housing: { label: 'Housing & Bills', icon: Home, color: '#7a4a2a' },
  food: { label: 'Food', icon: Utensils, color: '#c98a4a' },
  transport: { label: 'Transport', icon: Car, color: '#6f8f5e' },
  shopping: { label: 'Shopping', icon: ShoppingBag, color: '#b5735a' },
  entertainment: { label: 'Entertainment', icon: Clapperboard, color: '#d1a85a' },
  other: { label: 'Others', icon: Package, color: '#9c8a78' },
}

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

function formatPercent(percent: number) {
  if (percent === 0) return '0%'
  if (percent < 1) return '<1%'
  return `${Math.round(percent)}%`
}

export function CategorySpendingPanel({
  total,
  items,
}: {
  total: number
  items: { category: InsightCategory; amount: number; percent: number }[]
}) {
  return (
    <section
      aria-labelledby="category-spending-title"
      className="insight-panel rounded-3xl bg-card px-5 py-4 text-card-foreground shadow-xl shadow-black/25 sm:px-6"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 id="category-spending-title" className="font-serif text-lg font-medium">
          Spending by Category
        </h2>
        <span className="shrink-0 rounded-full border border-border bg-tile px-3 py-1 text-xs font-medium text-muted-foreground">
          This Month
        </span>
      </div>

      {total > 0 ? (
        <>
          <div
            aria-hidden="true"
            className="mt-3 flex h-2 w-full gap-0.5 overflow-hidden rounded-full bg-border"
          >
            {items
              .filter((item) => item.amount > 0)
              .map((item) => (
                <span
                  key={item.category}
                  className="h-full first:rounded-l-full last:rounded-r-full"
                  style={{
                    width: `${item.percent}%`,
                    backgroundColor: CATEGORY_META[item.category].color,
                  }}
                />
              ))}
          </div>

          <ul className="mt-4 grid grid-cols-3 gap-x-2 gap-y-4 sm:grid-cols-6">
            {items.map((item) => {
              const meta = CATEGORY_META[item.category]
              const Icon = meta.icon
              return (
                <li
                  key={item.category}
                  className="flex min-w-0 flex-col items-center gap-1 text-center"
                  title={`${meta.label}: ${currency.format(item.amount)}`}
                >
                  <span
                    className="flex size-9 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${meta.color}1f`, color: meta.color }}
                  >
                    <Icon aria-hidden="true" className="size-4" strokeWidth={1.8} />
                  </span>
                  <span className="text-base font-semibold tabular-nums">
                    {formatPercent(item.percent)}
                  </span>
                  <span className="w-full text-xs leading-tight text-balance text-muted-foreground">
                    {meta.label}
                  </span>
                  <span className="sr-only">{currency.format(item.amount)}</span>
                </li>
              )
            })}
          </ul>
        </>
      ) : (
        <p className="mt-3 rounded-2xl bg-tile px-4 py-6 text-center text-sm text-muted-foreground">
          No expenses recorded this month yet.
        </p>
      )}
    </section>
  )
}
