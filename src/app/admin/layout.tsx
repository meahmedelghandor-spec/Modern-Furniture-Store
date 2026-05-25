import { redirect } from 'next/navigation';
import { adminSupabase } from '@/lib/supabase/admin';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { SiteContentProvider } from '@/contexts/SiteContentContext';
import { getSiteContent } from '@/lib/site-content';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { ProfileRoleRow } from '@/types/database.types';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login?redirect=/admin');
  }

  const { data: profileData, error: profileError } = await adminSupabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .maybeSingle();

  const profile = profileData as ProfileRoleRow | null;

  if (profileError || profile?.role !== 'admin') {
    redirect('/');
  }

  const siteContent = await getSiteContent();

  return (
    <SiteContentProvider content={siteContent}>
      <div className="flex flex-1 min-h-0">
        <AdminSidebar
          userEmail={user.email ?? ''}
          userName={profile.full_name ?? 'Admin'}
        />
        <main className="flex-1 overflow-auto bg-muted/30">
          <div className="p-6 lg:p-8 max-w-screen-2xl mx-auto">{children}</div>
        </main>
      </div>
    </SiteContentProvider>
  );
}
