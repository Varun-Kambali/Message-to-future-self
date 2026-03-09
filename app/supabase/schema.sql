-- ═══════════════════════════════════════════════════════════
-- Future Self Messenger — Supabase Schema
-- Run this once in: Supabase Dashboard → SQL Editor → Run
-- ═══════════════════════════════════════════════════════════

-- ── Extensions ────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── profiles ──────────────────────────────────────────────────
-- Extends the built-in auth.users table
create table if not exists public.profiles (
  id           uuid        primary key references auth.users(id) on delete cascade,
  email        text        not null,
  name         text,
  bio          text,
  cover_color  text        not null default 'oxblood',
  cover_title  text        not null default 'Letters to the Future',
  cover_image  text,                    -- storage path in cover-images bucket
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ── capsules ───────────────────────────────────────────────────
create table if not exists public.capsules (
  id           uuid        primary key default uuid_generate_v4(),
  user_id      uuid        not null references public.profiles(id) on delete cascade,
  type         text        not null check (type in ('text','audio','video')),
  content      text,
  media_path   text,                    -- storage path in capsule-media bucket
  transcript   text,
  prompt       text,
  delivery_at  timestamptz not null,
  seal_color   text        not null default '#a02020',
  seal_emoji   text        not null default '✦',
  seal_image   text,                    -- storage path in seal-art bucket
  status       text        not null default 'sealed' check (status in ('sealed','delivered','failed')),
  delivered_at timestamptz,
  recipient_email text,
  email_sent   boolean     not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.capsules enable row level security;

create policy "Users can view own capsules"
  on public.capsules for select
  using (auth.uid() = user_id);

create policy "Users can insert own capsules"
  on public.capsules for insert
  with check (auth.uid() = user_id);

create policy "Users can update own sealed capsules"
  on public.capsules for update
  using (auth.uid() = user_id and status = 'sealed');

create policy "Users can delete own sealed capsules"
  on public.capsules for delete
  using (auth.uid() = user_id and status = 'sealed');

-- Index for the cron job — fast lookup of due sealed capsules
create index if not exists idx_capsules_delivery
  on public.capsules (delivery_at, status)
  where status = 'sealed';

create index if not exists idx_capsules_user
  on public.capsules (user_id, created_at desc);

-- ── Auto-update updated_at ─────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger capsules_updated_at before update on public.capsules
  for each row execute function public.set_updated_at();

-- ── Auto-create profile on sign-up ────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1))
  );
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Storage buckets ────────────────────────────────────────────
-- Run these individually if the SQL editor gives errors:

insert into storage.buckets (id, name, public)
  values ('capsule-media', 'capsule-media', false)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
  values ('seal-art', 'seal-art', false)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
  values ('cover-images', 'cover-images', false)
  on conflict (id) do nothing;

-- Storage RLS — users can only touch their own folder (userId/...)
create policy "Users manage own media"
  on storage.objects for all
  using (
    bucket_id in ('capsule-media','seal-art','cover-images')
    and auth.uid()::text = (storage.foldername(name))[1]
  );
