-- SMARTHIRE database schema
-- Run this in the Supabase SQL editor of a NEW project, top to bottom, in one go.
-- (Use the "Run" button — it runs all statements as a single batch. Don't use
-- "Explain" — that only works on a single SELECT.)
--
-- Re-running on an existing project will fail at `create type` because
-- Postgres has no IF NOT EXISTS for enums. To re-apply, drop the project's
-- public schema first or wrap statements in DO blocks.
--
-- Security model overview:
--   * `public.users.role` is the ONLY trusted source of truth for "is this user an admin?".
--     Application code MUST query this column (never user_metadata.role, which is
--     user-modifiable through the Supabase auth API).
--   * The `handle_new_user` trigger ALWAYS writes role='candidate' regardless of
--     the signup payload. Admins must be promoted manually via the SQL helper at
--     the bottom of this file (or via the Supabase dashboard).
--   * Public flows (browse jobs, submit application) work without auth via tight
--     RLS policies. The public application form goes through a server action that
--     uses the service-role key to bypass RLS while doing its own Zod validation.
--   * The `cvs` storage bucket is PRIVATE. Reads happen via short-lived signed
--     URLs generated server-side for HR admins. Uploads are also done server-side.

-- ============================================================================
-- 1. Enums
-- ============================================================================

create type public.user_role as enum ('candidate', 'admin');

create type public.application_status as enum (
  'applied',
  'reviewing',
  'interview',
  'accepted',
  'rejected'
);

-- ============================================================================
-- 2. Tables
-- ============================================================================

-- Users (mirrors auth.users for app-level metadata + role).
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  role public.user_role not null default 'candidate',
  created_at timestamptz not null default now()
);

-- Jobs.
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  short_description text not null,
  description text not null,
  requirements text not null,
  location text,
  employment_type text,
  is_open boolean not null default true,
  created_at timestamptz not null default now()
);

-- Applications.
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  user_id uuid references public.users (id) on delete set null,
  full_name text not null,
  email text not null,
  phone text not null,
  experience text not null,
  skills text not null,
  cv_path text not null,
  status public.application_status not null default 'applied',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Comments.
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  author_id uuid not null references public.users (id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 3. Functions (declared BEFORE any policy that references them)
-- ============================================================================

-- Auto-create a public.users row when a new auth user signs up.
-- IMPORTANT: role is hardcoded to 'candidate'. Even if a malicious signup
-- sends `data: { role: 'admin' }`, that value is ignored. Promote admins via
-- the helper at the bottom of this file.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    'candidate'
  );
  return new;
end;
$$;

-- Keep updated_at fresh on application row updates.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Is the current request from an admin?
-- Used inside RLS policies on every table + the storage bucket.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'admin'
  );
$$;

-- ============================================================================
-- 4. Triggers
-- ============================================================================

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger applications_set_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 5. Indexes
-- ============================================================================

create index applications_job_id_idx on public.applications (job_id);
create index applications_status_idx on public.applications (status);
create index applications_created_at_idx on public.applications (created_at desc);
create index comments_application_id_idx on public.comments (application_id);

-- ============================================================================
-- 6. View
-- ============================================================================

-- Joins comments with the trusted author name from public.users so the UI
-- cannot be fooled by a manipulated user_metadata.full_name.
create or replace view public.comments_with_author as
  select
    c.id,
    c.application_id,
    c.author_id,
    coalesce(u.full_name, u.email) as author_name,
    c.text,
    c.created_at
  from public.comments c
  left join public.users u on u.id = c.author_id;

-- ============================================================================
-- 7. Storage bucket (PRIVATE)
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('cvs', 'cvs', false)
on conflict (id) do update set public = false;

-- ============================================================================
-- 8. Enable RLS
-- ============================================================================

alter table public.users enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.comments enable row level security;

-- ============================================================================
-- 9. Policies (is_admin() now exists, so these resolve cleanly)
-- ============================================================================

-- USERS ----------------------------------------------------------------------
-- No INSERT/UPDATE/DELETE policies on public.users → only the trigger and the
-- service role can write. Users CANNOT promote themselves to admin.
create policy "Admins can read all users"
  on public.users for select
  using (public.is_admin());

create policy "Users can read self"
  on public.users for select
  using (auth.uid() = id);

-- JOBS — public read of OPEN jobs only; admins manage everything. ------------
create policy "Anyone can read open jobs"
  on public.jobs for select
  using (is_open = true or public.is_admin());

create policy "Admins manage jobs"
  on public.jobs for all
  using (public.is_admin())
  with check (public.is_admin());

-- APPLICATIONS — closed by default. Public submission goes through a server
-- action using the service-role key. HR reads/updates via the anon key.
create policy "Admins read all applications"
  on public.applications for select
  using (public.is_admin());

create policy "Candidates read own applications"
  on public.applications for select
  using (auth.uid() is not null and auth.uid() = user_id);

-- Admins may only update the status column. (Postgres RLS doesn't restrict
-- columns directly, but keeping the policy explicit + relying on the server
-- action to only set status is the practical safeguard.)
create policy "Admins update applications"
  on public.applications for update
  using (public.is_admin())
  with check (public.is_admin());

-- COMMENTS — admin-only. -----------------------------------------------------
create policy "Admins read comments"
  on public.comments for select
  using (public.is_admin());

create policy "Admins write comments"
  on public.comments for insert
  with check (public.is_admin() and auth.uid() = author_id);

create policy "Admins delete own comments"
  on public.comments for delete
  using (public.is_admin() and auth.uid() = author_id);

-- STORAGE — admin-only fallback. The application server action uses the
-- service-role key, which bypasses RLS, so we don't need a public-insert
-- policy. Locking the bucket down keeps things safe even if a key leaks.
create policy "Admins read CVs"
  on storage.objects for select
  using (bucket_id = 'cvs' and public.is_admin());

create policy "Admins write CVs (fallback)"
  on storage.objects for insert
  with check (bucket_id = 'cvs' and public.is_admin());

create policy "Admins update CVs (fallback)"
  on storage.objects for update
  using (bucket_id = 'cvs' and public.is_admin());

create policy "Admins delete CVs (fallback)"
  on storage.objects for delete
  using (bucket_id = 'cvs' and public.is_admin());

-- ============================================================================
-- 10. Promote a user to admin
-- ============================================================================
-- Run this AFTER the user has signed up via Authentication → Users → Add user.
-- Replace the email with the real one.
--
--   update public.users set role = 'admin' where email = 'hr@smarthire.example';
--
-- Optional but recommended: disable email signups in the Supabase dashboard
-- (Authentication → Providers → Email → "Enable Sign Ups" off). Candidates
-- apply as guests through the public form, so signups aren't needed.
