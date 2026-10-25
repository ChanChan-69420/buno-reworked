'use client'

import { useEffect, useMemo, useRef } from 'react'
import gsap from 'gsap'
import { CAUTIOUS_THRESHOLD, SAFE_THRESHOLD, clamp } from '@/lib/zone-engine'
import { ZONE_COLORS } from '@/lib/zone-copy'
import type { BudgetState, ZoneId } from '@/lib/types'

export interface RunwayBarProps {
  remainingPct?: number
  zone?: ZoneId
  state?: BudgetState
  overspentAmount?: number
  /** Deprecated: maintained for backward compatibility */
  pctSpent?: number
}

// Module-level cache of last rendered fill percentage to avoid stale visual jumps on tab navigation
let moduleLastRenderedPct: number | null = null

export function RunwayBar({
  remainingPct,
  zone,
  state,
  overspentAmount = 0,
  pctSpent,
}: RunwayBarProps) {
  const fillRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLDivElement>(null)
  const isMountedRef = useRef(false)

  // Determine clamped remaining percentage (0 to 100)
  const fillPct = useMemo(() => {
    if (typeof remainingPct === 'number') {
      return clamp(remainingPct, 0, 100)
    }
    if (typeof pctSpent === 'number') {
      return clamp(100 - pctSpent, 0, 100)
    }
    return 100
  }, [remainingPct, pctSpent])

  // Resolve active zone
  const resolvedZone: ZoneId = useMemo(() => {
    if (zone) return zone
    if (state === 'overspent') return 'critical'
    if (fillPct > SAFE_THRESHOLD) return 'safe'
    if (fillPct >= CAUTIOUS_THRESHOLD) return 'cautious'
    return 'critical'
  }, [zone, state, fillPct])

  // Resolve active state
  const resolvedState: BudgetState = useMemo(() => {
    if (state) return state
    if (overspentAmount > 0) return 'overspent'
    if (
      fillPct === 0 &&
      (remainingPct === 0 || (typeof pctSpent === 'number' && pctSpent >= 100))
    ) {
      return 'depleted'
    }
    if (fillPct > SAFE_THRESHOLD) return 'safe'
    if (fillPct >= CAUTIOUS_THRESHOLD) return 'cautious'
    return 'danger'
  }, [state, overspentAmount, fillPct, remainingPct, pctSpent])

  const zoneColor = ZONE_COLORS[resolvedZone]

  // Accessibility text
  const ariaValueText = useMemo(() => {
    if (resolvedState === 'overspent') {
      const formatted = Math.round(overspentAmount).toLocaleString('en-IN')
      return `Over budget: ₹${formatted} over limit (0% remaining)`
    }
    if (resolvedState === 'depleted') {
      return 'Budget depleted: 0% remaining'
    }
    if (resolvedState === 'danger' || resolvedZone === 'critical') {
      return `${Math.round(fillPct)}% remaining — Danger zone`
    }
    if (resolvedState === 'cautious' || resolvedZone === 'cautious') {
      return `${Math.round(fillPct)}% remaining — Cautious zone`
    }
    return `${Math.round(fillPct)}% remaining — Safe zone`
  }, [resolvedState, resolvedZone, fillPct, overspentAmount])

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    const markerLeft = Math.min(97, Math.max(3, fillPct))
    const duration = reduceMotion ? 0 : 1.4

    // Kill any active tweens on these elements to prevent conflicts
    if (fillRef.current) gsap.killTweensOf(fillRef.current)
    if (markerRef.current) gsap.killTweensOf(markerRef.current)
    if (indicatorRef.current) gsap.killTweensOf(indicatorRef.current)

    if (!isMountedRef.current) {
      isMountedRef.current = true

      // Starting point: if module has previous percentage, start from there.
      // Otherwise, start from full (100%) and visibly drain down to current remaining budget.
      const startPct = moduleLastRenderedPct !== null ? moduleLastRenderedPct : 100
      const startMarkerLeft = Math.min(97, Math.max(3, startPct))

      if (fillRef.current) {
        gsap.set(fillRef.current, { width: `${startPct}%` })
      }
      if (markerRef.current) {
        gsap.set(markerRef.current, { left: `${startMarkerLeft}%`, opacity: 1 })
      }
    }

    if (reduceMotion) {
      if (fillRef.current) {
        gsap.set(fillRef.current, { width: `${fillPct}%` })
      }
      if (markerRef.current) {
        gsap.set(markerRef.current, { left: `${markerLeft}%`, opacity: 1 })
      }
      if (indicatorRef.current) {
        gsap.set(indicatorRef.current, { opacity: 1, y: 0 })
      }
    } else {
      if (fillRef.current) {
        gsap.to(fillRef.current, {
          width: `${fillPct}%`,
          duration,
          ease: 'power3.out',
        })
      }
      if (markerRef.current) {
        gsap.to(markerRef.current, {
          left: `${markerLeft}%`,
          opacity: 1,
          duration,
          ease: 'power3.out',
        })
      }
      if (indicatorRef.current) {
        gsap.fromTo(
          indicatorRef.current,
          { opacity: 0, y: -4 },
          { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', delay: 0.15 },
        )
      }
    }

    moduleLastRenderedPct = fillPct

    return () => {
      if (fillRef.current) gsap.killTweensOf(fillRef.current)
      if (markerRef.current) gsap.killTweensOf(markerRef.current)
      if (indicatorRef.current) gsap.killTweensOf(indicatorRef.current)
    }
  }, [fillPct, resolvedState])

  return (
    <div className="flex flex-col">
      <div
        role="meter"
        aria-label="Remaining monthly budget"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(fillPct)}
        aria-valuetext={ariaValueText}
        tabIndex={0}
        className="relative h-11 rounded-full border-[3px] border-panel-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      >
        <div className="runway-track absolute inset-0 overflow-hidden rounded-full">
          <div
            ref={fillRef}
            className="runway-fill h-full w-0"
            style={
              {
                backgroundColor: zoneColor,
                '--runway-fill-color': zoneColor,
              } as React.CSSProperties
            }
          />
          {/* Threshold markers at 20% and 60% remaining */}
          <span
            aria-hidden="true"
            title="Cautious threshold (20% remaining)"
            className="absolute inset-y-0 border-l border-dashed border-panel-foreground/35"
            style={{ left: `${CAUTIOUS_THRESHOLD}%` }}
          />
          <span
            aria-hidden="true"
            title="Safe threshold (60% remaining)"
            className="absolute inset-y-0 border-l border-dashed border-panel-foreground/35"
            style={{ left: `${SAFE_THRESHOLD}%` }}
          />
        </div>
        <div
          ref={markerRef}
          aria-hidden="true"
          className="absolute top-1/2 left-[3%] size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-panel bg-panel-foreground opacity-0 shadow-md transition-colors"
        />
      </div>

      {/* Depleted state indicator */}
      {resolvedState === 'depleted' && (
        <div
          ref={indicatorRef}
          role="status"
          aria-live="polite"
          className="mt-3 flex items-center justify-between rounded-xl border border-critical/35 bg-critical/15 px-3.5 py-2.5 text-xs text-panel-foreground sm:text-sm"
        >
          <div className="flex items-center gap-2.5">
            <span className="inline-flex shrink-0 items-center justify-center rounded-md bg-critical px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-background shadow-xs">
              DEPLETED
            </span>
            <span className="font-medium text-panel-foreground/95">
              Your monthly budget has run out.
            </span>
          </div>
          <span className="shrink-0 font-mono text-xs text-panel-muted">
            ₹0 remaining
          </span>
        </div>
      )}

      {/* Overspent state warning */}
      {resolvedState === 'overspent' && (
        <div
          ref={indicatorRef}
          role="alert"
          aria-live="assertive"
          className="mt-3 flex items-center justify-between rounded-xl border border-critical/50 bg-critical/20 px-3.5 py-2.5 text-xs text-panel-foreground sm:text-sm"
        >
          <div className="flex items-center gap-2.5">
            <span className="inline-flex shrink-0 items-center justify-center rounded-md bg-critical px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-background shadow-xs">
              OVER BUDGET
            </span>
            <span className="font-medium text-panel-foreground/95">
              Overspent by ₹{Math.round(overspentAmount).toLocaleString('en-IN')}
            </span>
          </div>
          <span className="shrink-0 font-mono text-xs font-semibold text-critical">
            −₹{Math.round(overspentAmount).toLocaleString('en-IN')}
          </span>
        </div>
      )}
    </div>
  )
}
