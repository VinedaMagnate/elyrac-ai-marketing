create or replace function public.authorize_publish_job(
  p_job_id uuid,
  p_actor text
) returns public.publish_jobs
language plpgsql security invoker set search_path=public
as $$
declare v_job public.publish_jobs; v_connection public.social_connections;
begin
  if nullif(trim(p_actor),'') is null then raise exception 'Authorization actor is required'; end if;
  select * into v_job from public.publish_jobs where id=p_job_id for update;
  if not found then raise exception 'Publish job not found'; end if;
  if v_job.status <> 'pending_authorization' then raise exception 'Publish job is not awaiting authorization'; end if;

  select * into v_connection from public.social_connections where platform=v_job.platform;
  if not found or v_connection.status <> 'connected' then raise exception 'Platform is not connected'; end if;
  if v_connection.publishing_enabled is not true then raise exception 'Publishing is not enabled for this connection'; end if;

  update public.publish_jobs
  set status='authorized',authorized_by=trim(p_actor),authorized_at=now(),updated_at=now()
  where id=p_job_id returning * into v_job;

  insert into public.publish_audit_events(publish_job_id,event_type,actor,details)
  values(v_job.id,'authorized',trim(p_actor),jsonb_build_object('platform',v_job.platform));

  return v_job;
end;
$$;
