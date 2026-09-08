import type { MetadataRoute } from "next"

import { getProject } from "@/content/project"

/**
 * Lets a reader keep the register on their phone's home screen — which is how
 * most of this audience will come back to it, rather than through a bookmark.
 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const project = await getProject()
  return {
    name: "ทะเบียนสมุนไพรชุมชนตำบลชากไทย",
    short_name: "สมุนไพรชากไทย",
    description: `ทะเบียนสมุนไพรท้องถิ่นตำบลชากไทย อำเภอเขาคิชฌกูฏ จังหวัดจันทบุรี · ${project.owner}`,
    lang: "th",
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#eee8d9",
    theme_color: "#1f3a1c",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
