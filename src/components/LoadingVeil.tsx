'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

/* ─────────────────────────────────────────────────────────────
   LoadingVeil
   A precision arc progress indicator in rose gold that covers
   the canvas while Three.js assets hydrate. Fades out once
   the canvas is ready.

   Usage:
     <LoadingVeil onComplete={() => setReady(true)} />

   The parent passes an `isReady` boolean; the veil fades and
   unmounts itself, freeing the z-index 200 layer.

   Hydration note:
     Math.cos / Math.sin produce JS floats whose string
     representations can differ between Node SSR and V8 in the
     browser, causing React to warn about a hydration mismatch.
     Fix: `clientReady` starts false (server renders nothing for
     the tick marks), flips to true in useEffect (client only),
     then the computed SVG coordinates are rendered exclusively
     in the browser. Static SVG elements (track, arc) are safe
     to SSR and are left outside the gate. Additionally, every
     computed coordinate is wrapped in Number(val.toFixed(4)) as
     a belt-and-suspenders guard if SSR ever reaches that branch.
   ─────────────────────────────────────────────────────────────*/

interface LoadingVeilProps {
  /** Set true when the WebGL canvas / assets are ready */
  isReady: boolean
  /** Called after the veil's exit animation completes */
  onComplete?: () => void
}

export default function LoadingVeil({ isReady, onComplete }: LoadingVeilProps) {
  const veilRef    = useRef<HTMLDivElement>(null)
  const arcRef     = useRef<SVGCircleElement>(null)
  const labelRef   = useRef<HTMLParagraphElement>(null)

  /** Controls final unmount after exit animation */
  const [mounted, setMounted] = useState(true)

  /**
   * Client-only gate — starts false so the server never renders
   * the computed SVG tick marks; flips to true after first paint.
   */
  const [clientReady, setClientReady] = useState(false)

  /* ── Client mount gate ───────────────────────────────────── */
  useEffect(() => {
    setClientReady(true)
  }, [])

  /* ── Animate progress arc while loading ──────────────────── */
  useEffect(() => {
    if (!arcRef.current) return

    const circumference = 2 * Math.PI * 35 // r=35
    arcRef.current.style.strokeDasharray  = `${circumference}`
    arcRef.current.style.strokeDashoffset = `${circumference}`

    // Simulated load progress: fill arc in ~1.8 s, hold at 95% until ready
    const tl = gsap.timeline()
    tl.to(arcRef.current, {
      strokeDashoffset: circumference * 0.05, // 95%
      duration: 1.6,
      ease: 'power2.inOut',
    })

    return () => { tl.kill() }
  }, [])

  /* ── Exit animation when canvas is ready ─────────────────── */
  useEffect(() => {
    if (!isReady || !veilRef.current) return

    const veil  = veilRef.current
    const arc   = arcRef.current
    const label = labelRef.current

    const tl = gsap.timeline({
      onComplete: () => {
        setMounted(false)
        onComplete?.()
      },
    })

    // Complete the arc
    if (arc) {
      tl.to(arc, {
        strokeDashoffset: 0,
        duration: 0.28,
        ease: 'power2.out',
      })
    }

    // Brief hold, then fade inner elements
    tl.to([label, arc].filter(Boolean), {
      opacity: 0,
      duration: 0.2,
      ease: 'power1.in',
    }, '+=0.15')

    // Fade the whole veil
    tl.to(veil, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.inOut',
    }, '-=0.1')

  }, [isReady, onComplete])

  if (!mounted) return null

  return (
    <div
      ref={veilRef}
      className="loading-veil"
      role="status"
      aria-label="Loading CHRONOS ATELIER — please wait"
      aria-live="polite"
      style={{ pointerEvents: isReady ? 'none' : 'all' }}
    >
      {/* Precision arc in rose gold */}
      <svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        aria-hidden="true"
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Track — static, safe to SSR */}
        <circle
          cx="40" cy="40" r="35"
          fill="none"
          stroke="rgba(212,175,55,0.12)"
          strokeWidth="1"
        />
        {/* Progress arc — static, safe to SSR */}
        <circle
          ref={arcRef}
          cx="40" cy="40" r="35"
          fill="none"
          stroke="var(--color-rose-gold)"
          strokeWidth="1"
          strokeLinecap="butt"
        />

        {/*
          Tick marks — CLIENT ONLY.
          Rendered only after `clientReady` flips to true in useEffect
          so computed Math.cos/Math.sin values never reach the server
          and cannot produce a hydration mismatch.
          Every coordinate is also normalised via toFixed(4) as a
          belt-and-suspenders guard for floating-point determinism.
        */}
        {clientReady &&
          Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * 360
            const rad   = (angle * Math.PI) / 180
            const r1    = 38
            const r2    = 40
            // Normalise to 4 d.p. — identical string on any JS engine
            const x1 = Number((40 + r1 * Math.cos(rad)).toFixed(4))
            const y1 = Number((40 + r1 * Math.sin(rad)).toFixed(4))
            const x2 = Number((40 + r2 * Math.cos(rad)).toFixed(4))
            const y2 = Number((40 + r2 * Math.sin(rad)).toFixed(4))
            return (
              <line
                key={i}
                x1={x1} y1={y1}
                x2={x2} y2={y2}
                stroke="rgba(212,175,55,0.3)"
                strokeWidth={i % 3 === 0 ? 1.5 : 0.75}
              />
            )
          })
        }
      </svg>

      {/* Logotype */}
      <p
        style={{
          fontFamily: 'var(--font-cormorant, "Cormorant Garamond", Georgia, serif)',
          fontSize: '0.9rem',
          fontWeight: 300,
          letterSpacing: 'var(--tracking-logotype)',
          color: 'var(--color-platinum-mid)',
          marginTop: 'var(--sp-5)',
        }}
      >
        CHRONOS ATELIER
      </p>

      {/* Status label */}
      <p
        ref={labelRef}
        className="font-tech spec-label"
        style={{ fontSize: 'var(--text-micro)', letterSpacing: '0.12em' }}
      >
        INITIALISING
      </p>
    </div>
  )
}
