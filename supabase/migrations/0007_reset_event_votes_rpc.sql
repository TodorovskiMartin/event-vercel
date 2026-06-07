create or replace function public.reset_event_votes(p_event_id uuid)
returns table(result text, deleted_count integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted_count integer;
begin
  if not exists (
    select 1
    from public.events
    where id = p_event_id
      and created_by = auth.uid()
      and status <> 'archived'
  ) then
    return query select 'not_allowed', 0;
    return;
  end if;

  delete from public.votes
  where event_id = p_event_id;

  get diagnostics v_deleted_count = row_count;
  return query select 'success', v_deleted_count;
end;
$$;

grant execute on function public.reset_event_votes(uuid) to authenticated, service_role;
