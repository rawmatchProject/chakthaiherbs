"use client"

import { useSyncExternalStore } from "react"

import { cn } from "@/lib/utils"

export const TEXT_SIZE_KEY = "chakthai-text-scale"

/* Sizes here are in px on purpose — the one exception to the site's rem rule.
   This control is chrome, not content: if it grew with --text-scale it would
   push the wordmark in the header into a four-line stack at the largest
   setting, on exactly the screens that need the control most. */
const steps = [
  { scale: "1", label: "ปกติ", size: 15 },
  { scale: "1.15", label: "ใหญ่", size: 18 },
  { scale: "1.3", label: "ใหญ่พิเศษ", size: 22 },
] as const

/* The setting lives on the root element, not in React state: the head script
   in the layout writes it before first paint, so the DOM is the source of
   truth and React just subscribes to it. */
const listeners = new Set<() => void>()

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  return () => {
    listeners.delete(onChange)
  }
}

function readScale() {
  return document.documentElement.style.getPropertyValue("--text-scale") || "1"
}

function writeScale(scale: string) {
  document.documentElement.style.setProperty("--text-scale", scale)
  try {
    window.localStorage.setItem(TEXT_SIZE_KEY, scale)
  } catch {
    // private browsing — the choice applies now but will not persist
  }
  listeners.forEach((listener) => listener())
}

/**
 * Reader-controlled text size.
 *
 * Every size on the site is expressed in rem and the stylesheet multiplies the
 * root font size by `--text-scale`, so this one variable moves headings, body
 * and captions together.
 */
export function TextSizeControl({ className }: { className?: string }) {
  const scale = useSyncExternalStore(subscribe, readScale, () => "1")

  return (
    <div className={cn("flex items-center gap-2", className)} title="ปรับขนาดตัวอักษร">
      <div
        role="group"
        aria-label="ปรับขนาดตัวอักษรของเว็บไซต์"
        className="flex items-end gap-0.5 rounded-xs border border-input bg-paper p-0.5 sm:p-1"
      >
        {steps.map((step) => (
          <button
            key={step.scale}
            type="button"
            onClick={() => writeScale(step.scale)}
            aria-pressed={scale === step.scale}
            title={`ตัวอักษรขนาด${step.label}`}
            className={cn(
              "grid h-[32px] w-[30px] place-items-center rounded-xs leading-none transition-colors sm:h-[36px] sm:w-[34px]",
              scale === step.scale
                ? "bg-marker text-white"
                : "text-foreground/70 hover:bg-accent hover:text-foreground",
            )}
          >
            <span style={{ fontSize: `${step.size}px` }} aria-hidden="true">
              ก
            </span>
            <span className="sr-only">ตัวอักษรขนาด{step.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
