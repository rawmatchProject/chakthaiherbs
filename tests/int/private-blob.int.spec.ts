// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CollectionConfig, Config, PayloadRequest } from 'payload'
import { get, put } from '@vercel/blob'
import { privateBlobAdapter, privateBlobStorage } from '../../src/plugins/private-blob'

vi.mock('@vercel/blob', () => ({
  get: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
  BlobNotFoundError: class extends Error {},
}))

const collection = { slug: 'media', upload: true } as CollectionConfig
const adapter = privateBlobAdapter('test-secret')({ collection })
const request = () =>
  ({
    headers: new Headers(),
    payload: { logger: { error: vi.fn() } },
  }) as unknown as PayloadRequest
const params = { collection: 'media', filename: 'thumb-01.webp', prefix: '' }

describe('private Blob media', () => {
  beforeEach(() => vi.resetAllMocks())

  it('streams authenticated image bytes through the existing file endpoint', async () => {
    vi.mocked(get).mockResolvedValue({
      statusCode: 200,
      stream: new Response('image-bytes').body!,
      headers: new Headers(),
      blob: {
        url: '',
        downloadUrl: '',
        pathname: 'thumb-01.webp',
        cacheControl: '',
        uploadedAt: new Date(),
        etag: 'test-etag',
        contentType: 'image/webp',
        size: 11,
        contentDisposition: 'inline',
      },
    })
    const response = await adapter.staticHandler(request(), { params })
    expect(get).toHaveBeenCalledWith('thumb-01.webp', {
      token: 'test-secret',
      access: 'private',
      ifNoneMatch: undefined,
    })
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('image/webp')
    expect(response.headers.get('cache-control')).toBe('private, no-cache')
    expect(await response.text()).toBe('image-bytes')
  })

  it('returns 404 for an absent object', async () => {
    vi.mocked(get).mockResolvedValue(null)
    expect((await adapter.staticHandler(request(), { params })).status).toBe(404)
  })

  it('keeps the prefix field and Payload access control with storage enabled or disabled', async () => {
    for (const token of [undefined, 'test-secret']) {
      const config = await privateBlobStorage(token)({
        collections: [{ slug: 'media', fields: [], upload: true }],
      } as unknown as Config)
      const media = config.collections![0]
      expect(media.fields.some((field) => 'name' in field && field.name === 'prefix')).toBe(true)
      if (token && typeof media.upload === 'object') {
        expect(media.upload.disableLocalStorage).toBe(true)
        expect(media.upload.handlers).toHaveLength(1)
      }
    }
  })

  it('does not expose credentials when Blob rejects a read', async () => {
    vi.mocked(get).mockRejectedValue(new Error('credentials: test-secret'))
    const req = request()
    const response = await adapter.staticHandler(req, { params })
    expect(response.status).toBe(502)
    expect(await response.text()).not.toContain('test-secret')
    expect(JSON.stringify(vi.mocked(req.payload.logger.error).mock.calls)).not.toContain(
      'test-secret',
    )
  })

  it('uploads replacements with private access and preserves the filename', async () => {
    await adapter.handleUpload({
      collection,
      req: request(),
      clientUploadContext: undefined,
      data: { prefix: 'herbs' },
      file: {
        filename: 'thumb.webp',
        buffer: Buffer.from('image'),
        filesize: 5,
        mimeType: 'image/webp',
      },
    })
    expect(put).toHaveBeenCalledWith('herbs/thumb.webp', Buffer.from('image'), {
      token: 'test-secret',
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'image/webp',
    })
  })
})
