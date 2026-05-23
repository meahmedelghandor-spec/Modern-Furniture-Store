import { adminSupabase } from '@/lib/supabase/admin';
import { getSiteContent } from '@/lib/site-content';
import ContentClient from './ContentClient';

export default async function AdminContentPage() {
  const [content, { data: categories }] = await Promise.all([
    getSiteContent(),
    adminSupabase.from('categories').select('*').order('name'),
  ]);

  return <ContentClient initialContent={content} categories={categories ?? []} />;
}
