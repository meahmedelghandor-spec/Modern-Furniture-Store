'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

/** Translate Supabase English error messages → Arabic */
function translateAuthError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('invalid login credentials') || lower.includes('invalid email or password'))
    return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
  if (lower.includes('email not confirmed'))
    return 'يرجى تأكيد بريدك الإلكتروني أولاً. تحقق من صندوق الوارد.';
  if (lower.includes('too many requests'))
    return 'محاولات كثيرة جداً. يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.';
  if (lower.includes('user not found'))
    return 'لا يوجد حساب مرتبط بهذا البريد الإلكتروني.';
  if (lower.includes('network') || lower.includes('fetch'))
    return 'تعذّر الاتصال بالخادم. تحقق من اتصالك بالإنترنت.';

  // Fallback — show original message so we can debug
  return message;
}

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // بدء التحميل
    setError(null);   // تفريغ الأخطاء القديمة

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      // 1. في حالة وجود خطأ (مثل كلمة سر خاطئة)
      if (authError) {
        setError(translateAuthError(authError.message));
        setLoading(false); // إيقاف التحميل صراحةً هنا
        return; 
      }

      // 2. في حالة النجاح
      // استخدام window.location بيحل مشاكل الـ Cache والـ Cookies في Next.js
      // وبيقفل التحميل تلقائياً لأنه بينقل المستخدم لصفحة جديدة تماماً
      const redirectTo =
        new URLSearchParams(window.location.search).get('redirect') || '/';
      window.location.href = redirectTo;
      
    } catch (err: any) {
      // 3. في حالة انقطاع الإنترنت أو خطأ برمجي
      setError(translateAuthError(err?.message ?? 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'));
      setLoading(false); // إيقاف التحميل صراحةً هنا
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="flex justify-center mb-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl">🔑</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">تسجيل الدخول</CardTitle>
          <CardDescription>
            أدخل بريدك الإلكتروني وكلمة المرور للوصول إلى حسابك
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleLogin} noValidate>
          <CardContent className="space-y-4">
            {/* Error Banner */}
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="login-email">البريد الإلكتروني</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                dir="ltr"
                disabled={loading}
                className={error ? 'border-destructive/50' : ''}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password">كلمة المرور</Label>
              </div>
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                dir="ltr"
                disabled={loading}
                className={error ? 'border-destructive/50' : ''}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full gap-2"
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                'تسجيل الدخول'
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              ليس لديك حساب؟{' '}
              <Link href="/register" className="text-primary font-medium hover:underline">
                سجل الآن
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
