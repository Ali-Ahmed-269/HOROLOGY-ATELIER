'use client'

import { useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { PerspectiveCamera, Environment, Preload } from '@react-three/drei'
import { EffectComposer, DepthOfField, Bloom, Vignette } from '@react-three/postprocessing'
import { DepthOfFieldEffect } from 'postprocessing'
import * as THREE from 'three'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { SECTION_CONFIGS, SCENE_CONSTANTS } from '@/lib/scroll.config'
import { PostProcessingErrorBoundary } from './PostProcessingErrorBoundary'
import { useExplodedView } from '@/hooks/useExplodedView'
import { useReducedMotion } from '@/hooks/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

/* ─────────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────────── */

/** Shared mutable store passed via ref — avoids React re-renders */
interface SceneStore {
  /** 0–1 normalised progress through the #movement section */
  explodeProgress: number
  /** Signed scroll velocity (px/frame), smoothed */
  scrollVelocity: number
  /** Raw scroll Y, updated every frame */
  scrollY: number
}

/* ─────────────────────────────────────────────────────────────
   StudioLighting — DESIGN.md rig
   Key   : DirectionalLight warm (#FFF5E0) at [5, 8, 5]   intensity 2.5
   Fill  : DirectionalLight cool (#D0E0FF) at [-3, 2, -2]  intensity 0.4
   Rim   : SpotLight rose-gold  (#D4AF37) at [0, 8, -4]   intensity 1.2
   Ambient: near-black                                      intensity 0.15
   ───────────────────────────────────────────────────────────── */
function StudioLighting() {
  const rimRef = useRef<THREE.SpotLight>(null)
  return (
    <>
      <directionalLight
        position={[5, 8, 5]}
        intensity={2.5}
        color="#FFF5E0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-near={0.1}
      />
      <directionalLight position={[-3, 2, -2]} intensity={0.4} color="#D0E0FF" />
      <spotLight
        ref={rimRef}
        position={[0, 8, -4]}
        intensity={1.2}
        color="#D4AF37"
        angle={0.45}
        penumbra={0.6}
        decay={2}
        distance={30}
      />
      <ambientLight intensity={0.15} color="#1A1410" />
    </>
  )
}

/* ─────────────────────────────────────────────────────────────
   PostStack — DESIGN.md § Post-Processing
   DepthOfField | Bloom (specular only) | Vignette (persistent)
   ───────────────────────────────────────────────────────────── */
interface PostStackProps {
  dofRef?: React.RefObject<DepthOfFieldEffect | null>
  isMobile: boolean
}

function PostStack({ dofRef, isMobile }: PostStackProps) {
  const gl = useThree((state) => state.gl)

  const isContextHealthy = useMemo(() => {
    try {
      if (!gl || !gl.getContext()) return false
      const attrs = gl.getContextAttributes()
      return attrs !== null && attrs !== undefined
    } catch {
      return false
    }
  }, [gl])

  if (!isContextHealthy) {
    console.warn('CHRONOS ATELIER — PostStack deferred until context healthy')
    return null
  }

  return (
    <EffectComposer multisampling={isMobile ? 0 : 4}>
      {!isMobile && <DepthOfField ref={dofRef} focusDistance={0.015} focalLength={0.05} bokehScale={1.5} height={480} />}
      <Bloom luminanceThreshold={0.85} luminanceSmoothing={0.4} intensity={isMobile ? 0.08 : 0.15} mipmapBlur />
      <Vignette offset={0.4} darkness={0.7} eskil={false} />
    </EffectComposer>
  )
}

/* ─────────────────────────────────────────────────────────────
   MaterialPresets — shared PBR material instances
   Defined once outside components to avoid re-creation per frame
   ───────────────────────────────────────────────────────────── */
const roseGoldMat = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color('#D4AF37'),
  metalness: 0.95,
  roughness: 0.12,
  reflectivity: 1,
  envMapIntensity: 1.8,
})

