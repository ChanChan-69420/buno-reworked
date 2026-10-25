import { RunwayBar } from '@/components/runway-bar'
import { ZONE_COPY, ZONE_TONE } from '@/lib/zone-copy'
import type { BudgetState, ZoneId } from '@/lib/types'

// Reordered from left to right as Danger → Cautious → Safe
// Left represents depleted funds (0%), right represents full budget (100%)
const LEGEND: { id: ZoneId; dot: string; text: string }[] = [
  { id: 'critical', dot: 'bg-critical', text: 'text-critical' },
  { id: 'cautious', dot: 'bg-caution', text: 'text-caution' },
  { id: 'safe', dot: 'bg-safe-bright', text: 'text-safe-bright' },
]

export interface BudgetRangePanelProps {
  zone: ZoneId
  pctSpent?: number
  remainingPct?: number
  remaining?: number
  spent?: number
  budget?: number
  state?: BudgetState
  overspent?: number
}

export function BudgetRangePanel({
  zone,
  pctSpent,
  remainingPct,
  remaining,
  spent,
  budget,
  state,
  overspent = 0,
}: BudgetRangePanelProps) {
  // If remainingPct not supplied directly, infer from pctSpent
  const effectiveRemainingPct =
    typeof remainingPct === 'number'
      ? remainingPct
      : typeof pctSpent === 'number'
        ? Math.max(0, 100 - pctSpent)
        : 100

  // Resolve status label
  const statusLabel =
    state === 'overspent'
      ? 'OVER BUDGET'
      : state === 'depleted'
        ? 'DEPLETED'
        : ZONE_COPY[zone].label

  const tone = ZONE_TONE[zone]

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-3 font-serif text-2xl font-medium sm:text-[1.7rem]">
            <span
              aria-hidden="true"
              className={`size-3 shrink-0 rounded-full ${tone.dot}`}
            />
            <span>
              Currently:{' '}
              <span className={tone.text}>{statusLabel}</span>
            </span>
          </p>
        </div>
      </div>

      <section
        aria-label="Budget bar"
        className="rounded-2xl bg-panel p-4 text-panel-foreground shadow-md sm:p-4"
      >
        <div className="mb-2 flex items-center justify-between gap-3">
          <h3 className="text-sm font-medium uppercase tracking-wider text-panel-foreground/90">
            Budget Bar
          </h3>
        </div>

        <RunwayBar
          remainingPct={effectiveRemainingPct}
          zone={zone}
          state={state}
          overspentAmount={overspent}
          pctSpent={pctSpent}
        />

        <ul className="mt-2.5 flex items-center justify-between gap-2 border-t border-panel-foreground/10 pt-3 text-xs sm:text-sm">
          {LEGEND.map((item) => (
            <li
              key={item.id}
              className={`flex items-center gap-2 ${item.text} ${
                item.id === zone ? 'font-medium opacity-100' : 'opacity-65'
              }`}
            >
              <span
                aria-hidden="true"
                className={`size-1.5 rounded-full ${item.dot}`}
              />
              {ZONE_COPY[item.id].label}
            </li>
          ))}
        </ul>
      </section>

      <p className={`px-2 text-center text-sm leading-6 ${tone.text}`}>
        {state === 'overspent'
          ? `You have exceeded your monthly budget by ₹${Math.round(overspent).toLocaleString('en-IN')}. Pause non-essential spending.`
          : state === 'depleted'
            ? 'Your monthly budget has run out. 100% of your budget has been spent.'
            : zone === 'safe'
              ? 'You’re a safe spender! Keep up the good work.'
              : zone === 'cautious'
                ? 'Your remaining budget is narrowing. Keep an eye on your spending.'
                : 'Your budget is at risk. Stay alert and spend carefully.'}
      </p>
    </div>
  )
}
