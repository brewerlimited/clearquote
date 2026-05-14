-- ClearQuote admin global dashboard additions
-- Run this in Supabase SQL Editor before using link-open tracking.

create table if not exists feedback_link_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  link_id uuid not null references feedback_links(id) on delete cascade,
  event_type text not null default 'open' check (event_type in ('open')),
  user_agent text,
  referrer text,
  created_at timestamptz not null default now()
);

alter table feedback_link_events enable row level security;

-- No public read policy. The admin dashboard reads this table only through the server-side service role key.

create index if not exists feedback_link_events_user_created_idx on feedback_link_events(user_id, created_at desc);
create index if not exists feedback_link_events_link_created_idx on feedback_link_events(link_id, created_at desc);
create index if not exists feedback_link_events_event_type_idx on feedback_link_events(event_type);
