import { CategoryIcon } from '@/components/category-icon'
import type { Transaction } from '@/lib/types'

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: 'Asia/Kolkata',
})

const amountFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export function TransactionsPanel({
  transactions,
}: {
  transactions: Transaction[]
}) {
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  if (sorted.length === 0) {
    return (
      <p className="rounded-2xl bg-tile px-6 py-12 text-center font-serif text-lg text-muted-foreground">
        There are no transactions here. Feel free to spend a little on yourself.
      </p>
    )
  }

  return (
    <section aria-label="Recent transactions">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-medium uppercase tracking-wider text-coffee-label">
          Recent activity
        </h3>
        <p className="text-sm text-muted-foreground">
          {sorted.length} transactions this month
        </p>
      </div>

      <ul
        tabIndex={0}
        aria-label="Transactions, scroll horizontally to browse"
        className="-mx-6 flex snap-x snap-proximity gap-3 overflow-x-auto overscroll-x-contain px-6 pb-3 [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin] scroll-px-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      >
        {sorted.map((t) => (
          <li
            key={t.id}
            className="flex min-h-40 w-48 shrink-0 snap-start flex-col justify-between gap-3 rounded-2xl bg-tile p-4 shadow-sm shadow-black/5"
          >
            <div className="flex items-start justify-between gap-2">
              <CategoryIcon category={t.category} />
              <span
                className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                  t.source === 'bank'
                    ? 'border-border bg-card text-muted-foreground'
                    : 'border-primary/40 bg-primary/10 text-coffee-label'
                }`}
              >
                {t.source === 'bank' ? 'Bank' : 'Cash'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="line-clamp-2 min-h-10 break-words font-medium leading-5">
                {t.description}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {dateFormatter.format(new Date(t.date))}
              </p>
            </div>
            <p className="text-lg font-medium tabular-nums">
              {amountFormatter.format(t.amount)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
