import { adminSupabase } from '@/lib/supabase/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingBag, Users, TrendingUp, ArrowUpRight, Clock } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboard() {
  const [
    { count: productCount },
    { count: orderCount },
    { count: userCount },
    { data: recentOrders },
    { data: lowStock },
  ] = await Promise.all([
    adminSupabase.from('products').select('*', { count: 'exact', head: true }),
    adminSupabase.from('orders').select('*', { count: 'exact', head: true }),
    adminSupabase.from('profiles').select('*', { count: 'exact', head: true }),
    adminSupabase.from('orders').select('*, profiles(full_name)').order('created_at', { ascending: false }).limit(5),
    adminSupabase.from('products').select('id, name, stock').lt('stock', 5).order('stock'),
  ]);

  // Calculate revenue
  const { data: ordersData } = await adminSupabase.from('orders').select('total_amount');
  const totalRevenue = ordersData?.reduce((sum, o) => sum + o.total_amount, 0) ?? 0;

  const stats = [
    { label: 'إجمالي الأصناف', value: productCount ?? 0, icon: Package, href: '/admin/products', color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'طلبات الشراء', value: orderCount ?? 0, icon: ShoppingBag, href: '/admin/orders', color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'المستخدمين', value: userCount ?? 0, icon: Users, href: '#', color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'إجمالي المدفوع (ج.م)', value: totalRevenue.toLocaleString('ar-EG'), icon: TrendingUp, href: '#', color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  const statusMap: Record<string, string> = {
    pending: 'قيد المراجعة', shipped: 'تم الاستلام', delivered: 'تم الشراء', cancelled: 'ملغي',
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">لوحة التحكم</h1>
        <p className="text-muted-foreground mt-1">مرحباً بك! إليك ملخص عمليات شراء الأثاث اليوم.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold mb-1">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">آخر طلبات الشراء</CardTitle>
            <Link href="/admin/orders" className="text-sm text-primary hover:underline flex items-center gap-1">
              عرض الكل <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders?.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                      {(order.profiles as any)?.full_name?.charAt(0) ?? '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{(order.profiles as any)?.full_name ?? 'مستخدم'}</p>
                      <p className="text-xs text-muted-foreground">#{order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="text-left flex flex-col items-end gap-1">
                    <span className="text-sm font-bold">{order.total_amount.toLocaleString('ar-EG')} ج.م</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {statusMap[order.status] ?? order.status}
                    </span>
                  </div>
                </div>
              ))}
              {!recentOrders?.length && (
                <p className="text-center text-muted-foreground py-6 text-sm">لا توجد طلبات بعد</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-lg">تنبيه الأصناف</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStock?.map((product) => (
                <div key={product.id} className="flex items-center justify-between py-1">
                  <p className="text-sm line-clamp-1 flex-1 ml-2">{product.name}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    product.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {product.stock === 0 ? 'نفد' : `${product.stock} متبقي`}
                  </span>
                </div>
              ))}
              {!lowStock?.length && (
                <p className="text-center text-muted-foreground py-4 text-sm">✓ المخزون كافٍ</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
