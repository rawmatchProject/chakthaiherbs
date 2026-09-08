"use client"

import Link from "next/link"
import { useReducedMotion } from "@/lib/use-reduced-motion"

/**
 * The register, read aloud. Every herb the project recorded, in the order the
 * printed guide lists them — this list is the project's actual deliverable, so
 * it opens the site rather than a stat tile.
 *
 * When motion is reduced it becomes a plain wrapping list, which is also what
 * a narrow screen gets on the herbs page.
 */
export function RegisterMarquee({ names }: { names: { slug: string; nameTh: string }[] }) {
  const reduce = useReducedMotion()

  if (!names.length) return null

  if (reduce) {
    return (
      <ul className="flex flex-wrap gap-x-5 gap-y-1.5 type-sm text-white/70">
        {names.map((n) => (
          <li key={n.slug}>
            <Link href={`/herbs/${n.slug}`} className="hover:text-white">
              {n.nameTh}
            </Link>
          </li>
        ))}
      </ul>
    )
  }

  const run = [...names, ...names]

  return (
    <div className="marquee-mask overflow-hidden" aria-label="รายชื่อสมุนไพรในทะเบียน">
      <div className="marquee-track flex w-max items-center gap-6 py-1">
        {run.map((n, i) => (
          <span key={`${n.slug}-${i}`} className="flex shrink-0 items-center gap-6">
            <Link
              href={`/herbs/${n.slug}`}
              className="type-sm whitespace-nowrap text-white/75 transition-colors hover:text-white"
              tabIndex={i < names.length ? 0 : -1}
              aria-hidden={i >= names.length}
            >
              {n.nameTh}
            </Link>
            <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rotate-45 bg-marker-bright" />
          </span>
        ))}
      </div>
    </div>
  )
}
