alter table public.events
drop constraint if exists events_slug_check;

alter table public.events
add constraint events_slug_check check (
  length(btrim(slug)) between 3 and 80
  and slug !~ '[/\?#\\]'
);
