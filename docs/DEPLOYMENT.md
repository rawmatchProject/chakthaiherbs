# Deployment and database migrations

The Vercel build command is `pnpm run build`. Database migrations are a
separate operation; the build does not modify the database schema.

For an existing database populated using Payload development schema push,
build against that database only when its schema matches the deployed code.
Do not force the initial migration through the development-mode warning:
`20260907_163404_initial_schema` creates types and tables that may already exist.
Before adopting migrations for this database, back it up and compare its schema
with the initial migration to establish an accurate migration baseline.

For a new, empty production database, apply the committed migrations before
building or importing content:

```sh
pnpm run migrate
pnpm run build
```

For subsequent schema changes, generate and review migrations, test them against
a copy of the production database, and apply them explicitly before deploying
code that requires those changes. Keep development schema push on a separate
development database.

Set `POSTGRES_URL` (or `DATABASE_URL`) in the appropriate Vercel environment.
`POSTGRES_URL` takes precedence when both are set.

The media collection uses Vercel Blob when `BLOB_READ_WRITE_TOKEN` is supplied.
Set that variable in Vercel for persistent uploads. Files previously imported
into local storage need to be transferred separately; setting the token does
not upload existing files.

Reference: https://payloadcms.com/docs/database/migrations
