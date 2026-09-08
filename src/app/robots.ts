import type { MetadataRoute } from "next"

import { absoluteUrl, isConfigured } from "@/lib/site"

export default function robots(): MetadataRoute.Robots {
  // Without a configured address every URL we could advertise would be wrong,
  // so the build asks crawlers to stay away rather than publish the wrong name.
  if (!isConfigured) {
    return { rules: { userAgent: "*", disallow: "/" } }
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl(),
  }
}
