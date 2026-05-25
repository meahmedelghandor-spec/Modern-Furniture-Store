'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Category } from '@/types/database.types';
import {
  type SiteContent,
  type ServiceItem,
  type SocialLinkItem,
  type SocialPlatformId,
  SERVICE_ICON_OPTIONS,
  SOCIAL_PLATFORM_OPTIONS,
} from '@/types/site-content';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, Plus, Trash2, Globe, ShoppingBag, Briefcase, Users, Phone } from 'lucide-react';

type TabId = 'global' | 'catalog' | 'services' | 'about' | 'contact';

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'global', label: 'عام', icon: Globe },
  { id: 'catalog', label: 'ما نشتريه', icon: ShoppingBag },
  { id: 'services', label: 'خدماتنا', icon: Briefcase },
  { id: 'about', label: 'من نحن', icon: Users },
  { id: 'contact', label: 'تواصل معنا', icon: Phone },
];

function Field({
  label,
  value,
  onChange,
  multiline,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {multiline ? (
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} />
      ) : (
        <Input value={value} onChange={(e) => onChange(e.target.value)} />
      )}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

interface Props {
  initialContent: SiteContent;
  categories: Category[];
}

export default function ContentClient({ initialContent, categories }: Props) {
  const router = useRouter();
  const [content, setContent] = useState<SiteContent>(initialContent);
  const [tab, setTab] = useState<TabId>('global');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const setGlobal = (patch: Partial<SiteContent['global']>) =>
    setContent((c) => ({ ...c, global: { ...c.global, ...patch } }));

  const setCatalog = (patch: Partial<SiteContent['catalog']>) =>
    setContent((c) => ({ ...c, catalog: { ...c.catalog, ...patch } }));

  const setCategoryDesc = (slug: string, desc: string) =>
    setContent((c) => ({
      ...c,
      catalog: {
        ...c.catalog,
        categoryDescriptions: { ...c.catalog.categoryDescriptions, [slug]: desc },
      },
    }));

  const setServices = (patch: Partial<SiteContent['services']>) =>
    setContent((c) => ({ ...c, services: { ...c.services, ...patch } }));

  const updateServiceItem = (index: number, patch: Partial<ServiceItem>) =>
    setContent((c) => {
      const items = [...c.services.items];
      items[index] = { ...items[index], ...patch };
      return { ...c, services: { ...c.services, items } };
    });

  const addServiceItem = () =>
    setContent((c) => ({
      ...c,
      services: {
        ...c.services,
        items: [...c.services.items, { icon: 'Tag', title: '', description: '' }],
      },
    }));

  const removeServiceItem = (index: number) =>
    setContent((c) => ({
      ...c,
      services: {
        ...c.services,
        items: c.services.items.filter((_, i) => i !== index),
      },
    }));

  const setAbout = (patch: Partial<SiteContent['about']>) =>
    setContent((c) => ({ ...c, about: { ...c.about, ...patch } }));

  const updateParagraph = (index: number, text: string) =>
    setContent((c) => {
      const paragraphs = [...c.about.paragraphs];
      paragraphs[index] = text;
      return { ...c, about: { ...c.about, paragraphs } };
    });

  const addParagraph = () =>
    setContent((c) => ({
      ...c,
      about: { ...c.about, paragraphs: [...c.about.paragraphs, ''] },
    }));

  const removeParagraph = (index: number) =>
    setContent((c) => ({
      ...c,
      about: { ...c.about, paragraphs: c.about.paragraphs.filter((_, i) => i !== index) },
    }));

  const setContact = (patch: Partial<SiteContent['contact']>) =>
    setContent((c) => ({ ...c, contact: { ...c.contact, ...patch } }));

  const newSocialId = () =>
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `social-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const addSocialItem = () =>
    setContent((c) => ({
      ...c,
      contact: {
        ...c.contact,
        socialItems: [
          ...c.contact.socialItems,
          { id: newSocialId(), platform: 'facebook', url: '' },
        ],
      },
    }));

  const updateSocialItem = (id: string, patch: Partial<SocialLinkItem>) =>
    setContent((c) => ({
      ...c,
      contact: {
        ...c.contact,
        socialItems: c.contact.socialItems.map((item) =>
          item.id === id ? { ...item, ...patch } : item
        ),
      },
    }));

  const removeSocialItem = (id: string) =>
    setContent((c) => ({
      ...c,
      contact: {
        ...c.contact,
        socialItems: c.contact.socialItems.filter((item) => item.id !== id),
      },
    }));

  useEffect(() => {
    if (!success) return;
    const t = window.setTimeout(() => setSuccess(false), 4000);
    return () => window.clearTimeout(t);
  }, [success]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    const res = await fetch('/api/admin/site-content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error ?? 'فشل الحفظ');
      setSaving(false);
      return;
    }

    setSuccess(true);
    setSaving(false);
    router.refresh();
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {success && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 max-w-sm w-[calc(100%-2rem)] rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800 text-center shadow-lg"
        >
          ✓ تم حفظ المحتوى بنجاح
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">محتوى الموقع</h1>
          <p className="text-muted-foreground text-sm mt-1">
            عدّل النصوص وأرقام التواصل في الصفحات العامة
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          حفظ التغييرات
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'global' && (
        <Card>
          <CardHeader>
            <CardTitle>إعدادات عامة</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="اسم الموقع" value={content.global.siteName} onChange={(v) => setGlobal({ siteName: v })} />
            <Field
              label="رقم الهاتف (للاتصال)"
              value={content.global.phone}
              onChange={(v) => setGlobal({ phone: v })}
              hint="مثال: +201012345678"
            />
            <Field
              label="عرض رقم الهاتف"
              value={content.global.phoneDisplay}
              onChange={(v) => setGlobal({ phoneDisplay: v })}
              hint="يظهر للزائر في صفحة التواصل"
            />
            <Field
              label="واتساب (بدون +)"
              value={content.global.whatsapp}
              onChange={(v) => setGlobal({ whatsapp: v })}
              hint="مثال: 201012345678"
            />
            <Field label="البريد الإلكتروني" value={content.global.email} onChange={(v) => setGlobal({ email: v })} />
            <Field label="العنوان" value={content.global.address} onChange={(v) => setGlobal({ address: v })} />
          </CardContent>
        </Card>
      )}

      {tab === 'catalog' && (
        <Card>
          <CardHeader>
            <CardTitle>صفحة ما نشتريه</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="عنوان SEO" value={content.catalog.metaTitle} onChange={(v) => setCatalog({ metaTitle: v })} />
              <Field
                label="وصف SEO"
                value={content.catalog.metaDescription}
                onChange={(v) => setCatalog({ metaDescription: v })}
              />
              <Field label="عنوان الصفحة" value={content.catalog.pageTitle} onChange={(v) => setCatalog({ pageTitle: v })} />
              <Field
                label="عنوان الشريط الجانبي"
                value={content.catalog.sidebarLabel}
                onChange={(v) => setCatalog({ sidebarLabel: v })}
              />
            </div>
            <Field
              label="وصف الصفحة"
              value={content.catalog.pageSubtitle}
              onChange={(v) => setCatalog({ pageSubtitle: v })}
              multiline
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="عنوان عند عرض الكل"
                value={content.catalog.allItemsTitle}
                onChange={(v) => setCatalog({ allItemsTitle: v })}
              />
              <Field
                label="بادئة عنوان التصنيف"
                value={content.catalog.categoryTitlePrefix}
                onChange={(v) => setCatalog({ categoryTitlePrefix: v })}
                hint="يُضاف قبل اسم التصنيف، مثل: نشتري:"
              />
            </div>
            <Field
              label="وصف التصنيف الافتراضي"
              value={content.catalog.defaultCategoryDesc}
              onChange={(v) => setCatalog({ defaultCategoryDesc: v })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="عنوان عدم وجود أصناف" value={content.catalog.emptyTitle} onChange={(v) => setCatalog({ emptyTitle: v })} />
              <Field
                label="رسالة عدم وجود أصناف"
                value={content.catalog.emptyMessage}
                onChange={(v) => setCatalog({ emptyMessage: v })}
                multiline
              />
            </div>

            {categories.length > 0 && (
              <div className="border-t pt-4 space-y-3">
                <p className="font-semibold text-sm">وصف كل تصنيف</p>
                {categories.map((cat) => (
                  <Field
                    key={cat.id}
                    label={`${cat.name} (${cat.slug})`}
                    value={content.catalog.categoryDescriptions[cat.slug] ?? ''}
                    onChange={(v) => setCategoryDesc(cat.slug, v)}
                    multiline
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'services' && (
        <Card>
          <CardHeader>
            <CardTitle>صفحة خدماتنا</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="عنوان SEO" value={content.services.metaTitle} onChange={(v) => setServices({ metaTitle: v })} />
              <Field
                label="وصف SEO"
                value={content.services.metaDescription}
                onChange={(v) => setServices({ metaDescription: v })}
              />
              <Field label="عنوان الصفحة" value={content.services.pageTitle} onChange={(v) => setServices({ pageTitle: v })} />
            </div>
            <Field
              label="وصف الصفحة"
              value={content.services.pageSubtitle}
              onChange={(v) => setServices({ pageSubtitle: v })}
              multiline
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="نص قبل الزر" value={content.services.ctaText} onChange={(v) => setServices({ ctaText: v })} />
              <Field label="نص الزر" value={content.services.ctaButton} onChange={(v) => setServices({ ctaButton: v })} />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold">بطاقات الخدمات</p>
                <Button type="button" variant="outline" size="sm" onClick={addServiceItem} className="gap-1">
                  <Plus className="h-4 w-4" /> إضافة خدمة
                </Button>
              </div>
              {content.services.items.map((item, i) => (
                <div key={i} className="rounded-lg border p-4 space-y-3 bg-muted/20">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">خدمة {i + 1}</span>
                    {content.services.items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => removeServiceItem(i)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>الأيقونة</Label>
                      <Select
                        value={item.icon}
                        onValueChange={(v) => updateServiceItem(i, { icon: v ?? 'Tag' })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_ICON_OPTIONS.map((icon) => (
                            <SelectItem key={icon} value={icon}>
                              {icon}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Field label="العنوان" value={item.title} onChange={(v) => updateServiceItem(i, { title: v })} />
                  </div>
                  <Field
                    label="الوصف"
                    value={item.description}
                    onChange={(v) => updateServiceItem(i, { description: v })}
                    multiline
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'about' && (
        <Card>
          <CardHeader>
            <CardTitle>صفحة من نحن</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="عنوان SEO" value={content.about.metaTitle} onChange={(v) => setAbout({ metaTitle: v })} />
              <Field
                label="وصف SEO"
                value={content.about.metaDescription}
                onChange={(v) => setAbout({ metaDescription: v })}
              />
              <Field label="عنوان الصفحة" value={content.about.pageTitle} onChange={(v) => setAbout({ pageTitle: v })} />
            </div>
            <Field
              label="المقدمة"
              value={content.about.pageSubtitle}
              onChange={(v) => setAbout({ pageSubtitle: v })}
              multiline
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">فقرات المحتوى</p>
                <Button type="button" variant="outline" size="sm" onClick={addParagraph} className="gap-1">
                  <Plus className="h-4 w-4" /> فقرة
                </Button>
              </div>
              {content.about.paragraphs.map((p, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Field label={`فقرة ${i + 1}`} value={p} onChange={(v) => updateParagraph(i, v)} multiline />
                  </div>
                  {content.about.paragraphs.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-8 text-red-600"
                      onClick={() => removeParagraph(i)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="نص زر ما نشتريه"
                value={content.about.catalogButton}
                onChange={(v) => setAbout({ catalogButton: v })}
              />
              <Field
                label="نص زر التواصل"
                value={content.about.contactButton}
                onChange={(v) => setAbout({ contactButton: v })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'contact' && (
        <Card>
          <CardHeader>
            <CardTitle>صفحة تواصل معنا</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="عنوان SEO" value={content.contact.metaTitle} onChange={(v) => setContact({ metaTitle: v })} />
            <Field
              label="وصف SEO"
              value={content.contact.metaDescription}
              onChange={(v) => setContact({ metaDescription: v })}
            />
            <Field label="عنوان الصفحة" value={content.contact.pageTitle} onChange={(v) => setContact({ pageTitle: v })} />
            <Field
              label="وصف الصفحة"
              value={content.contact.pageSubtitle}
              onChange={(v) => setContact({ pageSubtitle: v })}
              multiline
            />
            <Field
              label="عنوان قسم التواصل"
              value={content.contact.contactSectionTitle}
              onChange={(v) => setContact({ contactSectionTitle: v })}
            />
            <Field
              label="عنوان نموذج الرسالة"
              value={content.contact.formSectionTitle}
              onChange={(v) => setContact({ formSectionTitle: v })}
            />
            <Field label="تسمية الهاتف" value={content.contact.phoneLabel} onChange={(v) => setContact({ phoneLabel: v })} />
            <Field label="تسمية واتساب" value={content.contact.whatsappLabel} onChange={(v) => setContact({ whatsappLabel: v })} />
            <Field
              label="نص رابط واتساب"
              value={content.contact.whatsappLinkText}
              onChange={(v) => setContact({ whatsappLinkText: v })}
            />
            <Field label="تسمية البريد" value={content.contact.emailLabel} onChange={(v) => setContact({ emailLabel: v })} />
            <Field label="تسمية العنوان" value={content.contact.addressLabel} onChange={(v) => setContact({ addressLabel: v })} />
            <Field
              label="ملاحظة أسفل الصفحة"
              value={content.contact.footerNote}
              onChange={(v) => setContact({ footerNote: v })}
              multiline
            />
            <Field
              label="عنوان نجاح الإرسال"
              value={content.contact.formSuccessTitle}
              onChange={(v) => setContact({ formSuccessTitle: v })}
            />
            <Field
              label="رسالة نجاح الإرسال"
              value={content.contact.formSuccessMessage}
              onChange={(v) => setContact({ formSuccessMessage: v })}
              multiline
            />
            <div className="sm:col-span-2 space-y-4 rounded-lg border border-dashed p-4 bg-muted/20">
              <div>
                <Label className="font-semibold">عنوان قسم السوشيال ميديا</Label>
                <Input
                  className="mt-2"
                  value={content.contact.socialLinksTitle}
                  onChange={(e) => setContact({ socialLinksTitle: e.target.value })}
                  placeholder="تابعنا على"
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <span>🔗</span> روابط وسائل التواصل
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    أضف أي منصة (تيك توك، سناب، يوتيوب…). اترك الرابط فارغاً لإخفاء الأيقونة بعد الحفظ.
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addSocialItem} className="gap-1 shrink-0">
                  <Plus className="h-4 w-4" />
                  إضافة رابط
                </Button>
              </div>

              {content.contact.socialItems.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6 border rounded-lg border-dashed">
                  لا توجد روابط بعد. اضغط «إضافة رابط» لبدء الإضافة.
                </p>
              ) : (
                <div className="space-y-3">
                  {content.contact.socialItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="grid gap-3 p-3 rounded-lg border bg-background sm:grid-cols-[1fr_1fr_2fr_auto] items-end"
                    >
                      <div className="space-y-2">
                        <Label>المنصة</Label>
                        <Select
                          value={item.platform}
                          onValueChange={(v) =>
                            v && updateSocialItem(item.id, { platform: v as SocialPlatformId })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SOCIAL_PLATFORM_OPTIONS.map((opt) => (
                              <SelectItem key={opt.id} value={opt.id}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {item.platform === 'custom' ? (
                        <div className="space-y-2">
                          <Label>اسم المنصة</Label>
                          <Input
                            value={item.label ?? ''}
                            onChange={(e) => updateSocialItem(item.id, { label: e.target.value })}
                            placeholder="مثال: Threads"
                          />
                        </div>
                      ) : (
                        <div className="hidden sm:block" />
                      )}
                      <div className="space-y-2 sm:col-span-1">
                        <Label>الرابط</Label>
                        <Input
                          value={item.url}
                          onChange={(e) => updateSocialItem(item.id, { url: e.target.value })}
                          placeholder="https://..."
                          dir="ltr"
                          className="text-right"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-red-600 shrink-0"
                        onClick={() => removeSocialItem(item.id)}
                        aria-label={`حذف رابط ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                إن لم تُضف واتساب هنا، يُعرض رقم الواتساب من تبويب «عام» تلقائياً في الموقع.
              </p>
            </div>

            <div className="sm:col-span-2 space-y-2 rounded-lg border border-dashed p-4 bg-muted/20">
              <Label className="flex items-center gap-2 font-semibold">
                <span>📍</span> رابط خريطة جوجل (Google Maps Embed)
              </Label>
              <Input
                id="google-maps-url"
                value={content.contact.googleMapsUrl}
                onChange={(e) => setContact({ googleMapsUrl: e.target.value })}
                placeholder="https://www.google.com/maps/embed?pb=..."
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground">
                افتح Google Maps → شارك → تضمين الخريطة → انسخ الرابط من خاصية
                <code className="bg-muted px-1 rounded mx-1">src</code>
                الموجودة في كود الـ iframe. اتركه فارغاً لإخفاء الخريطة.
              </p>
              {content.contact.googleMapsUrl && (
                <div className="mt-2 rounded overflow-hidden border" style={{ height: 160 }}>
                  <iframe
                    src={content.contact.googleMapsUrl}
                    width="100%"
                    height="160"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="معاينة الخريطة"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground">
        ملاحظة: إذا ظهر خطأ عند الحفظ، نفّذ ملف{' '}
        <code className="bg-muted px-1 rounded">supabase/site_content.sql</code> في Supabase SQL Editor.
      </p>
    </div>
  );
}
