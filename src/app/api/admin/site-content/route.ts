import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { adminSupabase } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { mergeSiteContent } from '@/lib/site-content';
import { DEFAULT_SITE_CONTENT, type SiteContent } from '@/types/site-content';
import type { ProfileRoleRow } from '@/types/database.types';

async function requireAdmin() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: NextResponse.json({ error: 'غير مصرح' }, { status: 401 }) };
  }

  const { data: profileData } = await adminSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  const profile = profileData as Pick<ProfileRoleRow, 'role'> | null;

  if (profile?.role !== 'admin') {
    return { error: NextResponse.json({ error: 'صلاحيات غير كافية' }, { status: 403 }) };
  }

  return { user };
}

export async function PUT(request: Request) {
  const auth = await requireAdmin();
  if ('error' in auth && auth.error) return auth.error;

  let body: Partial<SiteContent>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
  }

  const content = mergeSiteContent(DEFAULT_SITE_CONTENT, body);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (adminSupabase as any)
    .from('site_content')
    .upsert({ id: 'main', content, updated_at: new Date().toISOString() });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/', 'layout');
  revalidatePath('/catalog');
  revalidatePath('/services');
  revalidatePath('/about');
  revalidatePath('/contact');

  return NextResponse.json({ success: true, content });
}
