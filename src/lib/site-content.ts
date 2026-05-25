import { cache } from 'react';
import { adminSupabase } from '@/lib/supabase/admin';
import { resolveCurrencyCode } from '@/lib/currency';
import { normalizeSocialItems } from '@/lib/social-links';
import {
  DEFAULT_SITE_CONTENT,
  type SiteContent,
  type SiteGlobal,
  type ContactContent,
} from '@/types/site-content';

function mergeRecords(
  defaults: Record<string, string>,
  partial?: Record<string, string>
): Record<string, string> {
  return { ...defaults, ...(partial ?? {}) };
}

function mergeContact(defaults: ContactContent, partial?: Partial<ContactContent>): ContactContent {
  const merged = { ...defaults, ...(partial ?? {}) };
  const socialItems = normalizeSocialItems({
    ...merged,
    socialItems: partial?.socialItems,
    socialLinks: (partial as ContactContent & { socialLinks?: Record<string, string> })?.socialLinks,
  });

  return {
    ...merged,
    socialItems: socialItems.length > 0 ? socialItems : defaults.socialItems,
  };
}

export function mergeSiteContent(
  defaults: SiteContent,
  partial?: Partial<SiteContent> | null
): SiteContent {
  if (!partial) return defaults;

  const globalPartial = partial.global;
  return {
    global: {
      ...defaults.global,
      ...(globalPartial ?? {}),
      currency: resolveCurrencyCode(
        globalPartial?.currency ?? defaults.global.currency
      ),
    },
    catalog: {
      ...defaults.catalog,
      ...(partial.catalog ?? {}),
      categoryDescriptions: mergeRecords(
        defaults.catalog.categoryDescriptions,
        partial.catalog?.categoryDescriptions
      ),
    },
    services: {
      ...defaults.services,
      ...(partial.services ?? {}),
      items:
        partial.services?.items && partial.services.items.length > 0
          ? partial.services.items
          : defaults.services.items,
    },
    about: {
      ...defaults.about,
      ...(partial.about ?? {}),
      paragraphs:
        partial.about?.paragraphs && partial.about.paragraphs.length > 0
          ? partial.about.paragraphs
          : defaults.about.paragraphs,
    },
    contact: mergeContact(defaults.contact, partial.contact),
  };
}

export const getSiteContent = cache(async (): Promise<SiteContent> => {
  const { data, error } = await adminSupabase
    .from('site_content')
    .select('content')
    .eq('id', 'main')
    .maybeSingle();

  if (error || !data?.content) {
    return DEFAULT_SITE_CONTENT;
  }

  return mergeSiteContent(DEFAULT_SITE_CONTENT, data.content as Partial<SiteContent>);
});

export function getGlobalContact(content: SiteContent): SiteGlobal {
  return content.global;
}
