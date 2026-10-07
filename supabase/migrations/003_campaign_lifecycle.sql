alter table campaigns add column if not exists creative_direction text;
alter table campaigns add column if not exists video_direction text;
alter table campaigns add column if not exists authenticity_score integer;
alter table campaigns add column if not exists authenticity_passed boolean not null default false;
create index if not exists campaigns_scheduled_idx on campaigns(scheduled_at);