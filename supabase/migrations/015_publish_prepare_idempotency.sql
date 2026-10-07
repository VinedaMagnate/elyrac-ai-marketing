create or replace function public.prepare_publish_job(
  p_campaign_id uuid,
  p_platform text,
  p_idempotency_key text
) returns public.publish_jobs
language plpgsql security invoker set search_path=public
as $$
declare
  v_campaign public.campaigns;
  v_job public.publish_jobs;
begin
  if p_platform not in ('linkedin','instagram','facebook','x','tiktok','youtube') then raise exception 'Unsupported platform'; end if;
  if nullif(trim(p_idempotency_key),'') is null then raise exception 'Idempotency key is required'; end if;

  select * into v_campaign from public.campaigns where id=p_campaign_id for update;
  if not found then raise exception 'Campaign not found'; end if;
  if v_campaign.status <> 'scheduled' then raise exception 'Campaign must be scheduled before preparing publishing'; end if;

  select * into v_job from public.publish_jobs where campaign_id=p_campaign_id and platform=p_platform for update;
  if found then
    if v_job.idempotency_key <> p_idempotency_key then raise exception 'Publish job already exists with a different idempotency key'; end if;
    return v_job;
  end if;

  insert into public.publish_jobs(campaign_id,platform,status,idempotency_key)
  values(p_campaign_id,p_platform,'pending_authorization',p_idempotency_key)
  returning * into v_job;

  insert into public.publish_audit_events(publish_job_id,event_type,actor,details)
  values(v_job.id,'prepared','system',jsonb_build_object('platform',p_platform));

  return v_job;
end;
$$;
