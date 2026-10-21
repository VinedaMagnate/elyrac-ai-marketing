-- Atomically prevent editing content once its parent campaign has been approved.
-- Both the campaign and variant are locked before the edit is applied.
create or replace function public.edit_pending_content_variant(
  p_variant_id uuid,
  p_content text
) returns public.content_variants
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_campaign_id uuid;
  v_campaign public.campaigns;
  v_variant public.content_variants;
begin
  if nullif(trim(p_content),'') is null then
    raise exception 'Content is required';
  end if;

  select campaign_id into v_campaign_id
  from public.content_variants
  where id = p_variant_id;
  if not found then raise exception 'Content variant not found'; end if;

  select * into v_campaign from public.campaigns
  where id = v_campaign_id for update;
  if not found then raise exception 'Campaign not found'; end if;
  if v_campaign.status not in ('pending_approval','revision_requested') then
    raise exception 'Approved or scheduled campaign content cannot be edited';
  end if;

  select * into v_variant from public.content_variants
  where id = p_variant_id for update;
  if not found or v_variant.campaign_id <> v_campaign_id then
    raise exception 'Content variant changed during editing';
  end if;

  update public.content_variants
  set content = trim(p_content), status = 'awaiting_approval'
  where id = p_variant_id returning * into v_variant;

  return v_variant;
end;
$$;
