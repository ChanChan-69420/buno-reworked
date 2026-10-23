'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { CAUTIOUS_THRESHOLD, SAFE_THRESHOLD } from '@/lib/zone-engine'

const SAFE_END = 100 - SAFE_THRESHOLD
const CAUTIOUS_END = 100 - CAUTIOUS_THRESHOLD

export function RunwayBar({ pctSpent }: { pctSpent: number }) {
  const fillRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    const markerLeft = Math.min(97, Math.max(3, pctSpent))

    const ctx = gsap.context(() => {
      const duration = reduceMotion ? 0 : 1.4
      gsap.to(fillRef.current, {
        width: `${pctSpent}%`,
        duration,
        ease: 'power3.out',
      })
      gsap.to(markerRef.current, {
        left: `${markerLeft}%`,
        opacity: 1,
        duration,
        ease: 'power3.out',
      })
    })

    return () => ctx.revert()
  }, [pctSpent])

  return (
    <div
      role="meter"
      aria-label="Budget runway used"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pctSpent)}
      aria-valuetext="Runway progress shown by zone"
      className="relative h-11 rounded-full border-[3px] border-panel-foreground/90"
    >
      <div className="runway-track absolute inset-0 overflow-hidden rounded-full">
        <div ref={fillRef} className="runway-fill h-full w-0" />
        <span
          aria-hidden="true"
          className="absolute inset-y-0 border-l border-dashed border-panel-foreground/35"
          style={{ left: `${SAFE_END}%` }}
        />
        <span
          aria-hidden="true"
          className="absolute inset-y-0 border-l border-dashed border-panel-foreground/35"
          style={{ left: `${CAUTIOUS_END}%` }}
        />
      </div>
      <div
        ref={markerRef}
        aria-hidden="true"
        className="absolute top-1/2 left-[3%] size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-panel bg-panel-foreground opacity-0 shadow-md"
      />
    </div>
  )
}
