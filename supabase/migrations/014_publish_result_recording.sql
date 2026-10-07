create or replace function public.record_publish_result(
  p_job_id uuid,
  p_succeeded boolean,
  p_actor text,
  p_external_post_id text default null,
  p_error text default null
) returns public.publish_jobs
language plpgsql security invoker set search_path=public
as $$
declare v_job public.publish_jobs;
begin
  if nullif(trim(p_actor),'') is null then raise exception 'Result actor is required'; end if;
  select * into v_job from public.publish_jobs where id=p_job_id for update;
  if not found then raise exception 'Publish job not found'; end if;
  if v_job.status <> 'processing' then raise exception 'Publish job is not processing'; end if;
  if p_succeeded and nullif(trim(coalesce(p_external_post_id,'')),'') is null then
    raise exception 'Successful publishing requires an external post id';
  end if;
  if not p_succeeded and nullif(trim(coalesce(p_error,'')),'') is null then
    raise exception 'Failed publishing requires an error';
  end if;

  update public.publish_jobs
  set status=case when p_succeeded then 'succeeded' else 'failed' end,
      external_post_id=case when p_succeeded then trim(p_external_post_id) else external_post_id end,
      last_error=case when p_succeeded then null else trim(p_error) end,
      updated_at=now()
  where id=p_job_id returning * into v_job;

  insert into public.publish_audit_events(publish_job_id,event_type,actor,details)
  values(v_job.id,case when p_succeeded then 'succeeded' else 'failed' end,trim(p_actor),
    jsonb_build_object('platform',v_job.platform,'attempt',v_job.attempt_count,'external_post_id',v_job.external_post_id,'error',v_job.last_error));

  return v_job;
end;
$$;
