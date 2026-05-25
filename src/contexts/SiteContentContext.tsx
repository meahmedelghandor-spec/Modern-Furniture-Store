'use client';

import { useCallback, useContext, createContext } from 'react';
import { formatPrice, getCurrencyFromGlobal } from '@/lib/currency';
import { DEFAULT_SITE_CONTENT, type SiteContent } from '@/types/site-content';

const SiteContentContext = createContext<SiteContent>(DEFAULT_SITE_CONTENT);

export function SiteContentProvider({
  content,
  children,
}: {
  content: SiteContent;
  children: React.ReactNode;
}) {
  return (
    <SiteContentContext.Provider value={content}>{children}</SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  return useContext(SiteContentContext);
}

/** تنسيق السعر حسب العملة المختارة في محتوى الموقع */
export function useFormatPrice() {
  const { global } = useSiteContent();
  const code = getCurrencyFromGlobal(global);
  return useCallback(
    (amount: number, options?: { approximate?: boolean }) =>
      formatPrice(amount, code, options),
    [code]
  );
}
