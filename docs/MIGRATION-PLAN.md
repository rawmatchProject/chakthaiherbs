# charkthai → chakthaiherbs migration plan

Re-platforming the Chak Thai community herbarium from **Next.js + Prisma + Strapi**
(`../charkthai`) onto the **Payload CMS 3.88 website template** (this repo).

Status: complete. All five phases done and verified against a throwaway
Postgres seeded by the importer: 34 unit tests, 26 end-to-end tests, clean
lint, clean typecheck, clean build.

What is left is not migration work — it is the review queue (see the risks
below) and pointing the new repo at the real database.

---

## 1. What is being moved

| | Source (`charkthai`) | Target (`chakthaiherbs`) |
| --- | --- | --- |
| Framework | Next.js 16.3.3, App Router | Next.js 16.3.3 + Payload 3.88 |
| Data layer | Prisma 7 → Postgres (Supabase) | `@payloadcms/db-postgres` |
| CMS | Strapi 5 (`cms/`) + custom `CmsUser`/`CmsSession` auth | Payload admin + Payload `users` |
| Content | 17 Prisma models, 5 migrations, `prisma/seed-source/*.ts` | Payload collections + globals |
| UI | ~9,200 lines: 14 routes, `components/site`, `components/herbs`, `components/ui` | ported into `src/app/(frontend)` |
| Media | 100 files / ~65 MB in `public/images`, `public/media`, `public/brand` | Payload `media` collection + static `public/brand` |

### Decisions taken

- **Sequence:** data model first → content import → UI port → public API.
- **Content source:** *both* — `prisma/seed-source/` is the reproducible baseline;
  a diff against the live Postgres carries over anything edited since seeding.
- **Strapi:** dropped entirely. `cms/` does not come across.
- **Custom auth:** dropped. Payload `users` replaces `CmsUser`/`CmsSession`,
  `src/app/cms/actions/*` and `/api/auth/strapi/*`.
- **`/api/public/*`:** rebuilt as thin Payload-backed routes, same JSON contract.
- **Claim-review workflow:** kept (`HerbClaim` + `ClaimReviewAudit` port over).
- **Template:** Pages + blocks kept; `posts` becomes the news/knowledge/announcement
  collection rather than adding a parallel `articles` collection.

---

## 2. Data model mapping

### Collections

| Prisma model | Payload collection | Notes |
| --- | --- | --- |
| `Herb` | `herbs` | `status` splits: Payload drafts (`_status`) drives public visibility; a separate `editorialStatus` select keeps `in_review` / `archived`. `howToUse` / `references` JSON → typed `array` fields. `mediaThumb` / `mediaCard` → `upload` → `media`. |
| `HerbGroupMembership` | `herbs.groupMemberships[]` | array of `{ group: relationship→herb-groups, note }`. Never derived from name matching. |
| `HerbGroupRecord` | `herb-groups` | 5 fixed rows. `tables` / `panels` JSON → nested `array` fields. `poster` → upload. |
| `HerbClaim` | `herb-claims` | `herb` relationship, `section`, `kind`, `sourceRefs[]`, `reviewStatus`, `position`. Unique `(herb, section, position)` enforced by a `beforeValidate` hook. |
| `ClaimReviewAudit` | `claim-review-audit` | written by an `afterChange` hook on `herb-claims` when `reviewStatus` changes; read-only in admin. |
| `Article` | `posts` (existing) | `+ excerpt`, `authorLabel`, `readingMinutes`, `category` → `categories` (seed: news / knowledge / announcement). `body` → Lexical rich text. `createdBy`/`updatedBy` → Payload's own author fields. |
| `Download` | `downloads` | `file` upload → `media`; `sizeLabel` derived from `filesize` when a file is attached. |
| `Activity` | `activities` | `outcomes[]`, `photos` → `upload hasMany media`. |
| `Media` | `media` (existing, extended) | adds `credit`, `license`, `consentStatus`, `consentEvidenceRef`, `containsMinors`, `takedownRequestedAt`. **Public read is gated on `consentStatus = granted`**; media with minors additionally requires `consentEvidenceRef`. |
| `Partner` | `partners` | `links[]` `{ kind, href }`, `order`. |
| `Indicator` | `indicators` | `label`, `target`, `result`, `met`, `order`. |
| `ProjectVideoRecord` | `project-videos` | `youtubeId` unique; drafts for publish state. |
| `CmsUser`, `CmsSession` | — | dropped; Payload `users`. |

