/**
 * useReducedMotion
 *
 * Centralised source-of-truth for the reduced-motion preference.
 *
 * Priority (highest → lowest):
 *   1. Manual override set by the user toggle  → localStorage key "ca-reduced-motion"
 *   2. OS / browser `prefers-reduced-motion: reduce` media query
 *
 * API
 * ───
 *   reducedMotion          boolean — true when motion should be suppressed
 *   setManualOverride(v)   (v: boolean | null) => void
 *                          null  → clear override, defer to OS setting
 *                          true  → always reduce motion
 *                          false → always allow motion
 *
 * The hook is safe to call on the server (SSR) — it returns false and a
 * no-op setter until the browser hydrates, matching the default "motion
 * allowed" state that the rest of the page assumes during SSR.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'

const LS_KEY = 'ca-reduced-motion'

function readOsPreference(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function readLocalOverride(): boolean | null {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw === 'true')  return true
    if (raw === 'false') return false
  } catch {
    /* localStorage blocked (private mode, permissions policy) */
  }
  return null
}

function writeLocalOverride(value: boolean | null): void {
  try {
    if (value === null) {
      localStorage.removeItem(LS_KEY)
    } else {
      localStorage.setItem(LS_KEY, String(value))
    }
  } catch {
    /* ignore write errors */
  }
}

/**
 * Compute the effective boolean from override + OS preference.
 * Called both on mount and when either value changes.
 */
function resolve(override: boolean | null, osPref: boolean): boolean {
  return override !== null ? override : osPref
}

export function useReducedMotion(): {
  reducedMotion: boolean
  setManualOverride: (value: boolean | null) => void
} {
  // SSR-safe initial state — always false until hydration
  const [osPref, setOsPref]         = useState<boolean>(false)
  const [override, setOverride]     = useState<boolean | null>(null)
  const [reducedMotion, setResult]  = useState<boolean>(false)

  /* ── Hydrate from localStorage + OS on mount ───────────────── */
  useEffect(() => {
    const osMatch  = readOsPreference()
    const localVal = readLocalOverride()

    setOsPref(osMatch)
    setOverride(localVal)
    setResult(resolve(localVal, osMatch))

    /* ── Subscribe to OS-preference changes ─────────────────── */
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (e: MediaQueryListEvent) => {
      setOsPref(e.matches)
      // Recalculate with the current override value, read fresh from state
      setOverride(prev => {
        setResult(resolve(prev, e.matches))
        return prev // don't mutate override itself
      })
    }

    if (mq.addEventListener) {
      mq.addEventListener('change', handleChange)
    } else {
      // Safari < 14 fallback
      mq.addListener(handleChange)
    }

    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener('change', handleChange)
      } else {
        mq.removeListener(handleChange)
      }
    }
  }, [])

  /* ── Sync reducedMotion whenever override or osPref change ── */
  useEffect(() => {
    setResult(resolve(override, osPref))
  }, [override, osPref])

  /* ── Public setter ───────────────────────────────────────── */
  const setManualOverride = useCallback((value: boolean | null) => {
    writeLocalOverride(value)
    setOverride(value)
  }, [])

  return { reducedMotion, setManualOverride }
}
