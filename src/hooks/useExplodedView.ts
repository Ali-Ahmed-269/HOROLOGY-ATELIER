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
    // Reset all positions before GSAP initializes
    const reset = () => {
      refs.crystalRef.current  && (refs.crystalRef.current.position.z  = 0, refs.crystalRef.current.rotation.x  = 0)
      refs.dialRef.current     && (refs.dialRef.current.position.z      = 0, refs.dialRef.current.rotation.y      = 0)
      refs.handsRef.current    && (refs.handsRef.current.position.z     = 0, refs.handsRef.current.rotation.y     = 0)
      refs.bridgesRef.current  && (refs.bridgesRef.current.position.z   = 0, refs.bridgesRef.current.rotation.y   = 0)
      refs.casebackRef.current && (refs.casebackRef.current.position.z  = 0, refs.casebackRef.current.rotation.x  = 0)
    }
    reset()

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        paused: true,
        onUpdate: function() {
          refs.store.current.explodeProgress = this.progress()
        },
      })

      refs.crystalRef.current  && tl.fromTo(refs.crystalRef.current.position,  { z: 0 }, { z: 2.8  }, 0)
      refs.crystalRef.current  && tl.fromTo(refs.crystalRef.current.rotation,  { x: 0 }, { x: 0.1  }, 0)
      refs.dialRef.current     && tl.fromTo(refs.dialRef.current.position,     { z: 0 }, { z: 1.4  }, 0)
      refs.dialRef.current     && tl.fromTo(refs.dialRef.current.rotation,     { y: 0 }, { y: -0.15}, 0)
      refs.handsRef.current    && tl.fromTo(refs.handsRef.current.position,    { z: 0 }, { z: 0.6  }, 0)
      refs.handsRef.current    && tl.fromTo(refs.handsRef.current.rotation,    { y: 0 }, { y: 0.05 }, 0)
      refs.bridgesRef.current  && tl.fromTo(refs.bridgesRef.current.position,  { z: 0 }, { z: -1.2 }, 0)
      refs.bridgesRef.current  && tl.fromTo(refs.bridgesRef.current.rotation,  { y: 0 }, { y: 0.2  }, 0)
      refs.casebackRef.current && tl.fromTo(refs.casebackRef.current.position, { z: 0 }, { z: -2.5 }, 0)
      refs.casebackRef.current && tl.fromTo(refs.casebackRef.current.rotation, { x: 0 }, { x: -0.1 }, 0)

      ScrollTrigger.create({
        trigger: '#movement',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
        onUpdate: (self) => {
          tl.progress(self.progress)
          refs.store.current.explodeProgress = self.progress
        },
        onLeaveBack: () => {
          reset()
          refs.store.current.explodeProgress = 0
        },
      })
    })

    return () => ctx.revert()
  }, [])
}
