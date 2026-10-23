import type { ZoneId } from './types'

export interface ZoneCopy {
  label: string
  mood: string
  headroom: string
  tempoTitle: string
  tempoBody: string
  bufferTitle: string
  bufferBody: string
}

export const ZONE_COPY: Record<ZoneId, ZoneCopy> = {
  safe: {
    label: 'Safe',
    mood: 'Calm & Gentle',
    headroom: 'Ample Headroom',
    tempoTitle: 'Gentle & Steady',
    tempoBody: 'Outflow aligned with peace of mind',
    bufferTitle: 'Safe Buffer Untouched',
    bufferBody: 'Spacious room for living',
  },
  cautious: {
    label: 'Cautious',
    mood: 'Mindful & Measured',
    headroom: 'Narrowing Headroom',
    tempoTitle: 'Brisk & Watchful',
    tempoBody: 'Outflow is outpacing the calm',
    bufferTitle: 'Buffer Thinning',
    bufferBody: 'Room is getting tighter',
  },
  critical: {
    label: 'Danger',
    mood: 'Urgent & Tense',
    headroom: 'Little Headroom',
    tempoTitle: 'Fast & Heavy',
    tempoBody: 'Outflow needs a pause',
    bufferTitle: 'Buffer Nearly Gone',
    bufferBody: 'Only a sliver is left',
  },
}

export const ZONE_TONE: Record<
  ZoneId,
  { dot: string; text: string; onDark: string }
> = {
  safe: { dot: 'bg-safe', text: 'text-safe', onDark: 'text-safe-bright' },
  cautious: {
    dot: 'bg-caution',
    text: 'text-caution-deep',
    onDark: 'text-caution',
  },
  critical: {
    dot: 'bg-critical',
    text: 'text-critical-deep',
    onDark: 'text-critical',
  },
}
