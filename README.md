# Primer

An offline-first learning app: a teacher prints a sheet of QR codes, students scan it with
their phones, and the problems plus the whole solving experience live on the device — no
account, no connection required. Deck cards explain misconceptions with threaded links you
can follow from inside an audio/transcript timeline.

## How it works

- **Solve** — step-by-step equation problems; wrong steps shake and count misconceptions.
- **Scan** — camera decode (BarcodeDetector, jsQR fallback) of self-contained QR bundles.
- **Teacher** — generates and prints QR sheets of auto-generated problems.
- **Decks** — explainer cards with time-anchored links between them; recommended cards
  match your most frequent misconceptions. Learning events sync when online.

Everything is device-local (localStorage + service worker PWA) until a sync succeeds.

## Stack

Next.js 15 (App Router) · TypeScript · `pg` behind a Postgres pooler · Redis as a side
cache · Supabase as the hosted Postgres.

## Developing

```bash
npm install
npm run dev        # http://localhost:3000
npx tsc --noEmit   # typecheck
```

With no real `DATABASE_URL`, the API runs in **local mode**: it serves the seed data from
`lib/seed.ts` (three decks, four cards, one threaded link) and keeps sync events in memory.
To persist, set `DATABASE_URL` to a Supabase transaction-pooler URI and run
`supabase/schema.sql` in the Supabase SQL editor (RLS on, no policies — the server uses `pg`,
the publishable key is never trusted for data).

## Deploy

`npm run build` produces a standalone server (`node .next/standalone/server.js`).
`docker-compose.yml` runs three app instances behind nginx, with pgbouncer in front of
Supabase and Redis at the edge.

## Credits

UI design reviewed against Apple's Human Interface Guidelines using the
[apple-design-skill](https://github.com/dickwu/apple-design-skill) agent skill.
