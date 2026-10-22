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
  housing: { label: 'Housing', icon: Home, color: '#7a4a2a' },
  food: { label: 'Food', icon: Utensils, color: '#c98a4a' },
  transport: { label: 'Transport', icon: Car, color: '#6f8f5e' },
  shopping: { label: 'Shopping', icon: ShoppingBag, color: '#c0788b' },
  entertainment: { label: 'Entertainment', icon: Clapperboard, color: '#8d7aa8' },
  other: { label: 'Others', icon: Package, color: '#9c8a78' },
}

function shareLabel(percent: number) {
  if (percent <= 0) return 'None'
  if (percent < 10) return 'Small'
  if (percent < 20) return 'Modest'
  if (percent < 35) return 'Moderate'
  if (percent < 50) return 'Large'
  return 'Dominant'
}

export function CategorySpendingPanel({
  total,
  items,
}: {
  total: number
  items: { category: InsightCategory; amount: number; percent: number }[]
}) {
  const maxPercent = Math.max(...items.map((item) => item.percent), 1)

  return (
    <section
      aria-labelledby="category-spending-title"
      className="flex h-full flex-col rounded-3xl bg-card px-5 py-4 text-card-foreground shadow-xl shadow-black/25 sm:px-6"
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
        <ul className="mt-3 grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-6">
          {items.map((item) => {
            const meta = CATEGORY_META[item.category]
            const Icon = meta.icon
            const fill = item.percent > 0 ? Math.max(10, (item.percent / maxPercent) * 100) : 0
            return (
              <li
                key={item.category}
                className="flex min-w-0 flex-col items-center gap-1.5 text-center"
              >
                <span
                  className="flex size-9 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${meta.color}26`, color: meta.color }}
                >
                  <Icon aria-hidden="true" className="size-4" strokeWidth={1.8} />
                </span>
                <span className="w-full truncate text-xs font-medium">{meta.label}</span>
                <span
                  aria-hidden="true"
                  className="h-1.5 w-full overflow-hidden rounded-full bg-border"
                >
                  <span
                    className="block h-full rounded-full"
                    style={{ width: `${fill}%`, backgroundColor: meta.color }}
                  />
                </span>
                <span className="text-xs text-muted-foreground">{shareLabel(item.percent)}</span>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="mt-3 rounded-2xl bg-tile px-4 py-6 text-center text-sm text-muted-foreground">
          No expenses recorded this month yet.
        </p>
      )}
    </section>
  )
}
