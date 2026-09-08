import type { Metadata } from "next"

import { PageHeader } from "@/components/site/page-header"
import { ProjectShell } from "@/components/site/project-shell"
import { SectionHead } from "@/components/site/section-head"
import { VideoEmbed } from "@/components/site/video-embed"
import { getVideos } from "@/content/project"

export const metadata: Metadata = {
  title: "สื่อและวิดีโอ",
  description: "วิดีโอโครงการและคลิปสัมภาษณ์ปราชญ์ชาวบ้านในพื้นที่ตำบลชากไทย",
}

export default async function MediaPage() {
  const videos = await getVideos()
  return (
    <ProjectShell>
      <PageHeader
        plate="สื่อและวิดีโอ"
        title="วิดีโอและความรู้จากพื้นที่"
        intro="วิดีโอเผยแพร่บนช่องของผู้รับผิดชอบโครงการ รวบรวมเรื่องเล่าจากชุมชนและความรู้จากการทำงานในพื้นที่"
        meta={[
          { label: "วิดีโอ", value: `${videos.length} คลิป` },
          { label: "รูปแบบ", value: "วิดีโอและความรู้" },
          { label: "ช่วงเวลา", value: "พฤษภาคม – มิถุนายน 2569" },
        ]}
      />

      <section className="container-site py-14 sm:py-20">
        <SectionHead
          label="วิดีโอ"
          title="ความรู้จากคนในพื้นที่"
          intro="เลือกชมวิดีโอเพื่อฟังเรื่องราวและแนวทางการอนุรักษ์สมุนไพรของชุมชนตำบลชากไทย"
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {videos.map((video) => (
            <article key={video.id} className="sheet lift group overflow-hidden">
              <VideoEmbed youtubeId={video.youtubeId} title={video.title} />
              <div className="border-t border-border p-6">
                <p className="label text-marker">วิดีโอ</p>
                <h2 className="type-h4 mt-3">{video.title}</h2>
                <p className="type-sm mt-3 text-muted-foreground">{video.description}</p>
                <p className="type-meta mt-6 text-muted-foreground">
                  เผยแพร่บน YouTube · ช่อง {video.channel}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </ProjectShell>
  )
}
