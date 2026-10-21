import { useState, useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import BunnyLogo from './icons/BunnyLogo';

interface IntroProps {
  onContinue: () => void;
}

export default function Intro({ onContinue }: IntroProps) {
  // Step 1: Choreographed reveal of Buno & premise
  // Step 2: Set monthly budget prompt
  const [step, setStep] = useState<1 | 2>(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const heroGroupRef = useRef<HTMLDivElement>(null);
  const bunnyRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const nextBtnRef = useRef<HTMLButtonElement>(null);

  const step2ContentRef = useRef<HTMLDivElement>(null);
  const ctaBtnRef = useRef<HTMLButtonElement>(null);

  // Animation for Step 1
  useLayoutEffect(() => {
    if (step === 1) {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        // Initial states
        gsap.set(bunnyRef.current, { scale: 0.5, opacity: 0, x: 0 });
        gsap.set(titleRef.current, { opacity: 0, x: -15 });
        gsap.set(heroGroupRef.current, { y: 25 });
        gsap.set(descRef.current, { opacity: 0, y: 25 });
        gsap.set(nextBtnRef.current, { opacity: 0, scale: 0.8, x: 10 });

        // Sequence:
        // 1. Bunny appears in center
        tl.to(bunnyRef.current, {
          scale: 1,
          opacity: 1,
          duration: 0.7,
          ease: 'back.out(1.8)',
        })
          // 2. Bunny slides to the right
          .to(bunnyRef.current, {
            x: 20,
            duration: 0.65,
            ease: 'power2.inOut',
          }, '+=0.3')
          // 3. "Hello, this is Buno" text appears beside it
          .to(titleRef.current, {
            opacity: 1,
            x: 0,
            duration: 0.6,
          }, '-=0.35')
          // 4. After a few seconds pause, the hero group (bunny + title) floats up
          .to(heroGroupRef.current, {
            y: 0,
            duration: 0.8,
            ease: 'power2.inOut',
          }, '+=1.0')
          // 5. Description comes in below
          .to(descRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.65,
          }, '-=0.3')
          // 6. Next button pops in bottom-right
          .to(nextBtnRef.current, {
            opacity: 1,
            scale: 1,
            x: 0,
            duration: 0.45,
            ease: 'back.out(1.6)',
          }, '-=0.15');
      }, containerRef);

      return () => ctx.revert();
    }
  }, [step]);

  // Transition from Step 1 to Step 2
  const handleNextClick = () => {
    gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setStep(2);
        },
      });

      tl.to([descRef.current, titleRef.current, nextBtnRef.current], {
        opacity: 0,
        y: -15,
        duration: 0.35,
        stagger: 0.05,
        ease: 'power2.in',
      }).to(bunnyRef.current, {
        opacity: 0,
        scale: 0.8,
        duration: 0.3,
      }, '-=0.1');
    }, containerRef);
  };

  // Animation for Step 2
  useLayoutEffect(() => {
    if (step === 2) {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

        gsap.set(step2ContentRef.current, { opacity: 0, y: 20 });
        gsap.set(ctaBtnRef.current, { opacity: 0, scale: 0.95 });

        tl.to(step2ContentRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.6,
        }).to(ctaBtnRef.current, {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: 'back.out(1.4)',
        }, '-=0.2');
      }, containerRef);

      return () => ctx.revert();
    }
  }, [step]);

  return (
    <div className="intro-card" ref={containerRef}>
      {step === 1 ? (
        <div className="intro-step1-wrapper">
          {/* Hero group: Title on the left, Bunny on the right */}
          <div className="intro-hero-group" ref={heroGroupRef}>
            <div className="intro-title-box">
              <h1 className="brand-title" ref={titleRef}>
                Hello, this is Buno
              </h1>
            </div>
            <div className="intro-bunny-box" ref={bunnyRef}>
              <BunnyLogo size={85} />
            </div>
          </div>

          <div className="intro-desc-box" ref={descRef}>
            <p className="intro-premise">
              Most budgeting apps show you exact remaining numbers, which backfires by giving you psychological "permission to spend."
            </p>
            <p className="intro-subtext">
              Buno replaces numeric micromanagement with <strong>qualitative spending zones</strong> and human nudges, keeping your pace calm and steady.
            </p>
          </div>

          <div className="intro-bottom-nav">
            <button
              className="next-btn"
              ref={nextBtnRef}
              onClick={handleNextClick}
              type="button"
            >
              Next →
            </button>
          </div>
        </div>
      ) : (
        <div className="intro-step2-wrapper" ref={step2ContentRef}>
          <div className="step2-logo">
            <BunnyLogo size={70} />
          </div>
          <h2 className="step2-title">Ready to take control without the stress?</h2>
          <p className="step2-subtitle">
            Define your monthly comfort limit. We'll monitor your pace with visual sketch indicators and gentle cues instead of rigid spreadsheets.
          </p>

          <button
            className="primary-btn pulse-glow"
            ref={ctaBtnRef}
            onClick={onContinue}
            type="button"
          >
            Set your monthly budget →
          </button>
        </div>
      )}
    </div>
  );
}
