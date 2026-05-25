'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * انتقالات سلسة بين الصفحات + كشف تدريجي للأقسام عند التمرير
 */
export default function SiteMotion({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const targets = document.querySelectorAll<HTMLElement>(
      'main section, main article, main .container > div[class*="rounded"], main .container > section'
    );

    targets.forEach((el, index) => {
      if (el.closest('[data-no-reveal]')) return;
      el.classList.add('reveal-on-scroll');
      el.style.setProperty('--reveal-delay', `${Math.min(index * 70, 420)}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );

    document.querySelectorAll('.reveal-on-scroll:not(.is-visible)').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [pathname]);

  return (
    <div key={pathname} className="page-enter flex-1 flex flex-col min-h-0">
      {children}
    </div>
  );
}
