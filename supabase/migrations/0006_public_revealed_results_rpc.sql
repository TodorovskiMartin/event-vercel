create or replace function public.get_revealed_event_results(p_event_slug text)
returns table (
  song_id uuid,
  track_number integer,
  title text,
  vote_count integer
)
language sql
security definer
set search_path = public
as $$
  select
    s.id as song_id,
    s.track_number,
    s.title,
    count(vs.vote_id)::integer as vote_count
  from public.events e
  join public.songs s on s.event_id = e.id
  left join public.vote_selections vs on vs.song_id = s.id
  where e.slug = p_event_slug
    and e.status = 'results_revealed'
  group by s.id, s.track_number, s.title
  order by vote_count desc, s.track_number asc;
$$;

grant execute on function public.get_revealed_event_results(text) to anon, authenticated, service_role;
