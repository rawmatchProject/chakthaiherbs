import Image from "next/image"
import Link from "next/link"
import { MenuIcon } from "lucide-react"

import { MobileNav, SiteNav, type NavItem } from "@/components/site/site-nav"
import { TextSizeControl } from "@/components/site/text-size-control"
import { Button } from "@/components/site-ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/site-ui/sheet"
import { getProject } from "@/content/project"

/** Every section of the site, in reading order. */
const mainNav: NavItem[] = [
  { href: "/herbs", label: "ทะเบียนสมุนไพร" },
  { href: "/groups", label: "5 กลุ่มสมุนไพร" },
  { href: "/wisdom", label: "ภูมิปัญญา" },
  { href: "/activities", label: "การทำงาน" },
  { href: "/news", label: "บทความ" },
  { href: "/media", label: "สื่อและวิดีโอ" },
  { href: "/project", label: "โครงการ" },
]

const utilityNav: NavItem[] = [
  { href: "/project/team", label: "คณะผู้ดำเนินงาน" },
  { href: "/downloads", label: "ดาวน์โหลด" },
  { href: "/contact", label: "ติดต่อโครงการ" },
]

export async function SiteHeader() {
  const project = await getProject()

  return (
    <header className="sticky top-0 z-40">
      {/* Who runs this and when — the credit a public project owes its readers,
          kept on its own line so it never crowds the navigation. */}
      <div className="bg-canopy text-white">
        <div className="container-site flex flex-wrap items-center justify-between gap-x-8 gap-y-1 py-2">
          <p className="type-meta text-white/70">
            {project.owner} · {project.fiscalYear}
          </p>
          <div className="hidden items-center gap-x-6 sm:flex">
            {utilityNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="type-meta text-white/80 underline-offset-4 hover:text-white hover:underline"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="border-b border-border bg-litter/95 backdrop-blur-md">
        <div className="container-site flex items-center justify-between gap-3 sm:gap-6">
          <Link
            href="/"
            className="flex min-w-0 items-center py-3"
            aria-label="กลับหน้าแรก"
          >
            <Image
              src="/brand/chakthaiherbs-logo.png"
              alt="chakthaiherbs สมุนไพรตำบลชากไทย"
              width={2172}
              height={724}
              priority
              className="h-auto w-40 sm:w-48"
            />
          </Link>

          <SiteNav items={mainNav} />

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <TextSizeControl />

            <Sheet>
              <SheetTrigger
                render={
                  <Button variant="outline" size="icon" className="xl:hidden" aria-label="เปิดเมนู" />
                }
              >
                <MenuIcon aria-hidden="true" />
              </SheetTrigger>
              <SheetContent side="right" className="w-[88vw] max-w-sm bg-litter text-foreground">
                <SheetHeader className="pr-12">
                  <SheetTitle className="type-h4">เมนู</SheetTitle>
                </SheetHeader>
                <MobileNav items={mainNav} utility={utilityNav} />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
