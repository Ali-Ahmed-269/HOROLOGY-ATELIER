/**
 * useActiveSection
 *
 * Tracks which scroll section is currently in view using IntersectionObserver
 * and returns its ID string. Used by Navigation to apply the `.active` class
 * to the correct nav link without requiring GSAP or ScrollTrigger.
 *
 * Each observed section must have an `id` attribute matching one of the
 * keys in the `sectionIds` array. The active section updates when the
 * element is ≥ 40% visible in the viewport.
 */

'use client'

import { useEffect, useState } from 'react'

const DEFAULT_SECTIONS = ['hero', 'movement', 'craftsmanship', 'specs', 'reserve'] as const

export type SectionId = (typeof DEFAULT_SECTIONS)[number]

export function useActiveSection(
  sectionIds: readonly string[] = DEFAULT_SECTIONS
): string {
  const [activeId, setActiveId] = useState<string>(sectionIds[0])

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveId(id)
          }
        },
        {
          root: null,
          // Fires when section enters the middle 40% of the viewport
          rootMargin: '-20% 0px -40% 0px',
          threshold: 0,
        }
      )

      observer.observe(el)
      observers.push(observer)
    })

    return () => {
      observers.forEach((o) => o.disconnect())
    }
  }, [sectionIds])

  return activeId
}
