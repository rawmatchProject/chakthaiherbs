import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { AlertTriangleIcon } from "lucide-react"

import { GroupPanel } from "@/components/herbs/group-panel"
import { HerbThumb, registerSlugFor } from "@/components/herbs/herb-thumb"
import { Plate, toThaiNumerals } from "@/components/site/plate"
import { ProjectShell } from "@/components/site/project-shell"
import { BreadcrumbJsonLd } from "@/components/site/json-ld"
import { getGroupBySlug, getHerbGroupRecords } from "@/content/groups"
import { getPublishedHerbs } from "@/content/herbs"

export const dynamic = "force-dynamic"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params

  const group = await getGroupBySlug(slug)

  if (!group) {
    return { title: "ไม่พบกลุ่มสมุนไพร" }
  }

  return {
    title: group.titleTh,
    description: group.intro ?? group.titleEn,
  }
}

export default async function GroupDetailPage({ params }: Props) {
  const { slug } = await params

  const [group, allGroups, herbs] = await Promise.all([
    getGroupBySlug(slug),
    getHerbGroupRecords(),
    getPublishedHerbs(),
  ])

  if (!group) notFound()



  return (
    <ProjectShell>
      <BreadcrumbJsonLd
        trail={[
          { name: "หน้าแรก", path: "/" },
          { name: "5 กลุ่มสมุนไพร", path: "/groups" },
          { name: group.titleTh, path: `/groups/${group.slug}` },
        ]}
      />
      <header className="bg-canopy text-white">
        <div className="container-site py-12 sm:py-16">
          <Plate size="lg" staked className="bg-white/15">
            กลุ่มที่ {toThaiNumerals(group.number)}
          </Plate>
          <h1 className="type-h2 mt-9">{group.titleTh}</h1>
          <p className="label mt-2 text-white/60">{group.titleEn}</p>
          {group.intro && (
            <p className="type-lead mt-7 max-w-4xl text-white/80">{group.intro}</p>
          )}
        </div>
      </header>

      <div className="container-site py-14 sm:py-20">
        {/* ── Herb tables ─────────────────────────────────────────── */}
        <div className="space-y-16">
          {group.tables.map((table, ti) => (
            <section key={ti}>
              <h2 className={table.heading ? "type-h3 border-b border-border pb-3" : "sr-only"}>
                {table.heading ?? "รายการสมุนไพรในกลุ่มนี้"}
              </h2>

              {/* wide screens: a real table; narrow: stacked records */}
              <div className={table.heading ? "mt-8" : ""}>
                <div className="scroll-paper hidden overflow-x-auto lg:block">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-border">
                        <th scope="col" className="label w-80 pb-3 pr-6 text-muted-foreground">
                          ชื่อสมุนไพร
                        </th>
                        <th scope="col" className="label pb-3 pr-6 text-muted-foreground">
                          สรรพคุณโดยละเอียด
                        </th>
                        <th scope="col" className="label pb-3 text-muted-foreground">
                          วิธีการปรุงและการใช้
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row, ri) => {
                        const slug = registerSlugFor(row.name, herbs)
                        return (
                          <tr key={`${row.name}-${ri}`} className="border-b border-border/70 align-top">
                            <th scope="row" className="py-5 pr-6">
                              <span className="flex items-center gap-4">
                                <HerbThumb name={row.name} herbs={herbs} className="size-14 sm:size-14" />
                                <span className="display-font type-h4 whitespace-nowrap">
                                  {slug ? (
                                    <Link href={`/herbs/${slug}`} className="text-marker hover:underline">
                                      {row.name}
                                    </Link>
                                  ) : (
                                    row.name
                                  )}
                                </span>
                              </span>
                            </th>
                            <td className="py-5 pr-6 leading-8">{row.properties}</td>
                            <td className="py-5 leading-8 text-muted-foreground">{row.preparation}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <ul className="grid gap-px overflow-hidden border border-border bg-border lg:hidden">
                  {table.rows.map((row, ri) => {
                    const slug = registerSlugFor(row.name, herbs)
                    return (
                      <li key={`${row.name}-${ri}`} className="bg-paper p-5">
                        <div className="flex items-center gap-4">
                          <HerbThumb name={row.name} herbs={herbs} className="size-14 sm:size-14" />
                          <h3 className="display-font type-h4">
                            {slug ? (
                              <Link href={`/herbs/${slug}`} className="text-marker underline underline-offset-4">
                                {row.name}
                              </Link>
                            ) : (
                              row.name
                            )}
                          </h3>
                        </div>
                        <p className="mt-2.5 leading-8">{row.properties}</p>
                        <p className="label mt-4 text-muted-foreground">วิธีปรุงและใช้</p>
                        <p className="mt-1 leading-8 text-muted-foreground">{row.preparation}</p>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </section>
          ))}
        </div>

        {/* ── Recipes / product panels ────────────────────────────── */}
        {group.panels.length > 0 && (
          <section className="mt-20">
            <h2 className="type-h3 border-b border-border pb-3">ตำรับและตัวอย่างการนำไปใช้</h2>
            <div className="mt-8 space-y-6">
              {group.panels.map((panel, i) => (
                <GroupPanel key={i} panel={panel} />
              ))}
            </div>
          </section>
        )}

        {/* ── Cautions ────────────────────────────────────────────── */}
        {group.cautions.length > 0 && (
          <section className="mt-20 border-l-4 border-destructive bg-paper p-7">
            <h2 className="flex items-center gap-2.5">
              <AlertTriangleIcon className="size-5 shrink-0 text-destructive" aria-hidden="true" />
              <span className="display-font type-h4">ข้อควรระวัง</span>
            </h2>
            <ul className="mt-4 space-y-3">
              {group.cautions.map((caution, i) => (
                <li key={i} className="flex gap-3 leading-8">
                  <span className="type-meta text-destructive">
                    {toThaiNumerals(i + 1)}
                  </span>
                  <span>{caution}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {group.footer && (
          <p className="display-font mt-16 border-y border-border py-8 text-center type-h4 text-canopy">
            {group.footer}
          </p>
        )}

        {/* One reference to the printed original — the poster is unreadable at
            any size the web can show, so the text above is the real content. */}
        <p className="type-meta mt-12 text-muted-foreground">
          เนื้อหาทั้งหมดถอดจากโปสเตอร์กลุ่มที่ {toThaiNumerals(group.number)} ในคู่มือสมุนไพร
          ภูมิปัญญาท้องถิ่นตำบลชากไทย พ.ศ. 2569 ·{" "}
          <a
            href={group.poster}
            target="_blank"
            rel="noreferrer"
            className="text-marker underline underline-offset-4"
          >
            ดูภาพโปสเตอร์ต้นฉบับ
          </a>
        </p>
      </div>

      {/* ── Other groups ───────────────────────────────────────────── */}
      <nav className="border-t border-border bg-secondary/40" aria-label="กลุ่มสมุนไพรอื่น">
        <div className="container-site py-12">
          <p className="label text-muted-foreground">กลุ่มอื่น</p>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {allGroups
              .filter((g) => g.id !== group.id)
              .map((g) => (
                <li key={g.id}>
                  <Link
                    href={`/groups/${g.slug}`}
                    className="sheet lift group relative block h-full overflow-hidden p-5"
                  >
                    <span className="label-th text-muted-foreground">
                      กลุ่มที่ {toThaiNumerals(g.number)}
                    </span>
                    <span className="display-font mt-2 block type-h4 leading-snug">
                      {g.titleTh}
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      </nav>
    </ProjectShell>
  )
}
