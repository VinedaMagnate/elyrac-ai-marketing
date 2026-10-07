-- Separate factual approval from permission to use evidence in generated public content.
alter table public.brand_evidence
  add column if not exists public_use boolean not null default false,
  add column if not exists sensitivity text not null default 'internal'
    check (sensitivity in ('public','internal','confidential'));

-- Existing evidence remains unavailable for public generation until explicitly reviewed.
update public.brand_evidence set public_use = false where public_use is null;

create index if not exists brand_evidence_public_use_idx
  on public.brand_evidence(approved, public_use, sensitivity);
