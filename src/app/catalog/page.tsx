import { adminSupabase } from '@/lib/supabase/admin';
import Link from 'next/link';
import { Sofa, BedDouble, Briefcase } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { getSiteContent } from '@/lib/site-content';
import type { Metadata } from 'next';

export const revalidate = 60;

const categoryIcons: Record<string, React.ReactNode> = {
  'living-room': <Sofa className="h-5 w-5" />,
  bedroom: <BedDouble className="h-5 w-5" />,
  office: <Briefcase className="h-5 w-5" />,
};

export async function generateMetadata(): Promise<Metadata> {
  const { catalog } = await getSiteContent();
  return {
    title: catalog.metaTitle,
    description: catalog.metaDescription,
  };
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: categorySlug } = await searchParams;
  const { catalog } = await getSiteContent();

  const { data: categories } = await adminSupabase
    .from('categories')
    .select('*')
    .order('name');

  let query = adminSupabase.from('products').select('*').order('created_at', { ascending: false });
  if (categorySlug) {
    const cat = categories?.find((c) => c.slug === categorySlug);
    if (cat) query = query.eq('category_id', cat.id);
  }
  const { data: products } = await query;

  const activeCategory = categories?.find((c) => c.slug === categorySlug);

  const categoryDesc = activeCategory
    ? catalog.categoryDescriptions[activeCategory.slug] ?? catalog.defaultCategoryDesc
    : null;

  return (
    <div className="container mx-auto px-4 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{catalog.pageTitle}</h1>
        <p className="text-muted-foreground">{catalog.pageSubtitle}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-56 flex-shrink-0">
          <div className="sticky top-24">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              {catalog.sidebarLabel}
            </h2>
            <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 lg:overflow-x-visible">
              <Link
                href="/catalog"
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

        <div className="flex-1 min-w-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              {activeCategory
                ? `${catalog.categoryTitlePrefix} ${activeCategory.name}`
                : catalog.allItemsTitle}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {activeCategory
                ? categoryDesc
                : `${products?.length ?? 0} نوع من الأثاث نستقبله`}
            </p>
          </div>

          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-5xl mb-4">📦</div>
              <h3 className="text-lg font-semibold mb-2">{catalog.emptyTitle}</h3>
              <p className="text-muted-foreground">{catalog.emptyMessage}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
