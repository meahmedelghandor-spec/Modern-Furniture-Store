'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tag, Eye, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/store/useCart';
import { Product } from '@/types/database.types';
import FormattedPrice from '@/components/FormattedPrice';
import { useState } from 'react';

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCart((state) => state.addItem);
  const cartItems = useCart((state) => state.items);
  const [adding, setAdding] = useState(false);

  const buyPrice = product.discount_price ?? product.price;
  const isInList = cartItems.some((item) => item.product.id === product.id);
  const imageUrl = product.images?.[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80';

  const handleAdd = () => {
    if (isInList) return;
    setAdding(true);
    addItem(product);
    setTimeout(() => setAdding(false), 800);
  };

  return (
    <Card className="motion-card overflow-hidden flex flex-col group border-border/60">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Link href={`/catalog/${product.id}`}>
            <Button size="sm" variant="secondary" className="gap-2">
              <Eye className="h-4 w-4" /> عرض التفاصيل
            </Button>
          </Link>
        </div>
        {/* Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {product.is_featured && (
            <Badge className="bg-amber-500 text-white text-xs px-2">⭐ مطلوب</Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4 flex-grow">
        <Link href={`/catalog/${product.id}`} className="block">
          <h3 className="font-bold text-base leading-tight mb-1 hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {product.description}
        </p>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">نشتري بحتى</span>
          <FormattedPrice amount={buyPrice} className="text-lg font-bold text-primary" />
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleAdd}
          className="w-full gap-2 transition-all"
          disabled={isInList || adding}
          variant={isInList ? 'secondary' : 'default'}
        >
          {isInList ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              تمت الإضافة للقائمة
            </>
          ) : adding ? (
            '✓ تمت الإضافة'
          ) : (
            <>
              <Tag className="h-4 w-4" />
              أضف لقائمة البيع
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
