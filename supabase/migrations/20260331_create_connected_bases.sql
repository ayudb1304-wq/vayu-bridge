-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/cjzxuiagzhblcsftwpib/sql/new

create table if not exists public.connected_bases (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users(id) on delete cascade not null,
  airtable_base_id  text not null,
  base_name         text,
  access_token_enc  text not null,
  refresh_token_enc text not null,
  webhook_id        text,
  sync_status       text not null default 'pending',
  last_synced_at    timestamptz,
  created_at        timestamptz default now(),
  constraint connected_bases_user_base_unique unique (user_id, airtable_base_id)
);

alter table public.connected_bases enable row level security;

create policy "Users see own bases"
  on public.connected_bases for all
  using (auth.uid() = user_id);
