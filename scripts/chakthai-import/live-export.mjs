/**
 * Dumps the live charkthai Postgres to JSON so the import can carry over
 * anything edited since the original seed.
 *
 *   node scripts/chakthai-import/live-export.mjs
 *
 * Run this on the machine that can reach the database — the connection strings
 * come from the old repo's .env (POSTGRES_PRISMA_URL, falling back to
 * DATABASE_URL). Writes scripts/chakthai-import/live-dump.json, which
 * `pnpm import:chakthai:live` then applies.
 *
 * Plain .mjs on purpose: it must run without this repo's Payload/Next stack,
 * and it borrows `pg` from the old repo's node_modules.
 */
import fs from 'fs'
import path from 'path'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'

const here = path.dirname(fileURLToPath(import.meta.url))
const sourceRoot = path.resolve(process.env.CHAKTHAI_SOURCE ?? path.join(here, '../../../charkthai'))
const outFile = path.join(here, 'live-dump.json')

const readEnv = (file) => {
  if (!fs.existsSync(file)) return {}
  return Object.fromEntries(
    fs
      .readFileSync(file, 'utf8')
      .split('\n')
      .filter((line) => line.includes('=') && !line.trim().startsWith('#'))
      .map((line) => {
        const i = line.indexOf('=')
        return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
      }),
  )
}

const TABLES = [
  'herbs',
  'herb_groups',
  'herb_group_memberships',
  'herb_claims',
  'claim_review_audit',
  'articles',
  'downloads',
  'activities',
  'media',
  'partners',
  'indicators',
  'project_videos',
  'project_facts',
  'site_settings',
  'satisfaction_summary',
]

const main = async () => {
  if (!fs.existsSync(sourceRoot)) {
    throw new Error(`Cannot find the charkthai checkout at ${sourceRoot}. Set CHAKTHAI_SOURCE.`)
  }

  const env = { ...readEnv(path.join(sourceRoot, '.env')), ...process.env }
  const connectionString =
    process.env.CHAKTHAI_DATABASE_URL ||
    env.POSTGRES_URL_NON_POOLING ||
    env.POSTGRES_PRISMA_URL ||
    env.DATABASE_URL

  if (!connectionString) {
    throw new Error(
      'No connection string found. Set CHAKTHAI_DATABASE_URL, or POSTGRES_PRISMA_URL in the old repo .env.',
    )
  }

  const require = createRequire(path.join(sourceRoot, 'package.json'))
  const { Client } = require('pg')

  const needsSsl = /supabase|sslmode=require/.test(connectionString)
  const client = new Client({
    connectionString,
    ssl: needsSsl ? { rejectUnauthorized: false } : false,
  })

  await client.connect()
  const dump = { exportedAt: new Date().toISOString(), tables: {} }

  for (const table of TABLES) {
    try {
      const { rows } = await client.query(`select * from "${table}"`)
      dump.tables[table] = rows
      console.log(`${table}: ${rows.length} rows`)
    } catch (error) {
      console.warn(`${table}: skipped (${error.message})`)
      dump.tables[table] = []
    }
  }

  await client.end()
  fs.writeFileSync(outFile, JSON.stringify(dump, null, 2), 'utf8')
  console.log(`\nwrote ${outFile}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
