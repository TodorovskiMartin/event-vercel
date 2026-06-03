create policy "public reads revealed vote selections for result counts"
on public.vote_selections for select
using (
  exists (
    select 1
    from public.votes v
    join public.events e on e.id = v.event_id
    where v.id = vote_selections.vote_id
    and e.status = 'results_revealed'
  )
);
