import type { Metadata } from "next"
import Image from "next/image"

import { Plate, toThaiNumerals } from "@/components/site/plate"
import { PageHeader } from "@/components/site/page-header"
import { ProjectShell } from "@/components/site/project-shell"
import { Reveal } from "@/components/site/reveal"
import { getActivities, getIndicators, getProject } from "@/content/project"

export const metadata: Metadata = {
  title: "การทำงานในพื้นที่",
  description:
    "กิจกรรมหลัก 4 ครั้งของโครงการอนุรักษ์ภูมิปัญญาและสมุนไพรท้องถิ่นตำบลชากไทย เมษายน – มิถุนายน 2569",
}

export default async function ActivitiesPage() {
  const [activities, indicators, { recommendations }] = await Promise.all([
    getActivities(),
    getIndicators(),
    getProject(),
  ])
  const total = activities.reduce((sum, a) => sum + a.participants, 0)

  return (
    <ProjectShell>
      <PageHeader
        plate="การทำงาน"
        title="สี่ครั้งที่ลงพื้นที่ชากไทย"
        intro="ลำดับของกิจกรรมเป็นสาระ ไม่ใช่การจัดเรียง แต่ละครั้งใช้ผลของครั้งก่อนเป็นวัตถุดิบ ตั้งแต่การสำรวจป่า ไปจนถึงการอบรมที่มีผู้เข้าร่วมมากที่สุด"
        meta={[
          { label: "ช่วงเวลา", value: "เมษายน – มิถุนายน 2569" },
          { label: "กิจกรรมหลัก", value: `${activities.length} ครั้ง · ครบร้อยละ 100` },
          { label: "การเข้าร่วมรวม", value: `${total} คน` },
        ]}
      />

      <div className="container-site py-14 sm:py-20">
        <ol className="space-y-20 sm:space-y-28">
          {activities.map((activity) => (
            <li key={activity.id} className="grid gap-10 lg:grid-cols-[14rem_1fr] lg:gap-14">
              {/* the rail carries the facts a field log records */}
              <div className="lg:sticky lg:top-28 lg:self-start">
                <Plate size="lg" staked>
                  ครั้งที่ {toThaiNumerals(activity.order)}
                </Plate>
                <dl className="mt-8 space-y-4 type-meta">
                  <div>
                    <dt className="text-muted-foreground">วันที่</dt>
                    <dd className="mt-1 leading-6">{activity.dateLabel}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">สถานที่</dt>
                    <dd className="mt-1 leading-6">{activity.place}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">ผู้เข้าร่วม</dt>
                    <dd className="mt-1 type-h4 leading-none">{activity.participants} คน</dd>
                  </div>
                </dl>
              </div>

              <div className="min-w-0">
                <h2 className="type-h3">{activity.title}</h2>
                <p className="mt-5 max-w-3xl leading-8 text-muted-foreground">{activity.summary}</p>

                <p className="label mt-9 text-marker">ผลที่เกิดขึ้น</p>
                <ul className="mt-3 space-y-2.5">
                  {activity.outcomes.map((outcome) => (
                    <li key={outcome} className="flex gap-3 leading-8">
                      <span aria-hidden="true" className="mt-3 size-1.5 shrink-0 bg-moss" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>

                {/* Each activity keeps its complete photo record with the work
                    it documents, rather than separating photographs into media. */}
                {activity.photos.length > 0 && (
                  <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {activity.photos.map((photo, i) => (
                      <figure
                        key={photo.id}
                        className={`sheet relative aspect-square overflow-hidden ${
                          i === 0 ? "col-span-2 row-span-2" : ""
                        }`}
                      >
                        <Image
                          src={photo.url}
                          alt={photo.alt || `ภาพกิจกรรม${activity.title}`}
                          fill
                          sizes="(min-width: 1280px) 20vw, (min-width: 640px) 30vw, 45vw"
                          className="object-cover"
                        />
                      </figure>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* ── Indicators ───────────────────────────────────────────────── */}
      <Reveal as="section" className="border-t border-border bg-secondary/40 py-16 sm:py-20">
        <div className="container-site">
          <h2 className="type-h3">ผลประเมินตัวชี้วัดความสำเร็จ</h2>
          <div className="scroll-paper mt-8 overflow-x-auto">
            <table className="w-full min-w-[38rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="label pb-3 pr-6 text-muted-foreground">ตัวชี้วัด</th>
                  <th scope="col" className="label pb-3 pr-6 text-muted-foreground">เป้าหมาย</th>
                  <th scope="col" className="label pb-3 pr-6 text-muted-foreground">ผลดำเนินงาน</th>
                  <th scope="col" className="label pb-3 text-muted-foreground">บรรลุ</th>
                </tr>
              </thead>
              <tbody>
                {indicators.map((row) => (
                  <tr key={row.label} className="border-b border-border/70">
                    <th scope="row" className="py-4 pr-6 font-medium">{row.label}</th>
                    <td className="py-4 pr-6 type-meta text-muted-foreground">
                      {row.target}
                    </td>
                    <td className="py-4 pr-6 type-meta">{row.result}</td>
                    <td className="py-4">
                      <span
                        className={`type-meta ${
                          row.met ? "text-canopy" : "text-turmeric"
                        }`}
                      >
                        {row.met ? "บรรลุ" : "ต่ำกว่าเป้า"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-5 type-meta text-muted-foreground">
            ที่มา: รายงานผลการดำเนินงานโครงการ บทที่ 4
          </p>
        </div>
      </Reveal>

      {/* ── What comes next ──────────────────────────────────────────── */}
      <Reveal as="section" className="container-site py-16 sm:py-20">
        <h2 className="type-h3">ข้อเสนอแนะสำหรับระยะต่อไป</h2>
        <ol className="mt-8 grid gap-x-12 gap-y-6 md:grid-cols-2">
          {recommendations.map((item, i) => (
            <li key={item} className="flex gap-4">
              <span className="type-meta text-marker">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="leading-8">{item}</span>
            </li>
          ))}
        </ol>
      </Reveal>
    </ProjectShell>
  )
}
