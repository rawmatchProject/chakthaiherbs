import { cn } from "@/lib/utils"

/**
 * The leaf watermark.
 *
 * Drawn rather than pulled from an icon set: a lucide leaf is a UI glyph and
 * reads as one, where this is a simple ovate blade with a midrib and four
 * veins — the shape most of the 24 records actually have. Purely decorative,
 * so it carries aria-hidden and never holds content.
 *
 * `variant` flips and re-angles the same blade, so a grid of cards does not
 * repeat one identical mark down the page. Pass the record's index.
 */
export function LeafMark({
  className,
  variant = 0,
  size = 132,
}: {
  className?: string
  variant?: number
  size?: number
}) {
  const angles = [-18, 12, -6, 24, -30, 4]
  const angle = angles[Math.abs(variant) % angles.length]
  const flip = variant % 2 === 1 ? -1 : 1

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={cn("leaf-mark", className)}
      style={{ rotate: `${angle}deg`, scale: `${flip} 1` }}
    >
      <path
        d="M32 3c17 10.5 24.5 30 0 58C7.5 33 15 13.5 32 3Z"
        fill="currentColor"
        fillOpacity="0.55"
      />
      <path
        d="M32 3c17 10.5 24.5 30 0 58C7.5 33 15 13.5 32 3Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M32 8v49" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M32 20c-4.5 1.5-8 4.5-10.5 9M32 20c4.5 1.5 8 4.5 10.5 9M32 34c-4 1.5-7 4.5-9 8.5M32 34c4 1.5 7 4.5 9 8.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}
