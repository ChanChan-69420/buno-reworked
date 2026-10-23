import { RunwayBar } from '@/components/runway-bar'
import { ZONE_COPY, ZONE_TONE } from '@/lib/zone-copy'
import type { ZoneId } from '@/lib/types'

const LEGEND: { id: ZoneId; dot: string; text: string }[] = [
  { id: 'safe', dot: 'bg-safe-bright', text: 'text-safe-bright' },
  { id: 'cautious', dot: 'bg-caution', text: 'text-caution' },
  { id: 'critical', dot: 'bg-critical', text: 'text-critical' },
]

interface BudgetRangePanelProps {
  zone: ZoneId
  pctSpent: number
}

export function BudgetRangePanel({ zone, pctSpent }: BudgetRangePanelProps) {
  const copy = ZONE_COPY[zone]
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
              <span className={tone.text}>{copy.label}</span>
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

        <RunwayBar pctSpent={pctSpent} />

        <ul className="mt-2 flex items-center justify-between gap-2 border-t border-panel-foreground/10 pt-3 text-xs sm:text-sm">
          {LEGEND.map((item) => (
            <li
              key={item.id}
              className={`flex items-center gap-2 ${item.text} ${
                item.id === zone ? 'font-medium' : 'opacity-70'
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
        {zone === 'safe'
          ? "You’re a safe spender! Keep up the good work."
          : zone === 'cautious'
            ? "You’re entering territory worth being cautious about. Keep an eye on your spending."
            : "Your budget is at risk. Stay alert and spend carefully."}
      </p>

    </div>
  )
}
