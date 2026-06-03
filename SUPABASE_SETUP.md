# Supabase Setup

1. Create a Supabase project for production.
2. Copy the project URL, anon key, and service role key into Vercel environment variables.
3. Apply migrations:

```bash
supabase link --project-ref your-project-ref
supabase db push
```

4. In Authentication, create organizer accounts manually. Do not enable public self-registration for event organizers unless you add an approval flow.
5. Apply all migrations. The `album-covers` storage bucket and upload policies are created by `0002_album_cover_storage.sql`.
6. Verify RLS is enabled on all public tables.
7. Confirm anonymous clients cannot insert directly into `votes` or `vote_selections`.
8. Confirm organizers can only manage rows where `events.created_by = auth.uid()`.

## Optional Demo Event

After the organizer auth user exists, run `supabase/seed_eventadmin_demo.sql` in the Supabase SQL editor or with `psql` to create the Nova Echo demo event for:

- `eventadmin@gmail.com`
- `0ad8dc8f-556d-419e-a5cf-50877911c253`

## Manual Album Cover Storage Setup

If the Supabase CLI is not installed, paste `supabase/manual_album_cover_storage_setup.sql` into Supabase Dashboard > SQL Editor. This creates the `album-covers` bucket and upload/read policies.

Production notes:

- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
- Rotate keys if they are ever exposed.
- Use a staging/test event for load tests.
