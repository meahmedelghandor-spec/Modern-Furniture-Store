'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronLeft, Tag, CheckCircle2, PhoneCall, MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Product } from '@/types/database.types';
import type { SiteGlobal } from '@/types/site-content';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';

interface Props {
  product: Product & { categories: { name: string; slug: string } | null };
  related: Product[];
  contact: SiteGlobal;
}

type ProfileSnippet = {
  full_name: string | null;
  phone: string | null;
  address: string | null;
};

export default function ProductDetailClient({ product, related, contact }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isInitialized } = useAuth();

  const [selectedImage, setSelectedImage] = useState(0);
  const [profile, setProfile] = useState<ProfileSnippet | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [requested, setRequested] = useState(false);

  const [form, setForm] = useState({ phone: '', address: '', notes: '' });

  const images = product.images?.length
    ? product.images
    : ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'];

  const buyPrice = product.discount_price ?? product.price;

  const loadProfile = useCallback(async (userId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('profiles')
      .select('full_name, phone, address')
      .eq('id', userId)
      .maybeSingle();

    if (data) {
      setProfile(data);
      setForm({
        phone: data.phone ?? '',
        address: data.address ?? '',
        notes: '',
      });
    }
  }, []);

  useEffect(() => {
    if (user?.id) void loadProfile(user.id);
    else setProfile(null);
  }, [user?.id, loadProfile]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const submitEvaluation = async (phone: string, address: string | null, notes: string | null) => {
    if (!user) return;

    setSubmitting(true);
    setFormError(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('evaluation_requests').insert({
      user_id: user.id,
      product_id: product.id,
      estimated_price: buyPrice,
      status: 'pending',
      phone: phone.trim(),
      address: address?.trim() || null,
      notes: notes?.trim() || null,
    });

    if (error) {
      setFormError(error.message || 'تعذّر إرسال الطلب. حاول مرة أخرى.');
      setSubmitting(false);
      return false;
    }

    // Keep profile in sync
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('profiles')
      .update({
        phone: phone.trim(),
        ...(address?.trim() ? { address: address.trim() } : {}),
      })
      .eq('id', user.id);

    setSubmitting(false);
    setModalOpen(false);
    setRequested(true);
    setToast('✓ تم إرسال طلب التقييم! سنتواصل معك قريباً.');
    window.setTimeout(() => setRequested(false), 5000);
    return true;
  };

  const handleRequestQuote = async () => {
    if (!isInitialized) return;

    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    const phone = (profile?.phone ?? form.phone).trim();

    if (!phone) {
      setFormError(null);
      setModalOpen(true);
      return;
    }

    await submitEvaluation(phone, profile?.address ?? form.address, null);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phone = form.phone.trim();
    if (!phone) {
      setFormError('رقم الهاتف مطلوب');
      return;
    }
    await submitEvaluation(phone, form.address, form.notes);
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 max-w-sm w-[calc(100%-2rem)] rounded-xl border bg-background px-4 py-3 text-sm font-medium shadow-lg text-center animate-in fade-in slide-in-from-bottom-2"
        >
          {toast}
        </div>
      )}

      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">
          الرئيسية
        </Link>
        <ChevronLeft className="h-4 w-4 rotate-180" />
        <Link href="/catalog" className="hover:text-foreground transition-colors">
          ما نشتريه
        </Link>
        <ChevronLeft className="h-4 w-4 rotate-180" />
        {product.categories && (
          <>
            <Link
              href={`/catalog?category=${product.categories.slug}`}
              className="hover:text-foreground transition-colors"
            >
              {product.categories.name}
            </Link>
            <ChevronLeft className="h-4 w-4 rotate-180" />
          </>
        )}
        <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted shadow-lg">
            <Image
              src={images[selectedImage]}
              alt={product.name}
              fill
              className="object-cover transition-opacity duration-300"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            {product.is_featured && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-amber-500 text-white text-sm px-3 py-1">⭐ مطلوب بشدة</Badge>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 transition-all ring-2 ${
                    selectedImage === idx
                      ? 'ring-primary'
                      : 'ring-transparent hover:ring-muted-foreground/40'
                  }`}
                >
                  <Image src={img} alt={`صورة ${idx + 1}`} fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          {product.categories && (
            <Link href={`/catalog?category=${product.categories.slug}`}>
              <Badge variant="secondary" className="text-xs">
                {product.categories.name}
              </Badge>
            </Link>
          )}

          <h1 className="text-3xl font-bold leading-tight">{product.name}</h1>

          <div className="rounded-2xl bg-primary/5 border border-primary/20 p-5">
            <p className="text-sm text-muted-foreground mb-1">سعر الشراء المقدّر</p>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold text-primary">
                {buyPrice.toLocaleString('ar-EG')} ج.م
              </span>
              {product.discount_price !== null && product.discount_price < product.price && (
                <span className="text-lg text-muted-foreground line-through mb-1">
                  {product.price.toLocaleString('ar-EG')} ج.م
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">* السعر النهائي يُحدّد بعد المعاينة</p>
          </div>

          <Separator />

          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          <Separator />

          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-green-600">نستقبل هذا الصنف الآن</span>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              size="lg"
              onClick={() => void handleRequestQuote()}
              disabled={submitting || !isInitialized}
              className="w-full gap-2 shadow-lg shadow-primary/20 transition-all"
              variant={requested ? 'secondary' : 'default'}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <Tag className="h-5 w-5" />
                  {requested ? '✓ تم استلام طلبك! سنتواصل معك قريباً' : 'اطلب تقييم مجاني'}
                </>
              )}
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border bg-background font-semibold text-sm hover:bg-muted transition-colors"
              >
                <PhoneCall className="h-4 w-4" />
                اتصل بنا
              </a>
              <a
                href={`https://wa.me/${contact.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-green-500 text-green-600 font-semibold text-sm hover:bg-green-50 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                واتساب
              </a>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: '⚡', label: 'تقييم فوري' },
              { icon: '💵', label: 'دفع كاش' },
              { icon: '🚛', label: 'شيل مجاني' },
            ].map((badge) => (
              <div
                key={badge.label}
                className="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted/50 text-center"
              >
                <span className="text-2xl">{badge.icon}</span>
                <span className="text-xs font-medium">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">أصناف أخرى نشتريها</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((p) => (
              <RelatedCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إكمال طلب التقييم</DialogTitle>
            <DialogDescription>
              أدخل رقم هاتفك لنتواصل معك بخصوص: <strong>{product.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => void handleModalSubmit(e)} className="space-y-4">
            {formError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="eval-phone">رقم الهاتف *</Label>
              <Input
                id="eval-phone"
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="01xxxxxxxxx"
                dir="ltr"
                className="text-right"
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eval-address">العنوان (اختياري)</Label>
              <Input
                id="eval-address"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="المنطقة / العنوان للمعاينة"
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eval-notes">ملاحظات (اختياري)</Label>
              <Textarea
                id="eval-notes"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="حالة الأثاث، مقاسات، إلخ..."
                disabled={submitting}
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} disabled={submitting}>
                إلغاء
              </Button>
              <Button type="submit" disabled={submitting} className="gap-2">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Tag className="h-4 w-4" />}
                إرسال الطلب
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RelatedCard({ product }: { product: Product }) {
  const buyPrice = product.discount_price ?? product.price;
  const imageUrl =
    product.images?.[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80';
  return (
    <Link
      href={`/catalog/${product.id}`}
      className="group overflow-hidden rounded-2xl border border-border/60 bg-card transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, 25vw"
        />
      </div>
      <div className="p-3 flex flex-col gap-1">
        <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
        <p className="text-xs text-muted-foreground">نشتري بحتى</p>
        <p className="text-base font-bold text-primary">{buyPrice.toLocaleString('ar-EG')} ج.م</p>
      </div>
    </Link>
  );
}
