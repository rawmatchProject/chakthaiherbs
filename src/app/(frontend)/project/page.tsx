import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { AreaMap } from "@/components/site/area-map"
import { PageHeader } from "@/components/site/page-header"
import { ProjectShell } from "@/components/site/project-shell"
import { Reveal } from "@/components/site/reveal"
import { SectionHead } from "@/components/site/section-head"
import { toThaiNumerals } from "@/components/site/plate"
import { getProject, getPublicMedia, getSatisfaction } from "@/content/project"

export const metadata: Metadata = {
  title: "เกี่ยวกับโครงการ",
  description:
    "ที่มา วัตถุประสงค์ พื้นที่ดำเนินงาน และผลลัพธ์ของโครงการอนุรักษ์ภูมิปัญญาและสมุนไพรท้องถิ่นตำบลชากไทย",
}

const area = ["ประเทศไทย", "จังหวัดจันทบุรี", "อำเภอเขาคิชฌกูฏ", "ตำบลชากไทย"]

export default async function ProjectPage() {
  const [project, satisfaction, gardenPhoto] = await Promise.all([
    getProject(),
    getSatisfaction(),
    getPublicMedia("a3-17"),
  ])
  const { objectives, bibliography } = project

  return (
    <ProjectShell>
      <PageHeader
        plate="โครงการ"
        title={project.nameTh}
        intro="โครงการบริการวิชาการที่ทำงานร่วมกับชุมชน เพื่อไม่ให้ความรู้เรื่องสมุนไพรที่คนรุ่นก่อนสะสมไว้หายไปพร้อมกับคนรุ่นนั้น"
        meta={[
          { label: "หน่วยงาน", value: project.owner },
          { label: "ระยะเวลา", value: `${project.period} · ${project.fiscalYear}` },
          { label: "งบประมาณ", value: `${project.budgetTHB.toLocaleString("th-TH")} บาท` },
        ]}
      />

      {/* ── Why ─────────────────────────────────────────────────────── */}
      <section className="container-site py-16 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <div>
            <SectionHead label="ที่มาและความสำคัญ" title="ความรู้ที่กำลังหยุดถูกส่งต่อ" />
            <div className="mt-8 space-y-6 leading-8 text-muted-foreground">
              <p>
                ตำบลชากไทยตั้งอยู่ในเขตเชิงเขาและป่าอุดมสมบูรณ์ของภาคตะวันออก
                ชาวบ้านใช้ความรู้เรื่องสมุนไพรดูแลสุขภาพ ป้องกันและบรรเทาอาการเจ็บป่วย
                และนำพืชสมุนไพรมาเป็นอาหารและเครื่องดื่มมาอย่างต่อเนื่อง
                หลายชนิดพบเฉพาะในพื้นที่หรือมีชื่อเรียกตามภาษาท้องถิ่น
                ซึ่งสะท้อนอัตลักษณ์ทางวัฒนธรรมของชุมชนอย่างชัดเจน
              </p>
              <p>
                แต่การเปลี่ยนแปลงทางสังคม เศรษฐกิจ และเทคโนโลยี
                ทำให้การถ่ายทอดองค์ความรู้จากคนรุ่นเก่าสู่คนรุ่นใหม่ลดน้อยลง
                ภูมิปัญญาหลายอย่างจึงเสี่ยงต่อการสูญหาย
                การรวบรวม อนุรักษ์ และเผยแพร่ความรู้เรื่องสมุนไพรพื้นบ้านของชากไทย
                จึงเป็นภารกิจที่ต้องทำในขณะที่ยังมีผู้รู้ให้ถาม
              </p>
              <p className="border-l-2 border-marker pl-5 text-foreground">
                โครงการนี้ไม่ได้รักษาเพียงพันธุ์พืชหรือองค์ความรู้ดั้งเดิม
                แต่รักษารากเหง้าทางวัฒนธรรมและความภาคภูมิใจของชุมชน
                เพื่อให้สมุนไพรพื้นบ้านของตำบลชากไทยยังเป็นมรดกที่ส่งต่อจากรุ่นสู่รุ่นได้
              </p>
            </div>
          </div>

          <figure>
            <div className="sheet relative aspect-4/5 overflow-hidden">
              <Image
                src="/site/community.webp"
                alt="การเรียนรู้สมุนไพรร่วมกับชุมชนตำบลชากไทย"
                fill
                sizes="(min-width: 1024px) 38vw, 92vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-3 type-meta text-muted-foreground">
              การลงพื้นที่ร่วมกับปราชญ์ชาวบ้านและเครือข่ายชุมชน · 2569
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ── Objectives ──────────────────────────────────────────────── */}
      <Reveal as="section" className="border-y border-border bg-secondary/40 py-16 sm:py-24">
        <div className="container-site">
          <SectionHead label="วัตถุประสงค์" title="สิ่งที่โครงการตั้งใจให้เกิดขึ้น" />
          <ol className="mt-12 grid gap-x-12 gap-y-8 md:grid-cols-2">
            {objectives.map((objective, i) => (
              <li key={objective} className="flex gap-5 border-t border-border pt-5">
                <span className="display-font shrink-0 type-h4 text-marker">
                  {toThaiNumerals(i + 1)}
                </span>
                <span className="leading-8">{objective}</span>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>

      {/* ── Area ────────────────────────────────────────────────────── */}
      <section className="container-site py-16 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <SectionHead label="พื้นที่ดำเนินงาน" title="สวนสมุนไพรของชุมชน" />
            <ol className="mt-9 space-y-2">
              {area.map((place, i) => (
                <li
                  key={place}
                  className="flex items-baseline gap-4"
                  style={{ paddingLeft: `${i * 1.25}rem` }}
                >
                  <span className="type-meta text-muted-foreground">
                    {i === area.length - 1 ? "└" : "├"}
                  </span>
                  <span
                    className={
                      i === area.length - 1
                        ? "display-font type-h4 text-canopy"
                        : "text-muted-foreground"
                    }
                  >
                    {place}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-8 max-w-xl leading-8 text-muted-foreground">
              กิจกรรมสำรวจและสัมภาษณ์เกิดขึ้นในชุมชน การพัฒนาแปลงสมุนไพรอยู่ที่สวนสมุนไพรตำบลชากไทย
              และการอบรมจัดที่เทศบาลตำบลชากไทย
              จุดเรียนรู้ระดับพิกัดจะเผยแพร่เมื่อชุมชนอนุญาต
            </p>
          </div>

          <div className="space-y-8">
            <AreaMap
              query="สวนสมุนไพรตำบลชากไทย อำเภอเขาคิชฌกูฏ จังหวัดจันทบุรี"
              label="สวนสมุนไพรตำบลชากไทย"
              caption="แผนที่ระดับตำบล ตำบลชากไทย อำเภอเขาคิชฌกูฏ จังหวัดจันทบุรี"
            />
            {gardenPhoto && <figure>
              <div className="sheet relative aspect-3/2 overflow-hidden">
                <Image
                  src={gardenPhoto.url}
                  alt={gardenPhoto.alt}
                  fill
                  sizes="(min-width: 1024px) 50vw, 92vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-3 type-meta text-muted-foreground">
                ทางเดินในสวนสมุนไพรตำบลชากไทย หลังการพัฒนาพื้นที่ในกิจกรรมครั้งที่ 3
              </figcaption>
            </figure>}
          </div>
        </div>
      </section>

      {/* ── Outcome ─────────────────────────────────────────────────── */}
      <Reveal as="section" className="bg-canopy py-16 text-white sm:py-24">
        <div className="container-site">
          <SectionHead
            tone="dark"
            label="ผลลัพธ์"
            title="สิ่งที่เหลืออยู่กับชุมชนหลังโครงการจบ"
          />
          <dl className="mt-12 grid gap-px overflow-hidden bg-white/15 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { value: "24", unit: "ชนิด", label: "ฐานข้อมูลสมุนไพรท้องถิ่น" },
              { value: "24", unit: "ป้าย", label: "ป้ายความรู้ในแปลงสมุนไพร" },
              { value: "120", unit: "คน", label: "การเข้าร่วมกิจกรรมรวม" },
              {
                value: satisfaction.overallMean?.toFixed(2) ?? "ยังไม่มีข้อมูล",
                unit: "/ 5",
                label: "ความพึงพอใจโดยรวม",
              },
            ].map((stat) => (
              <div key={stat.label} className="bg-canopy px-6 py-8">
                <dt className="type-sm text-white/60">{stat.label}</dt>
                <dd className="mt-3 font-mono text-[2.5rem] leading-none">
                  {stat.value}
                  <span className="ml-1.5 text-base text-white/50">{stat.unit}</span>
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-8 max-w-3xl leading-8 text-white/70">
            รวมถึงแหล่งเรียนรู้ที่ได้รับการพัฒนา กิจกรรมถ่ายทอดความรู้และฝึกปฏิบัติ
            และเว็บไซต์กับสื่อออนไลน์สำหรับเผยแพร่ภูมิปัญญาสมุนไพรท้องถิ่น
            ซึ่งเป็นพื้นฐานของการอนุรักษ์และต่อยอดในระยะต่อไป
          </p>
          <Link
            href="/activities"
            className="mt-9 inline-flex items-center gap-2 border-b border-white/30 pb-1 font-medium text-white transition-colors hover:border-white"
          >
            ดูรายละเอียดการทำงานทั้ง 4 ครั้ง <span aria-hidden="true">→</span>
          </Link>
        </div>
      </Reveal>

      {/* ── Sources ─────────────────────────────────────────────────── */}
      <section className="container-site py-16 sm:py-20">
        <SectionHead label="บรรณานุกรม" title="แหล่งอ้างอิงของเนื้อหา" />
        <ul className="mt-9 max-w-4xl space-y-4">
          {bibliography.map((item) => (
            <li
              key={item}
              className="border-t border-border pt-4 type-sm text-muted-foreground"
            >
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-9 type-meta text-muted-foreground">
          {project.strategy}
          <br />
          {project.budgetCode}
        </p>
      </section>
    </ProjectShell>
  )
}
