# charkthai → Payload content import

Phase 2 of `docs/MIGRATION-PLAN.md`. Two sources, in this order:

1. **The frozen files** — `charkthai/prisma/seed-source/{herbs,groups,news,project}.ts`.
   Reproducible, works offline, and is what the old database was seeded from.
2. **The live database** — anything edited since that seed: review decisions,
   consent records, real articles, corrected copy.

## Run it

```bash
pnpm generate:types                 # after any collection change
pnpm import:chakthai                # 1 — the frozen baseline (+ media)
pnpm import:chakthai:verify         # counts and image/link parity

# optional, only if the old database has edits worth keeping:
node scripts/chakthai-import/live-export.mjs    # on a machine that reaches it
pnpm import:chakthai:live                       # 2 — apply the dump
```

`CHAKTHAI_SOURCE` points at the old checkout (default `../charkthai`).
`CHAKTHAI_DATABASE_URL` overrides the connection string the export script
otherwise reads from the old repo's `.env`.

## What it does

| Script | Role |
| --- | --- |
| `source.ts` | loads the four frozen modules out of the old repo (type-only imports, so no Prisma) |
| `media.ts` | uploads `public/media/**` into `media`, keyed by `legacyPath` |
| `import.ts` | groups → herbs → claims → downloads → activities → project records → globals → categories |
| `live-export.mjs` | dumps the live Postgres to `live-dump.json` (plain Node, borrows `pg` from the old repo) |
| `apply-live.ts` | applies that dump over the seeded content |
| `verify.ts` | parity check: counts, images resolved, group links, globals populated |
| `lexical.ts` | converts old article bodies (Strapi block JSON or plain text) to Lexical |

## Rules it follows

- **Idempotent.** Every write upserts on `legacyId` (`legacyPath` for media), so
  re-running updates rather than duplicates.
- **Never resets editorial state.** Claim review status, reviewer and consent
  fields are set on create only; the live diff is the one thing allowed to
  change them, because there they *are* the editorial record.
- **Consent stays conservative.** Only scans of the project's own printed
  material import as `granted`. Field photographs stay `unknown` and activity
  photos keep `containsMinors`, exactly as the old database had them — so
  nothing reaches a public gallery on the strength of this import.
- **Mock articles are not imported.** The three `ตัวอย่าง-` placeholders exist to
  show the shape of an article; `news.ts` and BACKEND-HANDOVER §3.4 both say
  they must not reach the CMS.
