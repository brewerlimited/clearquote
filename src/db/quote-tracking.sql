-- ClearQuote basic quote tracking
-- Run this in Supabase SQL Editor after your existing ClearQuote schema.

create table if not exists quote_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quote_name text,
  quote_value numeric not null default 0,
  status text not null default 'sent' check (status in ('sent', 'won', 'lost', 'no_response')),
  quoted_at date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table quote_records enable row level security;

drop policy if exists "Users can read own quote records" on quote_records;
create policy "Users can read own quote records"
  on quote_records for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own quote records" on quote_records;
create policy "Users can insert own quote records"
  on quote_records for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own quote records" on quote_records;
create policy "Users can update own quote records"
  on quote_records for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own quote records" on quote_records;
create policy "Users can delete own quote records"
  on quote_records for delete
  using (auth.uid() = user_id);

create index if not exists quote_records_user_quoted_at_idx on quote_records(user_id, quoted_at desc);
create index if not exists quote_records_user_status_idx on quote_records(user_id, status);
