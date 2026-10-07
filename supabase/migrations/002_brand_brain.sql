alter table campaigns add column if not exists source_evidence jsonb not null default '[]'::jsonb;
create table if not exists brand_evidence(id uuid primary key default gen_random_uuid(),kind text not null,content text not null,source_url text,approved boolean not null default false,created_at timestamptz not null default now());
create index if not exists campaigns_status_idx on campaigns(status);
create index if not exists brand_rules_active_idx on brand_rules(active);
create index if not exists brand_evidence_approved_idx on brand_evidence(approved);
