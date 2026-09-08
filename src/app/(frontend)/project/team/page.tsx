import type { Metadata } from "next"

import { PageHeader } from "@/components/site/page-header"
import { ProjectShell } from "@/components/site/project-shell"
import { SectionHead } from "@/components/site/section-head"
import { getPartners, getProject, getSatisfaction } from "@/content/project"

export const metadata: Metadata = {
  title: "คณะผู้ดำเนินงาน",
  description: "ผู้รับผิดชอบโครงการและภาคีเครือข่ายในพื้นที่ตำบลชากไทย",
}

export default async function TeamPage() {
  const [project, partners, satisfaction] = await Promise.all([
    getProject(),
    getPartners(),
    getSatisfaction(),
  ])

  return (
    <ProjectShell>
      <PageHeader
        plate="ผู้ดำเนินงาน"
        title="คนที่ทำให้ทะเบียนนี้เกิดขึ้น"
        intro="โครงการเดินได้ด้วยความร่วมมือของสถาบันการศึกษา องค์กรปกครองส่วนท้องถิ่น หน่วยบริการสุขภาพ โรงเรียน ผู้นำชุมชน อาสาสมัครสาธารณสุข และปราชญ์ชาวบ้าน"
      />

      <section className="container-site py-14 sm:py-20">
        <SectionHead label="ผู้รับผิดชอบโครงการ" title={project.owner} />
        <ul className="mt-9 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2">
          {project.leads.map((lead) => (
            <li key={lead} className="bg-paper px-6 py-7">
              <p className="display-font type-h4">{lead}</p>
              <p className="label mt-1.5 text-muted-foreground">ผู้รับผิดชอบโครงการ</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 type-meta text-muted-foreground">
          สนับสนุนงบประมาณโดย {project.funder}
        </p>
      </section>

      <section className="border-t border-border bg-secondary/40 py-14 sm:py-20">
        <div className="container-site">
          <SectionHead
            label="ภาคีเครือข่ายในพื้นที่"
            title="ผู้ร่วมสำรวจ ร่วมบอกเล่า และร่วมดูแลต่อ"
            intro="เครือข่ายนี้เกิดจากการประสานงาน 5 ครั้งในกิจกรรมช่วงแรกของโครงการ และเป็นกลไกที่รายงานเสนอให้รักษาไว้ในระยะต่อไป"
          />
          <ul className="mt-10 border-t border-border">
            {partners.map((partner) => (
              <li
                key={partner.label}
                className="grid gap-2 border-b border-border py-5 sm:grid-cols-[1.1fr_1fr] sm:gap-10"
              >
                <p className="display-font type-h4">{partner.label}</p>
                <p className="type-sm text-muted-foreground">{partner.role}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-site py-14 sm:py-20">
        <SectionHead label="ผู้เข้าร่วมประเมิน" title={`ใครตอบแบบประเมิน (${satisfaction.respondents} คน)`} />
        <ul className="mt-9 max-w-2xl space-y-4">
          {satisfaction.profile.map((row) => (
            <li key={row.label} className="grid grid-cols-[1fr_auto] items-center gap-5">
              <div>
                <p className="type-sm">{row.label}</p>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-marker" style={{ width: `${row.percent}%` }} />
                </div>
              </div>
              <span className="type-meta text-muted-foreground tabular-nums">
                {row.percent.toFixed(2)}%
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-6 type-meta text-muted-foreground">
          เก็บข้อมูล {satisfaction.collectedAt} · ที่มา: รายงานผลการดำเนินงานโครงการ ตารางที่ 1
        </p>
      </section>
    </ProjectShell>
  )
}
