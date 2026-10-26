'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { ArrowUpRight, ListFilter, X } from 'lucide-react'
import { CategoryIcon } from '@/components/category-icon'
import { trendVsLastMonth, type MonthSeries, type TrendVerdict } from '@/lib/spending-insights'

const WIDTH = 560
const HEIGHT = 230
const PAD = { top: 14, right: 14, bottom: 28, left: 40 }
const PLOT_W = WIDTH - PAD.left - PAD.right
const PLOT_H = HEIGHT - PAD.top - PAD.bottom

const THIS_MONTH_COLOR = '#4a2a0b'
const LAST_MONTH_COLOR = '#b99c82'

const TREND_COPY: Record<TrendVerdict, string> = {
  lighter: 'Lighter than last month so far',
  similar: 'Tracking close to last month',
  heavier: 'Running ahead of last month',
  unknown: 'No last-month history to compare yet',
}

const monthName = (year: number, month: number) =>
  new Intl.DateTimeFormat('en-IN', { month: 'short', timeZone: 'UTC' }).format(
    new Date(Date.UTC(year, month - 1, 1)),
  )

const fullMonthName = (year: number, month: number) =>
  new Intl.DateTimeFormat('en-IN', { month: 'long', timeZone: 'UTC' }).format(
    new Date(Date.UTC(year, month - 1, 1)),
  )

const amountFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const shortDateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  timeZone: 'Asia/Kolkata',
})

type Point = { x: number; y: number }

// Monotone cubic interpolation keeps a cumulative line from dipping between points.
function monotonePath(points: Point[]) {
  if (points.length === 0) return ''
  if (points.length === 1) return `M${points[0].x},${points[0].y}`

  const n = points.length
  const slopes: number[] = []
  for (let i = 0; i < n - 1; i++) {
    slopes.push((points[i + 1].y - points[i].y) / (points[i + 1].x - points[i].x))
  }
  const tangents = [slopes[0]]
  for (let i = 1; i < n - 1; i++) {
    tangents.push(slopes[i - 1] * slopes[i] <= 0 ? 0 : (slopes[i - 1] + slopes[i]) / 2)
  }
  tangents.push(slopes[n - 2])

  for (let i = 0; i < n - 1; i++) {
    if (slopes[i] === 0) {
      tangents[i] = 0
      tangents[i + 1] = 0
      continue
    }
    const a = tangents[i] / slopes[i]
    const b = tangents[i + 1] / slopes[i]
    const h = a * a + b * b
    if (h > 9) {
      const t = 3 / Math.sqrt(h)
      tangents[i] = t * a * slopes[i]
      tangents[i + 1] = t * b * slopes[i]
    }
  }

  let d = `M${points[0].x},${points[0].y}`
  for (let i = 0; i < n - 1; i++) {
    const dx = (points[i + 1].x - points[i].x) / 3
    d += ` C${points[i].x + dx},${points[i].y + tangents[i] * dx} ${points[i + 1].x - dx},${points[i + 1].y - tangents[i + 1] * dx} ${points[i + 1].x},${points[i + 1].y}`
  }
  return d
}

