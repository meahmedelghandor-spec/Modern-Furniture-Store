import type { RequestAttachment } from '@/types/request-attachment';

export function parseAttachments(raw: unknown): RequestAttachment[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (item): item is RequestAttachment =>
      !!item &&
      typeof item === 'object' &&
      typeof (item as RequestAttachment).url === 'string' &&
      ((item as RequestAttachment).kind === 'image' ||
        (item as RequestAttachment).kind === 'video')
  );
}