const platinumMat = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color('#9D9DAA'),
  metalness: 0.98,
  roughness: 0.35,
  envMapIntensity: 1.2,
})

const bluedSteelMat = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#2A3F6A'),
  metalness: 1,
  roughness: 0.05,
})

const markerMat = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#E5C158'),
  metalness: 1,
  roughness: 0.1,
})

const handMat = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#E8E8F0'),
  metalness: 0.9,
  roughness: 0.15,
})

const dialMat = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color('#D8D0C0'),
  metalness: 0.0,
  roughness: 0.85,
  envMapIntensity: 0.0,
  clearcoat: 0.3,
  clearcoatRoughness: 0.4,
})

const crystalMat = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color('#C8D8F0'),
  transmission: 0.95,
  thickness: 2,
  ior: 1.77,
  roughness: 0.02,
  metalness: 0,
  transparent: true,
  opacity: 0.35,
  envMapIntensity: 2,
})

/* ─────────────────────────────────────────────────────────────
   WatchExploded
   5 distinct layer groups driven apart along the Z-axis by
   GSAP ScrollTrigger scrub on the #movement section.

   Layer stack (Z-offset at full explode, from SECTION_CONFIGS.movement.explodeDepth = 3.5):
     Layer 0 — Caseback / mainspring barrel     z: -1.40  (deepest)
     Layer 1 — Movement bridges & jewels        z: -0.70
     Layer 2 — Dial & hour markers (assembled)  z:  0.00  (pivot)
     Layer 3 — Hands (hour + minute)            z: +0.70
     Layer 4 — Sapphire crystal                 z: +1.40  (shallowest)

   The ScrollTrigger proxy object `explodeProxy` holds a single
   `progress` value (0→1). useFrame reads it each tick and lerps
   each group's Z position, keeping Three.js mutations off the
   React render path entirely.
   ───────────────────────────────────────────────────────────── */

interface WatchExplodedProps {
  store: React.MutableRefObject<SceneStore>
}

const EXPLODE_DEPTH = SECTION_CONFIGS.movement.explodeDepth ?? 3.5
const LAYER_OFFSETS = [-0.40, -0.20, 0.0, 0.20, 0.40] // multipliers × EXPLODE_DEPTH

/** Marker geometry — shared, created once */
const markerGeos = Array.from({ length: 12 }).map((_, i) => {
  const isQuarter = i % 3 === 0
  return new THREE.BoxGeometry(isQuarter ? 0.06 : 0.03, 0.005, isQuarter ? 0.16 : 0.10)
})

