'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useCart } from '@/store/useCart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import Link from 'next/link';
import RequestMediaUpload from '@/components/RequestMediaUpload';
import FormattedPrice from '@/components/FormattedPrice';
import { uploadRequestMedia } from '@/lib/upload-request-media';
import type { RequestAttachment } from '@/types/request-attachment';
import { HandCoins, Tag, CheckCircle2, Loader2 } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    notes: '',
  });
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          router.push('/login?next=/checkout');
          return;
        }

        if (!cancelled) setUser(session.user);

        // Pre-fill from profile — failures are non-blocking
        try {
          const { data: profile } = await supabase
            .from('profiles').select('*').eq('id', session.user.id).single();
          if (profile && !cancelled) {
            setForm((prev) => ({
              ...prev,
              fullName: profile.full_name ?? '',
              phone:    profile.phone    ?? '',
              address:  profile.address  ?? '',
            }));
          }
        } catch {
          // Profile fetch failed — form stays empty, user can fill manually
        }
      } catch (err) {
        console.error('[checkout] session error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    init();
    return () => { cancelled = true; };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setSubmitting(true);
    setError(null);

    // Create sell request / order
    const estimatedTotal = items.reduce((total, item) => {
      const price = item.product.discount_price ?? item.product.price;
      return total + price;
    }, 0);

    let attachments: RequestAttachment[] = [];
    if (mediaFiles.length > 0) {
      const { attachments: uploaded, error: uploadError } = await uploadRequestMedia(
        user.id,
        mediaFiles
      );
      if (uploadError) {
        setError(uploadError);
        setSubmitting(false);
        return;
      }
      attachments = uploaded;
    }

    const { data: order, error: orderError } = await supabase.from('orders').insert({
      user_id: user.id,
      total_amount: estimatedTotal,
      status: 'pending',
      shipping_address: form.address,
      phone: form.phone,
      attachments,
    }).select().single();

    if (orderError || !order) {
      setError('حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى.');
      setSubmitting(false);
      return;
    }

    // Insert requested items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product.id,
      quantity: 1,
      price: item.product.discount_price ?? item.product.price,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

    if (itemsError) {
      setError('حدث خطأ أثناء تسجيل الأصناف.');
      setSubmitting(false);
      return;
    }

    // Update user profile with latest info
    await supabase.from('profiles').update({
      full_name: form.fullName,
      phone: form.phone,
      address: form.address,
    }).eq('id', user.id);

    clearCart();
    router.push(`/checkout/success?orderId=${order.id}`);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
        <HandCoins className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">قائمة البيع فارغة</h2>
        <p className="text-muted-foreground mb-6">أضف الأثاث الذي تريد بيعه أولاً.</p>
        <Link href="/"><Button>تصفح ما نشتريه</Button></Link>
      </div>
    );
  }

  const estimatedTotal = items.reduce((total, item) => {
    const price = item.product.discount_price ?? item.product.price;
    return total + price;
  }, 0);

  return (
    <div className="container mx-auto px-4 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Tag className="h-5 w-5 text-primary" />
        <h1 className="text-3xl font-bold">طلب تقييم الأثاث</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">بيانات التواصل والاستلام</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">
                    {error}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">الاسم بالكامل *</Label>
                    <Input
                      id="fullName"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      required
                      placeholder="محمد أحمد"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف *</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      required
                      placeholder="01xxxxxxxxx"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">عنوان الأثاث (مكان الاستلام) *</Label>
                  <Textarea
                    id="address"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    required
                    placeholder="المحافظة، المدينة، الحي، الشارع، رقم المبنى..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">وصف حالة الأثاث (اختياري)</Label>
                  <Textarea
                    id="notes"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="صف حالة الأثاث، عمره، أي تلفيات موجودة..."
                    rows={3}
                  />
                </div>
                <RequestMediaUpload
                  files={mediaFiles}
                  onChange={setMediaFiles}
                  disabled={submitting}
                />
              </CardContent>
            </Card>

            {/* How it works notice */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="text-2xl mt-0.5">📞</div>
                <div>
                  <p className="font-semibold">ماذا يحدث بعد ذلك؟</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    سيتواصل معك فريقنا خلال ساعات قليلة لتحديد موعد المعاينة وتأكيد السعر النهائي. الدفع كاش فور الاستلام.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Items Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-xl">الأثاث المراد بيعه</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {items.map((item) => {
                    const itemPrice = item.product.discount_price ?? item.product.price;
                    return (
                      <div key={item.product.id} className="flex items-center gap-3">
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <Image
                            src={item.product.images?.[0] || ''}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            <FormattedPrice amount={itemPrice} approximate />
                          </p>
                        </div>
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      </div>
                    );
                  })}
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">إجمالي السعر المقدّر</span>
                    <FormattedPrice
                      amount={estimatedTotal}
                      approximate
                      className="font-bold text-primary"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    * السعر النهائي يُحدّد بعد المعاينة الفعلية
                  </p>
                </div>

                <Separator />

                <Button type="submit" className="w-full gap-2" size="lg" disabled={submitting}>
                  {submitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin ml-2" /> جاري الإرسال...</>
                  ) : (
                    <><Tag className="h-4 w-4" /> أرسل طلب التقييم</>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  سنتواصل معك قريباً لتأكيد الموعد والسعر
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
