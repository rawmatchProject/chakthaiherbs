import type { ReactNode } from "react"

import { Plate } from "@/components/site/plate"

/**
 * Page masthead. Carries the same deep canopy ground as the home hero, so an
 * interior page opens with the same weight rather than a pale strip.
 */
export function PageHeader({
  plate,
  title,
  intro,
  meta,
  children,
}: {
  plate: string
  title: string
  intro?: ReactNode
  meta?: { label: string; value: string }[]
  children?: ReactNode
}) {
  return (
    <header className="bg-canopy text-white">
      <div className="container-site py-14 sm:py-20">
        <Plate staked className="rise bg-white/15">
          {plate}
        </Plate>
        <h1
          className="rise type-h2 mt-9 max-w-4xl text-balance"
          style={{ "--rise-delay": "80ms" } as React.CSSProperties}
        >
          {title}
        </h1>
        {intro && (
          <div
            className="rise type-lead mt-6 max-w-3xl text-white/80"
            style={{ "--rise-delay": "160ms" } as React.CSSProperties}
          >
            {intro}
          </div>
        )}

        {meta && meta.length > 0 && (
          <dl
            className="rise mt-10 grid gap-x-10 gap-y-4 border-t border-white/20 pt-6 type-meta sm:grid-cols-3"
            style={{ "--rise-delay": "240ms" } as React.CSSProperties}
          >
            {meta.map((item) => (
              <div key={item.label}>
                <dt className="text-white/55">{item.label}</dt>
                <dd className="mt-1 text-white">{item.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {children}
      </div>
    </header>
  )
}
