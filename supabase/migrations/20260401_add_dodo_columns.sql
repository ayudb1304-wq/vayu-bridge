-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/cjzxuiagzhblcsftwpib/sql/new

-- Add Dodopayments subscription tracking columns to users table
alter table public.users
  add column if not exists dodo_subscription_id text,
  add column if not exists dodo_customer_id text;
