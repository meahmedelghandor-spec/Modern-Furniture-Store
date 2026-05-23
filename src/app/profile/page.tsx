'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Package, Loader2, CheckCircle2, Clock, Truck, Home } from 'lucide-react';
import { Profile, Order } from '@/types/database.types';

const statusMap: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pending:   { label: 'قيد المراجعة', icon: <Clock className="h-3 w-3" />,       color: 'bg-amber-100 text-amber-700 border-amber-200' },
  shipped:   { label: 'تم الاستلام',     icon: <Truck className="h-3 w-3" />,        color: 'bg-blue-100 text-blue-700 border-blue-200' },
  delivered: { label: 'تم الشراء والدفع',   icon: <CheckCircle2 className="h-3 w-3" />, color: 'bg-green-100 text-green-700 border-green-200' },
  cancelled: { label: 'ملغي',          icon: null,                                  color: 'bg-red-100 text-red-700 border-red-200' },
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<(Order & { order_items: any[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');

  const [form, setForm] = useState({ full_name: '', phone: '', address: '' });

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          router.push('/login');
          return; // loading reset in finally
        }

        if (!cancelled) setUser(session.user);

        // Fetch profile — non-blocking failure
        try {
          const { data: profileData } = await supabase
            .from('profiles').select('*').eq('id', session.user.id).single();
          if (profileData && !cancelled) {
            setProfile(profileData);
            setForm({
              full_name: profileData.full_name ?? '',
              phone:     profileData.phone     ?? '',
              address:   profileData.address   ?? '',
            });
          }
        } catch { /* profile fetch failed — show empty form */ }

        // Fetch orders — non-blocking failure
        try {
          const { data: ordersData } = await supabase
            .from('orders')
            .select('*, order_items(*, products(name, images))')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });
          if (ordersData && !cancelled) setOrders(ordersData as any);
        } catch { /* orders fetch failed — show empty list */ }

      } catch (err) {
        console.error('[profile] session error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    init();
    return () => { cancelled = true; };
  }, [router]);


  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await supabase.from('profiles').update(form).eq('id', user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{profile?.full_name || 'حسابي'}</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b pb-0">
        {[
          { key: 'profile', label: 'بيانات الحساب', icon: <User className="h-4 w-4" /> },
          { key: 'orders', label: `طلبات البيع (${orders.length})`, icon: <Package className="h-4 w-4" /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>تعديل البيانات الشخصية</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">الاسم بالكامل</Label>
                  <Input id="full_name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} dir="ltr" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">العنوان</Label>
                <Textarea id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>البريد الإلكتروني</Label>
                <Input value={user?.email ?? ''} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">لا يمكن تعديل البريد الإلكتروني</p>
              </div>
              <Button type="submit" disabled={saving} className="gap-2">
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> جاري الحفظ...</> : saved ? '✓ تم الحفظ' : 'حفظ التغييرات'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">لا توجد طلبات</h3>
              <p className="text-muted-foreground mb-6">لم تقم بأي طلب بيع بعد.</p>
              <Button onClick={() => router.push('/')}>تصفح ما نشتريه</Button>
            </div>
          ) : (
            orders.map((order) => {
              const status = statusMap[order.status] ?? statusMap['pending'];
              return (
                <Card key={order.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">رقم الطلب</p>
                        <p className="font-mono font-bold">#{order.id.slice(0, 8).toUpperCase()}</p>
                      </div>
                      <Badge className={`border ${status.color} flex items-center gap-1`}>
                        {status.icon} {status.label}
                      </Badge>
                      <div className="text-left">
                        <p className="text-xs text-muted-foreground mb-1">التاريخ</p>
                        <p className="text-sm">{new Date(order.created_at).toLocaleDateString('ar-EG')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">الإجمالي</p>
                        <p className="font-bold text-primary">{order.total_amount.toLocaleString('ar-EG')} ج.م</p>
                      </div>
                    </div>
                    <Separator className="my-3" />
                    <p className="text-xs text-muted-foreground mb-1">
                      {order.order_items?.length ?? 0} عنصر
                    </p>
                    {order.shipping_address && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Home className="h-3 w-3" /> {order.shipping_address}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
