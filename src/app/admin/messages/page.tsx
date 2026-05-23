import { adminSupabase } from '@/lib/supabase/admin';
import type { ContactMessage } from '@/types/database.types';
import MessagesClient from './MessagesClient';

export default async function AdminMessagesPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: messages, error } = await (adminSupabase as any)
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900">
        <h2 className="font-bold mb-2">جدول الرسائل غير موجود</h2>
        <p className="text-sm">
          نفّذ ملف <code className="bg-white/80 px-1 rounded">supabase/contact_messages.sql</code> في
          Supabase SQL Editor ثم حدّث الصفحة.
        </p>
        <p className="text-xs mt-2 opacity-80">{error.message}</p>
      </div>
    );
  }

  return <MessagesClient messages={(messages ?? []) as ContactMessage[]} />;
}