export function MonthComparisonPanel({
  current,
  previous,
}: {
  current: MonthSeries
  previous: MonthSeries
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [isExpensesOpen, setIsExpensesOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'both' | 'previous' | 'current'>('both')

  useEffect(() => {
    setMounted(true)
  }, [])

  // The panel mounts each time the Insights tab opens, so a mount-only effect replays the draw once per activation.
  useLayoutEffect(() => {
    const svg = svgRef.current
    if (!svg || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const series = ['last-month', 'this-month'].flatMap((key) => {
      const line = svg.querySelector<SVGPathElement>(`[data-line="${key}"]`)
      const clip = svg.querySelector<SVGRectElement>(`#${key}-clip rect`)
      return line && clip ? [{ line, clip, length: line.getTotalLength() }] : []
    })
    const dot = svg.querySelector<SVGCircleElement>('[data-dot]')

    const reset = ({ line, clip }: (typeof series)[number]) => {
      line.style.removeProperty('stroke-dasharray')
      line.style.removeProperty('stroke-dashoffset')
      clip.setAttribute('width', String(WIDTH))
    }

    const ctx = gsap.context(() => {
      series.forEach((item) => {
        const { line, clip, length } = item
        line.style.strokeDasharray = `${length}`
        line.style.strokeDashoffset = `${length}`
        clip.setAttribute('width', '0')

        // The area clip follows the drawn tip so the fill rises along the same trajectory as the line.
        const progress = { value: 0 }
        gsap.to(progress, {
          value: 1,
          duration: 1.1,
          ease: 'power2.inOut',
          onUpdate: () => {
            line.style.strokeDashoffset = `${length * (1 - progress.value)}`
            clip.setAttribute('width', String(line.getPointAtLength(length * progress.value).x))
          },
          onComplete: () => reset(item),
        })
      })
      if (dot) gsap.fromTo(dot, { opacity: 0 }, { opacity: 1, duration: 0.2, delay: 0.9, ease: 'none' })
    }, svg)

    return () => {
      ctx.revert()
      series.forEach(reset)
    }
  }, [])

  // Animate modal opening
  useLayoutEffect(() => {
    if (!isExpensesOpen) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduceMotion) {
      if (backdropRef.current) gsap.set(backdropRef.current, { opacity: 1 })
      if (modalRef.current) gsap.set(modalRef.current, { opacity: 1, scale: 1, y: 0 })
      return
    }

    if (backdropRef.current) {
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.22, ease: 'power2.out' },
      )
    }

    if (modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.95, y: 14 },
        { opacity: 1, scale: 1, y: 0, duration: 0.25, ease: 'power2.out' },
      )
    }
  }, [isExpensesOpen])

  function handleCloseModal() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduceMotion || !backdropRef.current || !modalRef.current) {
      setIsExpensesOpen(false)
      return
    }

    gsap.to(backdropRef.current, {
      opacity: 0,
      duration: 0.18,
      ease: 'power2.in',
    })

    gsap.to(modalRef.current, {
      opacity: 0,
      scale: 0.95,
      y: 10,
      duration: 0.18,
      ease: 'power2.in',
      onComplete: () => setIsExpensesOpen(false),
    })
  }

  useEffect(() => {
    if (!isExpensesOpen) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        handleCloseModal()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isExpensesOpen])

  const totalDays = Math.max(current.totalDays, previous.hasData ? previous.totalDays : 0)
  const dataMax = Math.max(current.total, previous.hasData ? previous.total : 0, 1)
  // Both lines share one scale; headroom keeps the highest point off the top edge.
  const yMax = dataMax * 1.1
  const gridLines = [0, 0.25, 0.5, 0.75, 1]

  const xFor = (day: number) =>
    PAD.left + (totalDays > 1 ? ((day - 1) / (totalDays - 1)) * PLOT_W : 0)
  const yFor = (value: number) => PAD.top + PLOT_H - (value / yMax) * PLOT_H
  const gridY = (fraction: number) => PAD.top + PLOT_H - fraction * PLOT_H

  const toPoints = (series: MonthSeries) =>
    series.points.map((p) => ({ x: xFor(p.day), y: yFor(p.cumulative) }))

  const currentPoints = toPoints(current)
  const previousPoints = previous.hasData ? toPoints(previous) : []

  const areaPath = (points: Point[]) =>
    points.length > 1
      ? `${monotonePath(points)} L${points[points.length - 1].x},${PAD.top + PLOT_H} L${points[0].x},${PAD.top + PLOT_H} Z`
      : ''

  const xTicks = [1, 8, 15, 22, totalDays].filter(
    (d, i, arr) => d <= totalDays && arr.indexOf(d) === i && !(d !== totalDays && totalDays - d < 4),
  )

  const currentLabel = monthName(current.year, current.month)
  const previousLabel = monthName(previous.year, previous.month)
  const currentFullLabel = fullMonthName(current.year, current.month)
  const previousFullLabel = fullMonthName(previous.year, previous.month)
  const lastPoint = currentPoints[currentPoints.length - 1]
  const trend = trendVsLastMonth(current, previous)

  const currentExpenses = current.expenses ?? []
  const previousExpenses = previous.expenses ?? []

  const summary = `Cumulative spending trend for ${currentLabel} compared with ${previousLabel}. ${TREND_COPY[trend]}.`

  return (
    <section
      aria-labelledby="month-comparison-title"
      className="flex h-full flex-col rounded-3xl bg-card px-5 py-4 text-card-foreground shadow-xl shadow-black/25 sm:px-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="month-comparison-title" className="font-serif text-lg font-medium text-balance">
            This Month vs Last Month
          </h2>
          <p className="text-sm text-muted-foreground">{TREND_COPY[trend]}</p>
        </div>
        <ul className="flex shrink-0 flex-col items-end gap-1 pt-1 text-xs text-muted-foreground sm:flex-row sm:items-center sm:gap-4">
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="h-1 w-4 rounded-full" style={{ backgroundColor: THIS_MONTH_COLOR }} />
            This Month ({currentLabel})
          </li>
          <li className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-1 w-4 rounded-full opacity-60"
              style={{ backgroundColor: LAST_MONTH_COLOR }}
            />
            Last Month ({previousLabel})
          </li>
        </ul>
      </div>

      {current.hasData || previous.hasData ? (
        <div className="flex flex-1 items-center">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            role="img"
            aria-label={summary}
            className="mt-2 h-auto w-full"
          >
            <defs>
              <linearGradient id="this-month-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={THIS_MONTH_COLOR} stopOpacity="0.45" />
                <stop offset="100%" stopColor={THIS_MONTH_COLOR} stopOpacity="0.04" />
              </linearGradient>
              <linearGradient id="last-month-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={LAST_MONTH_COLOR} stopOpacity="0.2" />
                <stop offset="100%" stopColor={LAST_MONTH_COLOR} stopOpacity="0.02" />
              </linearGradient>
              <clipPath id="this-month-clip">
                <rect x="0" y="0" width={WIDTH} height={HEIGHT} />
              </clipPath>
              <clipPath id="last-month-clip">
                <rect x="0" y="0" width={WIDTH} height={HEIGHT} />
              </clipPath>
            </defs>

            {gridLines.map((fraction) => (
              <line
                key={fraction}
                x1={PAD.left}
                x2={WIDTH - PAD.right}
                y1={gridY(fraction)}
                y2={gridY(fraction)}
                stroke="#eadccd"
                strokeDasharray={fraction === 0 ? undefined : '3 4'}
              />
            ))}

            <text
              x={PAD.left - 8}
              y={gridY(1)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-muted-foreground text-[11px]"
            >
              More
            </text>
            <text
              x={PAD.left - 8}
              y={gridY(0)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-muted-foreground text-[11px]"
            >
              Less
            </text>

            {xTicks.map((day) => (
              <text
                key={day}
                x={xFor(day)}
                y={HEIGHT - 8}
                textAnchor={day === 1 ? 'start' : day === totalDays ? 'end' : 'middle'}
                className="fill-muted-foreground text-[11px]"
              >
                {`${currentLabel} ${day}`}
              </text>
            ))}

            {previousPoints.length > 1 && (
              <>
                <path d={areaPath(previousPoints)} fill="url(#last-month-fill)" clipPath="url(#last-month-clip)" />
                <path
                  data-line="last-month"
                  d={monotonePath(previousPoints)}
                  fill="none"
                  stroke={LAST_MONTH_COLOR}
                  strokeOpacity="0.7"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}

            {currentPoints.length > 1 && (
              <>
                <path d={areaPath(currentPoints)} fill="url(#this-month-fill)" clipPath="url(#this-month-clip)" />
                <path
                  data-line="this-month"
                  d={monotonePath(currentPoints)}
                  fill="none"
                  stroke={THIS_MONTH_COLOR}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}

            {lastPoint && (
              <circle data-dot cx={lastPoint.x} cy={lastPoint.y} r="4" fill="#f9f2ec" stroke={THIS_MONTH_COLOR} strokeWidth="2" />
            )}
          </svg>
        </div>
      ) : (
        <p className="mt-3 rounded-2xl bg-tile px-4 py-8 text-center text-sm text-muted-foreground">
          No spending recorded this month or last month yet.
        </p>
      )}

      {/* Trigger to open overlay card comparing September vs October expenses */}
      <div className="mt-2 border-t border-border/70 pt-2.5">
        <button
          type="button"
          onClick={() => setIsExpensesOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-coffee-label transition hover:text-foreground cursor-pointer"
        >
          <ListFilter className="size-3.5 text-primary" />
          <span>Compare Monthly Expenses ({previousLabel} vs {currentLabel})</span>
          <ArrowUpRight className="size-3.5" />
        </button>
      </div>

      {/* Overlay Modal Card blurring the background cards */}
      {isExpensesOpen &&
        mounted &&
        createPortal(
          <div
            ref={backdropRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-month-expenses-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-md sm:p-6"
            onClick={(e) => {
              if (e.target === e.currentTarget) handleCloseModal()
            }}
          >
            <div
              ref={modalRef}
              className="card-sheen relative flex max-h-[calc(100dvh-2.5rem)] w-full max-w-[780px] flex-col overflow-hidden rounded-3xl border border-border bg-card p-5 text-card-foreground shadow-2xl shadow-black/35 sm:p-7 focus:outline-none"
            >
              {/* Modal Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3.5">
                <div>
                  <h2
                    id="modal-month-expenses-title"
                    className="font-serif text-xl font-medium text-foreground sm:text-2xl"
                  >
                    {previousFullLabel} vs {currentFullLabel} Expenses
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                    Side-by-side breakdown of your monthly transactions
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="inline-flex rounded-full border border-border bg-tile p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveTab('both')}
                      className={`rounded-full px-3 py-1 font-medium transition cursor-pointer ${
                        activeTab === 'both'
                          ? 'bg-primary text-white shadow-2xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Side by Side
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('previous')}
                      className={`rounded-full px-3 py-1 font-medium transition cursor-pointer ${
                        activeTab === 'previous'
                          ? 'bg-primary text-white shadow-2xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {previousLabel} ({previousExpenses.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('current')}
                      className={`rounded-full px-3 py-1 font-medium transition cursor-pointer ${
                        activeTab === 'current'
                          ? 'bg-primary text-white shadow-2xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {currentLabel} ({currentExpenses.length})
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="rounded-full p-1.5 text-muted-foreground transition hover:bg-primary/10 hover:text-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    aria-label="Close dialog"
                  >
                    <X className="size-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body: Expense Lists */}
              <div
                className={`mt-4 grid flex-1 gap-4 overflow-y-auto pr-1 [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin] ${
                  activeTab === 'both' ? 'sm:grid-cols-2' : 'grid-cols-1'
                }`}
              >
                {(activeTab === 'both' || activeTab === 'previous') && (
                  <div className="flex flex-col rounded-2xl border border-border/70 bg-tile/60 p-3.5">
                    <div className="mb-2.5 flex items-center justify-between border-b border-border/60 pb-2">
                      <div className="flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className="size-2.5 rounded-full"
                          style={{ backgroundColor: LAST_MONTH_COLOR }}
                        />
                        <h3 className="font-serif text-base font-medium text-foreground">
                          {previousFullLabel}
                        </h3>
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">
                        {previousExpenses.length} transactions
                      </span>
                    </div>

                    <ul
                      aria-label={`${previousFullLabel} expenses`}
                      className="flex max-h-[340px] flex-col gap-1.5 overflow-y-auto pr-1 [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin]"
                    >
                      {previousExpenses.map((t) => (
                        <li
                          key={t.id}
                          className="flex items-center justify-between gap-2.5 rounded-xl bg-card px-3 py-2 text-xs shadow-2xs"
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            <CategoryIcon category={t.category} />
                            <div className="min-w-0">
                              <p className="truncate font-medium text-foreground">
                                {t.description}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {shortDateFormatter.format(new Date(t.date))} &bull;{' '}
                                {t.source === 'bank' ? 'Bank' : 'Cash'}
                              </p>
                            </div>
                          </div>
                          <span className="shrink-0 font-serif text-sm font-medium tabular-nums text-foreground">
                            {amountFormatter.format(t.amount)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(activeTab === 'both' || activeTab === 'current') && (
                  <div className="flex flex-col rounded-2xl border border-border/70 bg-tile/60 p-3.5">
                    <div className="mb-2.5 flex items-center justify-between border-b border-border/60 pb-2">
                      <div className="flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className="size-2.5 rounded-full"
                          style={{ backgroundColor: THIS_MONTH_COLOR }}
                        />
                        <h3 className="font-serif text-base font-medium text-foreground">
                          {currentFullLabel}
                        </h3>
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">
                        {currentExpenses.length} transactions
                      </span>
                    </div>

                    <ul
                      aria-label={`${currentFullLabel} expenses`}
                      className="flex max-h-[340px] flex-col gap-1.5 overflow-y-auto pr-1 [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin]"
                    >
                      {currentExpenses.map((t) => (
                        <li
                          key={t.id}
                          className="flex items-center justify-between gap-2.5 rounded-xl bg-card px-3 py-2 text-xs shadow-2xs"
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            <CategoryIcon category={t.category} />
                            <div className="min-w-0">
                              <p className="truncate font-medium text-foreground">
                                {t.description}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {shortDateFormatter.format(new Date(t.date))} &bull;{' '}
                                {t.source === 'bank' ? 'Bank' : 'Cash'}
                              </p>
                            </div>
                          </div>
                          <span className="shrink-0 font-serif text-sm font-medium tabular-nums text-foreground">
                            {amountFormatter.format(t.amount)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </section>
  )
}
