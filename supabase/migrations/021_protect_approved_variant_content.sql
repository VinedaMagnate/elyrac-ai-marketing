-- Protect approved/scheduled content regardless of the application update path.
-- Lock the parent campaign to serialize content changes with approval/scheduling.
create or replace function public.guard_approved_variant_content()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_campaign_id uuid;
  v_status text;
begin
  v_campaign_id := case when tg_op = 'DELETE' then old.campaign_id else new.campaign_id end;
  if tg_op = 'UPDATE' and new.campaign_id is distinct from old.campaign_id then
    raise exception 'Moving a content variant between campaigns is not permitted';
  end if;

  select status into v_status
  from public.campaigns
  where id = v_campaign_id
  for update;
  if not found then raise exception 'Parent campaign not found'; end if;

  if v_status in ('approved','scheduled') then
    if tg_op = 'INSERT' or tg_op = 'DELETE' then
      raise exception 'Approved or scheduled campaign variants cannot be added or deleted';
    end if;
    if new.content is distinct from old.content or new.platform is distinct from old.platform then
      raise exception 'Approved or scheduled campaign content cannot be modified';
    end if;
  end if;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists protect_approved_variant_content on public.content_variants;
create trigger protect_approved_variant_content
before insert or update or delete on public.content_variants
for each row execute function public.guard_approved_variant_content();
