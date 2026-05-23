'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingBag, Tag,
  Store, LogOut, ChevronLeft, FileText, Mail,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/admin',            label: 'الرئيسية',   icon: LayoutDashboard },
  { href: '/admin/products',   label: 'المنتجات',   icon: Package },
  { href: '/admin/categories', label: 'الأقسام',    icon: Tag },
  { href: '/admin/orders',     label: 'الطلبات',    icon: ShoppingBag },
  { href: '/admin/messages',   label: 'رسائل التواصل', icon: Mail },
  { href: '/admin/content',    label: 'محتوى الموقع', icon: FileText },
];

export default function AdminSidebar({ userEmail, userName }: { userEmail: string; userName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-card border-l flex flex-col min-h-full hidden lg:flex shadow-sm">
      {/* Brand */}
      <div className="p-6 border-b">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Store className="h-4 w-4" />
          </div>
          <div>
            <p className="font-bold text-sm">أثاث مودرن</p>
            <p className="text-xs text-muted-foreground">لوحة التحكم</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-3 mb-3">القائمة</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t space-y-3">
        <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors">
          <ChevronLeft className="h-4 w-4" />
          العودة للمتجر
        </Link>
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
            {userName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
