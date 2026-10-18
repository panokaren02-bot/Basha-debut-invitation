"use client"

import { useEffect, useState } from "react"
import { useReducedMotion } from "motion/react"

/**
 * useReducedMotion() is `null` on the server but `true`/`false` on the client's first
 * render — markup that branches on it causes a hydration mismatch, and React then
 * re-renders the whole tree (restarting every CSS animation). This returns `false`
 * until after hydration so the first client render always matches the server HTML.
 * CSS `@media (prefers-reduced-motion)` covers the visuals in the meantime.
 */
export function useHydratedReducedMotion(): boolean {
  const prefersReduced = useReducedMotion()
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])
  return hydrated && prefersReduced === true
}
