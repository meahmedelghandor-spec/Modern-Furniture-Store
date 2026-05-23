-- Run in Supabase SQL Editor: evaluation requests + RLS for users & admins

create table if not exists public.evaluation_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  estimated_price numeric not null default 0,
  status text not null default 'pending'
    check (status in ('pending', 'shipped', 'delivered', 'cancelled')),
  phone text not null,
  address text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists evaluation_requests_created_at_idx
  on public.evaluation_requests (created_at desc);

create index if not exists evaluation_requests_user_id_idx
  on public.evaluation_requests (user_id);

create index if not exists evaluation_requests_status_idx
  on public.evaluation_requests (status);

alter table public.evaluation_requests enable row level security;

-- Helper: check admin role (bypasses RLS on profiles when reading)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_admin() to anon;

-- Users: insert own requests
drop policy if exists "evaluation_requests_user_insert" on public.evaluation_requests;
create policy "evaluation_requests_user_insert"
  on public.evaluation_requests
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users: read own requests
drop policy if exists "evaluation_requests_user_select" on public.evaluation_requests;
create policy "evaluation_requests_user_select"
  on public.evaluation_requests
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Admins: read ALL evaluation requests
drop policy if exists "evaluation_requests_admin_select" on public.evaluation_requests;
create policy "evaluation_requests_admin_select"
  on public.evaluation_requests
  for select
  to authenticated
  using (public.is_admin());

-- Admins: update status / fields
drop policy if exists "evaluation_requests_admin_update" on public.evaluation_requests;
create policy "evaluation_requests_admin_update"
  on public.evaluation_requests
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Admins: delete
drop policy if exists "evaluation_requests_admin_delete" on public.evaluation_requests;
create policy "evaluation_requests_admin_delete"
  on public.evaluation_requests
  for delete
  to authenticated
  using (public.is_admin());

-- Legacy combined policy (remove if exists)
drop policy if exists "evaluation_requests_admin_all" on public.evaluation_requests;
