-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/cjzxuiagzhblcsftwpib/sql/new

-- 1. Create the increment_sync_records RPC function
create or replace function public.increment_sync_records(log_id uuid, amount integer)
returns void
language sql
security definer
as $$
  update public.sync_log
  set records_synced = records_synced + amount
  where id = log_id;
$$;

-- 2. Enable Realtime on sync_log (idempotent)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'sync_log'
  ) then
    alter publication supabase_realtime add table public.sync_log;
  end if;
end $$;
