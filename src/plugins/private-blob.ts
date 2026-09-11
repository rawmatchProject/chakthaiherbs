import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import type { Adapter } from '@payloadcms/plugin-cloud-storage/types'
import { getFileKey, getFilePrefix } from '@payloadcms/plugin-cloud-storage/utilities'
import { BlobNotFoundError, del, get, put } from '@vercel/blob'
import type { Plugin } from 'payload'

/** Private objects are streamed through Payload's access-controlled file endpoint. */
export const privateBlobAdapter =
  (token: string): Adapter =>
  ({ collection, prefix }) => {
    const key = (filename: string, docPrefix?: string) =>
      getFileKey({ filename, docPrefix, collectionPrefix: prefix }).fileKey

    return {
      name: 'vercel-blob-private',
      handleUpload: async ({ data, file }) => {
        await put(key(file.filename, data.prefix), file.buffer, {
          token,
          access: 'private',
          addRandomSuffix: false,
          allowOverwrite: true,
          contentType: file.mimeType,
        })
        return data
      },
      handleDelete: async ({ doc, filename }) => {
        await del(key(filename, doc.prefix), { token })
      },
      staticHandler: async (req, { headers: incomingHeaders, params }) => {
        try {
          const docPrefix = await getFilePrefix({
            collection,
            filename: params.filename,
            req,
            clientUploadContext: params.clientUploadContext,
            prefixQueryParam: params.prefix,
          })
          const result = await get(key(params.filename, docPrefix), {
            token,
            access: 'private',
            ifNoneMatch: req.headers.get('if-none-match') || undefined,
          })
          if (!result) return new Response(null, { status: 404 })
          const headers = new Headers(incomingHeaders)
          headers.set('Cache-Control', 'private, no-cache')
          headers.set('ETag', result.blob.etag)
          headers.set('X-Content-Type-Options', 'nosniff')
          if (result.statusCode === 304) return new Response(null, { status: 304, headers })
          headers.set('Content-Type', result.blob.contentType)
          headers.set('Content-Length', String(result.blob.size))
          headers.set('Content-Disposition', result.blob.contentDisposition)
          if (result.blob.contentType === 'image/svg+xml') {
            headers.set('Content-Security-Policy', "script-src 'none'")
          }
          return new Response(result.stream, { status: 200, headers })
        } catch (error) {
          if (error instanceof BlobNotFoundError) return new Response(null, { status: 404 })
          req.payload.logger.error(
            'Private Blob read failed; check the storage token and store access.',
          )
          return new Response('Unable to read media', { status: 502 })
        }
      },
    }
  }

export const privateBlobStorage = (token: string | undefined): Plugin =>
  cloudStoragePlugin({
    enabled: Boolean(token),
    alwaysInsertFields: true,
    collections: { media: { prefix: '', adapter: token ? privateBlobAdapter(token) : null } },
  })
