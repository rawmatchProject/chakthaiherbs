import type { Metadata } from "next"
// lucide dropped its brand icons, so the Facebook link uses a generic one
import { GlobeIcon, MapPinIcon, UsersRoundIcon } from "lucide-react"

import { PageHeader } from "@/components/site/page-header"
import { ProjectShell } from "@/components/site/project-shell"
import { getPartners, getProject, partnerLinkLabel, type PartnerLink } from "@/content/project"

export const metadata: Metadata = {
  title: "ติดต่อโครงการ",
  description:
    "ช่องทางติดต่อผู้รับผิดชอบโครงการ และเว็บไซต์กับแผนที่ของภาคีเครือข่ายในตำบลชากไทย",
}

const linkIcon = {
  website: GlobeIcon,
  map: MapPinIcon,
  facebook: UsersRoundIcon,
} as const

function PartnerLinks({ links }: { links: PartnerLink[] }) {
  if (!links.length) {
    return <p className="type-meta text-muted-foreground">ติดต่อผ่านเทศบาลตำบลชากไทย</p>
  }

  return (
    <ul className="flex flex-wrap gap-x-2 gap-y-2">
      {links.map((link) => {
        const Icon = linkIcon[link.kind]
        return (
          <li key={link.href}>
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xs border border-input bg-paper px-3 py-1.5 type-meta font-semibold text-marker transition-colors hover:border-marker hover:bg-accent"
            >
              <Icon className="size-4" aria-hidden="true" />
              {partnerLinkLabel[link.kind]}
            </a>
          </li>
        )
      })}
    </ul>
  )
}

export default async function ContactPage() {
  const [project, partners] = await Promise.all([getProject(), getPartners()])

  return (
    <ProjectShell>
      <PageHeader
        plate="ติดต่อ"
        title="ติดต่อโครงการและภาคีในพื้นที่"
        intro="สำหรับการขอใช้ข้อมูล การแจ้งแก้ไขเนื้อหา การขอให้นำภาพของท่านออก หรือการร่วมงานในระยะต่อไป"
      />

      <section className="container-site py-14 sm:py-20">
        <h2 className="type-h3">หน่วยงานเจ้าของโครงการ</h2>

        <div className="sheet mt-8 grid gap-8 p-7 sm:p-9 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          <div>
            <p className="type-h4">{project.owner}</p>
            <p className="type-sm mt-2 text-muted-foreground">
              ผู้รับผิดชอบโครงการ · {project.leads.join(" และ ")}
            </p>
            <div className="mt-6">
              <PartnerLinks
                links={[
                  { kind: "website", href: project.ownerUrl },
                  { kind: "map", href: project.ownerMapUrl },
                ]}
              />
            </div>
          </div>

          <dl className="grid gap-5 border-t border-border pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-14">
            <div>
              <dt className="label text-muted-foreground">พื้นที่ดำเนินงาน</dt>
              <dd className="mt-1.5">ตำบลชากไทย อำเภอเขาคิชฌกูฏ จังหวัดจันทบุรี</dd>
            </div>
            <div>
              <dt className="label text-muted-foreground">สนับสนุนโดย</dt>
              <dd className="mt-1.5">
                <a
                  href={project.funderUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-marker underline-offset-4 hover:underline"
                >
                  {project.funder} ↗
                </a>
              </dd>
            </div>
            <div>
              <dt className="label text-muted-foreground">ช่องทางออนไลน์อื่น</dt>
              <dd className="type-sm mt-1.5 text-muted-foreground">
                อีเมลและเบอร์โทรของโครงการจะแสดงที่นี่เมื่อผู้ดูแลบันทึกค่าเหล่านี้ในระบบหลังบ้าน
                จึงแก้ไขได้โดยไม่ต้องแก้โค้ดหน้าเว็บ
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="border-t border-border bg-secondary/40 py-14 sm:py-20">
        <div className="container-site">
          <h2 className="type-h3">ภาคีเครือข่ายในพื้นที่</h2>
          <p className="type-sm mt-4 max-w-3xl text-muted-foreground">
            เรื่องที่เกี่ยวกับสวนสมุนไพร ป้ายความรู้ หรือกิจกรรมในชุมชน
            ติดต่อผ่านหน่วยงานในพื้นที่ได้โดยตรง
          </p>

          <ul className="mt-10 grid gap-6 md:grid-cols-2">
            {partners.map((partner) => (
              <li key={partner.label} className="sheet lift group relative flex flex-col overflow-hidden p-6">
                <h3 className="type-h4">{partner.label}</h3>
                <p className="type-sm mt-1.5 text-muted-foreground">{partner.role}</p>
                <div className="mt-auto pt-5">
                  <PartnerLinks links={partner.links} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </ProjectShell>
  )
}
