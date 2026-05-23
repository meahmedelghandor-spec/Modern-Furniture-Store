'use client';

import { useCart } from '@/store/useCart';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, HandCoins, ArrowLeft, Tag, PhoneCall, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const { items, removeItem, clearCart } = useCart();

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-10">
        <div className="h-8 w-48 bg-muted rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-36 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
          <div className="h-64 rounded-xl bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
        <HandCoins className="h-20 w-20 text-muted-foreground/30 mb-6" />
        <h1 className="text-2xl font-bold mb-2">قائمة البيع فارغة</h1>
        <p className="text-muted-foreground mb-8">
          تصفح الأنواع التي نشتريها وأضف الأثاث الذي تريد بيعه
        </p>
        <Link href="/">
          <Button size="lg" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            تصفح ما نشتريه
          </Button>
        </Link>
      </div>
    );
  }

  // Estimated total we'll pay
  const estimatedTotal = items.reduce((total, item) => {
    const price = item.product.discount_price ?? item.product.price;
    return total + price;
  }, 0);

  return (
    <div className="container mx-auto px-4 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">قائمة الأثاث للبيع</h1>
          <p className="text-sm text-muted-foreground mt-1">{items.length} صنف مضاف</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const price = item.product.discount_price ?? item.product.price;
            return (
              <Card key={item.product.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex gap-0">
                    {/* Image */}
                    <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex-shrink-0 bg-muted">
                      <Image
                        src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80'}
                        alt={item.product.name}
                        fill className="object-cover"
                        sizes="144px"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link href={`/catalog/${item.product.id}`}>
                            <h3 className="font-bold text-sm sm:text-base hover:text-primary transition-colors line-clamp-2">
                              {item.product.name}
                            </h3>
                          </Link>
                          <p className="text-xs text-muted-foreground mt-0.5">سعر الشراء المقدّر</p>
                          <p className="text-primary font-bold mt-0.5">{price.toLocaleString('ar-EG')} ج.م</p>
                        </div>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <p className="text-xs text-muted-foreground mt-2">
                        * السعر النهائي يُحدّد بعد المعاينة
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <div className="flex items-center justify-between pt-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                <ArrowLeft className="h-4 w-4" />
                إضافة المزيد
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={clearCart} className="text-muted-foreground">
              مسح القائمة
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-bold text-xl">ملخص طلب البيع</h2>
              <Separator />

              <div className="space-y-3">
                {items.map((item) => {
                  const price = item.product.discount_price ?? item.product.price;
                  return (
                    <div key={item.product.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground line-clamp-1 flex-1 ml-2">
                        {item.product.name}
                      </span>
                      <span className="font-medium flex-shrink-0">
                        ~{price.toLocaleString('ar-EG')} ج.م
                      </span>
                    </div>
                  );
                })}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">إجمالي السعر المقدّر</span>
                  <span className="font-bold text-primary text-base">
                    ~{estimatedTotal.toLocaleString('ar-EG')} ج.م
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  * الأسعار تقديرية، يتم تأكيد السعر بعد المعاينة
                </p>
              </div>

              <Separator />

              <Link href="/checkout" className="block">
                <Button className="w-full gap-2" size="lg">
                  <Tag className="h-4 w-4" />
                  اطلب تقييم مجاني
                </Button>
              </Link>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <a
                  href="tel:+20100000000"
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border bg-background text-sm font-medium hover:bg-muted transition-colors"
                >
                  <PhoneCall className="h-3.5 w-3.5" />
                  اتصل بنا
                </a>
                <a
                  href="https://wa.me/20100000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-green-500 text-green-600 text-sm font-medium hover:bg-green-50 transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  واتساب
                </a>
              </div>

              <div className="flex justify-center gap-4 text-xs text-muted-foreground">
                {['⚡ تقييم فوري', '💵 كاش فوري', '🚛 نجي ليك'].map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
