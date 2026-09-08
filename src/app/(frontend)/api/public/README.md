# Public REST API

The read-only JSON contract from BACKEND-HANDOVER §4, kept byte-compatible
across the migration so anything already consuming it keeps working.

    GET /api/public/herbs?q=&family=&page=&limit=
    GET /api/public/herbs/:slug
    GET /api/public/groups
    GET /api/public/groups/:slug
    GET /api/public/articles?type=news|knowledge|announcement&page=&limit=
    GET /api/public/articles/:slug
    GET /api/public/downloads
    GET /api/public/project
    GET /api/public/site-settings

Collections answer `{ data, meta: { page, limit, total, totalPages } }`, single
resources `{ data }`, and a miss `{ error: "not_found" }` with a 404.

These sit on `src/content/*`, so they see exactly what the pages see: nothing
unpublished, no unreviewed health claim, no photograph without recorded
consent. Payload's own REST and GraphQL APIs are still mounted under `/api` for
authenticated editor use — this is the anonymous, stable-contract surface.
