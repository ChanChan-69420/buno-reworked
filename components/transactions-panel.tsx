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

      <ul className="flex max-h-[26rem] flex-col gap-2 overflow-y-auto pr-1">
        {sorted.map((t) => (
          <li
            key={t.id}
            className="flex items-center gap-4 rounded-2xl bg-tile px-4 py-3 shadow-sm shadow-black/5"
          >
            <CategoryIcon category={t.category} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{t.description}</p>
              <p className="text-sm text-muted-foreground">
                {dateFormatter.format(new Date(t.date))}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                t.source === 'bank'
                  ? 'border-border bg-card text-muted-foreground'
                  : 'border-primary/40 bg-primary/10 text-coffee-label'
              }`}
            >
              {t.source === 'bank' ? 'Bank' : 'Cash'}
            </span>
            <p className="w-20 shrink-0 text-right font-medium tabular-nums">
              {amountFormatter.format(t.amount)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
