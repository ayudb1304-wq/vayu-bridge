-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/cjzxuiagzhblcsftwpib/sql/new

-- 1. Enable trigram extension for fast ilike search
create extension if not exists pg_trgm;

-- 2. Add generated text column — always in sync with fields JSONB, no manual updates needed
alter table public.synced_records
  add column if not exists fields_text text generated always as (fields::text) stored;

-- 3. GIN trigram index — makes ilike '%term%' sub-10ms on large tables
create index if not exists synced_records_fields_text_trgm_idx
  on public.synced_records using gin (fields_text gin_trgm_ops);
