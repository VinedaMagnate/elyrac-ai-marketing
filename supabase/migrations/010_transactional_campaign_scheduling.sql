create or replace function public.schedule_approved_campaign(
  p_campaign_id uuid,
  p_scheduled_at timestamptz
) returns public.campaigns
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_campaign public.campaigns;
begin
  if p_scheduled_at is null then
    raise exception 'A schedule time is required';
  end if;

  select * into v_campaign
  from public.campaigns
  where id = p_campaign_id
  for update;

  if not found then
    raise exception 'Campaign not found';
  end if;

  if v_campaign.status <> 'approved' then
    raise exception 'Only CEO-approved campaigns can be scheduled';
  end if;

  update public.campaigns
  set status = 'scheduled',
      scheduled_at = p_scheduled_at
  where id = p_campaign_id
  returning * into v_campaign;

  return v_campaign;
end;
$$;
