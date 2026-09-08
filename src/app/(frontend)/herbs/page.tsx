import type { Metadata } from "next"

import { HerbRegister } from "@/components/herbs/herb-register"
import { PageHeader } from "@/components/site/page-header"
import { ProjectShell } from "@/components/site/project-shell"
import { getPublishedHerbs } from "@/content/herbs"
import { getProject } from "@/content/project"

export const metadata: Metadata = {
  title: "ทะเบียนสมุนไพร",
  description:
    "ทะเบียนสมุนไพรท้องถิ่นตำบลชากไทย ค้นหาด้วยชื่อไทย ชื่อท้องถิ่น หรือชื่อวิทยาศาสตร์",
}

export default async function HerbsPage() {
  const [herbs, project] = await Promise.all([getPublishedHerbs(), getProject()])

  return (
    <ProjectShell>
      <PageHeader
        plate="ทะเบียนสมุนไพร"
        title={`สมุนไพรท้องถิ่น ${herbs.length} ชนิด`}
        intro="ทุกรายการถอดจากบัตรข้อมูลในคู่มือสมุนไพรภูมิปัญญาท้องถิ่นตำบลชากไทย ซึ่งรวบรวมจากการสำรวจพื้นที่และการสัมภาษณ์ปราชญ์ชาวบ้าน"
        meta={[
          { label: "แหล่งข้อมูล", value: "คู่มือสมุนไพรฯ ฉบับพิมพ์ 2569" },
          { label: "เป้าหมายเดิม", value: "30 ชนิด · บันทึกได้ 24 ชนิด" },
          { label: "ป้ายในสวนสมุนไพร", value: "24 ป้าย" },
        ]}
      />

      <section className="container-site py-12 sm:py-16">
        <HerbRegister herbs={herbs} />
      </section>

      <section className="container-site pb-4">
        <p className="max-w-3xl border-l-2 border-marker pl-5 type-sm text-muted-foreground">
          ข้อมูลชุดนี้เป็นการบันทึกภูมิปัญญาของชุมชนตามที่ปราชญ์ชาวบ้านบอกเล่า ยังไม่ผ่านการตรวจทาน
          รายชนิดโดยผู้เชี่ยวชาญด้านเภสัชกรรมหรือการแพทย์แผนไทย จึงใช้เพื่อการเรียนรู้
          ไม่ใช่คำแนะนำในการรักษาโรค · อ้างอิง {project.owner}
        </p>
      </section>
    </ProjectShell>
  )
}
