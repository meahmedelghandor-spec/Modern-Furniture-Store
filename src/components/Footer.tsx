import Link from 'next/link';
import { HandCoins } from 'lucide-react';
import { getSiteContent } from '@/lib/site-content';

const footerLinks = [
  { href: '/', label: 'الرئيسية' },
  { href: '/catalog', label: 'ما نشتريه' },
  { href: '/services', label: 'خدماتنا' },
  { href: '/about', label: 'من نحن' },
  { href: '/contact', label: 'تواصل معنا' },
];

export default async function Footer() {
  const { global } = await getSiteContent();

  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <HandCoins className="h-4 w-4" />
            </div>
            <span className="font-bold">{global.siteName}</span>
          </Link>

          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          © {new Date().getFullYear()} {global.siteName}. جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  );
}
