'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { SiteHeader } from '@/components/site-header'
import { BudgetRangePanel } from '@/components/budget-range-panel'
import { TransactionsPanel } from '@/components/transactions-panel'
import { MONTHLY_BUDGET, SANDBOX_TRANSACTIONS } from '@/lib/sandbox-data'
import { calculateZone } from '@/lib/zone-engine'
import { MonthComparisonPanel } from '@/components/month-comparison-panel'
import { CategorySpendingPanel } from '@/components/category-spending-panel'
import { categoryBreakdown, monthComparison } from '@/lib/spending-insights'

type TabId = 'budget' | 'transactions'

export function Sanctuary() {
  const [activeTab, setActiveTab] = useState<TabId>('budget')
  const panelRef = useRef<HTMLDivElement>(null)
  const hasMounted = useRef(false)
  const isBudget = activeTab === 'budget'

  const result = useMemo(
    () => calculateZone(MONTHLY_BUDGET, SANDBOX_TRANSACTIONS),
    [],
  )

  const { comparison, categories } = useMemo(() => {
    const today = new Date()
    return {
      comparison: monthComparison(SANDBOX_TRANSACTIONS, today),
      categories: categoryBreakdown(SANDBOX_TRANSACTIONS, today),
    }
  }, [])

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
    <div className="sanctuary-page relative z-10 flex min-h-[100dvh] flex-col items-center">
      <SiteHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onTabKeyDown={handleTabKeyDown}
      />

      <main className="flex w-full flex-1 items-center justify-center px-3 py-3 lg:px-6">
        <div
          className={`grid w-full gap-4 ${
            isBudget ? 'max-w-[1180px] lg:grid-cols-[46fr_54fr]' : 'max-w-[620px]'
          }`}
        >
          <article
            className={`card-sheen flex flex-col overflow-hidden rounded-3xl bg-card text-card-foreground shadow-2xl shadow-black/30 ${
              isBudget ? 'lg:row-span-2' : ''
            }`}
          >
            <div className="flex flex-col gap-2 border-b border-border px-6 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <h1 className="font-serif text-2xl font-medium text-balance sm:text-3xl">
                Monthly Budget
              </h1>
            </div>

            <div
              ref={panelRef}
              role="tabpanel"
              id={`panel-${activeTab}`}
              aria-labelledby={`tab-${activeTab}`}
              className="flex flex-1 flex-col p-6 py-4"
            >
              {isBudget ? (
                <BudgetRangePanel zone={result.zone} pctSpent={result.pctSpent} />
              ) : (
                <TransactionsPanel transactions={SANDBOX_TRANSACTIONS} />
              )}
            </div>
          </article>

          {isBudget && (
            <>
              <MonthComparisonPanel current={comparison.current} previous={comparison.previous} />
              <CategorySpendingPanel total={categories.total} items={categories.items} />
            </>
          )}
        </div>
      </main>

      <footer className="shrink-0 pb-3 text-center text-sm text-card/70">
        Buno <span aria-hidden="true">&bull;</span> By Vachan and Yava
      </footer>
    </div>
  )
}
