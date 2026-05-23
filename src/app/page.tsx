import { adminSupabase } from '@/lib/supabase/admin';
import { getSiteContent } from '@/lib/site-content';
import Link from 'next/link';
import { Sofa, BedDouble, Briefcase, ChevronLeft, CheckCircle2, PhoneCall, Tag } from 'lucide-react';
import { Product } from '@/types/database.types';

export const revalidate = 60;

const categoryIcons: Record<string, React.ReactNode> = {
  'living-room': <Sofa className="h-5 w-5" />,
  'bedroom':     <BedDouble className="h-5 w-5" />,
  'office':      <Briefcase className="h-5 w-5" />,
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: categorySlug } = await searchParams;
  const { catalog } = await getSiteContent();

  const { data: categories } = await adminSupabase.from('categories').select('*').order('name');

  let query = adminSupabase.from('products').select('*').order('created_at', { ascending: false });
  if (categorySlug) {
    const cat = categories?.find((c) => c.slug === categorySlug);
    if (cat) query = query.eq('category_id', cat.id);
  }
  const { data: products } = await query;

  const activeCategory = categories?.find((c) => c.slug === categorySlug);

  return (
    <>
      {/* Hero Banner */}
      {!categorySlug && (
        <section className="relative overflow-hidden bg-gradient-to-bl from-primary/5 via-background to-accent/20 border-b">
          <div className="container mx-auto px-4 lg:px-8 py-16 md:py-24 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 text-center md:text-right">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                💰 نشتري أثاثك المستعمل بأفضل سعر
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                تخلّص من أثاثك
                <span className="block text-primary">واحصل على كاش فوري</span>
              </h1>
              <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto md:mx-0">
                نشتري أثاثك المستعمل — صالون، غرف نوم، مكاتب، وأكثر. تواصل معنا واحصل على عرض سعر مجاني خلال دقائق.
              </p>
              <div className="flex gap-3 justify-center md:justify-start flex-wrap">
                <Link href="#categories"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                  بيع أثاثك الآن
                  <ChevronLeft className="h-4 w-4" />
                </Link>
                <Link href="#how-it-works"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border bg-background font-semibold hover:bg-muted transition-colors">
                  كيف يعمل؟
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
                {[
                  { icon: '⚡', text: 'تقييم فوري' },
                  { icon: '💵', text: 'دفع كاش' },
                  { icon: '🚛', text: 'نجي ليك' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <span>{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 relative hidden md:block">
              <div className="relative w-full aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent rounded-3xl rotate-3" />
                <div className="absolute inset-0 overflow-hidden rounded-3xl -rotate-1 shadow-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80"
                    alt="أثاث مستعمل للبيع"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Floating price badge */}
                <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground rounded-2xl px-5 py-3 shadow-xl text-center">
                  <p className="text-xs opacity-80">احصل على</p>
                  <p className="text-2xl font-bold">كاش فوري</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      {!categorySlug && (
        <section id="how-it-works" className="border-b bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8 py-14">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-2">كيف نشتري أثاثك؟</h2>
              <p className="text-muted-foreground">3 خطوات بسيطة وتاخد فلوسك</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: '01', icon: <PhoneCall className="h-7 w-7" />, title: 'تواصل معنا', desc: 'ابعتلنا صور الأثاث أو اتصل بينا وهنرد عليك فوراً.' },
                { step: '02', icon: <Tag className="h-7 w-7" />, title: 'احصل على عرض سعر', desc: 'هنقيّم الأثاث ونعطيك أفضل سعر في السوق خلال دقائق.' },
                { step: '03', icon: <CheckCircle2 className="h-7 w-7" />, title: 'استلم كاشك', desc: 'بعد الاتفاق هنجي نشيل الأثاث من عندك وتاخد فلوسك فوراً.' },
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center text-center gap-4 p-6 rounded-2xl bg-background border hover:shadow-md transition-shadow">
                  <div className="relative">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      {item.icon}
                    </div>
                    <span className="absolute -top-2 -right-2 text-xs font-bold bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories / What we buy */}
      <div id="categories" className="container mx-auto px-4 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar Categories */}
          <aside className="w-full lg:w-56 flex-shrink-0">
            <div className="sticky top-24">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">نشتري منك</h2>
              <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 lg:overflow-x-visible">
                <Link
                  href="/"
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    !categorySlug
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>🛋️</span> الكل
                </Link>
                {categories?.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/catalog?category=${cat.slug}`}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      categorySlug === cat.slug
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {categoryIcons[cat.slug] ?? '📦'} {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Items We Buy Grid */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">
                  {activeCategory
                    ? `نشتري: ${activeCategory.name}`
                    : 'ما نشتريه من الأثاث'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeCategory
                    ? catalog.categoryDescriptions[activeCategory.slug] ?? catalog.defaultCategoryDesc
                    : `${products?.length ?? 0} نوع من الأثاث نستقبله`}
                </p>
              </div>
              <Link
                href="#how-it-works"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
              >
                كيف تبيع؟ <ChevronLeft className="h-3.5 w-3.5" />
              </Link>
            </div>

            {products && products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <BuyItemCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-5xl mb-4">📦</div>
                <h3 className="text-lg font-semibold mb-2">لا توجد أصناف</h3>
                <p className="text-muted-foreground">لا توجد أصناف في هذا القسم حالياً.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      {!categorySlug && (
        <section className="bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 lg:px-8 py-14 text-center">
            <h2 className="text-3xl font-bold mb-3">عندك أثاث مش محتاجه؟</h2>
            <p className="text-primary-foreground/80 mb-6 text-lg max-w-xl mx-auto">
              متتركهوش يغبّر. بيعه لينا دلوقتي واحصل على كاش في إيدك.
            </p>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-background text-foreground font-bold hover:bg-muted transition-colors shadow-lg"
            >
              ابدأ دلوقتي
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}
    </>
  );
}

// Inline buy item card — shows what we buy and estimated price we pay
function BuyItemCard({ product }: { product: Product }) {
  const buyPrice = product.discount_price ?? product.price;
  const imageUrl = product.images?.[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80';

  return (
    <div className="group overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Link
            href={`/catalog/${product.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-background text-foreground text-sm font-semibold shadow-lg hover:bg-muted transition-colors"
          >
            <Tag className="h-4 w-4" /> احصل على سعر
          </Link>
        </div>
        {product.is_featured && (
          <div className="absolute top-2 right-2">
            <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">⭐ مطلوب</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-grow flex flex-col gap-2">
        <h3 className="font-bold text-base leading-tight line-clamp-2">{product.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 flex-grow">{product.description}</p>
        <div className="flex items-center justify-between mt-2">
          <div>
            <p className="text-xs text-muted-foreground">نشتري بحتى</p>
            <p className="text-lg font-bold text-primary">{buyPrice.toLocaleString('ar-EG')} ج.م</p>
          </div>
          <Link
            href={`/catalog/${product.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
          >
            <Tag className="h-3.5 w-3.5" />
            بيع دلوقتي
          </Link>
        </div>
      </div>
    </div>
  );
}