'use client';

import { useSiteContent } from '@/contexts/SiteContentContext';
import { resolveSocialItemsForDisplay } from '@/lib/social-links';
import type { SocialLinkItem } from '@/types/site-content';
import {
  SocialPlatformIcon,
  getPlatformLabel,
  PLATFORM_STYLES,
} from '@/components/social/SocialPlatformIcon';

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

interface Props {
  items: SocialLinkItem[];
  whatsappFallback?: string;
  title?: string;
  showTitle?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export default function SocialLinks({
  items,
  whatsappFallback,
  title,
  showTitle = false,
  size = 'md',
  className = '',
}: Props) {
  const resolved = resolveSocialItemsForDisplay(items, whatsappFallback);

  if (resolved.length === 0) return null;

  const box = size === 'sm' ? 'h-9 w-9' : 'h-11 w-11';
  const icon = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {showTitle && title && (
        <p className="text-sm font-medium text-muted-foreground motion-fade-in">{title}</p>
      )}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {resolved.map((item, index) => {
          const href = normalizeUrl(item.url);
          const styles = PLATFORM_STYLES[item.platform] ?? PLATFORM_STYLES.custom;
          const label = getPlatformLabel(item.platform, item.label);

          return (
            <a
              key={item.id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              title={label}
              style={{ animationDelay: `${index * 60}ms` }}
              className={`${box} rounded-full flex items-center justify-center transition-all duration-300 ease-out motion-fade-in ${styles.idle} ${styles.hover}`}
            >
              <SocialPlatformIcon platform={item.platform} className={icon} />
            </a>
          );
        })}
      </div>
    </div>
  );
}

export function SocialLinksFromContext({
  showTitle = false,
  size = 'sm',
  className = '',
}: {
  showTitle?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const { contact, global } = useSiteContent();
  return (
    <SocialLinks
      items={contact.socialItems}
      whatsappFallback={global.whatsapp}
      title={contact.socialLinksTitle}
      showTitle={showTitle}
      size={size}
      className={className}
    />
  );
}
