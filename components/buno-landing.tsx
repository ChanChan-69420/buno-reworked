'use client'

import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { BunnyLogo } from '@/components/bunny-logo'

interface BunoLandingProps {
  onGetStarted: () => void
}

export function BunoLanding({ onGetStarted }: BunoLandingProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const backdropSheenRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLButtonElement>(null)

  useLayoutEffect(() => {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (reduceMotion) {
      gsap.set(
        [
          backdropSheenRef.current,
          logoRef.current,
          headingRef.current,
          descRef.current,
          ctaRef.current,
        ],
        { opacity: 1, y: 0, scale: 1 },
      )
      return
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

      // Initial state
      gsap.set(backdropSheenRef.current, { opacity: 0 })
      gsap.set([logoRef.current, headingRef.current, descRef.current, ctaRef.current], {
        opacity: 0,
        y: 18,
      })

      // 1. Subtle background sheen fade-in
      tl.to(backdropSheenRef.current, {
        opacity: 1,
        duration: 0.8,
        ease: 'power1.out',
      })
        // 2. Logo reveal with gentle scale
        .fromTo(
          logoRef.current,
          { opacity: 0, scale: 0.85, y: 16 },
          { opacity: 1, scale: 1, y: 0, duration: 0.75 },
          '-=0.5',
        )
        // 3. Heading & wordmark appear smoothly
        .to(
          headingRef.current,
          { opacity: 1, y: 0, duration: 0.55 },
          '-=0.3',
        )
        // 4. Description appears
        .to(
          descRef.current,
          { opacity: 1, y: 0, duration: 0.5 },
          '-=0.25',
        )
        // 5. "Get Started" CTA appears
        .to(
          ctaRef.current,
          { opacity: 1, y: 0, duration: 0.45 },
          '-=0.2',
        )
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-4"
    >
      {/* Subtle nature warmth sheen */}
      <div
        ref={backdropSheenRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/30 via-background/40 to-background/70 backdrop-blur-[2px]"
      />

      <div className="relative z-10 flex max-w-lg flex-col items-center text-center">
        {/* Prominent Logo & Wordmark */}
        <div ref={logoRef} className="mb-5 flex flex-col items-center gap-3">
          <BunnyLogo
            size={116}
            priority
            className="border-2 border-white/60 shadow-2xl shadow-black/35 ring-4 ring-black/15 sm:scale-110"
          />
          <h1 className="font-serif text-5xl font-bold tracking-tight text-card drop-shadow-sm sm:text-6xl">
            BUNO
          </h1>
        </div>

        {/* Heading */}
        <h2
          ref={headingRef}
          className="mb-4 font-serif text-2xl font-medium leading-snug text-card drop-shadow-xs sm:text-3xl"
        >
          A calmer way to understand your spending.
        </h2>

        {/* Concise Description */}
        <p
          ref={descRef}
          className="mb-8 max-w-md text-base leading-relaxed text-card/85 sm:text-lg"
        >
          Buno helps you build financial awareness without overwhelming you with
          exact numbers.
        </p>

        {/* Get Started Button */}
        <button
          ref={ctaRef}
          type="button"
          onClick={onGetStarted}
          className="group inline-flex items-center gap-2 rounded-full border border-white/30 bg-card px-8 py-3.5 font-serif text-base font-semibold text-foreground shadow-2xl shadow-black/25 transition-all hover:bg-tile hover:shadow-card/20 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-card/80 sm:text-lg"
        >
          <span>Get Started</span>
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </button>
      </div>

      <footer className="absolute bottom-4 text-center text-xs text-card/60 sm:text-sm">
        Buno <span aria-hidden="true">&bull;</span> By Vachan and Yava
      </footer>
    </div>
  )
}
