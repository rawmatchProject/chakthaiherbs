import { expect, test, type Page } from '@playwright/test'

/**
 * The migration walk: every public URL the pre-migration site published, plus
 * the API contract and the SEO routes. If a route stops rendering its own
 * content, or an image stops resolving, this is what says so.
 *
 * Runs against PLAYWRIGHT_BASE_URL (default http://localhost:3000) and expects
 * a database the content importer has run into.
 */
const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000'

/** Each page, and a phrase only that page renders. */
const pages: [path: string, marker: string | RegExp][] = [
  ['/', 'ทะเบียนสมุนไพร'],
  ['/herbs', 'สมุนไพรท้องถิ่น'],
  ['/herbs/thunbergia-laurifolia', 'รางจืด'],
  ['/groups', 'กลุ่ม'],
  ['/groups/ncds', 'NCDs'],
  ['/wisdom', 'ภูมิปัญญา'],
  ['/activities', 'การทำงาน'],
  ['/news', 'บทความ'],
  ['/media', 'วิดีโอ'],
  ['/project', 'โครงการ'],
  ['/project/team', 'คณะ'],
  ['/downloads', 'ดาวน์โหลด'],
  ['/contact', 'ติดต่อ'],
]

/** Nothing on the page may 404: a broken image is the classic migration scar. */
const collectFailures = (page: Page) => {
  const failures: string[] = []
  page.on('response', (response) => {
    if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`)
  })
  return failures
}

test.describe('public pages', () => {
  for (const [path, marker] of pages) {
    test(`${path} renders its own content with every asset resolving`, async ({ page }) => {
      const failures = collectFailures(page)

      const response = await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' })
      expect(response?.status(), `${path} status`).toBe(200)
      await expect(page.locator('body')).toContainText(marker)

      // the site shell is on every page
      await expect(page.locator('header').first()).toBeVisible()
      await expect(page.locator('footer').first()).toBeVisible()

      expect(failures, `${path} requested something that failed`).toEqual([])
    })
  }

  test('an unknown herb is a 404, not a crash', async ({ page }) => {
    const response = await page.goto(`${BASE}/herbs/not-a-herb`)
    expect(response?.status()).toBe(404)
  })

  test('the register lists every published herb', async ({ page }) => {
    await page.goto(`${BASE}/herbs`, { waitUntil: 'networkidle' })
    const links = page.locator('a[href^="/herbs/"]')
    expect(await links.count()).toBeGreaterThanOrEqual(24)
  })

  test('the reader can raise the text size, and it survives a reload', async ({ page }) => {
    // The one accessibility affordance this audience was given by name: every
    // size on the site is a rem multiple of --text-scale.
    await page.goto(`${BASE}/`)
    await page.getByRole('button', { name: 'ตัวอักษรขนาดใหญ่พิเศษ' }).first().click()
    await expect(page.locator('html')).toHaveAttribute('style', /--text-scale:\s*1\.3/)

    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('style', /--text-scale:\s*1\.3/)
  })
})

test.describe('public API', () => {
  test('herbs answer the paginated contract', async ({ request }) => {
    const response = await request.get(`${BASE}/api/public/herbs?limit=2`)
    expect(response.status()).toBe(200)

    const body = await response.json()
    expect(body.meta).toMatchObject({ page: 1, limit: 2 })
    expect(body.meta.total).toBeGreaterThanOrEqual(24)
    expect(body.data).toHaveLength(2)

    const herb = body.data[0]
    for (const key of ['id', 'slug', 'accessionNo', 'nameTh', 'media', 'source', 'updatedAt']) {
      expect(herb, `herb.${key}`).toHaveProperty(key)
    }
  })

  test('a single herb, and a miss', async ({ request }) => {
    const hit = await request.get(`${BASE}/api/public/herbs/thunbergia-laurifolia`)
    expect(hit.status()).toBe(200)
    expect((await hit.json()).data.slug).toBe('thunbergia-laurifolia')

    const miss = await request.get(`${BASE}/api/public/herbs/not-a-herb`)
    expect(miss.status()).toBe(404)
    expect(await miss.json()).toEqual({ error: 'not_found' })
  })

  test('groups, downloads, articles, project and settings all answer', async ({ request }) => {
    for (const path of [
      '/api/public/groups',
      '/api/public/groups/ncds',
      '/api/public/articles',
      '/api/public/downloads',
      '/api/public/project',
      '/api/public/site-settings',
    ]) {
      const response = await request.get(`${BASE}${path}`)
      expect(response.status(), path).toBe(200)
      expect(await response.json(), path).toHaveProperty('data')
    }
  })

  test('the project record carries its activities, indicators and partners', async ({ request }) => {
    const { data } = await (await request.get(`${BASE}/api/public/project`)).json()
    expect(data.activities.length).toBeGreaterThan(0)
    expect(data.indicators.length).toBeGreaterThan(0)
    expect(data.partners.length).toBeGreaterThan(0)
    expect(data.satisfaction.respondents).toBeGreaterThan(0)
  })
})

test.describe('crawlers', () => {
  test('robots points at the sitemap', async ({ request }) => {
    const body = await (await request.get(`${BASE}/robots.txt`)).text()
    expect(body).toContain('Sitemap:')
  })

  test('the sitemap lists the register and the groups', async ({ request }) => {
    const body = await (await request.get(`${BASE}/sitemap.xml`)).text()
    expect(body).toContain('/herbs/thunbergia-laurifolia')
    expect(body).toContain('/groups/ncds')
  })

  test('the manifest names the site', async ({ request }) => {
    const body = await (await request.get(`${BASE}/manifest.webmanifest`)).json()
    expect(body.short_name).toMatch(/\S/)
  })
})
