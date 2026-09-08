"use client"

import { useEffect, useRef } from "react"

/**
 * The satisfaction results, drawing themselves as they come into view.
 *
 * Each bar carries its true width inline, so the chart is correct with or
 * without JavaScript; the animation is a `scaleX` applied only under the `.js`
 * class. The scale starts at 4.60 rather than 0 because every item scored
 * between 4.73 and 4.89 — at a zero baseline the bars are indistinguishable,
 * and the page says so under the chart.
 */
export function SatisfactionBars({
  items,
  min = 4.6,
  max = 5,
}: {
  items: { label: string; mean: number }[]
  min?: number
  max?: number
}) {
  const ref = useRef<HTMLUListElement>(null)

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
      { threshold: 0.25 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <ul ref={ref} className="reveal-bars space-y-3.5">
      {items.map((item, i) => (
        <li key={item.label} className="grid grid-cols-[1fr_auto] items-center gap-4">
          <div>
            <p className="type-sm text-white/85">{item.label}</p>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/12">
              <div
                className="h-full rounded-full bg-marker-bright"
                style={{
                  width: `${((item.mean - min) / (max - min)) * 100}%`,
                  transitionDelay: `${i * 60}ms`,
                }}
              />
            </div>
          </div>
          <span className="type-meta text-white/70 tabular-nums">{item.mean.toFixed(2)}</span>
        </li>
      ))}
    </ul>
  )
}
