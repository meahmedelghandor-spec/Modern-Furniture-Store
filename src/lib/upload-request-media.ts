import { supabase } from '@/lib/supabase/client';
import type { RequestAttachment } from '@/types/request-attachment';

const BUCKET = 'request-attachments';
const MAX_FILES = 6;
const MAX_BYTES = 15 * 1024 * 1024;

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const VIDEO_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime']);

function attachmentKind(mime: string): 'image' | 'video' | null {
  if (IMAGE_TYPES.has(mime)) return 'image';
  if (VIDEO_TYPES.has(mime)) return 'video';
  return null;
}

function safeExt(name: string): string {
  const m = name.match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toLowerCase().slice(0, 8) : 'bin';
}

export function validateRequestMediaFiles(files: File[]): string | null {
  if (files.length > MAX_FILES) {
    return `يمكنك رفع ${MAX_FILES} ملفات كحد أقصى.`;
  }
  for (const f of files) {
    if (f.size > MAX_BYTES) {
      return `الملف «${f.name}» أكبر من 15 ميجابايت.`;
    }
    if (!attachmentKind(f.type)) {
      return `نوع الملف «${f.name}» غير مدعوم. استخدم صوراً (JPG, PNG, WebP) أو فيديو (MP4, WebM).`;
    }
  }
  return null;
}

export async function uploadRequestMedia(
  userId: string,
  files: File[]
): Promise<{ attachments: RequestAttachment[]; error: string | null }> {
  const validation = validateRequestMediaFiles(files);
  if (validation) return { attachments: [], error: validation };
  if (files.length === 0) return { attachments: [], error: null };

  const uploaded: RequestAttachment[] = [];

  for (const file of files) {
    const kind = attachmentKind(file.type);
    if (!kind) continue;

    const path = `${userId}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${safeExt(file.name)}`;

    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

    if (uploadError) {
      return {
        attachments: uploaded,
        error: uploadError.message || 'تعذّر رفع أحد الملفات.',
      };
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    uploaded.push({
      url: data.publicUrl,
      kind,
      name: file.name,
    });
  }

  return { attachments: uploaded, error: null };
}
