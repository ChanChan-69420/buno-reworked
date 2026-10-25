'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { BunnyLogo } from '@/components/bunny-logo'

if (typeof window !== 'undefined') {
  ;(window as unknown as { gsap?: typeof gsap }).gsap = gsap
}

interface BunoLandingProps {
  onGetStarted: () => void
}

export function BunoLanding({ onGetStarted }: BunoLandingProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const taglineRef = useRef<HTMLHeadingElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLButtonElement>(null)

  // GSAP Entrance Sequence
  useLayoutEffect(() => {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (reduceMotion) {
      gsap.set(
        [
          bgRef.current,
          logoRef.current,
          headingRef.current,
          taglineRef.current,
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
      gsap.set(bgRef.current, { opacity: 0.35, scale: 1.08 })
      gsap.set(
        [
          logoRef.current,
          headingRef.current,
          taglineRef.current,
          descRef.current,
          ctaRef.current,
        ],
        {
          opacity: 0,
          y: 20,
        },
      )

      // 1. Reveal landscape with subtle opacity transition and scale settle
      tl.to(bgRef.current, {
        opacity: 1,
        scale: 1.04,
        duration: 1.35,
        ease: 'power1.out',
      })
        // 2. Logo reveal with gentle scale
        .fromTo(
          logoRef.current,
          { opacity: 0, scale: 0.88, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: 'back.out(1.2)' },
          '-=0.9',
        )
        // 3. Heading "BUNO" appears smoothly
        .to(headingRef.current, { opacity: 1, y: 0, duration: 0.55 }, '-=0.45')
        // 4. Tagline appears
        .to(taglineRef.current, { opacity: 1, y: 0, duration: 0.5 }, '-=0.35')
        // 5. Supporting description appears
        .to(descRef.current, { opacity: 1, y: 0, duration: 0.45 }, '-=0.3')
        // 6. "Get Started →" CTA appears
        .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.45 }, '-=0.25')
    }, containerRef)

    return () => ctx.revert()
  }, [])

  // Restrained mouse parallax for desktop
  useEffect(() => {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (reduceMotion) return

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window
      if (innerWidth < 768) return

      const nx = (e.clientX / innerWidth - 0.5) * 2
      const ny = (e.clientY / innerHeight - 0.5) * 2

      if (bgRef.current) {
        gsap.to(bgRef.current, {
          x: nx * -12,
          y: ny * -8,
          duration: 1.2,
          ease: 'power1.out',
          overwrite: 'auto',
        })
      }
      if (contentRef.current) {
        gsap.to(contentRef.current, {
          x: nx * 6,
          y: ny * 4,
          duration: 0.9,
          ease: 'power1.out',
          overwrite: 'auto',
        })
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative z-20 h-[100svh] w-screen overflow-hidden select-none bg-[#1e0d04]"
    >
      {/* Cinematic Golden-Hour Woodland Background */}
      <div
        ref={bgRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-[-3%] z-0 overflow-hidden"
      >
        <Image
          src="/images/buno-hero-bg.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Subtle, soft vignette on left side to guarantee perfect text contrast without washing out the sunset */}
        <div className="pointer-events-none absolute inset-0 bg-black/30 sm:bg-transparent" />
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[52vw] bg-gradient-to-r from-black/45 via-black/15 to-transparent sm:block" />
      </div>

      {/* Main Content Blueprint: Left-aligned, matching reference image positioning */}
      <div className="relative z-10 flex h-full w-full items-center px-6 sm:px-12 lg:pl-[16.3%] lg:pr-8">
        <div
          ref={contentRef}
          className="flex max-w-[360px] flex-col items-start text-left sm:max-w-[420px] lg:max-w-[460px]"
        >
          {/* Circular Bunny Logo Emblem */}
          <div ref={logoRef} className="mb-4 sm:mb-5 lg:mb-6">
            <BunnyLogo
              size={88}
              priority
              className="ring-1 ring-[#F6EDE2]/35 shadow-xl shadow-black/40"
            />
          </div>

          {/* Heading: BUNO */}
          <h1
            ref={headingRef}
            className="font-serif text-5xl font-bold tracking-tight text-[#FAF4EC] drop-shadow-sm sm:text-6xl lg:text-[4.25rem] lg:leading-none"
          >
            BUNO
          </h1>

          {/* Tagline */}
          <h2
            ref={taglineRef}
            className="mt-3 font-serif text-2xl font-normal italic leading-snug text-[#F5ECE1] drop-shadow-xs sm:mt-4 sm:text-3xl lg:text-[2.1rem]"
          >
            A calmer way to
            <br />
            understand your spending.
          </h2>

          {/* Supporting Paragraph */}
          <p
            ref={descRef}
            className="mt-4 font-sans text-sm leading-relaxed text-[#D7C4B0] drop-shadow-xs sm:mt-5 sm:text-base lg:text-[1.05rem] lg:leading-[1.7] max-w-[370px]"
          >
            Visualise your finances, build better habits,
            <br className="hidden sm:inline" /> and make smarter decisions &mdash; without the
            <br className="hidden sm:inline" /> stress of exact numbers.
          </p>

          {/* Single "Get Started →" CTA Pill Button */}
          <button
            ref={ctaRef}
            type="button"
            onClick={onGetStarted}
            className="group mt-7 inline-flex items-center gap-2.5 rounded-full bg-[#FAF4EB] px-7 py-3.5 font-serif text-base font-semibold text-[#341907] shadow-xl shadow-black/35 transition-all duration-200 hover:scale-[1.03] hover:bg-white hover:text-[#281305] hover:shadow-2xl hover:shadow-black/45 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FAF4EB]/80 sm:mt-8 sm:px-8 sm:py-4 sm:text-lg cursor-pointer"
          >
            <span>Get Started</span>
            <span
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-1.5"
            >
              &rarr;
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
