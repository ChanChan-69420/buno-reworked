import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import BunnyLogo from './icons/BunnyLogo';

interface IntroProps {
  onContinue: () => void;
}

export default function Intro({ onContinue }: IntroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bunnyRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      tl.fromTo(
        bunnyRef.current,
        { scale: 0.7, opacity: 0, y: -20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.8 }
      )
        .fromTo(
          textRef.current,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.7 },
          '-=0.3'
        )
        .fromTo(
          ctaRef.current,
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.5 },
          '-=0.2'
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="intro-card" ref={containerRef}>
      <div className="intro-logo" ref={bunnyRef}>
        <BunnyLogo size={90} />
      </div>

      <div className="intro-body" ref={textRef}>
        <h1 className="brand-title">Hello, this is Buno</h1>
        <p className="intro-premise">
          Most budgeting apps show you exact remaining numbers, which backfires by giving you psychological "permission to spend."
        </p>
        <p className="intro-subtext">
          Buno replaces numeric micromanagement with <strong>qualitative spending zones</strong> and human nudges, keeping your pace calm and steady.
        </p>
      </div>

      <button className="primary-btn" ref={ctaRef} onClick={onContinue}>
        Set your monthly budget →
      </button>
    </div>
  );
}
