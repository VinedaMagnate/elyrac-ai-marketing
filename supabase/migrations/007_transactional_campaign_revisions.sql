-- Persist an AI campaign revision atomically.
-- Authenticity is evaluated by the server before this function is called.

create or replace function public.apply_campaign_revision(
  p_campaign_id uuid,
  p_variants jsonb,
  p_creative_direction text,
  p_video_direction text,
  p_authenticity_score integer
) returns public.campaigns
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_campaign public.campaigns;
  v_platform text;
  v_content jsonb;
begin
  select * into v_campaign
  from public.campaigns
  where id = p_campaign_id
  for update;

  if not found then raise exception 'Campaign not found'; end if;
  if v_campaign.status <> 'revision_requested' then
    raise exception 'Campaign is not awaiting revision';
  end if;
  if p_variants is null or jsonb_typeof(p_variants) <> 'object' or p_variants = '{}'::jsonb then
    raise exception 'At least one revised content variant is required';
  end if;

  for v_platform, v_content in select key, value from jsonb_each(p_variants)
  loop
    update public.content_variants
    set content = v_content #>> '{}', status = 'revised'
    where campaign_id = p_campaign_id and platform = v_platform;

    if not found then
      insert into public.content_variants(campaign_id,platform,content,status)
      values(p_campaign_id,v_platform,v_content #>> '{}','revised');
    end if;
  end loop;

  update public.campaigns
  set creative_direction = coalesce(p_creative_direction,creative_direction),
      video_direction = coalesce(p_video_direction,video_direction),
      authenticity_score = p_authenticity_score,
      authenticity_passed = true,
      status = 'pending_approval'
  where id = p_campaign_id
  returning * into v_campaign;

  return v_campaign;
end;
$$;
