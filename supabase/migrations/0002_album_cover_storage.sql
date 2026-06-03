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

create policy "public reads album covers"
on storage.objects for select
using (bucket_id = 'album-covers');

create policy "authenticated uploads album covers"
on storage.objects for insert
to authenticated
with check (bucket_id = 'album-covers');

create policy "authenticated updates own album covers"
on storage.objects for update
to authenticated
using (bucket_id = 'album-covers' and owner = auth.uid())
with check (bucket_id = 'album-covers' and owner = auth.uid());

create policy "authenticated deletes own album covers"
on storage.objects for delete
to authenticated
using (bucket_id = 'album-covers' and owner = auth.uid());
