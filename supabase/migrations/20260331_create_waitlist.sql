-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/cjzxuiagzhblcsftwpib/sql/new

create table if not exists public.waitlist (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  source      text not null default 'hero',
  created_at  timestamptz not null default now(),
  constraint waitlist_email_unique unique (email)
);

-- Enable Row Level Security
alter table public.waitlist enable row level security;

-- Allow inserts from anonymous users (public signup)
create policy "Anyone can join the waitlist"
  on public.waitlist
  for insert
  to anon
  with check (true);

-- Only authenticated service role can read (for your own queries)
-- Reads via the dashboard or service role key still work.
