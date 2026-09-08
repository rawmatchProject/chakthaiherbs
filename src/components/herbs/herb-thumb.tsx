import Image from "next/image"
import Link from "next/link"
import { LeafIcon } from "lucide-react"

import type { Herb } from "@/content/types"
import { cn } from "@/lib/utils"

/**
 * A herb name's photograph, wherever we have one.
 *
 * The five health-group posters cite herbs from across the Thai pharmacopeia,
 * while the photographs we hold come from the 24 cards in the Chak Thai guide,
 * so most names on those posters have no picture yet. Rather than hide the
 * column, an unmatched name gets a plain leaf tile — the layout stays honest
 * about what is missing, and the backend can fill it in later (see the media
 * task in docs/BACKEND-HANDOVER.md).
 *
 * Callers fetch the published register once (it's a Server Component render,
 * so an `await getPublishedHerbs()` at the top of the page) and pass it down —
 * that keeps a table of 60+ names from firing 60+ separate queries.
 */

const normalise = (value: string) =>
  value
    .replace(/\(.*?\)/g, "")
    .replace(/\s+/g, "")
    .trim()

function matchHerb(name: string, herbs: Herb[]) {
  const key = normalise(name)
  if (!key) return undefined
  return herbs.find(
    (herb) =>
      normalise(herb.nameTh) === key ||
      herb.localNames.some((local) => normalise(local) === key),
  )
}

export function HerbThumb({
  name,
  herbs,
  className,
  /** Set false when the thumbnail sits inside a link — <a> cannot nest. */
  linked = true,
}: {
  name: string
  herbs: Herb[]
  className?: string
  linked?: boolean
}) {
  const herb = matchHerb(name, herbs)
  const box = cn("relative block size-16 shrink-0 overflow-hidden rounded-xs sm:size-20", className)

  if (!herb) {
    return (
      <span className={cn(box, "grid place-items-center border border-dashed border-moss/50 bg-accent")}>
        <LeafIcon className="size-7 text-moss" aria-hidden="true" />
        <span className="sr-only">ยังไม่มีภาพของ{name}</span>
      </span>
    )
  }

  const picture = (
    <Image
      src={herb.media.thumb}
      alt={`ภาพ${herb.nameTh}`}
      fill
      sizes="5rem"
      className="object-cover"
    />
  )

  if (!linked) {
    return <span className={cn(box, "border border-input")}>{picture}</span>
  }

  return (
    <Link
      href={`/herbs/${herb.slug}`}
      className={cn(box, "border border-input")}
      title={`เปิดบัตรข้อมูล${herb.nameTh}`}
    >
      {picture}
    </Link>
  )
}

/** True when the register holds a card for this name, so callers can link it. */
export function registerSlugFor(name: string, herbs: Herb[]) {
  return matchHerb(name, herbs)?.slug
}
