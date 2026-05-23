import { adminSupabase } from '@/lib/supabase/admin';
import CategoriesClient from './CategoriesClient';

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const { data: categories } = await adminSupabase
    .from('categories')
    .select('*')
    .order('name');

  // Get product counts per category
  const { data: products } = await adminSupabase.from('products').select('category_id');
  const countMap: Record<string, number> = {};
  products?.forEach((p: { category_id: string }) => { countMap[p.category_id] = (countMap[p.category_id] ?? 0) + 1; });

  return <CategoriesClient categories={categories ?? []} productCounts={countMap} />;
}
