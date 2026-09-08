const DEFAULT_LIMIT = 24
const MAX_LIMIT = 100

export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1)
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(
      1,
      Number.parseInt(searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT,
    ),
  )
  return { page, limit, skip: (page - 1) * limit }
}

export function paginatedResponse<T>(data: T[], page: number, limit: number, total: number) {
  return { data, meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } }
}
