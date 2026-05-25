-- مرفقات طلبات التقييم وقائمة البيع + تخزين Supabase
-- نفّذ في Supabase SQL Editor بعد evaluation_requests.sql

-- أعمدة المرفقات (مصفوفة JSON: [{ url, kind, name? }])
alter table public.evaluation_requests
  add column if not exists attachments jsonb not null default '[]'::jsonb;

alter table public.orders
  add column if not exists attachments jsonb not null default '[]'::jsonb;

-- دلو التخزين (قراءة عامة للروابط — الرفع مقيّد بالمستخدم)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'request-attachments',
  'request-attachments',
  true,
  15728640,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- رفع: المستخدم يرفع داخل مجلد user_id فقط
drop policy if exists "request_attachments_insert_own" on storage.objects;
create policy "request_attachments_insert_own"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'request-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- قراءة: صاحب الملف أو الأدمن
drop policy if exists "request_attachments_select_own" on storage.objects;
create policy "request_attachments_select_own"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'request-attachments'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );

-- حذف: صاحب الملف أو الأدمن
drop policy if exists "request_attachments_delete_own" on storage.objects;
create policy "request_attachments_delete_own"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'request-attachments'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );
