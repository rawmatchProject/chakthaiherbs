import { readFile } from "node:fs/promises"
import { join } from "node:path"

/**
 * Fonts and colours for the generated share images.
 *
 * `next/og` renders with satori, which has no system fonts and no Thai
 * coverage of its own — without these files every Thai heading comes out as
 * tofu boxes. Kanit ships in the repo (SIL Open Font License) rather than
 * being fetched at build time, so the images do not depend on Google being
 * reachable from the build machine. It is the site's own display face, so a
 * share card looks like the page it links to.
 */

const fontDir = join(process.cwd(), "src/assets/fonts")

export async function ogFonts() {
  const [regular, semibold] = await Promise.all([
    readFile(join(fontDir, "Kanit-400.ttf")),
    readFile(join(fontDir, "Kanit-600.ttf")),
  ])

  return [
    { name: "Kanit", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Kanit", data: semibold, weight: 600 as const, style: "normal" as const },
  ]
}

/** The share image is the site's own palette, not a second visual identity. */
export const og = {
  size: { width: 1200, height: 630 },
  contentType: "image/png",
  canopy: "#1f3a1c",
  canopyDeep: "#101d0d",
  marker: "#2c6137",
  markerBright: "#7fb069",
  paper: "#fbf8f1",
  litter: "#eee8d9",
}
