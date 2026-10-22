'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { SiteHeader } from '@/components/site-header'
import { BudgetRangePanel } from '@/components/budget-range-panel'
import { TransactionsPanel } from '@/components/transactions-panel'
import { MONTHLY_BUDGET, SANDBOX_TRANSACTIONS } from '@/lib/sandbox-data'
import { calculateZone } from '@/lib/zone-engine'

const TABS = [
  { id: 'budget', label: 'Budget Range' },
  { id: 'transactions', label: 'Transactions' },
] as const

type TabId = (typeof TABS)[number]['id']

export function Sanctuary() {
  const [activeTab, setActiveTab] = useState<TabId>('budget')
  const panelRef = useRef<HTMLDivElement>(null)
  const hasMounted = useRef(false)

  const result = useMemo(
    () => calculateZone(MONTHLY_BUDGET, SANDBOX_TRANSACTIONS),
    [],
  )

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true
      return
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const tween = gsap.fromTo(
      panelRef.current,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' },
    )
    return () => {
      tween.kill()
    }
  }, [activeTab])

  function handleTabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    event.preventDefault()
    const next = activeTab === 'budget' ? 'transactions' : 'budget'
    setActiveTab(next)
    document.getElementById(`tab-${next}`)?.focus()
  }

  return (
    <div className="sanctuary-page relative z-10 flex h-[100dvh] max-h-[100dvh] flex-col items-center overflow-hidden">
      <SiteHeader zone={result.zone} />

      <main className="sanctuary-main flex min-h-0 w-full flex-1 items-center justify-center">
        <article className="sanctuary-card card-sheen overflow-hidden rounded-3xl bg-card text-card-foreground shadow-2xl shadow-black/30">
          <div className="flex flex-col gap-2 border-b border-border px-6 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
                Mindful Flow
              </p>
              <h1 className="mt-1 font-serif text-2xl font-medium text-balance sm:text-3xl">
                Pacing Sanctuary
              </h1>
            </div>

            <div
              role="tablist"
              aria-label="Sanctuary views"
              className="flex w-fit items-center gap-1 rounded-full border border-white bg-primary/10 p-1"
            >
              {TABS.map((tab) => {
                const selected = tab.id === activeTab
                return (
                  <button
                    key={tab.id}
                    id={`tab-${tab.id}`}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-controls={`panel-${tab.id}`}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setActiveTab(tab.id)}
                    onKeyDown={handleTabKeyDown}
                    className={`rounded-full px-3 py-1.5 text-xs transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
                      selected
                        ? 'bg-tile font-medium text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div
            ref={panelRef}
            role="tabpanel"
            id={`panel-${activeTab}`}
            aria-labelledby={`tab-${activeTab}`}
            className="space-y-4 p-6 py-4"
          >
            {activeTab === 'budget' ? (
              <BudgetRangePanel zone={result.zone} pctSpent={result.pctSpent} />
            ) : (
              <TransactionsPanel transactions={SANDBOX_TRANSACTIONS} />
            )}
          </div>
        </article>
      </main>

      <footer className="shrink-0 pb-3 text-center text-sm text-card/70">
        Buno <span aria-hidden="true">&bull;</span> Mindful broad-horizon
        sanctuary
      </footer>
    </div>
  )
}
