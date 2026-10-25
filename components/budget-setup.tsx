'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { BunnyLogo } from '@/components/bunny-logo'

interface BudgetSetupProps {
  onBudgetSet: (amount: number) => void
}

export function BudgetSetup({ onBudgetSet }: BudgetSetupProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Entrance animation
  useLayoutEffect(() => {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (reduceMotion) {
      gsap.set(cardRef.current, { opacity: 1, y: 0, scale: 1 })
      return
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 26, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power2.out' },
      )
    }, containerRef)

    return () => ctx.revert()
  }, [])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const cleaned = amount.trim()
    const num = Number(cleaned)

    if (!cleaned || isNaN(num) || num <= 0) {
      setError('Please enter a positive monthly budget (e.g. ₹25,000).')
      return
    }

    setError(null)
    onBudgetSet(num)
  }

  return (
    <div
      ref={containerRef}
      className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-4"
    >
      <div
        ref={cardRef}
        className="card-sheen w-full max-w-md overflow-hidden rounded-3xl bg-card text-card-foreground shadow-2xl shadow-black/30"
      >
        <div className="border-b border-border px-6 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <BunnyLogo size={38} className="border border-primary/20 shadow-xs" />
            <span className="font-serif text-xl font-semibold leading-none text-foreground">
              Buno
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-5 p-6 sm:p-8">
          <div>
            <h1 className="font-serif text-2xl font-medium text-balance sm:text-3xl">
              Let&apos;s set your monthly budget.
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Buno uses spending ranges and visual indicators to encourage
              mindful spending.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="budget-input"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-coffee-label"
              >
                Monthly Budget (₹)
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-base text-muted-foreground">
                  ₹
                </span>
                <input
                  id="budget-input"
                  type="number"
                  min="1"
                  step="any"
                  placeholder="e.g. 25000"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value)
                    if (error) setError(null)
                  }}
                  className={`w-full rounded-xl border bg-tile py-3 pl-9 pr-4 text-base tabular-nums text-foreground focus:outline-none focus:ring-2 ${
                    error
                      ? 'border-critical focus:ring-critical/30'
                      : 'border-border focus:border-primary focus:ring-primary/20'
                  }`}
                  autoFocus
                />
              </div>
              {error && (
                <p className="mt-1.5 text-sm text-critical-deep">{error}</p>
              )}
            </div>

            <button
              type="submit"
              className="mt-1 rounded-full bg-primary px-6 py-3 font-serif text-base font-semibold text-white shadow-md transition hover:bg-primary/90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              Enter Buno →
            </button>
          </form>
        </div>
      </div>

      <footer className="absolute bottom-4 text-center text-xs text-card/60 sm:text-sm">
        Buno <span aria-hidden="true">&bull;</span> By Vachan and Yava
      </footer>
    </div>
  )
}
