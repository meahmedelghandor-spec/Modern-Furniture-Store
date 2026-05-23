import { adminSupabase } from '@/lib/supabase/admin';
import ProductsClient from './ProductsClient';

export const revalidate = 0;

export default async function AdminProductsPage() {
  const { data: products } = await adminSupabase
    .from('products')
    .select('*, categories(name)')
    .order('created_at', { ascending: false });

  const { data: categories } = await adminSupabase
    .from('categories')
    .select('*')
    .order('name');

  return <ProductsClient products={products ?? []} categories={categories ?? []} />;
}
