'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { getStoredBudget, setStoredBudget } from '@/lib/storage'
import { BunoLanding } from '@/components/buno-landing'
import { BudgetSetup } from '@/components/budget-setup'
import { Sanctuary } from '@/components/sanctuary'

type AppScreen = 'loading' | 'landing' | 'setup' | 'dashboard'

export function BunoApp() {
  const [screen, setScreen] = useState<AppScreen>('loading')
  const [budget, setBudget] = useState<number | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const prevScreenRef = useRef<AppScreen>('loading')

  // Check localStorage on mount — returning users skip straight to dashboard
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search)
      if (searchParams.get('intro') === 'true' || searchParams.get('onboarding') === 'true') {
        setScreen('landing')
        return
      }
    } catch {
      // ignore in environments without window.location
    }

    const saved = getStoredBudget()
    if (saved) {
      setBudget(saved)
      setScreen('dashboard')
    } else {
      setScreen('landing')
    }
  }, [])

  // Cross-fade transition between screens
  useLayoutEffect(() => {
    // Don't animate the initial load reveal
    if (prevScreenRef.current === 'loading' && screen === 'loading') return

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (reduceMotion || !wrapperRef.current) {
      prevScreenRef.current = screen
      return
    }

    // Only run a cross-fade when transitioning between real screens
    if (prevScreenRef.current !== 'loading' && prevScreenRef.current !== screen) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          wrapperRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.35, ease: 'power2.out' },
        )
      })
      prevScreenRef.current = screen
      return () => ctx.revert()
    }

    prevScreenRef.current = screen
  }, [screen])

  function handleGetStarted() {
    setScreen('setup')
  }

  function handleBudgetSet(amount: number) {
    setStoredBudget(amount)
    setBudget(amount)
    setScreen('dashboard')
  }

  // Blank while checking localStorage
  if (screen === 'loading') {
    return null
  }

  return (
    <div ref={wrapperRef}>
      {screen === 'landing' && <BunoLanding onGetStarted={handleGetStarted} />}
      {screen === 'setup' && <BudgetSetup onBudgetSet={handleBudgetSet} />}
      {screen === 'dashboard' && <Sanctuary budget={budget} />}
    </div>
  )
}
