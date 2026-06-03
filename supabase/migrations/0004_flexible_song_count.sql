alter table public.songs
drop constraint if exists songs_track_number_check;

alter table public.songs
add constraint songs_track_number_check check (track_number between 1 and 100);
