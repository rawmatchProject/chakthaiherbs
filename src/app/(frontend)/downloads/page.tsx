import type { Metadata } from "next"
import Image from "next/image"

import { PageHeader } from "@/components/site/page-header"
import { ProjectShell } from "@/components/site/project-shell"
import { getPublishedDownloads } from "@/content/news"

export const metadata: Metadata = {
  title: "ดาวน์โหลด",
  description: "คู่มือสมุนไพร โปสเตอร์ 5 กลุ่ม ป้ายความรู้ และรายงานผลการดำเนินงานของโครงการ",
}

const typeLabel: Record<string, string> = {
  guide: "คู่มือ",
  report: "รายงาน",
  poster: "โปสเตอร์",
  infographic: "อินโฟกราฟิก",
  research: "งานวิจัย",
  presentation: "สไลด์",
  form: "แบบฟอร์ม",
}

export default async function DownloadsPage() {
  const items = await getPublishedDownloads()
  const ready = items.filter((item) => item.fileUrl)
  const pending = items.filter((item) => !item.fileUrl)

  return (
    <ProjectShell>
      <PageHeader
        plate="ดาวน์โหลด"
        title="เอกสารและสื่อของโครงการ"
        intro="สื่อที่พร้อมเผยแพร่ดาวน์โหลดได้ทันที ส่วนคู่มือฉบับพิมพ์และรายงานฉบับเต็มเป็นไฟล์ต้นฉบับขนาดใหญ่ที่รอการจัดเก็บบนระบบหลังบ้าน"
      />

      <section className="container-site py-14 sm:py-20">
        <h2 className="type-h3">พร้อมดาวน์โหลด</h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {ready.map((item) => (
            <li key={item.id}>
              <a href={item.fileUrl!} target="_blank" rel="noreferrer" className="sheet lift group relative flex h-full flex-col overflow-hidden">
                <span className="relative block aspect-3/4 overflow-hidden bg-muted">
                  <Image
                    src={item.fileUrl!}
                    alt=""
                    fill
                    sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 92vw"
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </span>
                <span className="flex flex-1 flex-col p-5">
                  <span className="label text-muted-foreground">{typeLabel[item.type]}</span>
                  <span className="display-font mt-2 type-h4 leading-snug">{item.title}</span>
                  <span className="mt-2 type-sm text-muted-foreground">
                    {item.description}
                  </span>
                  <span className="mt-auto pt-5 type-meta text-marker">
                    เปิดไฟล์ {item.sizeLabel} ↗
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {pending.length > 0 && (
        <section className="border-t border-border bg-secondary/40 py-14 sm:py-20">
          <div className="container-site">
            <h2 className="type-h3">กำลังจัดเตรียมไฟล์</h2>
            <p className="mt-4 max-w-3xl leading-8 text-muted-foreground">
              เอกสารเหล่านี้มีอยู่จริงและเป็นแหล่งอ้างอิงของเนื้อหาทั้งเว็บไซต์
              แต่เป็นไฟล์ต้นฉบับขนาดใหญ่ที่ต้องแปลงเป็น PDF และจัดเก็บบนที่เก็บไฟล์ของระบบหลังบ้านก่อนเปิดให้ดาวน์โหลด
            </p>
            <ul className="mt-8 border-t border-border">
              {pending.map((item) => (
                <li key={item.id} className="grid gap-2 border-b border-border py-6 sm:grid-cols-[1fr_1.2fr_auto] sm:gap-10">
                  <div>
                    <span className="label text-muted-foreground">{typeLabel[item.type]}</span>
                    <p className="display-font mt-1.5 type-h4">{item.title}</p>
                  </div>
                  <p className="type-sm text-muted-foreground">{item.description}</p>
                  <p className="type-meta text-turmeric sm:self-center">รอไฟล์เผยแพร่</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </ProjectShell>
  )
}
