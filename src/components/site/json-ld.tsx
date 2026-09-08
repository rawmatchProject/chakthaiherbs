import { absoluteUrl, siteName } from "@/lib/site"

/**
 * Structured data.
 *
 * Kept to the two things a search engine can actually do something with for a
 * site like this: who publishes it, and where the reader is in the hierarchy.
 * No speculative markup — a herb card is not a product, a recipe or an article,
 * and claiming otherwise to chase a rich result would misdescribe the content.
 */

type Json = Record<string, unknown>

function Script({ data }: { data: Json }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output, not user input; `<` is escaped so it cannot close the tag
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  )
}

export function OrganizationJsonLd({
  owner,
  ownerUrl,
  description,
}: {
  owner: string
  ownerUrl: string
  description: string
}) {
  return (
    <>
      <Script
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": absoluteUrl("/#website"),
          url: absoluteUrl(),
          name: siteName,
          alternateName: "ทะเบียนสมุนไพรชุมชนตำบลชากไทย",
          description,
          inLanguage: "th-TH",
          publisher: { "@id": absoluteUrl("/#organization") },
        }}
      />
      <Script
        data={{
          "@context": "https://schema.org",
          "@type": "CollegeOrUniversity",
          "@id": absoluteUrl("/#organization"),
          name: owner,
          url: ownerUrl,
          areaServed: "ตำบลชากไทย อำเภอเขาคิชฌกูฏ จังหวัดจันทบุรี",
        }}
      />
    </>
  )
}

export function BreadcrumbJsonLd({ trail }: { trail: { name: string; path: string }[] }) {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: trail.map((step, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: step.name,
          item: absoluteUrl(step.path),
        })),
      }}
    />
  )
}
