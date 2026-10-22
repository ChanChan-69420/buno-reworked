import { ZONE_COPY, ZONE_TONE } from '@/lib/zone-copy'
import type { ZoneId } from '@/lib/types'

export function SiteHeader({ zone }: { zone: ZoneId }) {
  const copy = ZONE_COPY[zone]
  const tone = ZONE_TONE[zone]

  return (
    <header className="sanctuary-navbar mt-5 flex h-[68px] min-h-[68px] shrink-0 items-center justify-between rounded-full border border-white/50 bg-card/55 px-4 shadow-lg shadow-black/10 backdrop-blur-md sm:px-6">
      <div className="flex w-full items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-4">
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background font-serif text-lg font-semibold leading-none text-card"
          >
            B
          </span>
          <span className="font-serif text-xl font-semibold leading-none text-foreground">
            Buno
          </span>
          <span className="hidden truncate font-serif text-sm italic leading-none text-muted-foreground/80 sm:inline">
            Sanctuary
          </span>
        </div>

        <p className="m-0 flex shrink-0 items-center gap-2 rounded-full border border-safe/25 bg-card/60 px-4 py-1.5 text-sm leading-none text-foreground">
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
