'use client'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import gsap from 'gsap'

export default function PageTransition() {
  const pathname = usePathname()
  const overlayRef = useRef<HTMLDivElement>(null)
  const isFirst = useRef(true)

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false
      return
    }
    if (!overlayRef.current) return

    const tl = gsap.timeline()
    tl.set(overlayRef.current, { scaleX: 0, transformOrigin: 'left center' })
    tl.to(overlayRef.current, {
      scaleX: 1,
      duration: 0.35,
      ease: 'power2.inOut',
    })
    tl.to(overlayRef.current, {
      scaleX: 0,
      transformOrigin: 'right center',
      duration: 0.35,
      ease: 'power2.inOut',
      delay: 0.1,
    })
  }, [pathname])

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'var(--color-rose-gold)',
        transform: 'scaleX(0)',
        transformOrigin: 'left center',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  )
}
