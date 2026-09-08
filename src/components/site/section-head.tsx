import Link from "next/link"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * Section heading.
 *
 * The "see all" link sits on the heading's own line rather than under the
 * intro, so it reads as part of the title rather than as a third paragraph.
 * It is underlined on hover only — a permanent rule as wide as the link drew
 * more attention than the heading above it.
 */
export function SectionHead({
  label,
  title,
  intro,
  link,
  align = "start",
  tone = "light",
  className,
}: {
  label?: string
  title: ReactNode
  intro?: ReactNode
  link?: { href: string; label: string }
  align?: "start" | "between"
  tone?: "light" | "dark"
  className?: string
}) {
  const isDark = tone === "dark"

  return (
    <div className={cn("max-w-4xl", align === "between" && "max-w-none", className)}>
      {label && (
        <p className={cn("label", isDark ? "text-white/70" : "text-marker")}>{label}</p>
      )}

      <div
        className={cn(
          "mt-3 flex flex-col gap-x-10 gap-y-3",
          link && "sm:flex-row sm:items-baseline sm:justify-between",
        )}
      >
        <h2 className={cn("type-h2", isDark ? "text-white" : "text-foreground")}>{title}</h2>

        {link && (
          <Link
            href={link.href}
            className={cn(
              "shrink-0 font-semibold underline-offset-4 hover:underline",
              isDark ? "text-marker-bright" : "text-marker",
            )}
          >
            {link.label} <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>

      {intro && (
        <div
          className={cn(
            "type-lead mt-5 max-w-3xl",
            isDark ? "text-white/80" : "text-muted-foreground",
          )}
        >
          {intro}
        </div>
      )}
    </div>
  )
}
