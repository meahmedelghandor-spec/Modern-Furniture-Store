import { adminSupabase } from '@/lib/supabase/admin';
import { getSiteContent } from '@/lib/site-content';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: product } = await adminSupabase
    .from('products')
    .select('name, description')
    .eq('id', id)
    .single();

  if (!product) return { title: 'الصنف غير موجود' };

  return {
    title: `نشتري: ${product.name} | نشتري أثاثك`,
    description: product.description ?? '',
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: product } = await adminSupabase
    .from('products')
    .select(`*, categories(name, slug)`)
    .eq('id', id)
    .single();

  if (!product) notFound();

  const { data: related } = await adminSupabase
    .from('products')
    .select('*')
    .eq('category_id', product.category_id)
    .neq('id', product.id)
    .limit(4);

  const { global } = await getSiteContent();

  return (
    <ProductDetailClient product={product} related={related ?? []} contact={global} />
  );
}
