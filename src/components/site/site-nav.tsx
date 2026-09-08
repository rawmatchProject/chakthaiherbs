"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

export type NavItem = { href: string; label: string }

/** Marks the section the reader is in, including its child pages. */
function isCurrent(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)
}

export function SiteNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname()

  return (
    <nav className="hidden items-center gap-x-6 xl:flex" aria-label="เมนูหลัก">
      {items.map((item) => {
        const current = isCurrent(pathname, item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={current ? "page" : undefined}
            className={cn(
              "relative py-4 type-sm font-semibold transition-colors",
              "after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:transition-colors",
              current
                ? "text-marker after:bg-marker"
                : "text-foreground/75 after:bg-transparent hover:text-marker hover:after:bg-marker/40",
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function MobileNav({ items, utility }: { items: NavItem[]; utility: NavItem[] }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col px-4 pb-10" aria-label="เมนูบนมือถือ">
      {items.map((item) => {
        const current = isCurrent(pathname, item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={current ? "page" : undefined}
            className={cn(
              "border-b border-border/70 py-4 font-semibold",
              current ? "text-marker" : "text-foreground",
            )}
          >
            {item.label}
          </Link>
        )
      })}

      <span className="label mt-8 mb-1 text-muted-foreground">เพิ่มเติม</span>
      {utility.map((item) => (
        <Link key={item.href} href={item.href} className="type-sm py-2.5 text-foreground/80">
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
