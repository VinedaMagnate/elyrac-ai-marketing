create or replace function public.cancel_publish_authorization(p_job_id uuid,p_actor text) returns public.publish_jobs
language plpgsql security invoker set search_path=public
as $$
declare v_job public.publish_jobs;
begin
  if nullif(trim(p_actor),'') is null then raise exception 'Cancellation actor is required'; end if;
  select * into v_job from public.publish_jobs where id=p_job_id for update;
  if not found then raise exception 'Publish job not found'; end if;
  if v_job.status not in ('pending_authorization','authorized') then raise exception 'Only pending or authorized publish jobs can be cancelled'; end if;
  update public.publish_jobs set status='cancelled',updated_at=now() where id=p_job_id returning * into v_job;
  insert into public.publish_audit_events(publish_job_id,event_type,actor,details)
  values(v_job.id,'cancelled',trim(p_actor),jsonb_build_object('platform',v_job.platform,'previous_status',case when v_job.authorized_at is null then 'pending_authorization' else 'authorized' end));
  return v_job;
end;
$$;
