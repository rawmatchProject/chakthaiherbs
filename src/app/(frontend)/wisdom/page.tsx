import type { Metadata } from "next"
import Link from "next/link"

import { PageHeader } from "@/components/site/page-header"
import { ProjectShell } from "@/components/site/project-shell"
import { SectionHead } from "@/components/site/section-head"
import { VideoEmbed } from "@/components/site/video-embed"
import { getPublishedHerbs } from "@/content/herbs"
import { getVideos } from "@/content/project"

export const metadata: Metadata = {
  title: "ภูมิปัญญาท้องถิ่น",
  description:
    "ภูมิปัญญาการใช้สมุนไพรของชุมชนตำบลชากไทย ตามที่ปราชญ์ชาวบ้านบอกเล่าและบันทึกไว้ในคู่มือของโครงการ",
}

export default async function WisdomPage() {
  const [herbs, videos] = await Promise.all([getPublishedHerbs(), getVideos()])
  // Only records whose card actually carries a ภูมิปัญญาท้องถิ่น paragraph.
  const withWisdom = herbs.filter((herb) => herb.localWisdom)
  const interview = videos.find((video) => video.id === "elder-interview")

  return (
    <ProjectShell>
      <PageHeader
        plate="ภูมิปัญญา"
        title="ความรู้นี้มีเจ้าของ"
        intro="ทุกบัตรข้อมูลในทะเบียนมีย่อหน้าที่บันทึกว่าคนชากไทยใช้พืชต้นนั้นอย่างไรจริง ๆ หน้านี้รวบรวมเฉพาะส่วนนั้นไว้อ่านต่อเนื่อง"
        meta={[
          { label: "บันทึกภูมิปัญญา", value: `${withWisdom.length} รายการ` },
          { label: "ที่มา", value: "สัมภาษณ์ปราชญ์ชาวบ้าน 2569" },
          { label: "สถานะ", value: "ข้อมูลชุมชน ยังไม่ตรวจทานรายชนิด" },
        ]}
      />

      {interview && (
        <section className="container-site py-14 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
            <VideoEmbed youtubeId={interview.youtubeId} title={interview.title} />
            <div>
              <SectionHead label="เสียงจากผู้รู้" title={interview.title} />
              <p className="mt-6 leading-8 text-muted-foreground">{interview.description}</p>
              <p className="mt-6 border-l-2 border-marker pl-5 leading-8">
                องค์ความรู้ของปราชญ์ชาวบ้านเป็นทรัพยากรของชุมชน
                การนำมาเผยแพร่จึงต้องระบุที่มา และเปิดทางให้ชุมชนกำหนดขอบเขตการเผยแพร่ได้เสมอ
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-border bg-secondary/40 py-14 sm:py-20">
        <div className="container-site">
          <SectionHead
            label="บันทึกรายชนิด"
            title="ภูมิปัญญาท้องถิ่นตำบลชากไทย"
            intro="เรียงตามลำดับในทะเบียน กดที่ชื่อเพื่อเปิดบัตรข้อมูลเต็ม"
          />

          {withWisdom.length > 0 ? (
            <ul className="mt-10 border-t border-border">
              {withWisdom.map((herb) => (
                <li key={herb.id} className="grid gap-3 border-b border-border py-7 lg:grid-cols-[16rem_1fr] lg:gap-12">
                  <div>
                    <Link href={`/herbs/${herb.slug}`} className="display-font type-h4 hover:text-marker">
                      {herb.nameTh}
                    </Link>
                    <p className="mt-1 type-meta text-muted-foreground font-mono italic">
                      {herb.scientificName}
                    </p>
                  </div>
                  <p className="leading-8 text-muted-foreground">{herb.localWisdom}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-10 border border-dashed border-input bg-paper/60 p-12 text-center text-muted-foreground">
              ยังไม่มีบันทึกภูมิปัญญาที่เผยแพร่
            </p>
          )}
        </div>
      </section>
    </ProjectShell>
  )
}
