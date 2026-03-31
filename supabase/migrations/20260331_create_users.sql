-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/cjzxuiagzhblcsftwpib/sql/new

-- Public users table (mirrors auth.users, extended with app data)
create table if not exists public.users (
  id          uuid references auth.users(id) on delete cascade primary key,
  email       text,
  plan_tier   text not null default 'free',
  created_at  timestamptz default now()
);

alter table public.users enable row level security;

create policy "Users see own row"
  on public.users for all
  using (auth.uid() = id);

-- Trigger: auto-insert a row into public.users on every new auth sign-up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
