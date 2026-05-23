-- Run this if you ALREADY created evaluation_requests before.
-- Fixes FK (for PostgREST joins), RLS for admin read, and policies.

-- 1) Point user_id to profiles (required for profiles(...) embed in API)
alter table public.evaluation_requests
  drop constraint if exists evaluation_requests_user_id_fkey;

alter table public.evaluation_requests
  add constraint evaluation_requests_user_id_fkey
  foreign key (user_id) references public.profiles (id) on delete cascade;

-- 2) Admin helper
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

-- 3) RLS policies
alter table public.evaluation_requests enable row level security;

drop policy if exists "evaluation_requests_admin_all" on public.evaluation_requests;

drop policy if exists "evaluation_requests_user_insert" on public.evaluation_requests;
create policy "evaluation_requests_user_insert"
  on public.evaluation_requests for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "evaluation_requests_user_select" on public.evaluation_requests;
create policy "evaluation_requests_user_select"
  on public.evaluation_requests for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "evaluation_requests_admin_select" on public.evaluation_requests;
create policy "evaluation_requests_admin_select"
  on public.evaluation_requests for select to authenticated
  using (public.is_admin());

drop policy if exists "evaluation_requests_admin_update" on public.evaluation_requests;
create policy "evaluation_requests_admin_update"
  on public.evaluation_requests for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "evaluation_requests_admin_delete" on public.evaluation_requests;
create policy "evaluation_requests_admin_delete"
  on public.evaluation_requests for delete to authenticated
  using (public.is_admin());
