# EventKahoot

Production-oriented live album launch voting app for 200+ attendees scanning a QR code, choosing exactly 3 songs out of 10, and watching confirmed database results reveal on a projector.

## Stack

- Next.js App Router, TypeScript strict mode, Tailwind CSS
- Supabase PostgreSQL, Auth, RLS, Storage-ready album cover field
- Zod validation, atomic PostgreSQL vote RPC, HMAC anonymous voter hashes
- Vitest, Playwright, k6

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Fill `.env.local` with Supabase project values, a server-only service role key, and a long `VOTER_HASH_SECRET`. Supabase's current `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` name is supported, and older projects can use `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Supabase Setup

```bash
supabase login
supabase link --project-ref your-project-ref
supabase db push
```

Create the first organizer account in Supabase Auth, then sign in at `/admin/login`. The event creation form includes demo defaults for Nova Echo / After Midnight and exactly 10 tracks.

## Testing

```bash
npm test
npm run build
npm run e2e
```

## Load Tests

See `LOAD_TESTING.md`.

## Deployment

Deploy the Next.js app to Vercel, add every variable from `.env.example`, set `NEXT_PUBLIC_APP_URL` to the production HTTPS URL, and apply Supabase migrations to the production project.

## Production Assumptions

Use a production Supabase project and production Vercel deployment for the real event. Create the organizer account before event day, rehearse on a staging/test event, and avoid code changes immediately before the live event unless fixing a confirmed issue.
