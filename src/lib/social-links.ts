import type { ContactContent, SocialLinkItem, SocialPlatformId } from '@/types/site-content';

/** تحويل الصيغة القديمة (كائن ثابت) إلى قائمة ديناميكية */
export function normalizeSocialItems(contact: Partial<ContactContent> & Record<string, unknown>): SocialLinkItem[] {
  if (Array.isArray(contact.socialItems)) {
    return contact.socialItems
      .filter((item) => item?.url?.trim())
      .map((item, index) => ({
        id: item.id || `social-${index}`,
        platform: item.platform || 'custom',
        label: item.label,
        url: item.url.trim(),
      }));
  }

  const legacy = contact.socialLinks as Record<string, string> | undefined;
  if (legacy && typeof legacy === 'object') {
    const items: SocialLinkItem[] = [];
    let i = 0;
    for (const [key, url] of Object.entries(legacy)) {
      if (typeof url === 'string' && url.trim()) {
        items.push({
          id: `legacy-${key}-${i++}`,
          platform: key as SocialPlatformId,
          url: url.trim(),
        });
      }
    }
    return items;
  }

  return [];
}

export function resolveSocialItemsForDisplay(
  items: SocialLinkItem[],
  whatsappFallback?: string
): SocialLinkItem[] {
  const resolved = items.filter((i) => i.url.trim());
  const hasWhatsapp = resolved.some((i) => i.platform === 'whatsapp');

  if (!hasWhatsapp && whatsappFallback?.trim()) {
    const digits = whatsappFallback.replace(/\D/g, '');
    if (digits) {
      resolved.push({
        id: 'fallback-whatsapp',
        platform: 'whatsapp',
        url: `https://wa.me/${digits}`,
      });
    }
  }

  return resolved;
}