function WatchExploded({ store }: WatchExplodedProps) {
  /* ── Group refs — one per layer ─────────────────── */
  const casebackRef = useRef<THREE.Group>(null) // layer 0
  const bridgesRef = useRef<THREE.Group>(null) // layer 1
  const dialRef = useRef<THREE.Group>(null) // layer 2 (pivot)
  const handsRef = useRef<THREE.Group>(null) // layer 3
  const crystalRef = useRef<THREE.Group>(null) // layer 4

  /* ── Hover target refs — one primary mesh per layer ── */
  const hoverCaseRef = useRef<THREE.Mesh>(null)
  const hoverBridgeRef = useRef<THREE.Mesh>(null)
  const hoverDialRef = useRef<THREE.Mesh>(null)
  const hoverCrystalRef = useRef<THREE.Mesh>(null)
  const hoverHandsRef = useRef<THREE.Mesh>(null)

  /* ── Per-instance hover materials (cloned so mutation is isolated) ── */
  const caseHoverMat = useMemo(() => roseGoldMat.clone(), [])
  const bridgeHoverMat = useMemo(() => platinumMat.clone(), [])
  const dialHoverMat = useMemo(() => dialMat.clone(), [])
  const crystalHoverMat = useMemo(() => crystalMat.clone(), [])
  const handsHoverMat = useMemo(() => handMat.clone(), [])

  /* ── Hover state ref — no re-renders ── */
  const hoveredLayer = useRef<string | null>(null)

  /* ── Touch device detection ── */
  const [isTouch, setIsTouch] = useState(false)
  useEffect(() => {
    setIsTouch(typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0))
  }, [])

  /* ── DOM HUD helper — reads overlay divs from page.tsx ── */
  const getHudEl = (id: string) =>
    typeof document !== 'undefined'
      ? document.getElementById(`hud-${id}`) as HTMLDivElement | null
      : null

  useExplodedView({
    crystalRef:  crystalRef  as React.RefObject<THREE.Group>,
    dialRef:     dialRef     as React.RefObject<THREE.Group>,
    handsRef:    handsRef    as React.RefObject<THREE.Group>,
    bridgesRef:  bridgesRef  as React.RefObject<THREE.Group>,
    casebackRef: casebackRef as React.RefObject<THREE.Group>,
    store,
  })

  const handlePointerOver = (
    layerName: string,
    mat: THREE.MeshPhysicalMaterial | THREE.MeshStandardMaterial
  ) => (e: ThreeEvent<PointerEvent>) => {
    if (store.current.explodeProgress < 0.15) return
    e.stopPropagation()
    hoveredLayer.current = layerName
    mat.emissive.setHex(0xD4AF37)
    mat.emissiveIntensity = 0.25
    document.body.style.cursor = 'pointer'
    const hud = getHudEl(layerName)
    if (hud) hud.style.opacity = '1'
  }

  const handlePointerOut = (
    layerName: string,
    mat: THREE.MeshPhysicalMaterial | THREE.MeshStandardMaterial
  ) => () => {
    mat.emissive.setHex(0x000000)
    mat.emissiveIntensity = 0
    if (hoveredLayer.current === layerName) {
      hoveredLayer.current = null
      document.body.style.cursor = 'auto'
    }
    const hud = getHudEl(layerName)
    if (hud) hud.style.opacity = '0'
  }

  /* ── Geometry: 12 hour marker positions (memoised) ── */
  const markerPositions = useMemo(() =>
    Array.from({ length: 12 }).map((_, i) => {
      const angle = (i / 12) * Math.PI * 2
      return {
        pos: [Math.sin(angle) * 0.78, 0.195, Math.cos(angle) * 0.78] as [number, number, number],
        rot: [0, -angle, 0] as [number, number, number],
        geo: markerGeos[i],
        large: i % 3 === 0,
      }
    }),
    [])

  return (
    /* Root group — idle Y rotation applied here so all layers share it */
    <group position={[0, 0, 0]}>

      {/* ── Layer 0: Caseback / barrel (deepest) ──── */}
      <group ref={casebackRef}>
        {/* Outer case — rose gold */}
        <mesh
          ref={hoverCaseRef}
          castShadow receiveShadow
          material={caseHoverMat}
          onPointerOver={isTouch ? undefined : handlePointerOver('caseback', caseHoverMat)}
          onPointerOut={isTouch ? undefined : handlePointerOut('caseback', caseHoverMat)}
        >
          <cylinderGeometry args={[1.1, 1.1, 0.35, 64]} />
        </mesh>
        {/* Crown */}
        <mesh position={[1.18, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={platinumMat}>
          <cylinderGeometry args={[0.12, 0.12, 0.28, 32]} />
        </mesh>
        {/* Mainspring barrel placeholder (small inner cylinder) */}
        <mesh position={[0, -0.10, 0]} material={platinumMat}>
          <cylinderGeometry args={[0.52, 0.52, 0.08, 48]} />
        </mesh>
      </group>

      {/* ── Layer 1: Bridges & jewels ─────────────── */}
      <group ref={bridgesRef}>
        {/* Main plate */}
        <mesh
          ref={hoverBridgeRef}
          position={[0, 0.06, 0]}
          material={bridgeHoverMat}
          onPointerOver={isTouch ? undefined : handlePointerOver('bridges', bridgeHoverMat)}
          onPointerOut={isTouch ? undefined : handlePointerOut('bridges', bridgeHoverMat)}
        >
          <cylinderGeometry args={[0.90, 0.90, 0.04, 64]} />
        </mesh>
        {/* Centre bridge */}
        <mesh position={[0, 0.09, 0]} material={platinumMat}>
          <boxGeometry args={[0.60, 0.025, 0.22]} />
        </mesh>
        {/* Barrel bridge */}
        <mesh position={[0.28, 0.09, 0.18]} rotation={[0, 0.4, 0]} material={platinumMat}>
          <boxGeometry args={[0.36, 0.022, 0.14]} />
        </mesh>
        {/* Pallet fork bridge */}
        <mesh position={[-0.22, 0.09, -0.20]} rotation={[0, -0.6, 0]} material={platinumMat}>
          <boxGeometry args={[0.28, 0.020, 0.10]} />
        </mesh>
        {/* Blued screws — 6 positions */}
        {[
          [0.55, 0.115, 0.30],
          [-0.55, 0.115, 0.30],
          [0.55, 0.115, -0.30],
          [-0.55, 0.115, -0.30],
          [0.00, 0.115, 0.62],
          [0.00, 0.115, -0.62],
        ].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]} material={bluedSteelMat}>
            <cylinderGeometry args={[0.028, 0.028, 0.018, 12]} />
          </mesh>
        ))}
        {/* Centre jewel (red ruby approximation) */}
        <mesh position={[0, 0.105, 0]} material={new THREE.MeshStandardMaterial({ color: '#8B1A1A', metalness: 0.2, roughness: 0.1 })}>
          <cylinderGeometry args={[0.035, 0.035, 0.022, 16]} />
        </mesh>
      </group>

      {/* ── Layer 2: Dial & hour markers (pivot) ─── */}
      <group ref={dialRef}>
        {/* Dial face */}
        <mesh
          ref={hoverDialRef}
          position={[0, 0.18, 0]}
          castShadow
          material={dialHoverMat}
          onPointerOver={isTouch ? undefined : handlePointerOver('dial', dialHoverMat)}
          onPointerOut={isTouch ? undefined : handlePointerOut('dial', dialHoverMat)}
        >
          <cylinderGeometry args={[0.98, 0.98, 0.02, 64]} />
        </mesh>
        {/* Hour markers */}
        {markerPositions.map(({ pos, rot, geo }, i) => (
          <mesh key={i} position={pos} rotation={rot} geometry={geo} material={markerMat} />
        ))}
        {/* Centre pip — blued steel */}
        <mesh position={[0, 0.22, 0]} material={bluedSteelMat}>
          <cylinderGeometry args={[0.04, 0.04, 0.012, 32]} />
        </mesh>
      </group>

      {/* ── Layer 3: Hands ───────────────────────── */}
      <group ref={handsRef}>
        {/* Hour hand — 10 o'clock position, offset so pivot is at center */}
        <group rotation={[0, -Math.PI * 0.17, 0]}>
          <mesh
            ref={hoverHandsRef}
            position={[0, 0.21, -0.16]}
            material={handsHoverMat}
            onPointerOver={isTouch ? undefined : handlePointerOver('hands', handsHoverMat)}
            onPointerOut={isTouch ? undefined : handlePointerOut('hands', handsHoverMat)}
          >
            <boxGeometry args={[0.04, 0.006, 0.32]} />
          </mesh>
        </group>
        {/* Minute hand — 2 o'clock position */}
        <group rotation={[0, Math.PI * 0.17, 0]}>
          <mesh position={[0, 0.215, -0.22]} material={handMat}>
            <boxGeometry args={[0.028, 0.005, 0.44]} />
          </mesh>
        </group>
        {/* Seconds hand — 30 seconds position */}
        <group rotation={[0, Math.PI * 0.5, 0]}>
          <mesh position={[0, 0.218, -0.28]} material={roseGoldMat}>
            <boxGeometry args={[0.012, 0.003, 0.56]} />
          </mesh>
        </group>
      </group>

      {/* ── Layer 4: Sapphire crystal (shallowest) ── */}
      <group ref={crystalRef}>
        <mesh
          ref={hoverCrystalRef}
          position={[0, 0.22, 0]}
          material={crystalHoverMat}
          onPointerOver={isTouch ? undefined : handlePointerOver('crystal', crystalHoverMat)}
          onPointerOut={isTouch ? undefined : handlePointerOut('crystal', crystalHoverMat)}
        >
          <cylinderGeometry args={[0.96, 0.96, 0.04, 64]} />
        </mesh>
      </group>

    </group>
  )
}

