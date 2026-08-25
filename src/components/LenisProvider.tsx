'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import CustomEase from 'gsap/CustomEase'

gsap.registerPlugin(ScrollTrigger, CustomEase)

/**
 * Register DESIGN.md easing curves as named GSAP CustomEase IDs.
 * Called once at module level — safe in strict-mode double-invoke
 * because GSAP deduplicates by name.
 *
 * mechanical  cubic-bezier(0.25, 0.00, 0.10, 1.00) — escapement impulse
 * sweep       cubic-bezier(0.60, 0.00, 0.40, 1.00) — blade-like transition
 * settle      cubic-bezier(0.05, 0.70, 0.10, 1.00) — hand-setting deceleration
 */
function registerEasings() {
  if (!CustomEase.get('mechanical')) {
    CustomEase.create('mechanical', 'M0,0 C0.25,0 0.10,1 1,1')
  }
  if (!CustomEase.get('sweep')) {
    CustomEase.create('sweep', 'M0,0 C0.60,0 0.40,1 1,1')
  }
  if (!CustomEase.get('settle')) {
    CustomEase.create('settle', 'M0,0 C0.05,0.70 0.10,1 1,1')
  }
}

registerEasings()

/**
 * LenisProvider
 *
 * Creates a single Lenis smooth-scroll instance for the whole document,
 * then wires it into GSAP's ticker so ScrollTrigger and R3F frame updates
 * stay lock-step — no judder, no drift.
 *
 * Architecture notes (DESIGN.md § Scroll Choreography):
 *  - Lenis drives the scroll position; GSAP reads it via ScrollTrigger.
 *  - `requestAnimationFrame` is delegated entirely to gsap.ticker so there
 *    is exactly one rAF loop on the page.
 *  - On prefers-reduced-motion: reduce, Lenis is destroyed immediately and
 *    the browser's native scroll is used; ScrollTrigger still works.
 */
export default function LenisProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    /* ── Respect user motion preference ─────────────── */
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (prefersReducedMotion) {
      ScrollTrigger.defaults({ scroller: window })
      return
    }

    /* ── Create Lenis instance ───────────────────────── */
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo-out
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2.0,
      infinite: false,
      autoRaf: false, // GSAP ticker drives RAF
    })

    lenisRef.current = lenis

    /* ── Sync Lenis → GSAP ScrollTrigger ────────────── */
    lenis.on('scroll', ScrollTrigger.update)

    /* ── GSAP ticker drives Lenis RAF ───────────────── */
    const onTick = (time: number) => {
      lenis.raf(time * 1000) // GSAP time in seconds → Lenis expects ms
    }

    gsap.ticker.add(onTick)
    gsap.ticker.lagSmoothing(0) // Lenis handles lag; GSAP compensation off

    /* ── Expose on window for R3F useFrame sync ──────── */
    ;(window as unknown as { lenis?: Lenis }).lenis = lenis

    return () => {
      gsap.ticker.remove(onTick)
      lenis.destroy()
      lenisRef.current = null
      ;(window as unknown as { lenis?: Lenis }).lenis = undefined
    }
  }, [])

  return <>{children}</>
}
