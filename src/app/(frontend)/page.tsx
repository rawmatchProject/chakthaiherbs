import Image from "next/image"
import Link from "next/link"

import { HerbCard } from "@/components/herbs/herb-card"
import { ArticleCard } from "@/components/site/article-card"
import { LeafMark } from "@/components/site/leaf-mark"
import { Plate, toThaiNumerals } from "@/components/site/plate"
import { ProjectShell } from "@/components/site/project-shell"
import { RegisterMarquee } from "@/components/site/register-marquee"
import { Reveal } from "@/components/site/reveal"
import { SatisfactionBars } from "@/components/site/satisfaction-bars"
import { SectionHead } from "@/components/site/section-head"
import { VideoEmbed } from "@/components/site/video-embed"
import { getHerbGroupRecords, groupHerbCount } from "@/content/groups"
import { getPublishedHerbs } from "@/content/herbs"
import { getPublishedArticles } from "@/content/news"
import { getActivities, getProject, getSatisfaction, getVideos } from "@/content/project"

export default async function Home() {
  const [herbs, herbGroupRecords, allArticles, activities, project, satisfaction, videos] =
    await Promise.all([
      getPublishedHerbs(),
      getHerbGroupRecords(),
      getPublishedArticles(),
      getActivities(),
      getProject(),
      getSatisfaction(),
      getVideos(),
    ])
  const featured = herbs.slice(0, 4)
  const totalParticipation = activities.reduce((sum, a) => sum + a.participants, 0)
  const articles = allArticles.slice(0, 3)

  return (
    <ProjectShell>
      {/* ── Hero ─────────────────────────────────────────────────────────
          The register itself is the headline: 24 names, in the order the
          printed guide lists them, over the garden they were recorded in. */}
      <section className="relative isolate overflow-hidden bg-canopy-deep text-white">
        <Image
          src="/site/garden-path.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="rise-scrim object-cover opacity-45"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(105deg,var(--canopy-deep)_18%,rgb(20_32_15_/_0.82)_48%,rgb(20_32_15_/_0.45)_100%)]"
        />

        <div className="relative container-site pt-16 pb-12 sm:pt-24 sm:pb-16">
          <Plate staked className="rise">ทะเบียนสมุนไพรชุมชน</Plate>

          <p className="rise mt-6 font-medium text-marker-bright" style={{ "--rise-delay": "45ms" } as React.CSSProperties}>
            อนุรักษ์ภูมิปัญญาท้องถิ่นสมุนไพรไทยตำบลชากไทย
          </p>

          <h1 className="rise type-hero mt-5 max-w-[19ch] text-balance" style={{ "--rise-delay": "90ms" } as React.CSSProperties}>
            สมุนไพร ๒๔ ชนิด
            <span className="block text-white/70">ที่ชากไทยบันทึกไว้เอง</span>
          </h1>

          <p className="rise type-lead mt-7 max-w-2xl text-white/75" style={{ "--rise-delay": "180ms" } as React.CSSProperties}>
            ชุมชนตำบลชากไทย อำเภอเขาคิชฌกูฏ เดินสำรวจป่าเชิงเขาของตัวเอง
            นั่งคุยกับปราชญ์ชาวบ้าน แล้วปักป้ายบอกชื่อสมุนไพรทีละต้นในสวนของชุมชน
            เว็บไซต์นี้คือทะเบียนเล่มนั้นในรูปแบบที่ค้นได้
          </p>

          <div className="rise mt-9 flex flex-wrap items-center gap-x-4 gap-y-3" style={{ "--rise-delay": "270ms" } as React.CSSProperties}>
            <Link
              href="/herbs"
              className="inline-flex h-12 items-center rounded-xs bg-marker px-6 font-medium text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.4)] transition hover:bg-marker-bright"
            >
              เปิดทะเบียนสมุนไพร
            </Link>
            <Link
              href="/activities"
              className="inline-flex h-12 items-center rounded-xs border border-white/30 px-6 font-medium text-white transition hover:border-white/70 hover:bg-white/5"
            >
              ดูการทำงานในพื้นที่
            </Link>
          </div>

          {/* field record — the metadata a specimen sheet always carries */}
          <dl className="rise mt-14 grid max-w-3xl gap-x-10 gap-y-5 border-t border-white/15 pt-7 type-meta sm:grid-cols-3" style={{ "--rise-delay": "360ms" } as React.CSSProperties}>
            <div>
              <dt className="text-white/45">พื้นที่บันทึก</dt>
              <dd className="mt-1 text-white/85">ต.ชากไทย อ.เขาคิชฌกูฏ จ.จันทบุรี</dd>
            </div>
            <div>
              <dt className="text-white/45">ช่วงเวลาสำรวจ</dt>
              <dd className="mt-1 text-white/85">{project.period}</dd>
            </div>
            <div>
              <dt className="text-white/45">ผู้บันทึก</dt>
              <dd className="mt-1 text-white/85">ปราชญ์ชุมชน ร่วมกับ {project.owner}</dd>
            </div>
          </dl>
        </div>

        {/* the register, running */}
        <div className="rise relative border-t border-white/12 bg-canopy-deep/70 py-4 backdrop-blur-sm" style={{ "--rise-delay": "460ms" } as React.CSSProperties}>
          <RegisterMarquee names={herbs.map((h) => ({ slug: h.slug, nameTh: h.nameTh }))} />
        </div>
      </section>

      {/* ── The register ─────────────────────────────────────────────── */}
      <Reveal as="section" className="container-site py-20 sm:py-28">
        <SectionHead
          align="between"
          label="Register"
          title="บัตรข้อมูลสมุนไพร"
          intro={
            <>
              แต่ละบัตรบันทึกชื่อท้องถิ่น ชื่อวิทยาศาสตร์ นิเวศวิทยา ลักษณะทางพฤกษศาสตร์
              ส่วนที่ใช้ วิธีใช้ ข้อควรระวัง และภูมิปัญญาของชุมชนที่ผูกกับพืชต้นนั้น
            </>
          }
          link={{ href: "/herbs", label: `ดูทั้ง ${herbs.length} ชนิด` }}
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {featured.map((herb) => (
            <HerbCard key={herb.id} herb={herb} />
          ))}
        </div>
      </Reveal>

      {/* ── Five groups ─────────────────────────────────────────────────
          No poster thumbnails here: the printed posters are dense enough that
          they are unreadable at any size a card can give them. The herb names
          are the useful preview. */}
      <Reveal as="section" className="border-y border-border bg-secondary/45 py-20 sm:py-28">
        <div className="container-site">
          <SectionHead
            align="between"
            label="Thematic guides"
            title="5 กลุ่มสมุนไพรเพื่อสุขภาพ"
            intro={
              <>
                นอกจากทะเบียนรายชนิด คู่มือยังจัดสมุนไพรเป็นห้ากลุ่มตามการดูแลสุขภาพ
                พร้อมตำรับและวิธีปรุงที่ใช้ได้จริงในครัวเรือน
              </>
            }
          />

          <ul className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {herbGroupRecords.map((group) => {
              const names = [...new Set(group.tables.flatMap((t) => t.rows.map((r) => r.name)))]
              const shown = names.slice(0, 6)
              return (
                <li key={group.id}>
                  <Link
                    href={`/groups/${group.slug}`}
                    className="sheet lift group relative flex h-full flex-col overflow-hidden p-7"
                  >
                    <LeafMark variant={group.number} size={150} className="-right-8 -bottom-7" />
                    <div className="relative flex items-center justify-between gap-4">
                      <Plate size="lg">กลุ่มที่ {toThaiNumerals(group.number)}</Plate>
                      <span className="type-meta text-muted-foreground">
                        {groupHerbCount(group)} ชนิด
                      </span>
                    </div>

                    <h3 className="type-h4 relative mt-6 transition-colors group-hover:text-marker">{group.titleTh}</h3>
                    <p className="label relative mt-1 text-muted-foreground">{group.titleEn}</p>

                    <ul className="relative mt-5 flex flex-wrap gap-2">
                      {shown.map((name) => (
                        <li
                          key={name}
                          className="type-sm border border-input bg-background/60 px-3 py-1"
                        >
                          {name}
                        </li>
                      ))}
                      {names.length > shown.length && (
                        <li className="type-sm px-1 py-1 text-muted-foreground">
                          +{names.length - shown.length}
                        </li>
                      )}
                    </ul>

                    <span className="relative mt-auto pt-6 type-sm font-semibold text-marker">
                      อ่านสรรพคุณและวิธีปรุง{" "}
                      <span aria-hidden="true" className="arrow-slide">→</span>
                    </span>
                  </Link>
                </li>
              )
            })}

            <li>
              <Link
                href="/groups"
                className="group flex h-full flex-col justify-center border border-dashed border-marker/40 bg-background/40 p-7 text-center transition-colors hover:border-marker hover:bg-background/70"
              >
                <span className="type-h4 text-marker">เปิดทั้ง 5 กลุ่ม</span>
                <span className="type-sm mt-2 text-muted-foreground">
                  ดูสรรพคุณโดยละเอียด วิธีปรุง ตำรับ และข้อควรระวังของทุกกลุ่ม
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </Reveal>

      {/* ── The work ─────────────────────────────────────────────────── */}
      <Reveal as="section" className="container-site py-20 sm:py-28">
        <SectionHead
          align="between"
          label="Fieldwork · เมษายน – มิถุนายน 2569"
          title="สี่ครั้งที่ลงพื้นที่"
          intro="ลำดับนี้สำคัญ เพราะแต่ละครั้งต่อยอดจากครั้งก่อน ตั้งแต่การสำรวจ ไปจนถึงการอบรมที่มีคนเข้าร่วมมากที่สุด"
          link={{ href: "/activities", label: "อ่านรายละเอียดทุกครั้ง" }}
        />

        <ol className="mt-12 grid gap-px overflow-hidden rounded-xs border border-border bg-border sm:grid-cols-2 xl:grid-cols-4">
          {activities.map((activity) => (
            <li key={activity.id} className="flex flex-col bg-paper p-6">
              <div className="flex items-baseline justify-between gap-3">
                <Plate>ครั้งที่ {toThaiNumerals(activity.order)}</Plate>
                <span className="type-meta text-muted-foreground">
                  {activity.participants} คน
                </span>
              </div>
              <p className="label-th mt-5 text-foreground/50">{activity.dateLabel}</p>
              <h3 className="display-font mt-2 type-h4 leading-snug">{activity.title}</h3>
              <p className="mt-3 line-clamp-4 type-sm text-muted-foreground">
                {activity.summary}
              </p>
              {activity.photos[0] && (
                <div className="relative mt-5 aspect-[4/3] overflow-hidden rounded-xs bg-muted">
                  <Image
                    src={activity.photos[0].url}
                    alt=""
                    fill
                    sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 92vw"
                    className="object-cover"
                  />
                </div>
              )}
            </li>
          ))}
        </ol>

        <p className="mt-6 type-meta text-muted-foreground">
          รวมการเข้าร่วมกิจกรรม {totalParticipation} คน · ดำเนินกิจกรรมหลักครบ {activities.length} ครั้ง
        </p>
      </Reveal>

      {/* ── What people said ─────────────────────────────────────────── */}
      <Reveal as="section" className="bg-canopy py-20 text-white sm:py-28">
        {satisfaction.overallMean === null ? (
          <p className="container-site type-body">ยังไม่มีข้อมูลผลประเมินความพึงพอใจ</p>
        ) : (
          <div className="container-site grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div>
              <SectionHead
                tone="dark"
                label={`ผลประเมิน · ผู้ตอบ ${satisfaction.respondents} คน`}
                title="ชุมชนให้คะแนนอย่างไร"
                intro={
                  <>
                    เก็บแบบประเมินออนไลน์ {satisfaction.collectedAt} หลังการอบรม
                    ทุกข้ออยู่ในระดับมากที่สุด
                  </>
                }
              />
              <p className="mt-10 font-mono text-6xl leading-none font-500 text-white sm:text-7xl">
                {satisfaction.overallMean.toFixed(2)}
                <span className="type-h4 text-white/45"> / 5.00</span>
              </p>
              <p className="mt-3 type-sm text-white/60">
                ค่าเฉลี่ยรวม คิดเป็นร้อยละ {satisfaction.overallPercent}
              </p>
            </div>
  
            {/* small multiples — the real spread is 4.73 to 4.89, so the scale
                starts at 4.6 rather than 0, and says so */}
            <div>
              <SatisfactionBars items={satisfaction.items} />
              <p className="mt-5 type-meta text-white/40">
                แกนแสดงช่วง 4.60 – 5.00 เพื่อให้เห็นความต่างระหว่างข้อ
              </p>
            </div>
          </div>
        )}
      </Reveal>

      {/* ── Articles ─────────────────────────────────────────────────────
          Placeholder records until the backend serves real ones; each card
          labels itself so a visitor is never misled. */}
      {articles.length > 0 && (
        <section className="border-y border-border bg-secondary/45 py-20 sm:py-28">
          <div className="container-site">
            <SectionHead
              align="between"
              label="บทความ"
              title="บทความและข่าวสาร"
              intro="พื้นที่สำหรับบทความความรู้เรื่องสมุนไพร ข่าวกิจกรรมในตำบล และประกาศถึงชุมชน"
              link={{ href: "/news", label: "อ่านบทความทั้งหมด" }}
            />
            <div className="mt-12 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Video ────────────────────────────────────────────────────── */}
      <section className="container-site py-20 sm:py-28">
        <SectionHead
          align="between"
          label="วิดีโอ"
          title="วิดีโอและความรู้"
          intro="เรื่องเล่าจากปราชญ์ชาวบ้านและภาพรวมของการทำงาน ที่อ่านรายละเอียดต่อได้จากทะเบียนและหน้าโครงการ"
          link={{ href: "/media", label: "ดูสื่อทั้งหมด" }}
        />
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {videos.map((video) => (
            <figure key={video.id}>
              <VideoEmbed youtubeId={video.youtubeId} title={video.title} />
              <figcaption className="mt-4">
                <h3 className="display-font type-h4">{video.title}</h3>
                <p className="mt-1.5 type-sm text-muted-foreground">
                  {video.description}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </ProjectShell>
  )
}
