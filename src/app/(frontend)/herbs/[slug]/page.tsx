import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { AlertTriangleIcon } from "lucide-react"
import type { ReactNode } from "react"

import { accession, Plate } from "@/components/site/plate"
import { ProjectShell } from "@/components/site/project-shell"
import { BreadcrumbJsonLd } from "@/components/site/json-ld"
import { getHerbGroupRecords } from "@/content/groups"
import { getHerbBySlug, getPublishedHerbs } from "@/content/herbs"
import { getProject } from "@/content/project"
import type { Herb } from "@/content/types"

type Props = { params: Promise<{ slug: string }> }

// Herb pages are backed by Postgres. Rendering them on demand keeps deployments
// independent of the database connection and avoids opening many concurrent TLS
// connections while Next.js fans static generation out across build workers.
export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const herb = await getHerbBySlug((await params).slug)
  if (!herb) return { title: "ไม่พบบัตรข้อมูล" }
  return {
    title: herb.nameTh,
    description:
      herb.tagline ??
      `${herb.nameTh} (${herb.scientificName}) — บัตรข้อมูลสมุนไพรท้องถิ่นตำบลชากไทย`,
  }
}

export default async function HerbDetailPage({ params }: Props) {
  const { slug } = await params
  const [herb, all, herbGroupRecords, { safetyNotice }] = await Promise.all([
    getHerbBySlug(slug),
    getPublishedHerbs(),
    getHerbGroupRecords(),
    getProject(),
  ])
  if (!herb) notFound()

  const index = all.findIndex((h) => h.slug === herb.slug)
  const prev = all[index - 1]
  const next = all[index + 1]
  const inGroups = herbGroupRecords.filter((g) => herb.groups.includes(g.id))
  const compounds = herb.phytochemicals.filter((item) => item.length <= 42)
  const compoundNotes = herb.phytochemicals.filter((item) => item.length > 42)

  return (
    <ProjectShell>
      <BreadcrumbJsonLd
        trail={[
          { name: "หน้าแรก", path: "/" },
          { name: "ทะเบียนสมุนไพร", path: "/herbs" },
          { name: herb.nameTh, path: `/herbs/${herb.slug}` },
        ]}
      />
      {/* ── Specimen head ──────────────────────────────────────────── */}
      <header className="bg-canopy text-white">
        <div className="container-site grid gap-10 py-12 sm:py-16 lg:grid-cols-[1fr_22rem] lg:gap-16">
          <div>
            <Plate staked className="bg-white/15">
              {accession(herb.accessionNo)}
            </Plate>
            <h1 className="type-h2 mt-9">{herb.nameTh}</h1>
            <p className="mt-3 type-sm text-white/70 font-mono italic">{herb.scientificName}</p>

            <dl className="mt-9 grid gap-x-10 gap-y-5 border-t border-white/20 pt-7 sm:grid-cols-2">
              <Field label="ชื่อท้องถิ่น" value={herb.localNames.join(" · ")} />
              <Field label="ชื่อสามัญ" value={herb.commonNames.join(" · ")} />
              <Field
                label="วงศ์"
                value={[herb.family, herb.familyTh].filter(Boolean).join(" ")}
              />
              <Field label="ส่วนที่ใช้" value={herb.partsUsed} />
            </dl>

            {inGroups.length > 0 && (
              <p className="mt-8 type-sm text-white/75">
                ปรากฏในกลุ่มสมุนไพร{" "}
                {inGroups.map((g, i) => (
                  <span key={g.id}>
                    {i > 0 && " · "}
                    <Link href={`/groups/${g.slug}`} className="text-marker-bright underline underline-offset-4">
                      {g.titleTh}
                    </Link>
                  </span>
                ))}
              </p>
            )}
          </div>

          <figure className="lg:pt-2">
            <div className="sheet relative aspect-[7/5] overflow-hidden">
              <Image
                src={herb.media.thumb}
                alt={herb.media.alt}
                fill
                priority
                sizes="(min-width: 1024px) 22rem, 92vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-3 type-meta text-white/60">ภาพประกอบจาก{herb.source.label}</figcaption>
          </figure>
        </div>
      </header>

      {/* ── Record body ────────────────────────────────────────────── */}
      <div className="container-site grid gap-14 py-14 lg:grid-cols-[1fr_20rem] lg:gap-16 lg:py-20">
        <article className="min-w-0 space-y-14">
          <Block title="นิเวศวิทยาและการแพร่กระจาย" items={herb.ecology} />
          <Block title="ลักษณะทางพฤกษศาสตร์" items={herb.botany} />
          <Block title="การใช้ประโยชน์" items={herb.uses} />

          {herb.properties.length > 0 && (
            <Section title="สรรพคุณทางยา">
              <ul className="space-y-2.5">
                {herb.properties.map((item) => (
                  <li key={item} className="flex gap-3 leading-8">
                    <span aria-hidden="true" className="mt-3 size-1.5 shrink-0 bg-moss" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {herb.howToUse.length > 0 && (
            <Section title="วิธีใช้">
              <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2">
                {herb.howToUse.map((method, i) => (
                  <div key={i} className="bg-paper p-6">
                    {method.title && (
                      <h3 className="display-font type-h4 text-marker">{method.title}</h3>
                    )}
                    <p className="mt-2 leading-8">{method.text}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {herb.cautions && (
            <aside className="border-l-4 border-destructive bg-paper p-6">
              <p className="flex items-center gap-2.5">
                <AlertTriangleIcon className="size-5 shrink-0 text-destructive" aria-hidden="true" />
                <span className="display-font type-h4">ข้อควรระวัง</span>
              </p>
              <p className="mt-2.5 leading-8">{herb.cautions}</p>
            </aside>
          )}

          {herb.localWisdom && (
            <Section title="ภูมิปัญญาท้องถิ่นตำบลชากไทย">
              <p className="leading-8">{herb.localWisdom}</p>
            </Section>
          )}

          {herb.phytochemicals.length > 0 && (
            <Section title="สารสำคัญทางพฤกษเคมี">
              {/* Short entries are compound names and read as chips; the cards
                  sometimes end the list with a sentence, which does not. */}
              <ul className="flex flex-wrap gap-2">
                {compounds.map((item) => (
                  <li
                    key={item}
                    className="border border-input bg-paper px-3 py-1.5 type-meta"
                  >
                    {item}
                  </li>
                ))}
              </ul>
              {compoundNotes.map((note) => (
                <p key={note} className="mt-4 leading-8 text-muted-foreground">
                  {note}
                </p>
              ))}
            </Section>
          )}

          {herb.significance && (
            <Section title="ความสำคัญ">
              <p className="leading-8">{herb.significance}</p>
            </Section>
          )}

          <Section title="ที่มาของข้อมูล">
            <p className="type-sm text-muted-foreground">
              เนื้อหาบนหน้านี้ถอดความจากบัตรข้อมูลฉบับพิมพ์ของโครงการ
              รายการที่กำกับว่า “รอตรวจสอบ” เป็นแหล่งค้นคว้าที่รวบรวมไว้ชั่วคราวเพื่อให้ผู้เชี่ยวชาญใช้เทียบเคียง
              ยังไม่ถือเป็นการรับรองสรรพคุณ
            </p>
            <ul className="mt-5 space-y-3">
              {herb.references.map((ref) => (
                <li key={ref.label} className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
                  <span
                    className={
                      ref.kind === "guide"
                        ? "plate shrink-0"
                        : "shrink-0 rounded-xs border border-input px-2 py-0.5 type-meta text-muted-foreground"
                    }
                  >
                    {ref.kind === "guide" ? "ต้นฉบับโครงการ" : "รอตรวจสอบ"}
                  </span>
                  {ref.url ? (
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-marker underline-offset-4 hover:underline"
                    >
                      {ref.label} ↗
                    </a>
                  ) : (
                    <span>{ref.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </Section>

          {herb.tagline && (
            <p className="display-font border-y border-border py-8 text-center type-h4 leading-relaxed text-canopy sm:type-h4">
              {herb.tagline}
            </p>
          )}
        </article>

        {/* ── Sidebar ──────────────────────────────────────────────── */}
        <aside className="space-y-8 lg:sticky lg:top-28 lg:self-start">
          <div>
            <p className="label text-muted-foreground">บัตรข้อมูลต้นฉบับ</p>
            <a
              href={herb.media.card}
              target="_blank"
              rel="noreferrer"
              className="sheet lift group mt-3 block overflow-hidden"
            >
              <span className="relative block aspect-[2/3]">
                <Image
                  src={herb.media.card}
                  alt={`บัตรข้อมูล${herb.nameTh}ฉบับพิมพ์`}
                  fill
                  sizes="(min-width: 1024px) 20rem, 92vw"
                  className="zoom-media object-cover object-top"
                />
              </span>
              <span className="block border-t border-border px-4 py-3 type-meta text-marker">
                เปิดภาพเต็ม ↗
              </span>
            </a>
          </div>

          <div className="border-t border-border pt-6">
            <p className="label text-muted-foreground">การตรวจทาน</p>
            <p className="mt-2 type-sm text-muted-foreground">
              {herb.reviewedBy
                ? `ตรวจทานโดย ${herb.reviewedBy} เมื่อ ${herb.reviewedAt}`
                : "ยังไม่ผ่านการตรวจทานรายชนิดโดยผู้เชี่ยวชาญ — เป็นข้อมูลภูมิปัญญาชุมชนตามที่บันทึกไว้"}
            </p>
          </div>

          <div className="border-t border-border pt-6">
            <p className="label text-muted-foreground">ข้อควรทราบ</p>
            <p className="mt-2 type-sm text-muted-foreground">{safetyNotice}</p>
          </div>
        </aside>
      </div>

      {/* ── Neighbours in the register ─────────────────────────────── */}
      <nav className="border-t border-border bg-secondary/40" aria-label="บัตรข้อมูลใกล้เคียง">
        <div className="container-site grid gap-px bg-border sm:grid-cols-2">
          <NeighbourLink herb={prev} direction="prev" />
          <NeighbourLink herb={next} direction="next" />
        </div>
      </nav>
    </ProjectShell>
  )
}

/** A determination field on the dark specimen head. */
function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="label text-white/55">{label}</dt>
      <dd className="mt-1.5 leading-8">
        {value?.trim() ? value : <span className="text-white/45">—</span>}
      </dd>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="type-h3 border-b border-border pb-3">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  )
}

function Block({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null
  return (
    <Section title={title}>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 leading-8">
            <span aria-hidden="true" className="mt-3 size-1.5 shrink-0 bg-moss" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Section>
  )
}

function NeighbourLink({ herb, direction }: { herb?: Herb; direction: "prev" | "next" }) {
  if (!herb) return <span className="bg-secondary/40" />
  return (
    <Link
      href={`/herbs/${herb.slug}`}
      className={`group flex flex-col bg-secondary/40 px-6 py-8 transition-colors hover:bg-paper sm:px-10 ${
        direction === "next" ? "sm:items-end sm:text-right" : ""
      }`}
    >
      <span className="label text-muted-foreground">
        {direction === "prev" ? "← ก่อนหน้า" : "ถัดไป →"}
      </span>
      <span className="display-font mt-2 type-h4">{herb.nameTh}</span>
      <span className="mt-0.5 type-meta text-muted-foreground font-mono italic">
        {herb.scientificName}
      </span>
    </Link>
  )
}
