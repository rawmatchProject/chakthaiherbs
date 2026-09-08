"use client"

import { SearchIcon } from "lucide-react"
import { useMemo, useState } from "react"

import { HerbCard } from "@/components/herbs/herb-card"
import type { Herb } from "@/content/types"
import { Input } from "@/components/site-ui/input"
import { cn } from "@/lib/utils"

/**
 * The register, searchable. Filters by botanical family because that is the
 * one classification every record in this collection actually carries — the
 * five health-theme groups cover a different (and wider) set of plants.
 */
export function HerbRegister({ herbs }: { herbs: Herb[] }) {
  const [query, setQuery] = useState("")
  const [family, setFamily] = useState<string | null>(null)

  const families = useMemo(() => {
    const counts = new Map<string, number>()
    for (const herb of herbs) {
      if (herb.family) counts.set(herb.family, (counts.get(herb.family) ?? 0) + 1)
    }
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  }, [herbs])

  const visible = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("th-TH")
    return herbs.filter((herb) => {
      if (family && herb.family !== family) return false
      if (!q) return true
      return [herb.nameTh, herb.scientificName, herb.family ?? "", ...herb.localNames, ...herb.commonNames]
        .join(" ")
        .toLocaleLowerCase("th-TH")
        .includes(q)
    })
  }, [herbs, query, family])

  return (
    <div>
      <div className="flex flex-col gap-5 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block w-full lg:max-w-sm">
          <span className="sr-only">ค้นหาสมุนไพร</span>
          <SearchIcon
            className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            name="herb-search"
            autoComplete="off"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ชื่อไทย ชื่อท้องถิ่น หรือชื่อวิทยาศาสตร์"
            className="h-11 rounded-xs bg-paper pl-10"
          />
        </label>

        {families.length > 1 && (
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
            <span className="label mr-1 text-muted-foreground">วงศ์</span>
            <FamilyChip active={family === null} onClick={() => setFamily(null)}>
              ทั้งหมด
            </FamilyChip>
            {families.map((item) => (
              <FamilyChip
                key={item.name}
                active={family === item.name}
                onClick={() => setFamily(family === item.name ? null : item.name)}
              >
                {item.name}
                <span className="ml-1.5 opacity-55">{item.count}</span>
              </FamilyChip>
            ))}
          </div>
        )}
      </div>

      <p className="mt-6 type-meta text-muted-foreground" aria-live="polite">
        {visible.length} จาก {herbs.length} รายการ
      </p>

      {visible.length > 0 ? (
        <>
          <h2 className="sr-only">รายการสมุนไพรในทะเบียน</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((herb) => (
              <HerbCard key={herb.id} herb={herb} />
            ))}
          </div>
        </>
      ) : (
        <div className="mt-6 border border-dashed border-input bg-paper/60 p-14 text-center">
          <p className="display-font type-h4">ไม่พบสมุนไพรที่ตรงกับที่ค้น</p>
          <p className="mt-2 type-sm text-muted-foreground">
            ลองใช้ชื่อท้องถิ่น หรือล้างตัวกรองวงศ์เพื่อดูทั้งทะเบียน
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("")
              setFamily(null)
            }}
            className="mt-5 type-sm font-medium text-marker underline underline-offset-4"
          >
            ล้างการค้นหา
          </button>
        </div>
      )}
    </div>
  )
}

function FamilyChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-xs border px-3 py-1.5 type-meta transition-colors",
        active
          ? "border-marker bg-marker text-white"
          : "border-input bg-paper text-foreground/70 hover:border-marker/60 hover:text-foreground",
      )}
    >
      {children}
    </button>
  )
}
