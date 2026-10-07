create table if not exists public.social_oauth_tokens (
 id uuid primary key default gen_random_uuid(),
 platform text not null check (platform in ('facebook','instagram','linkedin','x','tiktok','youtube')),
 external_account_id text not null,
 access_token_encrypted text not null,
 refresh_token_encrypted text,
 token_type text,
 scopes text[] not null default '{}',
 expires_at timestamptz,
 refresh_expires_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(platform,external_account_id)
);
alter table public.social_oauth_tokens enable row level security;
comment on table public.social_oauth_tokens is 'Server-only encrypted OAuth credentials. Never return token columns to browser clients.';
revoke all on table public.social_oauth_tokens from anon, authenticated;
revoke all on table public.social_oauth_sessions from anon, authenticated;
