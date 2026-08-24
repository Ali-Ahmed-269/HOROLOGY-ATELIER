'use client'
import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type * as THREE from 'three'

gsap.registerPlugin(ScrollTrigger)

interface SceneStore {
  explodeProgress: number
  scrollVelocity: number
  scrollY: number
}

interface ExplodedRefs {
  crystalRef:  React.RefObject<THREE.Group>
  dialRef:     React.RefObject<THREE.Group>
  handsRef:    React.RefObject<THREE.Group>
  bridgesRef:  React.RefObject<THREE.Group>
  casebackRef: React.RefObject<THREE.Group>
  store:       React.MutableRefObject<SceneStore>
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
          onUpdate: (self) => {
            refs.store.current.explodeProgress = self.progress
          },
        },
      })

      if (refs.crystalRef.current) {
        tl.to(refs.crystalRef.current.position,  { z: 2.8,  immediateRender: false },  0)
        tl.to(refs.crystalRef.current.rotation,  { x: 0.1,  immediateRender: false },  0)
      }
      if (refs.dialRef.current) {
        tl.to(refs.dialRef.current.position,  { z: 1.4,   immediateRender: false },  0)
        tl.to(refs.dialRef.current.rotation,  { y: -0.15, immediateRender: false },  0)
      }
      if (refs.handsRef.current) {
        tl.to(refs.handsRef.current.position,  { z: 0.6,  immediateRender: false },  0)
        tl.to(refs.handsRef.current.rotation,  { y: 0.05, immediateRender: false },  0)
      }
      if (refs.bridgesRef.current) {
        tl.to(refs.bridgesRef.current.position,  { z: -1.2, immediateRender: false },  0)
        tl.to(refs.bridgesRef.current.rotation,  { y: 0.2,  immediateRender: false },  0)
      }
      if (refs.casebackRef.current) {
        tl.to(refs.casebackRef.current.position,  { z: -2.5,  immediateRender: false },  0)
        tl.to(refs.casebackRef.current.rotation,  { x: -0.1,  immediateRender: false },  0)
      }
    })

    return () => ctx.revert()
  }, [])
}
