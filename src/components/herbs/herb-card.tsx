import Image from "next/image"
import Link from "next/link"

import { LeafMark } from "@/components/site/leaf-mark"
import { accession, Plate } from "@/components/site/plate"
import type { Herb } from "@/content/types"
import { cn } from "@/lib/utils"

/**
 * A specimen sheet: photograph, accession plate, Thai name, determination.
 * Deliberately flat — the plate is the only saturated element on the card.
 */
export function HerbCard({ herb, className }: { herb: Herb; className?: string }) {
  return (
    <Link
      href={`/herbs/${herb.slug}`}
      className={cn(
        "group sheet lift relative flex flex-col overflow-hidden",
        className,
      )}
    >
      <div className="relative aspect-[7/5] overflow-hidden bg-muted">
        <Image
          src={herb.media.thumb}
          alt={herb.media.alt}
          fill
          sizes="(min-width: 1280px) 24vw, (min-width: 768px) 45vw, 92vw"
          className="zoom-media object-cover"
        />
        <Plate className="absolute top-3 left-3">{accession(herb.accessionNo)}</Plate>
      </div>

      <div className="relative flex flex-1 flex-col p-5">
        <LeafMark variant={herb.accessionNo} size={128} className="-right-11 -bottom-10" />
        <h3 className="display-font relative text-[1.375rem] leading-snug">{herb.nameTh}</h3>
        <p className="mt-1 type-meta text-muted-foreground font-mono italic">
          {herb.scientificName}
        </p>

        {herb.localNames.length > 0 && (
          <p className="mt-3 type-sm text-muted-foreground">
            <span className="text-foreground/50">ชื่อท้องถิ่น </span>
            {herb.localNames.join(" · ")}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          {herb.family ? (
            <span className="label-th text-foreground/45">{herb.family}</span>
          ) : (
            <span />
          )}
          <span className="relative type-sm font-medium text-marker">
            เปิดบัตร <span aria-hidden="true" className="arrow-slide">→</span>
          </span>
        </div>
      </div>
    </Link>
  )
}
