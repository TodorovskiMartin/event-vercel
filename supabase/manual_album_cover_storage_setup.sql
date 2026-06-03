-- Paste this into Supabase Dashboard > SQL Editor if the Supabase CLI is not installed.
-- It creates the album-covers bucket and the policies needed for public display
-- and authenticated organizer uploads.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'album-covers',
  'album-covers',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
    and tablename = 'objects'
    and policyname = 'public reads album covers'
  ) then
    create policy "public reads album covers"
    on storage.objects for select
    using (bucket_id = 'album-covers');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
    and tablename = 'objects'
    and policyname = 'authenticated uploads album covers'
  ) then
    create policy "authenticated uploads album covers"
    on storage.objects for insert
    to authenticated
    with check (bucket_id = 'album-covers');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
    and tablename = 'objects'
    and policyname = 'authenticated updates own album covers'
  ) then
    create policy "authenticated updates own album covers"
    on storage.objects for update
    to authenticated
    using (bucket_id = 'album-covers' and owner = auth.uid())
    with check (bucket_id = 'album-covers' and owner = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
    and tablename = 'objects'
    and policyname = 'authenticated deletes own album covers'
  ) then
    create policy "authenticated deletes own album covers"
    on storage.objects for delete
    to authenticated
    using (bucket_id = 'album-covers' and owner = auth.uid());
  end if;
end $$;