### Globals (were singleton rows)

| Prisma model | Payload global |
| --- | --- |
| `SiteSetting` (id=1) | `site-settings` |
| `ProjectFact` (id=1) | `project-facts` |
| `SatisfactionSummary` (id=1) | `satisfaction-summary` |

Header/Footer stay as the template's own globals and carry the site nav.

### Enum mapping

All Prisma enums become Payload `select` options with identical stored values
(`health-promotion`, `ncds`, `mental-wellness`, `food-as-medicine`,
`beauty-postpartum`; `project-guide` / `project-report` / `community-wisdom` /
`reference`; etc.), so serialized API output does not change.

---

## 3. Phases

### Phase 1 — data model ✅
- `src/collections/`: Herbs, HerbGroups, HerbClaims, ClaimReviewAudit, Downloads,
  Activities, Partners, Indicators, ProjectVideos; extend Media and Posts.
- `src/globals/`: SiteSettings, ProjectFacts, SatisfactionSummary.
- Register in `payload.config.ts`; `pnpm generate:types`; create a Payload migration.

**Exit:** admin panel shows every collection; `payload migrate` runs clean on an
empty database.

### Phase 2 — content import ✅
`scripts/chakthai-import/` — see its README for the commands.

- `import.ts` reads the frozen modules straight out of `../charkthai` and writes
  through the Payload local API; `media.ts` uploads `public/media/**` keyed on a
  new `legacyPath` field; every collection gained a `legacyId` so writes upsert.
- `live-export.mjs` dumps the live Postgres to JSON (run it where the database
  is reachable); `apply-live.ts` applies that over the seeded baseline.
- `verify.ts` checks counts and that every image and group link resolved.

**Verified end to end** on a scratch Postgres, twice (the second run to prove
idempotency), with a synthetic live dump exercising the diff path:

```
media: 83 uploaded          herbs: 24, claims: 234      herb-groups: 5
downloads: 8                activities: 4               indicators: 4
partners: 7                 project-videos: 2           globals: 3
ok  herbs with both images 24/24   ok  group memberships 2/2   ok  posters 5/5
```

Re-running changed nothing. Applying a live dump correctly overwrote edited
copy, added an editorial group link, carried a claim to `reviewed` (writing the
audit row), applied a consent record, and converted an article body to Lexical.

### Phase 3 — UI port ✅
The seam held: `src/content/*.ts` was reimplemented against the Payload local
API with identical exported signatures, and the components and routes came
across essentially unchanged.

