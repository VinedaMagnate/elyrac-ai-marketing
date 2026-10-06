-- Auditable, idempotent publishing boundary. This does not connect or publish to any platform.
create table if not exists public.publish_jobs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete restrict,
  platform text not null check (platform in ('linkedin','instagram','facebook','x','tiktok','youtube')),
  status text not null default 'pending_authorization'
    check (status in ('pending_authorization','authorized','processing','succeeded','failed','cancelled')),
  idempotency_key text not null unique,
  authorized_by text,
  authorized_at timestamptz,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  last_attempt_at timestamptz,
  external_post_id text,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(campaign_id, platform)
);
alter table public.publish_jobs enable row level security;
create index if not exists publish_jobs_campaign_idx on public.publish_jobs(campaign_id);
create index if not exists publish_jobs_status_idx on public.publish_jobs(status);

create table if not exists public.publish_audit_events (
  id uuid primary key default gen_random_uuid(),
  publish_job_id uuid not null references public.publish_jobs(id) on delete restrict,
  event_type text not null,
  actor text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.publish_audit_events enable row level security;
create index if not exists publish_audit_events_job_idx on public.publish_audit_events(publish_job_id, created_at);

create or replace function public.prepare_publish_job(
  p_campaign_id uuid,
  p_platform text,
  p_idempotency_key text
) returns public.publish_jobs
language plpgsql security invoker set search_path=public
as $$
declare v_campaign public.campaigns; v_job public.publish_jobs;
begin
  if p_platform not in ('linkedin','instagram','facebook','x','tiktok','youtube') then raise exception 'Unsupported platform'; end if;
  if nullif(trim(p_idempotency_key),'') is null then raise exception 'Idempotency key is required'; end if;
  select * into v_campaign from public.campaigns where id=p_campaign_id for update;
  if not found then raise exception 'Campaign not found'; end if;
  if v_campaign.status <> 'scheduled' then raise exception 'Only scheduled campaigns can enter publishing authorization'; end if;
  insert into public.publish_jobs(campaign_id,platform,idempotency_key)
  values(p_campaign_id,p_platform,p_idempotency_key)
  on conflict(campaign_id,platform) do update set updated_at=now()
  returning * into v_job;
  insert into public.publish_audit_events(publish_job_id,event_type,actor,details)
  values(v_job.id,'prepared','system',jsonb_build_object('campaign_id',p_campaign_id,'platform',p_platform));
  return v_job;
end;
$$;
