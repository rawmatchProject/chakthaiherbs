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

`BLOB_STORE_ID` is not a substitute for `BLOB_READ_WRITE_TOKEN`: the Payload
storage adapter requires the read/write token. Set it locally and in Vercel's
Production environment for the same Blob store. This project's store is private:
`BLOB_ACCESS` defaults to `private` in both the application and repair command.
Only set `BLOB_ACCESS=public` when using a public store. The installed stock
Payload Vercel adapter supports public stores only, so private stores use a
cloud-storage adapter that authenticates reads and streams files through Payload's
existing file endpoint. Payload collection access rules still apply. Private
uploads go through the server and are subject to Vercel's 4.5 MB request limit;
the repair command uploads directly and does not have this request limit.

To repair an existing local-media import while preserving media IDs and links:

```sh
pnpm media:repair
pnpm media:repair --apply
```

The first command reads the production media catalogue and checks all originals
and generated sizes against `public/media`. The second uploads missing Blob
objects using their existing filenames and prefixes, without overwriting objects
or changing database records. Existing objects with a different size stop the
repair. Override `MEDIA_REPAIR_ORIGIN` or `MEDIA_REPAIR_DIR` if needed.
Redeploy after setting the Production token, and check both `/api/media/file/`
URLs and their `/_next/image` responses. Rerunning the content importer alone
does not repair storage because it skips existing media records.

Reference: https://payloadcms.com/docs/database/migrations