- **Design system** — `globals.css` is the herbarium's own 546-line stylesheet
  (palette, four text steps, Thai leading, the reader's text-scale control),
  with the template's breakpoints, `.container`, typography plugin and runtime
  class names appended. Kanit / Google Sans / IBM Plex Mono and the pre-paint
  text-scale script live in `(frontend)/layout.tsx`.
- **Data layer** — `content/{herbs,groups,news,project}.ts` over Payload;
  `content/payload.ts` holds the shared helpers; `content/lexical-to-body.ts`
  converts Lexical back into the `ArticleBlock[]` shape the site's article
  renderer already knew, so its typography was untouched.
- **Components** — `components/site/*` and `components/herbs/*` copied verbatim.
  The site's own primitives (Base UI button, input, sheet) live in
  `components/site-ui/` so they never collide with the template's shadcn set.
- **Routes** — all 14 URLs moved into `(frontend)/` unchanged. The template's
  `/posts` archive was removed in favour of `/news`; preview paths, revalidate
  hooks, card links and rich-text internal links now point there.
- **Assets** — the wordmark, app icons and the photographs used as page
  furniture are static under `public/{brand,icons,site}` and allowlisted in
  `next.config.ts`; the media *catalogue* stays in Payload. `/media/site/**` is
  therefore no longer imported as media records.

Two contract changes, both deliberate:

- `Activity.photos` is now `PublicMedia[]` rather than a list of IDs the page
  turned into paths by hand, so curated alt text travels with each image and
  the consent rule is applied in one place.
- The three mock placeholder articles are gone. Their own comment said to
  delete them once the CMS could publish a real one; the news page already had
  an empty state.

**Verified**: `tsc --noEmit` clean, `next build` clean (25 routes), and every
route returns 200 from a production server against the imported data — 24 herb
links and 48 images on `/herbs`, 5 groups, the article at `/news/...`, the
Payload admin at `/admin`, and `/manifest.webmanifest` (which had to move to
`src/app/` — metadata files do not resolve from inside a route group).

### Phase 4 — public API, SEO, revalidation ✅

**Public API** — `(frontend)/api/public/*`, the BACKEND-HANDOVER §4 contract,
byte-compatible with what it answered before (same keys, same `{data, meta}`
envelope, same 404 shape). See its README for the endpoint list.

The one structural change: the serializers no longer map the database a second
time. They sit on `src/content/*`, so the API and the pages are served from one
mapping and can no longer disagree — which also means the API inherits every
gate for free: nothing unpublished, no unreviewed health claim, no photograph
without recorded consent. `updatedAt` became an optional field on the shared
content types, since only the API needs it.

Payload's own REST and GraphQL stay mounted at `/api` for authenticated editor
use; the static `/api/public/*` segments take precedence over its catch-all.

**SEO** — the source's `robots.ts` and `sitemap.ts` moved to `src/app/` (like
`manifest.ts`, metadata routes do not resolve from inside a route group), and
`next-sitemap` is gone along with the static `public/robots.txt` and
`public/sitemap.xml` that would have shadowed them. The fail-safe rule is
intact: with no public address configured, robots disallows everything and the
sitemap comes back empty. `NEXT_PUBLIC_SITE_URL` now falls back to the
template's `NEXT_PUBLIC_SERVER_URL`. The sitemap gained CMS-authored Pages and
uses each record's own `updatedAt` for `lastmod`. 41 URLs at last check.

**Revalidation** — `hooks/revalidateSite.ts` replaces `/api/revalidate` and the
Strapi webhook that used to call it: Payload knows what changed, so nothing
external has to be told. Herbs revalidate `/`, `/herbs` and their own page (both
old and new slug on a rename); groups, downloads, activities, indicators,
partners and videos their own pages; a claim revalidates the herb it belongs to,
so a review decision is visible immediately; the site-settings and project-facts
globals redo the layout, since the header and footer are on every page.
`context.disableRevalidate` is honoured throughout — the importer sets it.

**Verified** end to end against a running production server: every endpoint 200
(and 404 on a miss) with the expected key sets; `/robots.txt` and `/sitemap.xml`
correct; and a real authenticated PATCH through Payload's REST API logged
`Revalidating /`, `/herbs`, `/herbs/thunbergia-laurifolia` and `the site layout`,
with the edited copy live on the page immediately afterwards.

### Phase 5 — verification ✅

**Unit / integration** (`tests/int`, 34 tests):

- `content.int.spec.ts` — the pre-migration contract suite, ported from Prisma
  to Payload: stable slugs and accession numbers, lookup by slug, Thai search,
  both images resolving, a citation behind every record, family counts, the
  five posters, and the rule that a group is only cross-linked from a herb when
  the poster actually names it. Extended with a test that สรรพคุณ never reach a
  page from an unreviewed claim.
