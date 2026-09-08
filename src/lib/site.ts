/**
 * Where this site lives.
 *
 * One module, because the address used to be written out three times — the
 * metadata base said `herb.chakthai.local` while robots.txt and the sitemap
 * said `example.com`, so a deploy that forgot the environment variable would
 * have handed Google a sitemap full of URLs on somebody else's domain.
 *
 * Now an unconfigured deploy fails safe instead: `isConfigured` is false,
 * robots.txt disallows everything and the sitemap comes back empty, so the
 * site can be looked at but cannot be indexed under the wrong name. Set
 * NEXT_PUBLIC_SITE_URL — or the template's NEXT_PUBLIC_SERVER_URL — (see .env.example) and both come back on. Vercel
 * deployments can also use the system-provided production/preview hostname.
 */

const explicitUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.NEXT_PUBLIC_SERVER_URL?.trim()
const vercelHostname =
  process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || process.env.VERCEL_URL?.trim()
const raw = explicitUrl || (vercelHostname ? `https://${vercelHostname}` : undefined)

/** True once an explicit or Vercel-provided public address is available. */
export const isConfigured = Boolean(raw)

/** Absolute origin, no trailing slash. Falls back to localhost for local work. */
export const siteUrl = (raw || "http://localhost:3000").replace(/\/+$/, "")

export const siteName = "สมุนไพรชากไทย"

/** Joins a route onto the origin. `path` starts with a slash, or is empty for the home page. */
export function absoluteUrl(path = "") {
  return `${siteUrl}${path}`
}

if (!isConfigured && process.env.NODE_ENV === "production") {
  console.warn(
    "\n[chakthai] No public site URL is available.\n" +
      "  robots.txt will disallow crawling and sitemap.xml will be empty, so search\n" +
      "  engines cannot index this build. Set NEXT_PUBLIC_SITE_URL before deploying.\n",
  )
}
