create table if not exists public.social_oauth_sessions (
 id uuid primary key default gen_random_uuid(),
 platform text not null check (platform in ('facebook','instagram','linkedin','x','tiktok','youtube')),
 state_hash text not null unique,
 pkce_verifier_encrypted text,
 requested_by text not null,
 redirect_uri text not null,
 expires_at timestamptz not null,
 consumed_at timestamptz,
 created_at timestamptz not null default now()
);
alter table public.social_oauth_sessions enable row level security;
create index if not exists social_oauth_sessions_expiry_idx on public.social_oauth_sessions(expires_at);
comment on table public.social_oauth_sessions is 'Server-only one-time OAuth state. Raw state is never persisted.';
