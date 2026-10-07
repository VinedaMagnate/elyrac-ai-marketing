create table if not exists public.social_account_candidates (
 id uuid primary key default gen_random_uuid(),
 platform text not null check (platform in ('facebook','instagram')),
 external_account_id text not null,
 account_label text not null,
 parent_account_id text,
 access_token_encrypted text not null,
 requested_by text not null,
 expires_at timestamptz not null,
 consumed_at timestamptz,
 created_at timestamptz not null default now(),
 unique(platform,external_account_id,requested_by)
);
alter table public.social_account_candidates enable row level security;
revoke all on table public.social_account_candidates from anon, authenticated;
create index if not exists social_account_candidates_expiry_idx on public.social_account_candidates(expires_at);
comment on table public.social_account_candidates is 'Server-only temporary Meta Page/Instagram Business choices; encrypted credentials only.';