/* ─────────────────────────────────────────────────────────────
   GearKinematics
   Renders a set of stylised gear-wheel meshes that rotate in
   opposing directions at arithmetically correct speeds derived
   from SCENE_CONSTANTS.gearRatios.

   Architecture:
   - Gear rotation angles are accumulated in useFrame using
     state.clock.elapsedTime as the monotonic time source.
   - Scroll velocity from store.current.scrollVelocity scales
     the rotation speed — faster scroll = faster gear spin,
     matching the DESIGN.md "physical coherence" principle.
   - Direction alternates per gear (driver clockwise → driven
     counter-clockwise → ...) matching real escapement trains.
   - Placed at Y = -0.15 so they sit just below the dial plane
     and become visible during the exploded-view phase.
   ───────────────────────────────────────────────────────────── */

interface GearKinematicsProps {
  store: React.MutableRefObject<SceneStore>
  reducedMotion: boolean
}

/** Cumulative gear chain ratios relative to the mainspring */
const GEAR_CHAIN = (() => {
  const r = SCENE_CONSTANTS.gearRatios
  // Each entry: [cumulativeRatio, direction, xOffset, radius]
  // Direction: 1 = CW from above (positive Y rotation), -1 = CCW
  return [
    { ratio: r.mainspring_to_barrel, dir: 1, x: 0.00, r: 0.50 }, // barrel
    { ratio: r.mainspring_to_barrel * r.barrel_to_centre, dir: -1, x: 0.54, r: 0.22 }, // centre wheel
    { ratio: r.mainspring_to_barrel * r.barrel_to_centre * r.centre_to_third, dir: 1, x: 0.28, r: 0.14 }, // third wheel
    { ratio: r.mainspring_to_barrel * r.barrel_to_centre * r.centre_to_third * r.third_to_fourth, dir: -1, x: -0.20, r: 0.10 }, // fourth
    { ratio: r.mainspring_to_barrel * r.barrel_to_centre * r.centre_to_third * r.third_to_fourth * r.fourth_to_escape, dir: 1, x: -0.38, r: 0.08 }, // escape
  ]
})()

