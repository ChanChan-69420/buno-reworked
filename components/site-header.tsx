import { ZONE_COPY, ZONE_TONE } from '@/lib/zone-copy'
import type { ZoneId } from '@/lib/types'

export function SiteHeader({ zone }: { zone: ZoneId }) {
  const copy = ZONE_COPY[zone]
  const tone = ZONE_TONE[zone]

  return (
    <header className="w-full max-w-3xl rounded-full border border-white/50 bg-card/55 px-4 py-3 shadow-lg shadow-black/10 backdrop-blur-md sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background font-serif text-lg font-semibold text-card"
          >
            B
          </span>
          <span className="font-serif text-xl font-semibold text-foreground">
            Buno
          </span>
          <span className="hidden truncate font-serif text-sm italic text-muted-foreground/80 sm:inline">
            Sanctuary
          </span>
        </div>

        <p className="flex shrink-0 items-center gap-2 rounded-full border border-safe/25 bg-card/60 px-4 py-1.5 text-sm text-foreground">
          <span
            aria-hidden="true"
            className={`size-2 rounded-full ${tone.dot}`}
          />
          <span className="sr-only">Current zone: </span>
          {copy.label.replace('Cautious Zone', 'Cautious').replace('Critical Reserve', 'Critical')}
        </p>
      </div>
    </header>
  )
}
