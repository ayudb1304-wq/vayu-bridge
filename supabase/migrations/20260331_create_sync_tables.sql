-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/cjzxuiagzhblcsftwpib/sql/new

-- Add token expiry + webhook secret to connected_bases
alter table public.connected_bases
  add column if not exists token_expires_at  timestamptz,
  add column if not exists webhook_secret_enc text;

-- Sync log: tracks each sync job (initial or poll)
create table if not exists public.sync_log (
  id                 uuid primary key default gen_random_uuid(),
  connected_base_id  uuid references public.connected_bases(id) on delete cascade not null,
  user_id            uuid references auth.users(id) on delete cascade not null,
  status             text not null default 'running',  -- running | complete | error
  records_synced     integer not null default 0,
  message            text,
  error_message      text,
  started_at         timestamptz not null default now(),
  completed_at       timestamptz
);

alter table public.sync_log enable row level security;

create policy "Users see own sync logs"
  on public.sync_log for all
  using (auth.uid() = user_id);

-- Synced records: all Airtable records stored as JSONB
create table if not exists public.synced_records (
  id                   uuid primary key default gen_random_uuid(),
  connected_base_id    uuid references public.connected_bases(id) on delete cascade not null,
  airtable_table_id    text not null,
  airtable_table_name  text not null,
  airtable_record_id   text not null,
  fields               jsonb not null default '{}',
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint synced_records_unique unique (connected_base_id, airtable_table_id, airtable_record_id)
);

create index if not exists synced_records_base_table_idx
  on public.synced_records (connected_base_id, airtable_table_id);

create index if not exists synced_records_fields_gin
  on public.synced_records using gin (fields);

alter table public.synced_records enable row level security;

create policy "Users see own synced records"
  on public.synced_records for all
  using (
    exists (
      select 1 from public.connected_bases cb
      where cb.id = synced_records.connected_base_id
        and cb.user_id = auth.uid()
    )
  );

-- Enable Realtime for sync_log (for live progress UI)
alter publication supabase_realtime add table public.sync_log;

-- Helper: atomically increment records_synced on a sync_log row
create or replace function public.increment_sync_records(log_id uuid, amount integer)
returns void
language sql
security definer
as $$
  update public.sync_log
  set records_synced = records_synced + amount
  where id = log_id;
$$;