/** Per-gear signed rotation ratios for Z-axis kinematics */
const GEAR_ROT_RATIOS = [1.0, -0.125, 0.125, -0.125, 0.125]

function GearKinematics({ store, reducedMotion }: GearKinematicsProps) {
  const groupRef = useRef<THREE.Group>(null)
  const gearRefs = useRef<THREE.Mesh[]>([])
  const { gl } = useThree()

  /** Tooth-mark geometry — shared flat cylinder per gear, created once */
  const gearGeos = useMemo(() =>
    GEAR_CHAIN.map(g => new THREE.CylinderGeometry(g.r, g.r, 0.022, Math.round(g.r * 80 + 12))),
    [])

  const gearMats = useMemo(() =>
    GEAR_CHAIN.map((_, i) => {
      const mat = (i === 0 ? roseGoldMat : platinumMat).clone()
      mat.transparent = true
      mat.opacity = 0
      return mat
    }),
  [])

  useFrame((_, delta) => {
    if (!groupRef.current) return

    // only accumulate gear rotation when the canvas element is in the viewport
    const rect = gl.domElement.getBoundingClientRect()
    const isVisible = rect.bottom > 0 && rect.top < window.innerHeight
    if (!isVisible) return

    // When motion is reduced, freeze gear rotation at its current angle
    if (!reducedMotion) {
      const velocity = (window as unknown as { lenis?: { velocity: number } }).lenis?.velocity ?? 0

      gearRefs.current.forEach((mesh, i) => {
        if (!mesh) return
        mesh.rotation.z += GEAR_ROT_RATIOS[i] * delta * (1 + Math.abs(velocity) * 2)
      })
    }

    // Fade gears in/out with explode progress
    const p = store.current.explodeProgress
    const opacity = Math.min(p * 3, 1)
    gearMats.forEach(mat => {
      mat.opacity = Math.max(opacity, 0)
    })
  })

  return (
    <group ref={groupRef} position={[0, -0.15, 0]}>
      {GEAR_CHAIN.map((g, i) => (
        <mesh
          key={i}
          ref={el => { if (el) gearRefs.current[i] = el }}
          position={[g.x, 0, 0.05]}
          geometry={gearGeos[i]}
          material={gearMats[i]}
          castShadow
        />
      ))}
    </group>
  )
}

