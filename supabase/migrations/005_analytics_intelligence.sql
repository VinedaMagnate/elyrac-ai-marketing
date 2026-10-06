create index if not exists analytics_events_campaign_idx on analytics_events(campaign_id);
create index if not exists analytics_events_type_idx on analytics_events(event_type);
create index if not exists analytics_events_recorded_idx on analytics_events(recorded_at desc);