- `visibility.int.spec.ts` — the consent and review policy asserted literally,
  including a table of every way media stays hidden. A silent regression here
  is a real-world harm, so changing the policy has to mean changing this test.
- `lexical.int.spec.ts` — the Lexical → article-body converter.
- `pagination.int.spec.ts` — the public API's paging contract.

Not ported: `postgres-config.test.ts` (Prisma-specific SSL plumbing, replaced by
the Payload postgres adapter) and `strapi-content.test.ts` (Strapi is gone).

**End-to-end** (`tests/e2e/site.e2e.spec.ts`, 23 tests + 3 admin): all 13 public
URLs render their own content with **zero failed requests** — a broken image is
the classic migration scar, so the suite fails on any 4xx the page requests —
plus 404 handling, the full register, the reader's text-size control surviving a
reload, the API contract, and robots / sitemap / manifest.

Both suites take `PLAYWRIGHT_BASE_URL`, so they can run against an already-built
server instead of only `pnpm dev`.

**Lint** — `pnpm lint` now runs. It was failing before any file was read:
`eslint-config-next` 16 ships flat configs, and the template still loaded them
through the eslintrc `FlatCompat` bridge, which throws "Converting circular
structure to JSON". Importing them as flat configs fixes it, and the five real
errors it then surfaced — all in template code — are fixed: three
`setState`-in-effect cascades in the theme provider, theme selector and header,
and two ref reads in `Card`. Clean, no warnings.

**Parity** — `pnpm import:chakthai:verify` green: 24 herbs, 5 groups, 234
claims, 8 downloads, 4 activities, 4 indicators, 7 partners, 2 videos, every
image and group link resolved. Counts against your *live* database still need
one run on a machine that can reach it (`live-export.mjs`, then
`import:chakthai:live`).

## 4. Things worth knowing

Gotchas this migration ran into, kept because they will bite again:

- **`payload run` awaits module evaluation, not stray promises.** The import
  scripts end with a top-level `await main()`; `void main()` exits silently with
  status 0 and does nothing.
- **`revalidatePath` throws outside a request context.** Anything that writes
  through the local API from a script must pass
  `context: { disableRevalidate: true }` — the importer does.
- **Metadata routes do not resolve from inside a route group.** `manifest.ts`,
  `robots.ts` and `sitemap.ts` live at `src/app/`, not `src/app/(frontend)/`.
- **`images.localPatterns` is an allowlist.** The template ships it locked to
  `/api/media/file/**`; anything else the optimizer is asked for returns 400.
  The site's own design assets (`/brand`, `/icons`, `/site`) are listed too.
- **Static files shadow dynamic routes.** `public/robots.txt` and
  `public/sitemap.xml` had to go for `robots.ts` and `sitemap.ts` to be reached.
- **`defaultSort` belongs on the collection, not on `admin`.**
- **The four-state publication status maps onto Payload's two.** `_status`
  drives public visibility; `editorialStatus` preserves `in_review` and
  `archived` for editors.
- **Media consent is a query rule, not an access rule.** `lib/public-visibility`
  gates catalogue listings; the files themselves stay servable, because the
  site's own illustrations live in the same collection.

## 5. Left for you

1. **The review queue.** 234 claims are `pending`, so herb pages show no
   สรรพคุณ, วิธีใช้ or ข้อควรระวัง until a reviewer accepts them. This is the
   pre-migration behaviour, carried over on purpose.
2. **The live-database diff**, if the old database holds edits worth keeping.
3. **Production media.** `public/media/` is gitignored, so the imported files
   live only where the import ran. Set `BLOB_READ_WRITE_TOKEN` before importing
   against production, or sync the files separately.
4. **Rotate the Supabase password** that `charkthai/.env` still carries.
5. **Dead template chrome.** The site's header and footer are its own
   components, so Payload's `header`/`footer` globals and their front-end
   components are unused, as is the theme selector. They are harmless but
   removable — a decision about whether you ever want admin-editable nav.
