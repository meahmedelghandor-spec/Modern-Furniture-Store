'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Mail, Search, Eye, Trash2, Phone, Clock, CheckCircle2, Archive } from 'lucide-react';
import type { ContactMessage } from '@/types/database.types';

const statusConfig = {
  new: { label: 'جديدة', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  read: { label: 'مقروءة', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  archived: { label: 'مؤرشفة', className: 'bg-muted text-muted-foreground border-border' },
} as const;

export default function MessagesClient({ messages: initial }: { messages: ContactMessage[] }) {
  const [messages, setMessages] = useState(initial);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | ContactMessage['status']>('all');
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = messages.filter((m) => {
    const q = search.trim();
    const matchSearch =
      !q ||
      m.name.includes(q) ||
      m.phone.includes(q) ||
      m.message.includes(q);
    const matchStatus = filter === 'all' || m.status === filter;
    return matchSearch && matchStatus;
  });

  const counts = {
    all: messages.length,
    new: messages.filter((m) => m.status === 'new').length,
    read: messages.filter((m) => m.status === 'read').length,
    archived: messages.filter((m) => m.status === 'archived').length,
  };

  const updateStatus = async (id: string, status: ContactMessage['status']) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('contact_messages')
      .update({ status })
      .eq('id', id);

    if (!error) {
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
      if (selected?.id === id) setSelected({ ...selected, status });
    }
  };

  const openMessage = (msg: ContactMessage) => {
    setSelected(msg);
    if (msg.status === 'new') {
      void updateStatus(msg.id, 'read');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('contact_messages').delete().eq('id', deleteId);
    if (!error) {
      setMessages((prev) => prev.filter((m) => m.id !== deleteId));
      if (selected?.id === deleteId) setSelected(null);
    }
    setDeleteId(null);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('ar-EG', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Mail className="h-8 w-8 text-primary" />
          رسائل التواصل
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {messages.length} رسالة — {counts.new} جديدة
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(
          [
            ['all', 'الكل', counts.all],
            ['new', 'جديدة', counts.new],
            ['read', 'مقروءة', counts.read],
            ['archived', 'مؤرشفة', counts.archived],
          ] as const
        ).map(([key, label, count]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === key ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="بحث بالاسم، الهاتف، أو نص الرسالة..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-10"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Mail className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>لا توجد رسائل</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((msg) => {
            const st = statusConfig[msg.status];
            return (
              <div
                key={msg.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold">{msg.name}</span>
                    <Badge variant="outline" className={st.className}>
                      {st.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1" dir="ltr">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    {msg.phone}
                  </p>
                  <p className="text-sm line-clamp-2 mt-1">{msg.message}</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(msg.created_at)}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => openMessage(msg)}>
                    <Eye className="h-4 w-4" />
                    عرض
                  </Button>
                  {msg.status !== 'archived' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateStatus(msg.id, 'archived')}
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600"
                    onClick={() => setDeleteId(msg.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  رسالة من {selected.name}
                  <Badge variant="outline" className={statusConfig[selected.status].className}>
                    {statusConfig[selected.status].label}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">الهاتف</p>
                  <a href={`tel:${selected.phone}`} className="font-medium" dir="ltr">
                    {selected.phone}
                  </a>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">التاريخ</p>
                  <p>{formatDate(selected.created_at)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">الرسالة</p>
                  <p className="leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {selected.status !== 'read' && selected.status !== 'archived' && (
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => updateStatus(selected.id, 'read')}>
                      <CheckCircle2 className="h-4 w-4" />
                      مقروءة
                    </Button>
                  )}
                  {selected.status !== 'archived' && (
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => updateStatus(selected.id, 'archived')}>
                      <Archive className="h-4 w-4" />
                      أرشفة
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    className="gap-1 mr-auto"
                    onClick={() => {
                      setDeleteId(selected.id);
                      setSelected(null);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    حذف
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الرسالة؟</AlertDialogTitle>
            <AlertDialogDescription>لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
