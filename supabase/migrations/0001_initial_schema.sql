create extension if not exists "pgcrypto";

create table public.organizer_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id),
  slug text not null unique,
  title text not null,
  artist_name text not null,
  album_name text not null,
  album_cover_path text,
  status text not null default 'draft',
  max_selections integer not null default 3,
  voting_opened_at timestamptz,
  voting_closed_at timestamptz,
  results_revealed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_status_check check (status in ('draft','ready','waiting','voting_open','voting_closed','results_revealed','archived')),
  constraint events_max_selections_check check (max_selections = 3),
  constraint events_slug_check check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

create table public.songs (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  track_number integer not null,
  title text not null,
  created_at timestamptz not null default now(),
  constraint songs_track_number_check check (track_number between 1 and 10),
  constraint songs_event_track_unique unique (event_id, track_number)
);

create table public.votes (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  voter_hash text not null,
  submitted_at timestamptz not null default now(),
  constraint votes_event_voter_unique unique (event_id, voter_hash)
);

create table public.vote_selections (
  vote_id uuid not null references public.votes(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (vote_id, song_id)
);

create index events_slug_idx on public.events(slug);
create index songs_event_id_idx on public.songs(event_id);
create index votes_event_id_idx on public.votes(event_id);
create index vote_selections_song_id_idx on public.vote_selections(song_id);
create index vote_selections_vote_id_idx on public.vote_selections(vote_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger events_touch_updated_at
before update on public.events
for each row execute function public.touch_updated_at();

create or replace view public.event_results
with (security_invoker = true)
as
select
  s.event_id,
  s.id as song_id,
  s.track_number,
  s.title,
  count(vs.vote_id)::integer as vote_count
from public.songs s
left join public.vote_selections vs on vs.song_id = s.id
group by s.event_id, s.id, s.track_number, s.title;

create or replace function public.submit_event_vote(
  p_event_slug text,
  p_voter_hash text,
  p_song_ids uuid[]
)
returns table(result text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event_id uuid;
  v_status text;
  v_vote_id uuid;
  v_distinct_count integer;
  v_matching_count integer;
begin
  select id, status into v_event_id, v_status
  from public.events
  where slug = p_event_slug;

  if v_event_id is null then
    return query select 'event_not_found';
    return;
  end if;

  if v_status <> 'voting_open' then
    return query select 'voting_closed';
    return;
  end if;

  select count(distinct song_id) into v_distinct_count
  from unnest(p_song_ids) as song_id;

  if coalesce(array_length(p_song_ids, 1), 0) <> 3 or v_distinct_count <> 3 then
    return query select 'invalid_selection';
    return;
  end if;

  select count(*) into v_matching_count
  from public.songs
  where event_id = v_event_id and id = any(p_song_ids);

  if v_matching_count <> 3 then
    return query select 'invalid_selection';
    return;
  end if;

  insert into public.votes(event_id, voter_hash)
  values (v_event_id, p_voter_hash)
  on conflict (event_id, voter_hash) do nothing
  returning id into v_vote_id;

  if v_vote_id is null then
    return query select 'already_voted';
    return;
  end if;

  insert into public.vote_selections(vote_id, song_id)
  select v_vote_id, song_id
  from unnest(p_song_ids) as song_id;

  return query select 'success';
exception
  when others then
    raise warning 'submit_event_vote failed for event slug %: %', p_event_slug, sqlerrm;
    return query select 'internal_error';
end;
$$;

alter table public.organizer_profiles enable row level security;
alter table public.events enable row level security;
alter table public.songs enable row level security;
alter table public.votes enable row level security;
alter table public.vote_selections enable row level security;

create policy "organizers read own profile" on public.organizer_profiles for select using (auth.uid() = id);
create policy "organizers update own profile" on public.organizer_profiles for update using (auth.uid() = id);

create policy "public reads active events" on public.events for select using (status in ('ready','waiting','voting_open','voting_closed','results_revealed'));
create policy "organizers manage own events" on public.events for all using (auth.uid() = created_by) with check (auth.uid() = created_by);

create policy "public reads active event songs" on public.songs for select using (
  exists (
    select 1 from public.events e
    where e.id = songs.event_id
    and e.status in ('ready','waiting','voting_open','voting_closed','results_revealed')
  )
);
create policy "organizers manage own songs" on public.songs for all using (
  exists (select 1 from public.events e where e.id = songs.event_id and e.created_by = auth.uid())
) with check (
  exists (select 1 from public.events e where e.id = songs.event_id and e.created_by = auth.uid())
);

create policy "organizers read own votes" on public.votes for select using (
  exists (select 1 from public.events e where e.id = votes.event_id and e.created_by = auth.uid())
);
create policy "organizers read own vote selections" on public.vote_selections for select using (
  exists (
    select 1
    from public.votes v
    join public.events e on e.id = v.event_id
    where v.id = vote_selections.vote_id and e.created_by = auth.uid()
  )
);

grant execute on function public.submit_event_vote(text, text, uuid[]) to anon, authenticated, service_role;
