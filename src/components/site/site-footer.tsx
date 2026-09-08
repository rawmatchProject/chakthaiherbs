import Link from "next/link"

import { getDeveloper, getPartners, getProject } from "@/content/project"

const explore = [
  { href: "/herbs", label: "ทะเบียนสมุนไพร 24 ชนิด" },
  { href: "/groups", label: "5 กลุ่มสมุนไพร" },
  { href: "/activities", label: "การทำงาน 4 ครั้ง" },
  { href: "/media", label: "สื่อและวิดีโอ" },
]

const about = [
  { href: "/project", label: "เกี่ยวกับโครงการ" },
  { href: "/project/team", label: "คณะผู้ดำเนินงาน" },
  { href: "/downloads", label: "เอกสารดาวน์โหลด" },
  { href: "/contact", label: "ติดต่อโครงการ" },
]

export async function SiteFooter() {
  const [project, partners, developer] = await Promise.all([getProject(), getPartners(), getDeveloper()])
  const safetyNotice = project.safetyNotice

  return (
    <footer className="mt-24 bg-canopy-deep text-[#e9e5d6]">
      {/* the safety notice is the first thing in the footer, not the last */}
      <div className="border-b border-white/10 bg-canopy">
        <div className="container-site flex flex-col gap-3 py-5 sm:flex-row sm:items-start sm:gap-5">
          <span className="plate shrink-0">ข้อควรทราบ</span>
          <p className="max-w-4xl type-sm text-[#e9e5d6]/80">{safetyNotice}</p>
        </div>
      </div>

      <div className="container-site grid gap-12 py-16 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1.1fr]">
        <div>
          <p className="display-font type-h4">{project.shortName}</p>
          <p className="label mt-1.5 text-[#e9e5d6]/50">{project.nameEn}</p>
          <p className="mt-5 max-w-sm type-sm text-[#e9e5d6]/70">
            {project.nameTh}
          </p>
          <p className="mt-5 type-meta text-[#e9e5d6]/55">
            <a
              href={project.ownerUrl}
              target="_blank"
              rel="noreferrer"
              className="underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              {project.owner} ↗
            </a>
            <br />
            {project.period} · {project.fiscalYear}
          </p>
        </div>

        <nav aria-label="สำรวจเนื้อหา">
          <p className="label text-[#e9e5d6]/45">สำรวจ</p>
          <ul className="mt-4 space-y-2.5 type-sm">
            {explore.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-[#e9e5d6]/80 transition-colors hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="เกี่ยวกับโครงการ">
          <p className="label text-[#e9e5d6]/45">โครงการ</p>
          <ul className="mt-4 space-y-2.5 type-sm">
            {about.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-[#e9e5d6]/80 transition-colors hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="label text-[#e9e5d6]/45">ภาคีเครือข่ายในพื้นที่</p>
          <ul className="mt-4 space-y-2 type-sm text-[#e9e5d6]/70">
            {partners.map((partner) => {
              const site = partner.links.find((link) => link.kind !== "map")
              return (
                <li key={partner.label}>
                  {site ? (
                    <a
                      href={site.href}
                      target="_blank"
                      rel="noreferrer"
                      className="underline-offset-4 transition-colors hover:text-white hover:underline"
                    >
                      {partner.label} ↗
                    </a>
                  ) : (
                    partner.label
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-site flex flex-col gap-2 py-6 type-meta text-[#e9e5d6]/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear() + 543} {project.owner}</p>
          <p className="flex flex-wrap gap-x-5 gap-y-1">
            <span>
              สนับสนุนโดย{" "}
              <a
                href={project.funderUrl}
                target="_blank"
                rel="noreferrer"
                className="underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                {project.funder} ↗
              </a>
            </span>
            <span>
              พัฒนาเว็บไซต์โดย{" "}
              <a
                href={developer.href}
                target="_blank"
                rel="noreferrer"
                className="underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                {developer.label} ↗
              </a>
            </span>
          </p>
        </div>
      </div>
    </footer>
  )
}
