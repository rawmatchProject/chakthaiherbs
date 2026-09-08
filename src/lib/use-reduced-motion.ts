"use client"

import { useSyncExternalStore } from "react"

const QUERY = "(prefers-reduced-motion: reduce)"

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY)
  mq.addEventListener("change", onChange)
  return () => mq.removeEventListener("change", onChange)
}

/**
 * Whether the reader has asked their system for less motion.
 *
 * This replaces `useReducedMotion` from `motion`, which was the only thing
 * the whole animation library was imported for — a large client bundle for
 * one media query. The server snapshot is `false` so the markup ships with
 * the animated variant and the client corrects it, matching how the rest of
 * the site handles progressive enhancement.
 *
 * Everything that can be done in CSS still is; this exists only for the
 * marquee, which renders genuinely different markup rather than a different
 * animation.
 */
export function useReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  )
}
