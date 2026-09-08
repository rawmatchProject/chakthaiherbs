import type { Metadata } from "next"
import Link from "next/link"

import { Plate } from "@/components/site/plate"
import { ProjectShell } from "@/components/site/project-shell"

export const metadata: Metadata = { title: "ไม่พบหน้าที่ต้องการ" }

const routes = [
  { href: "/herbs", label: "ทะเบียนสมุนไพร", detail: "บัตรข้อมูลสมุนไพรท้องถิ่น 24 ชนิด" },
  { href: "/groups", label: "5 กลุ่มสมุนไพร", detail: "สรรพคุณและวิธีปรุงตามเป้าหมายสุขภาพ" },
  { href: "/wisdom", label: "ภูมิปัญญาท้องถิ่น", detail: "บันทึกการใช้สมุนไพรของคนชากไทย" },
  { href: "/activities", label: "การทำงานในพื้นที่", detail: "กิจกรรมทั้งสี่ครั้งของโครงการ" },
]

export default function NotFound() {
  return (
    <ProjectShell>
      <header className="bg-canopy text-white">
        <div className="container-site py-16 sm:py-24">
          <Plate staked className="bg-white/15">
            404
          </Plate>
          <h1 className="type-h2 mt-9">ไม่พบหน้าที่ต้องการ</h1>
          <p className="type-lead mt-6 max-w-2xl text-white/80">
            หน้านี้อาจถูกย้าย เปลี่ยนที่อยู่ หรือพิมพ์ที่อยู่คลาดเคลื่อน
            ลองเริ่มจากส่วนหลักของเว็บไซต์ด้านล่าง
          </p>
        </div>
      </header>

      <section className="container-site py-14 sm:py-20">
        <ul className="grid gap-5 md:grid-cols-2">
          {routes.map((route) => (
            <li key={route.href}>
              <Link
                href={route.href}
                className="sheet lift group relative block h-full overflow-hidden p-7"
              >
                <span className="type-h4 group-hover:text-marker">{route.label}</span>
                <span className="type-sm mt-2 block text-muted-foreground">{route.detail}</span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-10">
          <Link href="/" className="font-semibold text-marker underline-offset-4 hover:underline">
            <span aria-hidden="true">←</span> กลับหน้าแรก
          </Link>
        </p>
      </section>
    </ProjectShell>
  )
}
