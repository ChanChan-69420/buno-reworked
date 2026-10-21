import type { ZoneType } from '../types';

export const humanNotes: Record<ZoneType, string[]> = {
  safe: [
    "You have plenty of room this month. Take a breath.",
    "Spending is well within your comfort zone. All calm.",
    "Healthy balance remaining. No need to overthink it."
  ],
  cautious: [
    "Pacing is steady, but keep an eye on extras.",
    "Notice where the smaller spends are drifting.",
    "You're in the middle stretch. Mindful choices help."
  ],
  danger: [
    "Running low for this cycle. Prioritize what's essential.",
    "Approaching the limit. Time to slow down spending.",
    "Tight buffer left. Keep non-essentials on hold."
  ],
  depleted: [
    "Budget limit reached for this cycle.",
    "No remaining buffer. Take note and reset next period.",
    "You've crossed your monthly boundary."
  ]
};

export function getRandomNote(zone: ZoneType): string {
  const notes = humanNotes[zone];
  const index = Math.floor(Math.random() * notes.length);
  return notes[index];
}
