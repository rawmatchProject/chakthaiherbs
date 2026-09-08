"use client"

import Image from "next/image"
import { PlayIcon } from "lucide-react"
import { useState } from "react"

/**
 * YouTube facade: shows the poster frame and only loads the player — and
 * YouTube's scripts and cookies — after the visitor asks for it.
 */
export function VideoEmbed({
  youtubeId,
  title,
  className,
}: {
  youtubeId: string
  title: string
  className?: string
}) {
  const [playing, setPlaying] = useState(false)

  return (
    <div className={className}>
      <div className="relative aspect-video overflow-hidden rounded-xs bg-canopy-deep">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 h-full w-full cursor-pointer"
          >
            <Image
              src={`https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`}
              alt=""
              fill
              unoptimized
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover transition duration-700 group-hover:scale-[1.03]"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-canopy-deep/85 via-canopy-deep/15 to-transparent" />
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid size-16 place-items-center rounded-full bg-marker shadow-[inset_0_0_0_1px_rgba(255,255,255,0.5)] transition group-hover:scale-110">
                <PlayIcon className="size-6 translate-x-px fill-white text-white" aria-hidden="true" />
              </span>
            </span>
            <span className="sr-only">เล่นวิดีโอ {title}</span>
          </button>
        )}
      </div>
    </div>
  )
}
