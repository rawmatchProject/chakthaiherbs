"use client"

import { useEffect, useRef, type ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * Fades a section up the first time it scrolls into view.
 *
 * The hidden state lives in CSS behind the `.js` class, which the inline
 * script in the layout sets before first paint. That matters: if the initial
 * state were rendered inline, a reader whose JavaScript failed would get a
 * page with four invisible sections. Here the markup ships visible and only
 * becomes animatable once we know scripting works.
 *
 * Deliberately coarse — it wraps a whole section rather than each card inside
 * it, because a page where every tile arrives on its own reads as decoration
 * rather than as the page settling.
 */
export function Reveal({
  children,
  className,
  as = "div",
}: {
  children: ReactNode
  className?: string
  as?: "div" | "section"
}) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (!("IntersectionObserver" in window)) {
      el.classList.add("is-visible")
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        el.classList.add("is-visible")
        observer.disconnect()
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const Tag = as
  return (
    <Tag ref={ref as never} className={cn("reveal", className)}>
      {children}
    </Tag>
  )
}
