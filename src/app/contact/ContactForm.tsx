'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface Props {
  successTitle: string;
  successMessage: string;
}

export default function ContactForm({ successTitle, successMessage }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const form = new FormData(e.currentTarget);
    const name = String(form.get('name') ?? '').trim();
    const phone = String(form.get('phone') ?? '').trim();
    const message = String(form.get('message') ?? '').trim();

    if (!name || !phone || !message) {
      setError('يرجى ملء جميع الحقول');
      setSaving(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertError } = await (supabase as any)
      .from('contact_messages')
      .insert({ name, phone, message, status: 'new' });

    setSaving(false);

    if (insertError) {
      setError(insertError.message || 'تعذّر إرسال الرسالة. حاول مرة أخرى.');
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border bg-primary/5 border-primary/20 p-8 text-center">
        <p className="text-2xl mb-2">✓</p>
        <h3 className="text-lg font-bold mb-2">{successTitle}</h3>
        <p className="text-muted-foreground text-sm">{successMessage}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="name">الاسم</Label>
        <Input id="name" name="name" required placeholder="اسمك الكامل" disabled={saving} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">رقم الهاتف</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          required
          placeholder="01xxxxxxxxx"
          dir="ltr"
          className="text-right"
          disabled={saving}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">رسالتك</Label>
        <Textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="صف الأثاث الذي تريد بيعه أو اكتب استفسارك..."
          disabled={saving}
        />
      </div>
      <Button type="submit" className="w-full gap-2" disabled={saving}>
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            جاري الإرسال...
          </>
        ) : (
          'إرسال الرسالة'
        )}
      </Button>
    </form>
  );
}
