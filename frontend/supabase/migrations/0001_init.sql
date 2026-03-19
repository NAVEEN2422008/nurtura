-- NURTURA v1 schema (Supabase Postgres)
-- Notes:
-- - Uses UUID primary keys via pgcrypto
-- - Adds RLS policies assuming Supabase Auth (auth.uid()).
--   If you access with service role from server, policies are bypassed (acceptable for v1),
--   but keeping RLS makes it production-ready when/if you switch to user JWTs.

create extension if not exists pgcrypto;

-- Enums
do $$ begin
  create type public.user_role as enum ('mother', 'partner', 'provider', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.pregnancy_status as enum ('pregnant', 'postpartum', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.symptom_severity as enum ('mild', 'moderate', 'severe');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.mood_level as enum ('happy', 'okay', 'neutral', 'sad', 'very_sad');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.community_group as enum ('first_trimester', 'second_trimester', 'third_trimester', 'postpartum');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.moderation_status as enum ('pending', 'approved', 'flagged', 'removed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.wearable_source as enum ('apple_watch', 'fitbit', 'oura', 'manual');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.report_status as enum ('uploaded', 'processing', 'ready', 'failed');
exception when duplicate_object then null; end $$;

-- Utility trigger for updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- USERS (app-level profile; NextAuth/Supabase Auth can map to this)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  role public.user_role not null default 'mother',
  language text not null default 'en',
  timezone text,
  password_hash text, -- for Credentials login (bcrypt hash). NULL for OAuth-only accounts.
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

-- Pregnancy profile
create table if not exists public.pregnancy_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  start_date date, -- LMP
  due_date date,
  current_week int,
  trimester int,
  status public.pregnancy_status not null default 'pregnant',
  medical_history jsonb not null default '[]'::jsonb,
  risk_factors jsonb not null default '[]'::jsonb,
  next_appointment_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_pregnancy_profiles_user_id on public.pregnancy_profiles(user_id);

drop trigger if exists trg_pregnancy_profiles_updated_at on public.pregnancy_profiles;
create trigger trg_pregnancy_profiles_updated_at
before update on public.pregnancy_profiles
for each row execute function public.set_updated_at();

-- Symptom logs
create table if not exists public.symptom_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  pregnancy_id uuid references public.pregnancy_profiles(id) on delete set null,
  symptoms jsonb not null, -- array: [{name,severity,notes?}]
  risk_score int,
  risk_level text, -- GREEN|YELLOW|RED (kept as text for easy iteration)
  suggested_actions jsonb not null default '[]'::jsonb,
  condition_signals jsonb not null default '[]'::jsonb,
  notes_encrypted jsonb, -- {iv,tag,ciphertext} or null
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_symptom_logs_user_id_occurred_at on public.symptom_logs(user_id, occurred_at desc);
create index if not exists idx_symptom_logs_pregnancy_id_occurred_at on public.symptom_logs(pregnancy_id, occurred_at desc);

-- Mood logs
create table if not exists public.mood_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  pregnancy_id uuid references public.pregnancy_profiles(id) on delete set null,
  mood public.mood_level not null,
  notes_encrypted jsonb,
  ai_flags jsonb not null default '[]'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_mood_logs_user_id_occurred_at on public.mood_logs(user_id, occurred_at desc);

-- Wearable data (v1 stores JSON metrics)
create table if not exists public.wearable_data (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  source public.wearable_source not null,
  metrics jsonb not null, -- heartRate, hrv, sleep, activity, etc
  captured_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_wearable_data_user_id_captured_at on public.wearable_data(user_id, captured_at desc);

-- Community
create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  group_name public.community_group not null,
  title text,
  body text not null,
  anonymous boolean not null default false,
  moderation_status public.moderation_status not null default 'pending',
  misinformation_flags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_community_posts_group_created_at on public.community_posts(group_name, created_at desc);

drop trigger if exists trg_community_posts_updated_at on public.community_posts;
create trigger trg_community_posts_updated_at
before update on public.community_posts
for each row execute function public.set_updated_at();

create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  parent_comment_id uuid references public.community_comments(id) on delete cascade,
  body text not null,
  anonymous boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_community_comments_post_id_created_at on public.community_comments(post_id, created_at asc);

create table if not exists public.post_likes (
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- Support circle contacts
create table if not exists public.support_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  relationship text,
  phone text,
  email text,
  notify_on jsonb not null default '[]'::jsonb, -- e.g. ["EMERGENCY","DISTRESS"]
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_support_contacts_user_id on public.support_contacts(user_id);

drop trigger if exists trg_support_contacts_updated_at on public.support_contacts;
create trigger trg_support_contacts_updated_at
before update on public.support_contacts
for each row execute function public.set_updated_at();

-- Medical reports (file in Supabase Storage)
create table if not exists public.medical_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  file_path text not null,
  file_type text not null,
  status public.report_status not null default 'uploaded',
  ocr_text_encrypted jsonb,
  ai_summary_encrypted jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_medical_reports_user_id_created_at on public.medical_reports(user_id, created_at desc);

drop trigger if exists trg_medical_reports_updated_at on public.medical_reports;
create trigger trg_medical_reports_updated_at
before update on public.medical_reports
for each row execute function public.set_updated_at();

-- AI chat history
create table if not exists public.ai_chat_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  pregnancy_id uuid references public.pregnancy_profiles(id) on delete set null,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ai_chat_threads_user_id_updated_at on public.ai_chat_threads(user_id, updated_at desc);

drop trigger if exists trg_ai_chat_threads_updated_at on public.ai_chat_threads;
create trigger trg_ai_chat_threads_updated_at
before update on public.ai_chat_threads
for each row execute function public.set_updated_at();

create table if not exists public.ai_chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.ai_chat_threads(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content_encrypted jsonb not null,
  flags jsonb not null default '[]'::jsonb,
  confidence numeric,
  created_at timestamptz not null default now()
);

create index if not exists idx_ai_chat_messages_thread_id_created_at on public.ai_chat_messages(thread_id, created_at asc);

-- Appointments
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  pregnancy_id uuid references public.pregnancy_profiles(id) on delete set null,
  starts_at timestamptz not null,
  provider_name text,
  location text,
  notes_encrypted jsonb,
  reminders jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_appointments_user_id_starts_at on public.appointments(user_id, starts_at asc);

drop trigger if exists trg_appointments_updated_at on public.appointments;
create trigger trg_appointments_updated_at
before update on public.appointments
for each row execute function public.set_updated_at();

-- Audit events (minimal)
create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  event_type text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_events_user_id_created_at on public.audit_events(user_id, created_at desc);

-- RLS
alter table public.users enable row level security;
alter table public.pregnancy_profiles enable row level security;
alter table public.symptom_logs enable row level security;
alter table public.mood_logs enable row level security;
alter table public.wearable_data enable row level security;
alter table public.community_posts enable row level security;
alter table public.community_comments enable row level security;
alter table public.post_likes enable row level security;
alter table public.support_contacts enable row level security;
alter table public.medical_reports enable row level security;
alter table public.ai_chat_threads enable row level security;
alter table public.ai_chat_messages enable row level security;
alter table public.appointments enable row level security;
alter table public.audit_events enable row level security;

-- Basic owner policies (Supabase Auth UID == users.id)
-- If you use Supabase Auth, set users.id to auth.uid().
do $$ begin
  create policy users_self_select on public.users for select using (auth.uid() = id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy users_self_update on public.users for update using (auth.uid() = id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy pregnancy_self_all on public.pregnancy_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy symptom_self_all on public.symptom_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy mood_self_all on public.mood_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy wearable_self_all on public.wearable_data for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- Community: read approved content for all, write for authenticated
do $$ begin
  create policy community_posts_read on public.community_posts for select using (moderation_status = 'approved' or auth.uid() = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy community_posts_write on public.community_posts for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy community_posts_update_own on public.community_posts for update using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy community_comments_read on public.community_comments for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy community_comments_write on public.community_comments for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy likes_self_all on public.post_likes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy support_contacts_self_all on public.support_contacts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy medical_reports_self_all on public.medical_reports for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy ai_threads_self_all on public.ai_chat_threads for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy ai_messages_thread_owner on public.ai_chat_messages for select using (
    exists (
      select 1 from public.ai_chat_threads t
      where t.id = ai_chat_messages.thread_id
      and t.user_id = auth.uid()
    )
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy ai_messages_thread_owner_insert on public.ai_chat_messages for insert with check (
    exists (
      select 1 from public.ai_chat_threads t
      where t.id = ai_chat_messages.thread_id
      and t.user_id = auth.uid()
    )
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy appointments_self_all on public.appointments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy audit_events_self_insert on public.audit_events for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

