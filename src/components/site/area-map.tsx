"use client"

import { MapPinIcon } from "lucide-react"
import { useState } from "react"

/**
 * Google Maps facade for the community herb garden.
 *
 * The map loads only when the visitor asks for it, so the page does not hand
 * Google a request from every reader. `query` is a place search, not a fixed
 * coordinate — swap it for the garden's exact latitude/longitude once the
 * community agrees to publish the precise location.
 */
export function AreaMap({
  query,
  label,
  caption,
}: {
  query: string
  label: string
  caption: string
}) {
  const [loaded, setLoaded] = useState(false)
  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=13&hl=th&output=embed`
  const link = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`

  return (
    <figure>
      <div className="sheet relative aspect-3/2 overflow-hidden">
        {loaded ? (
          <iframe
            src={src}
            title={label}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setLoaded(true)}
            className="absolute inset-0 grid h-full w-full cursor-pointer place-items-center bg-accent/50 px-6 text-center transition-colors hover:bg-accent"
          >
            <span>
              <MapPinIcon className="mx-auto size-9 text-marker" aria-hidden="true" />
              <span className="type-h4 mt-4 block">{label}</span>
              <span className="type-sm mt-2 block text-muted-foreground">
                กดเพื่อเปิดแผนที่ Google Maps
              </span>
            </span>
          </button>
        )}
      </div>
      <figcaption className="type-meta mt-3 flex flex-wrap gap-x-3 text-muted-foreground">
        <span>{caption}</span>
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="text-marker underline underline-offset-4"
        >
          เปิดใน Google Maps ↗
        </a>
      </figcaption>
    </figure>
  )
}
