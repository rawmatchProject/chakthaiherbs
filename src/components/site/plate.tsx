import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * The marker plate — this site's signature.
 *
 * Every one of the 24 herbs recorded by the project has a blue marker sign
 * staked beside it in the community garden at ตำบลชากไทย. That plate is
 * reused here for anything that carries a real identifier: accession codes,
 * group numbers, activity numbers, dates.
 *
 * `staked` draws the short post below the plate, as it stands in the ground.
 */
export function Plate({
  children,
  size = "sm",
  staked = false,
  className,
}: {
  children: ReactNode
  size?: "sm" | "lg"
  staked?: boolean
  className?: string
}) {
  return (
    <span
      className={cn("plate", size === "lg" && "plate-lg", staked && "plate-staked", className)}
    >
      {children}
    </span>
  )
}

const thaiDigits = ["๐", "๑", "๒", "๓", "๔", "๕", "๖", "๗", "๘", "๙"]

/** Thai numerals, as the printed guide and the report both use them. */
export function toThaiNumerals(value: number | string) {
  return String(value).replace(/\d/g, (d) => thaiDigits[Number(d)])
}

/** Accession code for a herb record, e.g. ชท ๐๗ (ชากไทย, record 7). */
export function accession(index: number) {
  return `ชท ${toThaiNumerals(String(index).padStart(2, "0"))}`
}
