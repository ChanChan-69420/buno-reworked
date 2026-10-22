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
  const lastPoint = currentPoints[currentPoints.length - 1]
  const trend = trendVsLastMonth(current, previous)

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
            This Month
          </li>
          <li className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-1 w-4 rounded-full opacity-60"
              style={{ backgroundColor: LAST_MONTH_COLOR }}
            />
            Last Month
          </li>
        </ul>
      </div>

      {current.hasData || previous.hasData ? (
        <div className="flex flex-1 items-center">
          <svg
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
                <path d={areaPath(previousPoints)} fill="url(#last-month-fill)" />
                <path
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
                <path d={areaPath(currentPoints)} fill="url(#this-month-fill)" />
                <path
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
              <circle cx={lastPoint.x} cy={lastPoint.y} r="4" fill="#f9f2ec" stroke={THIS_MONTH_COLOR} strokeWidth="2" />
            )}
          </svg>
        </div>
      ) : (
        <p className="mt-3 rounded-2xl bg-tile px-4 py-8 text-center text-sm text-muted-foreground">
          No spending recorded this month or last month yet.
        </p>
      )}
    </section>
  )
}
