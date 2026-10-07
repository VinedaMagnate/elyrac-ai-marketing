-- Keep public application tables inaccessible to browser roles by default.
-- The application currently performs privileged database work only through
-- authenticated server routes using the Supabase service role.
alter table public.campaigns enable row level security;
alter table public.content_variants enable row level security;
alter table public.trend_signals enable row level security;
alter table public.brand_rules enable row level security;
alter table public.approval_feedback enable row level security;
alter table public.analytics_events enable row level security;
alter table public.brand_evidence enable row level security;
