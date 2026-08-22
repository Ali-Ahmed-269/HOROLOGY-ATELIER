'use client'
import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type * as THREE from 'three'

gsap.registerPlugin(ScrollTrigger)

interface ExplodedRefs {
  crystalRef:  React.RefObject<THREE.Group>
  dialRef:     React.RefObject<THREE.Group>
  handsRef:    React.RefObject<THREE.Group>
  bridgesRef:  React.RefObject<THREE.Group>
  casebackRef: React.RefObject<THREE.Group>
}

export function useExplodedView(refs: ExplodedRefs) {
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '#movement',
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      })

      if (refs.crystalRef.current) {
        tl.to(refs.crystalRef.current.position,  { z: 2.8 },  0)
        tl.to(refs.crystalRef.current.rotation,  { x: 0.1 },  0)
      }
      if (refs.dialRef.current) {
        tl.to(refs.dialRef.current.position,  { z: 1.4 },   0)
        tl.to(refs.dialRef.current.rotation,  { y: -0.15 }, 0)
      }
      if (refs.handsRef.current) {
        tl.to(refs.handsRef.current.position,  { z: 0.6 },  0)
        tl.to(refs.handsRef.current.rotation,  { y: 0.05 }, 0)
      }
      if (refs.bridgesRef.current) {
        tl.to(refs.bridgesRef.current.position,  { z: -1.2 }, 0)
        tl.to(refs.bridgesRef.current.rotation,  { y: 0.2 },  0)
      }
      if (refs.casebackRef.current) {
        tl.to(refs.casebackRef.current.position,  { z: -2.5 },  0)
        tl.to(refs.casebackRef.current.rotation,  { x: -0.1 }, 0)
      }
    })

    return () => ctx.revert()
  }, [])
}
