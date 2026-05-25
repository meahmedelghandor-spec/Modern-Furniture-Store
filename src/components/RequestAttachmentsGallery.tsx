'use client';

import Image from 'next/image';
import { ExternalLink, Video } from 'lucide-react';
import type { RequestAttachment } from '@/types/request-attachment';

export default function RequestAttachmentsGallery({
  attachments,
  title = 'مرفقات العميل (صور / فيديو)',
}: {
  attachments: RequestAttachment[];
  title?: string;
}) {
  if (!attachments.length) return null;

  return (
    <div>
      <h3 className="font-semibold text-sm mb-3">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {attachments.map((a, i) => (
          <a
            key={`${a.url}-${i}`}
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square rounded-lg overflow-hidden border bg-muted hover:ring-2 hover:ring-primary/40 transition-all"
          >
            {a.kind === 'image' ? (
              <Image src={a.url} alt={a.name ?? 'مرفق'} fill className="object-cover" sizes="160px" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-2 text-center">
                <Video className="h-8 w-8 text-primary" />
                <span className="text-[10px] line-clamp-2">{a.name ?? 'فيديو'}</span>
              </div>
            )}
            <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink className="h-3 w-3" />
              فتح
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
