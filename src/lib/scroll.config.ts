/**
 * scroll.config.ts
 *
 * Central source of truth for all scroll-driven animation parameters.
 * DESIGN.md § Scroll Choreography: "Values live in a scroll.config.ts
 * constants file, not inline."
 *
 * Unit convention:
 *   rotationPerPx   — degrees of geometry rotation per 1px of scroll progress
 *   triggerStart    — ScrollTrigger `start` string (e.g. "top top")
 *   triggerEnd      — ScrollTrigger `end` string  (e.g. "bottom top")
 *   scrub           — GSAP scrub value (true = 1:1, number = smoothing seconds)
 */

export interface SectionScrollConfig {
  /** Section element ID (matches #id in page.tsx) */
  id: string
  /** Degrees per pixel of scroll progress for primary geometry rotation */
  rotationPerPx: number
  /** Axis of primary rotation: 'x' | 'y' | 'z' */
  rotationAxis: 'x' | 'y' | 'z'
  /** ScrollTrigger start descriptor */
  triggerStart: string
  /** ScrollTrigger end descriptor */
  triggerEnd: string
  /** GSAP scrub: true = immediate lock, number = seconds of lag smoothing */
  scrub: boolean | number
  /** Target Z-axis explosion depth for exploded view (Three.js units) */
  explodeDepth?: number
  /** DoF focusDistance target for this section's post-processing */
  dofFocusDistance?: number
  /** Camera position target [x, y, z] for this section */
  cameraTarget?: [number, number, number]
  /** Camera look-at target [x, y, z] for this section */
  lookAt?: [number, number, number]
}

/**
 * Per-section scroll choreography contracts.
 * All values are deliberately conservative for the first sprint;
 * adjust rotationPerPx once real geometry scale is known.
 */
export const SECTION_CONFIGS: Record<string, SectionScrollConfig> = {
  hero: {
    id: 'hero',
    rotationPerPx: 0.04,
    rotationAxis: 'y',
    triggerStart: 'top top',
    triggerEnd: 'bottom top',
    scrub: 1.2,
    dofFocusDistance: 0.02,
    cameraTarget: [0, 0, 6],
    lookAt: [0, 0, 0],
  },

  movement: {
    id: 'movement',
    rotationPerPx: 0.15, // DESIGN.md default reference value
    rotationAxis: 'y',
    triggerStart: 'top top',
    triggerEnd: 'bottom bottom',
    scrub: true, // 1:1 scroll lock — physical mapping
    explodeDepth: 3.5, // Three.js units of Z-spread on full explode
    dofFocusDistance: 0.05,
    cameraTarget: [0, 0.4, 5.2],
    lookAt: [0, 0, 0],
  },

  craftsmanship: {
    id: 'craftsmanship',
    rotationPerPx: 0.06,
    rotationAxis: 'x',
    triggerStart: 'top 80%',
    triggerEnd: 'bottom 20%',
    scrub: 1.5,
    dofFocusDistance: 0.01, // sharp focus — detail mode
    cameraTarget: [0.8, 0.2, 4.8],
    lookAt: [0, 0, 0],
  },

  specs: {
    id: 'specs',
    rotationPerPx: 0.03,
    rotationAxis: 'y',
    triggerStart: 'top 70%',
    triggerEnd: 'bottom 30%',
    scrub: 2,
    dofFocusDistance: 0.015,
    cameraTarget: [-0.6, -0.2, 5.5],
    lookAt: [0, 0, 0],
  },

  reserve: {
    id: 'reserve',
    rotationPerPx: 0.02,
    rotationAxis: 'y',
    triggerStart: 'top 60%',
    triggerEnd: 'bottom bottom',
    scrub: 2.5,
    dofFocusDistance: 0.025,
    cameraTarget: [0, 0, 6],
    lookAt: [0, 0, 0],
  },
}

/**
 * Global scene constants
 */
export const SCENE_CONSTANTS = {
  /** Base camera FOV (degrees) */
  cameraFov: 45,

  /** Camera transition duration in seconds (GSAP cinematic) */
  cameraTransitionDuration: 1.8,

  /** GSAP ease for camera moves */
  cameraEase: 'power3.inOut',

  /** Minimum scroll progress (0–1) to begin exploded view */
  explodeThreshold: 0.05,

  /** Maximum scroll progress (0–1) at which full explosion is reached */
  explodeFullAt: 0.85,

  /** Idle rotation speed (radians/sec) when no scroll is active */
  idleRotationSpeed: 0.004,

  /** DoF transition duration (seconds) */
  dofTransitionDuration: 0.9,

  /**
   * Gear ratio table — maps component pairs to their tooth-count ratio.
   * Used to compute arithmetically correct rotation angles in the
   * exploded view gear-sync animation.
   * Values are placeholders; replace with actual [CALIBRE NUMBER] ratios.
   */
  gearRatios: {
    mainspring_to_barrel:   1 / 1,
    barrel_to_centre:       1 / 8,
    centre_to_third:        1 / 8,
    third_to_fourth:        1 / 8,
    fourth_to_escape:       1 / 8,
  },
} as const

/**
 * Easing identifiers for GSAP CustomEase (registered in LenisProvider).
 * Reference: DESIGN.md § Motion & Easing
 */
export const GSAP_EASINGS = {
  mechanical: 'mechanical', // cubic-bezier(0.25, 0.00, 0.10, 1.00)
  sweep:      'sweep',      // cubic-bezier(0.60, 0.00, 0.40, 1.00)
  settle:     'settle',     // cubic-bezier(0.05, 0.70, 0.10, 1.00)
} as const

/**
 * Duration tokens in seconds (mirrors CSS --dur-* in globals.css)
 */
export const DURATIONS = {
  instant:   0.12,
  fast:      0.28,
  mid:       0.50,
  slow:      0.90,
  cinematic: 1.80,
} as const
