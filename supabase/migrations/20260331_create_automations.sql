-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/cjzxuiagzhblcsftwpib/sql/new

-- 1. Automations table
create table public.automations (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users(id) on delete cascade not null,
  connected_base_id   uuid references public.connected_bases(id) on delete cascade not null,
  name                text not null,
  enabled             boolean not null default true,
  -- Trigger
  trigger_table       text not null,
  trigger_field       text not null default '',
  trigger_condition   text not null,  -- 'any_change' | 'not_empty' | 'eq' | 'contains'
  trigger_value       text,
  -- Action
  action_type         text not null,  -- 'http_post' | 'send_email' | 'update_airtable'
  action_config       jsonb not null default '{}',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.automations enable row level security;

create policy "Users manage own automations"
  on public.automations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 2. Automation runs table
create table public.automation_runs (
  id                      uuid primary key default gen_random_uuid(),
  automation_id           uuid references public.automations(id) on delete cascade not null,
  user_id                 uuid references auth.users(id) on delete cascade not null,
  status                  text not null,  -- 'success' | 'error'
  triggered_by_record_id  text,
  error_message           text,
  executed_at             timestamptz not null default now()
);

alter table public.automation_runs enable row level security;

create policy "Users see own automation runs"
  on public.automation_runs for all
  using (auth.uid() = user_id);

-- 3. Indexes
-- Hot-path: webhook handler queries enabled automations per base
create index automations_base_enabled_idx
  on public.automations (connected_base_id)
  where enabled = true;

-- Run log queries: last N runs for an automation
create index automation_runs_automation_idx
  on public.automation_runs (automation_id, executed_at desc);

-- 4. updated_at auto-trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger automations_updated_at
  before update on public.automations
  for each row execute function public.set_updated_at();
