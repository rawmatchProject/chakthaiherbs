import { describe, expect, it } from 'vitest'

import { paginatedResponse, parsePagination } from '@/lib/api-pagination'

const params = (query: string) => new URLSearchParams(query)

describe('public API pagination', () => {
  it('defaults to the first page of 24', () => {
    expect(parsePagination(params(''))).toEqual({ page: 1, limit: 24, skip: 0 })
  })

  it('clamps the limit and rejects nonsense', () => {
    expect(parsePagination(params('limit=500')).limit).toBe(100)
    expect(parsePagination(params('limit=0')).limit).toBe(24)
    expect(parsePagination(params('limit=abc')).limit).toBe(24)
    expect(parsePagination(params('page=0')).page).toBe(1)
    expect(parsePagination(params('page=-3')).page).toBe(1)
  })

  it('computes the offset from the page', () => {
    expect(parsePagination(params('page=3&limit=10')).skip).toBe(20)
  })

  it('always reports at least one page', () => {
    expect(paginatedResponse([], 1, 24, 0).meta).toEqual({
      page: 1,
      limit: 24,
      total: 0,
      totalPages: 1,
    })
    expect(paginatedResponse([1], 1, 10, 25).meta.totalPages).toBe(3)
  })
})
