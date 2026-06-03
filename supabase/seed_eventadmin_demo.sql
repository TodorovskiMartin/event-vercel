-- Demo event seed for the organizer account:
-- eventadmin@gmail.com
-- auth.users.id = 0ad8dc8f-556d-419e-a5cf-50877911c253
--
-- Run this after the auth user exists and after migrations have been applied.

insert into public.organizer_profiles (id, display_name)
values ('0ad8dc8f-556d-419e-a5cf-50877911c253', 'Event Admin')
on conflict (id) do update
set display_name = excluded.display_name;

insert into public.events (
  id,
  created_by,
  slug,
  title,
  artist_name,
  album_name,
  status
)
values (
  '11111111-1111-4111-8111-111111111111',
  '0ad8dc8f-556d-419e-a5cf-50877911c253',
  'demo',
  'Album Launch Night',
  'Nova Echo',
  'After Midnight',
  'waiting'
)
on conflict (slug) do update
set
  title = excluded.title,
  artist_name = excluded.artist_name,
  album_name = excluded.album_name,
  status = excluded.status;

insert into public.songs (event_id, track_number, title)
values
  ('11111111-1111-4111-8111-111111111111', 1, 'Signal in the Static'),
  ('11111111-1111-4111-8111-111111111111', 2, 'Velvet Hour'),
  ('11111111-1111-4111-8111-111111111111', 3, 'North Window'),
  ('11111111-1111-4111-8111-111111111111', 4, 'After Midnight'),
  ('11111111-1111-4111-8111-111111111111', 5, 'Silver Lines'),
  ('11111111-1111-4111-8111-111111111111', 6, 'Room Tone'),
  ('11111111-1111-4111-8111-111111111111', 7, 'Low Sun'),
  ('11111111-1111-4111-8111-111111111111', 8, 'Mirrors Awake'),
  ('11111111-1111-4111-8111-111111111111', 9, 'Last Train Lights'),
  ('11111111-1111-4111-8111-111111111111', 10, 'The Long Echo')
on conflict (event_id, track_number) do update
set title = excluded.title;
