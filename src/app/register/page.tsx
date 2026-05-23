'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

/** Translate Supabase English error messages → Arabic */
function translateAuthError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('password should be at least') || lower.includes('weak password') || lower.includes('422'))
    return 'كلمة المرور ضعيفة جداً. يجب أن تكون 6 أحرف على الأقل وتحتوي على أرقام وحروف.';
  if (lower.includes('user already registered') || lower.includes('already been registered') || lower.includes('already exists'))
    return 'البريد الإلكتروني مسجّل بالفعل. يرجى تسجيل الدخول أو استخدام بريد آخر.';
  if (lower.includes('invalid email'))
    return 'صيغة البريد الإلكتروني غير صحيحة.';
  if (lower.includes('email rate limit') || lower.includes('too many requests'))
    return 'محاولات كثيرة جداً. يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.';
  if (lower.includes('network') || lower.includes('fetch') || lower.includes('failed to fetch'))
    return 'تعذّر الاتصال بالخادم. تحقق من اتصالك بالإنترنت.';
  if (lower.includes('signup is disabled'))
    return 'التسجيل معطّل حالياً. يرجى التواصل مع الإدارة.';
  if (lower.includes('422') || lower.includes('unprocessable'))
    return 'البيانات المدخلة غير صحيحة. تحقق من صحة البريد الإلكتروني وقوة كلمة المرور.';

  // Fallback
  return message;
}

/** Client-side password strength check before hitting the API */
function validatePassword(password: string): string | null {
  if (password.length < 6)
    return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.';
  if (!/[a-zA-Z]/.test(password) && !/[0-9]/.test(password))
    return 'كلمة المرور يجب أن تحتوي على حروف وأرقام.';
  return null; // valid
}

export default function RegisterPage() {
  const [fullName, setFullName]     = useState('');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // ── Client-side validation (avoids a wasted API round-trip) ─────────────
    if (!fullName.trim()) {
      setError('يرجى إدخال اسمك بالكامل.');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    try {
      // ── 1. Create auth user ───────────────────────────────────────────────
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName.trim() },
        },
      });

      if (authError) {
        setError(translateAuthError(authError.message));
        return; // finally will reset loading
      }

      // Supabase returns a user with identities=[] when the email already
      // exists AND "Confirm email" is enabled — handle that edge case.
      if (!authData.user || authData.user.identities?.length === 0) {
        setError('البريد الإلكتروني مسجّل بالفعل. يرجى تسجيل الدخول أو استخدام بريد آخر.');
        return;
      }

      // ── 2. Create profile row ─────────────────────────────────────────────
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: authData.user.id,
          full_name: fullName.trim(),
          role: 'client',
        },
      ]);

      // Profile creation failure is non-blocking (user is still created),
      // but we log it for debugging.
      if (profileError) {
        console.warn('[register] profile insert failed:', profileError.message);
      }

      // ── 3. Navigate on success ────────────────────────────────────────────
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(translateAuthError(err?.message ?? 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'));
    } finally {
      // Always reset loading — guards against every error path
      setLoading(false);
    }
  };

  /* Password strength indicator */
  const passwordStrength = (() => {
    if (!password) return null;
    if (password.length < 6) return { level: 0, label: 'ضعيفة جداً', color: 'bg-red-500' };
    if (password.length < 8 || !/[0-9]/.test(password)) return { level: 1, label: 'مقبولة', color: 'bg-amber-500' };
    if (password.length >= 8 && /[0-9]/.test(password) && /[a-zA-Z]/.test(password))
      return { level: 2, label: 'قوية', color: 'bg-green-500' };
    return { level: 1, label: 'مقبولة', color: 'bg-amber-500' };
  })();

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="flex justify-center mb-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">إنشاء حساب جديد</CardTitle>
          <CardDescription>أدخل بياناتك لإنشاء حساب مجاناً</CardDescription>
        </CardHeader>

        <form onSubmit={handleRegister} noValidate>
          <CardContent className="space-y-4">
            {/* Error Banner */}
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="reg-fullName">الاسم بالكامل *</Label>
              <Input
                id="reg-fullName"
                type="text"
                placeholder="محمد أحمد"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="reg-email">البريد الإلكتروني *</Label>
              <Input
                id="reg-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                dir="ltr"
                disabled={loading}
              />
            </div>

            {/* Password + toggle visibility */}
            <div className="space-y-2">
              <Label htmlFor="reg-password">كلمة المرور *</Label>
              <div className="relative">
                <Input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="6 أحرف على الأقل"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  dir="ltr"
                  disabled={loading}
                  className="pl-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Strength bar */}
              {passwordStrength && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i <= passwordStrength.level ? passwordStrength.color : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${
                    passwordStrength.level === 0 ? 'text-red-500' :
                    passwordStrength.level === 1 ? 'text-amber-600' : 'text-green-600'
                  }`}>
                    قوة كلمة المرور: {passwordStrength.label}
                  </p>
                </div>
              )}
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
                  جاري إنشاء الحساب...
                </>
              ) : (
                'إنشاء الحساب'
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              لديك حساب بالفعل؟{' '}
              <Link href="/login" className="text-primary font-medium hover:underline">
                تسجيل الدخول
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