/* ─────────────────────────────────────────────────────────────
   ScrollVelocityTracker
   Measures raw scroll velocity each frame and writes it into
   the shared store so GearKinematics and WatchExploded can
   read it without subscribing to DOM events themselves.

   Uses useFrame so it runs inside the R3F loop — same tick as
   the geometry updates, guaranteeing no off-by-one-frame lag.
   ───────────────────────────────────────────────────────────── */
function ScrollVelocityTracker({ store }: { store: React.MutableRefObject<SceneStore> }) {
  useFrame(() => {
    const y = window.scrollY
    const vel = y - store.current.scrollY
    // Exponential moving average for smooth deceleration
    store.current.scrollVelocity = store.current.scrollVelocity * 0.82 + vel * 0.18
    store.current.scrollY = y
  })
  return null
}

/* ─────────────────────────────────────────────────────────────
   HeroScrollTrigger
   Handles the hero section: subtle Y-rotation of the whole
   scene driven by scroll, using SECTION_CONFIGS.hero values.

   When reducedMotion is true:
   - The ScrollTrigger is not created at all
   - rotation.y is explicitly zeroed so there is no residual
     angle from a previous session or a half-initialised frame
   ───────────────────────────────────────────────────────────── */
interface HeroScrollTriggerProps {
  rootRef: React.RefObject<THREE.Group | null>
  reducedMotion: boolean
}

function HeroScrollTrigger({ rootRef, reducedMotion }: HeroScrollTriggerProps) {
  useEffect(() => {
    // Always start with a clean rotation.y so there is no residual
    // angle regardless of motion preference
    if (rootRef.current) {
      rootRef.current.rotation.y = 0
    }

    // When motion is reduced, hold at rest — no ScrollTrigger needed
    if (reducedMotion) return

    const cfg = SECTION_CONFIGS.hero
    const el = document.getElementById(cfg.id)
    if (!el || !rootRef.current) return

    const st = ScrollTrigger.create({
      trigger: el,
      start: cfg.triggerStart,
      end: cfg.triggerEnd,
      scrub: cfg.scrub,
      // immediateRender: false prevents GSAP firing onUpdate synchronously
      // on creation — that synchronous call was the source of the one-frame
      // spin artifact on mount, even when starting at scroll=0.
      immediateRender: false,
      onUpdate: (self) => {
        if (rootRef.current) {
          rootRef.current.rotation.y = self.progress * (cfg.rotationPerPx * 600)
        }
      },
    })

    return () => {
      st.kill()
      // Reset rotation when the trigger is torn down (e.g. reducedMotion toggle)
      if (rootRef.current) {
        rootRef.current.rotation.y = 0
      }
    }
  }, [rootRef, reducedMotion])

  return null
}

/* ─────────────────────────────────────────────────────────────
   SceneRoot — combines all scene objects with shared store ref
   Isolated so useThree() is available (must be inside <Canvas>)
   ───────────────────────────────────────────────────────────── */
