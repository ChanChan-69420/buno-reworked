import { CircleAlert, CircleCheck, Sprout } from 'lucide-react'
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
  const HeadroomIcon = zone === 'safe' ? CircleCheck : CircleAlert

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Current Zone Status</p>
          <p className="mt-1 flex items-center gap-3 font-serif text-2xl font-medium sm:text-[1.7rem]">
            <span
              aria-hidden="true"
              className={`size-3 shrink-0 rounded-full ${tone.dot}`}
            />
            <span>
              Currently in:{' '}
              <span className={tone.text}>{copy.label}</span>
            </span>
          </p>
        </div>
        <p className="flex items-center gap-2 rounded-full border border-border bg-primary/10 px-4 py-2 text-sm font-medium">
          <Sprout aria-hidden="true" className="size-4 text-muted-foreground" />
          {copy.mood}
        </p>
      </div>

      <section
        aria-label="Chalk runway horizon"
        className="rounded-2xl bg-panel p-4 text-panel-foreground shadow-md sm:p-4"
      >
        <div className="mb-2 flex items-center justify-between gap-3">
          <h3 className="text-sm font-medium uppercase tracking-wider text-panel-foreground/90">
            Chalk Runway Horizon
          </h3>
          <p className="flex items-center gap-2 text-sm">
            <HeadroomIcon aria-hidden="true" className="size-4" />
            {copy.headroom}
          </p>
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

      <div className="grid grid-cols-2 gap-2">
        <article className="rounded-2xl bg-tile p-2.5 shadow-sm shadow-black/5">
          <h4 className="text-xs font-medium uppercase tracking-wider text-coffee-label">
            Burn Tempo
          </h4>
          <p className="mt-2 text-lg font-medium">{copy.tempoTitle}</p>
          <p className="mt-1 text-sm text-muted-foreground">{copy.tempoBody}</p>
        </article>
        <article className="rounded-2xl bg-tile p-2.5 shadow-sm shadow-black/5">
          <h4 className="text-xs font-medium uppercase tracking-wider text-coffee-label">
            Buffer Cushion
          </h4>
          <p className={`mt-2 text-lg font-medium ${tone.text}`}>
            {copy.bufferTitle}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {copy.bufferBody}
          </p>
        </article>
      </div>
    </div>
  )
}
