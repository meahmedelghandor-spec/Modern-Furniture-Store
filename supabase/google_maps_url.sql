-- ============================================================
-- Migration: إضافة googleMapsUrl إلى قسم contact في site_content
-- التاريخ: 2026-05-24
-- ============================================================
-- يتحقّق من وجود صف الإعدادات الرئيسي ويضيف المفتاح إن لم يكن موجوداً.
-- الجدول موجود مسبقاً وبه عمود JSONB باسم content.
-- ============================================================

-- 1. أضف مفتاح googleMapsUrl افتراضياً إن لم يكن موجوداً في الصف الحالي
UPDATE site_content
SET content = jsonb_set(
  content,
  '{contact,googleMapsUrl}',
  '""'::jsonb,
  true            -- create_missing = true
)
WHERE id = 'main'
  AND NOT (content -> 'contact' ? 'googleMapsUrl');

-- ملاحظة: لا حاجة لإنشاء جدول جديد.
-- قيمة الرابط تُحفظ وتُقرأ عبر API /api/admin/site-content الموجودة مسبقاً.
