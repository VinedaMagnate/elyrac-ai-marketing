-- Atomic persistence primitives for campaign creation and CEO approval.
-- These functions are invoked only by authenticated server routes using service_role.

create or replace function public.create_campaign_with_variants(
  p_title text,
  p_objective text,
  p_audience text,
  p_pillar text,
  p_source_evidence jsonb,
  p_creative_direction text,
  p_video_direction text,
  p_authenticity_score integer,
  p_variants jsonb
) returns public.campaigns
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_campaign public.campaigns;
begin
  if p_variants is null or jsonb_typeof(p_variants) <> 'object' or p_variants = '{}'::jsonb then
    raise exception 'At least one content variant is required';
  end if;

  insert into public.campaigns (
    title, objective, audience, pillar, status, source_evidence,
    creative_direction, video_direction, authenticity_score, authenticity_passed
  ) values (
    p_title, p_objective, p_audience, p_pillar, 'pending_approval', coalesce(p_source_evidence,'[]'::jsonb),
    p_creative_direction, p_video_direction, p_authenticity_score, true
  ) returning * into v_campaign;

  insert into public.content_variants (campaign_id, platform, content, status)
  select v_campaign.id, key, value #>> '{}', 'draft'
  from jsonb_each(p_variants);

  return v_campaign;
end;
$$;

create or replace function public.record_campaign_decision(
  p_campaign_id uuid,
  p_decision text,
  p_feedback text default null
) returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_campaign public.campaigns;
  v_approval public.approval_feedback;
  v_status text;
begin
  if p_decision not in ('approved','changes_requested','rejected') then
    raise exception 'Invalid approval decision';
  end if;
  if p_decision = 'changes_requested' and nullif(trim(p_feedback),'') is null then
    raise exception 'Feedback is required when requesting changes';
  end if;

  select * into v_campaign from public.campaigns where id = p_campaign_id for update;
  if not found then raise exception 'Campaign not found'; end if;
  if v_campaign.status not in ('pending_approval','revision_requested') then
    raise exception 'Campaign is not currently reviewable';
  end if;
  if p_decision = 'approved' and not coalesce(v_campaign.authenticity_passed,false) then
    raise exception 'Campaign failed the authenticity gate';
  end if;

  v_status := case p_decision when 'approved' then 'approved' when 'rejected' then 'rejected' else 'revision_requested' end;

  insert into public.approval_feedback(campaign_id,decision,feedback)
  values(p_campaign_id,p_decision,nullif(trim(p_feedback),''))
  returning * into v_approval;

  update public.campaigns set status=v_status where id=p_campaign_id;

  return jsonb_build_object('approval',to_jsonb(v_approval),'status',v_status);
end;
$$;
