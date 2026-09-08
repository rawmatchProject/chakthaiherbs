import type { Metadata, Viewport } from 'next'
import { draftMode } from 'next/headers'
import { Google_Sans, IBM_Plex_Mono, Kanit } from 'next/font/google'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { OrganizationJsonLd } from '@/components/site/json-ld'
import { getProject } from '@/content/project'
import { isConfigured, siteName, siteUrl } from '@/lib/site'

import './globals.css'

/**
 * The text face: Google Sans, which carries a Thai subset.
 *
 * Note for whoever tunes this next — Google Sans sets noticeably lighter than
 * Sarabun in Thai, so the body runs at 500 rather than 400 to keep the colour
 * on the page close to what it was. Do not drop it to 400: this site is read
 * by people who have already asked for larger type.
 */
const googleSans = Google_Sans({
  subsets: ['thai', 'latin'],
  variable: '--font-thai',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

/**
 * The display face: Kanit — condensed and angular, so headings carry weight and
 * long Thai titles fit on fewer lines. Headings only; it is too dense for
 * continuous reading at 18px.
 */
const kanit = Kanit({
  subsets: ['thai', 'latin'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
  display: 'swap',
})

/** Latin data only — scientific names and the large result figures. */
const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-plex-mono',
  weight: ['400', '500'],
  display: 'swap',
})

const description =
  'ทะเบียนสมุนไพรท้องถิ่น 24 ชนิดที่ชุมชนตำบลชากไทย อำเภอเขาคิชฌกูฏ จังหวัดจันทบุรี สำรวจและบันทึกไว้ร่วมกับคณะพยาบาลศาสตร์ มหาวิทยาลัยราชภัฏรำไพพรรณี'

export async function generateMetadata(): Promise<Metadata> {
  const project = await getProject()
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: 'ทะเบียนสมุนไพรชุมชนตำบลชากไทย',
      template: '%s · สมุนไพรชากไทย',
    },
    description,
    applicationName: siteName,
    keywords: [
      'สมุนไพรไทย',
      'สมุนไพรท้องถิ่น',
      'ตำบลชากไทย',
      'เขาคิชฌกูฏ',
      'จันทบุรี',
      'ภูมิปัญญาท้องถิ่น',
      'ทะเบียนสมุนไพร',
    ],
    authors: [{ name: project.owner, url: project.ownerUrl }],
    publisher: project.owner,
    openGraph: {
      type: 'website',
      locale: 'th_TH',
      siteName,
      url: '/',
      title: 'ทะเบียนสมุนไพรชุมชนตำบลชากไทย',
      description,
    },
    twitter: { card: 'summary_large_image' },
    robots: isConfigured ? undefined : { index: false, follow: false },
  }
}

export const viewport: Viewport = {
  themeColor: '#1f3a1c',
  colorScheme: 'light',
}

/**
 * The site shell. Header and footer are not rendered here — every page wraps
 * itself in `ProjectShell`, which owns the skip link, the site header and the
 * footer's safety notice.
 *
 * `AdminBar` is the one piece the Payload template contributes: it gives a
 * signed-in editor the "edit this page" strip and the exit-preview control.
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()
  const project = await getProject()

  return (
    <html
      lang="th"
      data-scroll-behavior="smooth"
      /* the text-size script below writes --text-scale on this element before
         React hydrates, so its style attribute is expected to differ */
      suppressHydrationWarning
      className={`${googleSans.variable} ${kanit.variable} ${plexMono.variable} h-full scroll-smooth`}
    >
      <head>
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        {/* React manages async external scripts during client rendering too.
            Block the first paint until the reader's saved text size is applied. */}
        <script async src="/text-scale.js" blocking="render" />
      </head>
      <body className="min-h-full bg-background font-sans text-foreground">
        <OrganizationJsonLd
          owner={project.owner}
          ownerUrl={project.ownerUrl}
          description={description}
        />
        <AdminBar adminBarProps={{ preview: isEnabled }} />
        {children}
      </body>
    </html>
  )
}
