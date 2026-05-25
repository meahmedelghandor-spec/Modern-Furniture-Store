import { cache } from 'react';
import { adminSupabase } from '@/lib/supabase/admin';
import {
  DEFAULT_SITE_CONTENT,
  type SiteContent,
  type SiteGlobal,
} from '@/types/site-content';

function mergeRecords(
  defaults: Record<string, string>,
  partial?: Record<string, string>
): Record<string, string> {
  return { ...defaults, ...(partial ?? {}) };
}

export function mergeSiteContent(
  defaults: SiteContent,
  partial?: Partial<SiteContent> | null
): SiteContent {
  if (!partial) return defaults;

  return {
    global: { ...defaults.global, ...(partial.global ?? {}) },
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
    contact: {
      ...defaults.contact,
      ...(partial.contact ?? {}),
      socialLinks: {
        ...defaults.contact.socialLinks,
        ...(partial.contact?.socialLinks ?? {}),
      },
    },
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
