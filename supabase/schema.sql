-- ClearQuote V1 Supabase schema
-- Run this inside Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  company_name text not null default 'Your company',
  average_quote_value numeric not null default 300,
  created_at timestamptz not null default now()
);

create table if not exists public.feedback_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.feedback_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  link_id uuid not null references public.feedback_links(id) on delete cascade,
  q1_reason text not null,
  q2_priority text not null,
  q3_improve text not null,
  q4_other text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.feedback_links enable row level security;
alter table public.feedback_responses enable row level security;

-- Profiles: logged-in user can manage own profile
create policy "Users can view own profile"
on public.profiles for select
using (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id);

create policy "Users can insert own profile"
on public.profiles for insert
with check (auth.uid() = id);

-- Feedback links: logged-in user can view/manage own link
create policy "Users can view own feedback links"
on public.feedback_links for select
using (auth.uid() = user_id);

create policy "Users can insert own feedback links"
on public.feedback_links for insert
with check (auth.uid() = user_id);

create policy "Users can update own feedback links"
on public.feedback_links for update
using (auth.uid() = user_id);

-- Public needs to read link by slug for anonymous form
create policy "Public can read feedback links"
on public.feedback_links for select
using (true);

-- Feedback responses: logged-in user can view their own responses
create policy "Users can view own feedback responses"
on public.feedback_responses for select
using (auth.uid() = user_id);

-- Public anonymous customers can submit feedback
create policy "Anyone can submit feedback"
on public.feedback_responses for insert
with check (true);

-- Auto-create profile after signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  generated_slug text;
begin
  insert into public.profiles (id, email, company_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'company_name', 'Your company')
  );

  generated_slug := lower(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));

  insert into public.feedback_links (user_id, slug)
  values (new.id, generated_slug);

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
