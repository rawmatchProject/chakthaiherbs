import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import { BlobNotFoundError, head, put } from '@vercel/blob'

// Copy existing files without modifying database records or regenerating filenames.
// Default is a read-only preflight; --apply uploads missing objects only.
const apply = process.argv.includes('--apply')
const origin = new URL(process.env.MEDIA_REPAIR_ORIGIN || 'https://www.chakthaiherbs.com')
const localRoot = path.resolve(process.env.MEDIA_REPAIR_DIR || 'public/media')
const token = process.env.BLOB_READ_WRITE_TOKEN
const access = process.env.BLOB_ACCESS || 'private'

async function main() {
  if (!['private', 'public'].includes(access))
    throw new Error('BLOB_ACCESS must be private or public.')
  if (apply && !token) throw new Error('Set BLOB_READ_WRITE_TOKEN before using --apply.')
  const files = new Map()
  let page = 1
  do {
    const endpoint = new URL('/api/media', origin)
    endpoint.search = new URLSearchParams({
      limit: '100',
      page: String(page),
      depth: '0',
    }).toString()
    const response = await fetch(endpoint, { signal: AbortSignal.timeout(30000) })
    if (!response.ok) throw new Error(`Media catalogue returned HTTP ${response.status}`)
    const result = await response.json()
    if (!Array.isArray(result.docs)) throw new Error('Invalid media catalogue response')
    for (const doc of result.docs) {
      for (const file of [doc, ...Object.values(doc.sizes || {})]) {
        if (!file?.filename) continue
        const filename = file.filename
        if (path.basename(filename) !== filename || /[\\/]/.test(filename)) {
          throw new Error(`Unsafe filename: ${filename}`)
        }
        const prefix = doc.prefix || ''
        if (prefix.includes('..') || prefix.includes('\\') || prefix.startsWith('/')) {
          throw new Error('Unsafe media prefix')
        }
        const key = path.posix.join(prefix, filename)
        files.set(key, { filename, size: file.filesize, mimeType: file.mimeType || doc.mimeType })
      }
    }
    if (!result.hasNextPage) break
    page += 1
  } while (true)

  // Check every source before any writes, to avoid a partial migration from missing files.
  for (const [key, file] of files) {
    const stat = await fs.stat(path.join(localRoot, file.filename))
    if (!stat.isFile() || stat.size !== file.size) {
      throw new Error(`Source file does not match catalogue: ${key}`)
    }
  }
  console.log(`Preflight passed: ${files.size} files match the production catalogue.`)
  if (!apply) {
    console.log('No uploads performed. Set BLOB_READ_WRITE_TOKEN and run with --apply to repair.')
    return
  }

  let uploaded = 0
  let existing = 0
  for (const [key, file] of files) {
    try {
      const current = await head(key, { token })
      if (current.size !== file.size) throw new Error(`Existing Blob has different size: ${key}`)
      existing += 1
      continue
    } catch (error) {
      if (!(error instanceof BlobNotFoundError)) throw error
    }
    const blob = await put(key, await fs.readFile(path.join(localRoot, file.filename)), {
      token,
      access,
      addRandomSuffix: false,
      allowOverwrite: false,
      contentType: file.mimeType,
    })
    const verified = await head(blob.url, { token })
    if (verified.size !== file.size) throw new Error(`Uploaded file size mismatch: ${key}`)
    uploaded += 1
    console.log(`Uploaded ${key}`)
  }
  console.log(`Complete: ${uploaded} uploaded, ${existing} already present. Database unchanged.`)
  console.log(
    'Redeploy with BLOB_READ_WRITE_TOKEN set in Production, then verify /api/media/file URLs.',
  )
}

main().catch((error) => {
  // SDK errors may contain request details. Do not print credentials or full objects.
  console.error(
    `Media repair failed (${error.name}). ${token ? String(error.message).split(token).join('[redacted]') : error.message}`,
  )
  process.exitCode = 1
})