function SceneRoot({ onReady, isMobile }: { onReady?: () => void; isMobile: boolean }) {
  const { gl, camera } = useThree()
  const rootRef = useRef<THREE.Group>(null)
  const dofRef = useRef<DepthOfFieldEffect | null>(null)
  const cameraTarget = useRef(new THREE.Vector3(0, 1.5, 4))
  const targetFocusDistance = useRef(0.02)

  /* ── Reduced-motion preference ───────────────────── */
  const { reducedMotion } = useReducedMotion()

  /** Mutable store — written by tracker, read by kinematics/explode */
  const store = useRef<SceneStore>({
    explodeProgress: 0,
    scrollVelocity: 0,
    scrollY: typeof window !== 'undefined' ? window.scrollY : 0,
  })

  useEffect(() => {
    onReady?.()
  }, [])

  const hasLoggedOnMount = useRef(false)

  // Immediately set the camera to hero section resting position/rotation when reducedMotion is true
  useEffect(() => {
    if (reducedMotion) {
      camera.position.set(0, 1.5, 4)
      camera.rotation.set(0, 0, 0)
      cameraTarget.current.set(0, 1.5, 4)
      targetFocusDistance.current = 0.02
      if (dofRef.current) {
        dofRef.current.cocMaterial.focusDistance = 0.02
      }
      
      if (!hasLoggedOnMount.current) {
        console.log('Reduced motion active on mount. Camera position set to:', camera.position.x, camera.position.y, camera.position.z)
        hasLoggedOnMount.current = true
      }
    }
  }, [reducedMotion, camera])

  useEffect(() => {
    // When reducedMotion is true, do not create ANY of these camera ScrollTriggers at all
    if (reducedMotion) {
      return
    }

    const setCamera = (x: number, y: number, z: number, focus: number) => {
      cameraTarget.current.set(x, y, z)
      targetFocusDistance.current = focus
    }

    const triggers = [
      ScrollTrigger.create({
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        onEnter: () => setCamera(0, 1.5, 4, 0.02),
        onEnterBack: () => setCamera(0, 1.5, 4, 0.02),
      }),
      ScrollTrigger.create({
        trigger: '#movement',
        start: 'top top',
        end: 'bottom top',
        onEnter: () => setCamera(0, 0.8, 3.5, 0.008),
        onEnterBack: () => setCamera(0, 0.8, 3.5, 0.008),
      }),
      ScrollTrigger.create({
        trigger: '#craftsmanship',
        start: 'top top',
        end: 'bottom top',
        onEnter: () => setCamera(0, 0.2, 3.5, 0.015),
        onEnterBack: () => setCamera(0, 0.2, 3.5, 0.015),
      }),
      ScrollTrigger.create({
        trigger: '#specs',
        start: 'top top',
        end: 'bottom top',
        onEnter: () => setCamera(-0.2, -0.1, 2.0, 0.006),
        onEnterBack: () => setCamera(-0.2, -0.1, 2.0, 0.006),
      }),
    ]

    return () => triggers.forEach(t => t.kill())
  }, [reducedMotion, camera]) // eslint-disable-line react-hooks/exhaustive-deps

  useFrame(() => {
    if (!reducedMotion) {
      // Camera lerp toward target — disabled when motion is reduced
      camera.position.lerp(cameraTarget.current, 0.04)

      // DOF focal distance lerp — mutates effect directly, no re-render
      if (dofRef.current) {
        dofRef.current.cocMaterial.focusDistance = THREE.MathUtils.lerp(
          dofRef.current.cocMaterial.focusDistance,
          targetFocusDistance.current,
          0.05
        )
      }
    } else {
      // Freeze post-processing at its hero-section values and hold camera
      if (dofRef.current && dofRef.current.cocMaterial.focusDistance !== 0.02) {
        dofRef.current.cocMaterial.focusDistance = 0.02
      }
    }
  })

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.5, 4]} fov={50} near={0.01} far={100} />
      <StudioLighting />
      <Environment preset="studio" environmentIntensity={0.4} />

      {/* Scroll velocity — runs every frame, feeds store */}
      <ScrollVelocityTracker store={store} />

      {/* Root group for hero-section rotation */}
      <group ref={rootRef} position={[0, 0.3, 0]} rotation={[0.15, 0, 0]}>
        <WatchExploded store={store} />
        <GearKinematics store={store} reducedMotion={reducedMotion} />
      </group>

      {/* Hero rotation driven by ST — skipped when motion is reduced */}
      <HeroScrollTrigger rootRef={rootRef} reducedMotion={reducedMotion} />

      <PostProcessingErrorBoundary>
        <PostStack dofRef={dofRef} isMobile={isMobile} />
      </PostProcessingErrorBoundary>
      <Preload all />
    </>
  )
}

