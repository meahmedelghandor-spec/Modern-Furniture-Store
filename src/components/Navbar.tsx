'use client';

import Link from 'next/link';
import {
  User,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  HandCoins,
  ChevronDown,
  Tag,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteContent } from '@/contexts/SiteContentContext';

const navLinks = [
  { href: '/', label: 'الرئيسية' },
  { href: '/catalog', label: 'ما نشتريه' },
  { href: '/services', label: 'خدماتنا' },
  { href: '/about', label: 'من نحن' },
  { href: '/contact', label: 'تواصل معنا' },
];

function AuthSkeleton() {
  return (
    <div className="flex items-center gap-2" aria-hidden="true">
      <div className="h-8 w-14 rounded-md bg-muted animate-pulse" />
      <div className="h-8 w-20 rounded-md bg-muted animate-pulse" />
    </div>
  );
}

function GuestAuthLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <Link href="/login" onClick={onNavigate}>
        <Button variant="ghost" size="sm">
          دخول
        </Button>
      </Link>
      <Link href="/register" onClick={onNavigate}>
        <Button size="sm">إنشاء حساب</Button>
      </Link>
    </div>
  );
}

function UserAuthMenu({ onNavigate }: { onNavigate?: () => void }) {
  const { user, role, signOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    onNavigate?.();
    await signOut();
    router.push('/');
    router.refresh();
  };

  const displayName =
    user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'حسابي';

  return (
    <div className="flex items-center gap-2">
      {role === 'admin' && (
        <Link href="/admin" onClick={onNavigate} className="hidden sm:block">
          <Button size="sm" variant="outline" className="gap-1.5">
            <LayoutDashboard className="h-4 w-4" />
            لوحة التحكم
          </Button>
        </Link>
      )}

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-expanded={open}
          aria-haspopup="menu"
        >
          <User className="h-4 w-4" />
          <span className="max-w-[120px] truncate hidden sm:inline">{displayName}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </button>

        {open && (
          <div
            role="menu"
            className="absolute left-0 top-full z-50 mt-1 min-w-[180px] rounded-md border bg-background py-1 shadow-lg"
          >
            <Link
              href="/profile"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
            >
              <User className="h-4 w-4" />
              حسابي
            </Link>
            {role === 'admin' && (
              <Link
                href="/admin"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onNavigate?.();
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted sm:hidden"
              >
                <LayoutDashboard className="h-4 w-4" />
                لوحة التحكم
              </Link>
            )}
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              تسجيل الخروج
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isInitialized } = useAuth();
  const { global } = useSiteContent();

  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/'
      ? pathname === '/'
      : pathname === href || pathname.startsWith(`${href}/`);

  const renderAuth = (onNavigate?: () => void) => {
    if (!isInitialized) return <AuthSkeleton />;
    if (user) return <UserAuthMenu onNavigate={onNavigate} />;
    return <GuestAuthLinks onNavigate={onNavigate} />;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-110">
            <HandCoins className="h-4 w-4" />
          </div>
          <span className="text-xl font-bold tracking-tight">{global.siteName}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Sell CTA button */}
          <Link href="/cart">
            <Button size="sm" className="gap-1.5 hidden sm:inline-flex">
              <Tag className="h-4 w-4" />
              قائمة البيع
            </Button>
          </Link>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-2">{renderAuth()}</div>

          <button
            type="button"
            className="flex md:hidden h-9 w-9 items-center justify-center rounded-md hover:bg-muted transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t bg-background px-4 py-4 space-y-2 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-muted"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/cart"
            onClick={() => setMobileOpen(false)}
            className="block"
          >
            <Button size="sm" className="w-full gap-2 mt-1">
              <Tag className="h-4 w-4" />
              قائمة البيع
            </Button>
          </Link>
          <div className="border-t pt-2 mt-2">{renderAuth(() => setMobileOpen(false))}</div>
        </div>
      )}
    </header>
  );
}
