-- Metadata-only registry for social channel connections.
-- OAuth access/refresh tokens must remain in a dedicated server-side secret store,
-- never in this table, the browser, logs, or the repository.

create table if not exists public.social_connections (
  id uuid primary key default gen_random_uuid(),
  platform text not null unique
    check (platform in ('linkedin','instagram','facebook','x','tiktok','youtube')),
  status text not null default 'not_connected'
    check (status in ('not_connected','connecting','connected','error','revoked')),
  account_label text,
  external_account_id text,
  scopes text[] not null default '{}',
  publishing_enabled boolean not null default false,
  analytics_enabled boolean not null default false,
  last_verified_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.social_connections enable row level security;

insert into public.social_connections(platform)
values ('linkedin'),('instagram'),('facebook'),('x'),('tiktok'),('youtube')
on conflict (platform) do nothing;

create index if not exists social_connections_status_idx
  on public.social_connections(status);