/* ─────────────────────────────────────────────────────────────
   SceneCanvas — Fixed full-screen WebGL overlay
   DESIGN.md § Three.js / WebGL Conventions
   ───────────────────────────────────────────────────────────── */
interface SceneCanvasProps {
  onReady?: () => void
}

export default function SceneCanvas({ onReady }: SceneCanvasProps) {
  const [webglAvailable, setWebglAvailable] = useState<boolean | null>(null)
  const [isGlReady, setIsGlReady] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent))
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      setWebglAvailable(!!gl)
      if (!gl) onReady?.()
    } catch {
      setWebglAvailable(false)
      onReady?.()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const cleanupRef = useRef<(() => void) | null>(null)

  if (webglAvailable === null) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          background: '#0A0A0C',
          pointerEvents: 'none',
        }}
      />
    )
  }

  if (!webglAvailable) {
    return (
      <div
        aria-label="CHRONOS ATELIER — luxury mechanical timepiece displayed as a decorative still"
        role="img"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          background: 'radial-gradient(circle at 50% 40%, rgba(184, 150, 46, 0.15) 0%, var(--color-void) 80%)',
          pointerEvents: 'none',
        }}
      />
    )
  }

  return (
    <div
      aria-label="Interactive 3D view of CHRONOS ATELIER timepiece — scroll to disassemble the movement"
      role="img"
      className="canvas-container"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches
          ? 'none'
          : 'auto'
      }}
    >
      <Canvas
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        dpr={isMobile ? [1, 1] : [1, 2]}
        shadows={{ type: THREE.PCFShadowMap }}
        camera={{ position: [0, 0, 6], fov: 45, near: 0.01, far: 100 }}
        style={{ background: '#0A0A0C' }}
        frameloop="always"
        eventSource={typeof document !== 'undefined'
          ? document.documentElement
          : undefined}
        eventPrefix="client"
        onCreated={({ gl: r3fGl }) => {
          // Configure shadows & tone mapping directly after context creation
          r3fGl.shadowMap.enabled = true
          r3fGl.shadowMap.type = THREE.PCFShadowMap
          r3fGl.toneMapping = THREE.ACESFilmicToneMapping
          r3fGl.toneMappingExposure = 0.85

          const canvasEl = r3fGl.domElement
          if (canvasEl && typeof canvasEl.addEventListener === 'function') {
            const handleContextLost = (event: Event) => {
              event.preventDefault()
              console.warn('CHRONOS ATELIER — WebGL context lost.')
              setWebglAvailable(false)
              setIsGlReady(false)
            }
            canvasEl.addEventListener('webglcontextlost', handleContextLost)
            cleanupRef.current = () => {
              canvasEl.removeEventListener('webglcontextlost', handleContextLost)
            }
          }

          // Trigger loading veil dismissal & mark GL ready
          setIsGlReady(true)
          onReady?.()
          // Note: onReady is idempotent — LoadingVeil ignores duplicate calls
        }}
      >
        {isGlReady && <SceneRoot onReady={onReady} isMobile={isMobile} />}
      </Canvas>
    </div>
  )
}
