"use client"

import Link from "next/link"
import { useEffect } from "react"

import { Plate } from "@/components/site/plate"

/**
 * What a reader sees when something inside the site throws.
 *
 * Written in Thai, with the way out named rather than implied: this audience
 * includes people who will not recognise an English stack trace as anything
 * other than a dead end. The digest is shown small at the bottom because it is
 * the only thing that lets the team match a report to the server log.
 */
export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <main className="flex-1">
      <header className="bg-canopy text-white">
        <div className="container-site py-16 sm:py-24">
          <Plate staked className="bg-white/15">
            ขัดข้อง
          </Plate>
          <h1 className="type-h2 mt-9">ขออภัย หน้านี้แสดงผลไม่สำเร็จ</h1>
          <p className="type-lead mt-6 max-w-2xl text-white/80">
            เกิดข้อผิดพลาดระหว่างเปิดหน้านี้ ไม่ได้เกิดจากสิ่งที่ท่านทำ
            ลองโหลดใหม่อีกครั้ง หรือกลับไปเริ่มจากหน้าแรก
          </p>
        </div>
      </header>

      <section className="container-site py-14 sm:py-20">
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => retry()}
            className="rounded-xs bg-marker px-7 py-3.5 font-semibold text-white transition-colors hover:bg-canopy"
          >
            ลองโหลดหน้านี้ใหม่
          </button>
          <Link
            href="/"
            className="rounded-xs border border-input px-7 py-3.5 font-semibold text-foreground transition-colors hover:border-marker hover:text-marker"
          >
            กลับหน้าแรก
          </Link>
        </div>

        <p className="type-sm mt-10 max-w-2xl text-muted-foreground">
          หากพบปัญหาซ้ำ โปรดแจ้งผู้ดูแลเว็บไซต์ผ่านหน้า{" "}
          <Link href="/contact" className="text-marker underline underline-offset-4">
            ติดต่อโครงการ
          </Link>{" "}
          พร้อมแจ้งรหัสอ้างอิงด้านล่าง
        </p>

        {error.digest && (
          <p className="type-meta mt-4 font-mono text-muted-foreground">
            รหัสอ้างอิง: {error.digest}
          </p>
        )}
      </section>
      </main>
    </div>
  )
}
