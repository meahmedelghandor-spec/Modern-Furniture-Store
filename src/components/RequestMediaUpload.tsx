'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Video, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { validateRequestMediaFiles } from '@/lib/upload-request-media';

interface Props {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
  hint?: string;
}

export default function RequestMediaUpload({ files, onChange, disabled, hint }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<{ id: string; url: string; kind: 'image' | 'video'; name: string }[]>(
    []
  );

  const syncPreviews = (next: File[]) => {
    setPreviews((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.url));
      return next.map((f) => ({
        id: `${f.name}-${f.size}-${f.lastModified}`,
        url: URL.createObjectURL(f),
        kind: f.type.startsWith('video/') ? 'video' : 'image',
        name: f.name,
      }));
    });
  };

  const addFiles = (incoming: FileList | null) => {
    if (!incoming?.length) return;
    const merged = [...files, ...Array.from(incoming)];
    const err = validateRequestMediaFiles(merged);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    onChange(merged);
    syncPreviews(merged);
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeAt = (index: number) => {
    const next = files.filter((_, i) => i !== index);
    onChange(next);
    syncPreviews(next);
    setError(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Label>صور أو فيديو للأثاث (اختياري)</Label>
        <span className="text-xs text-muted-foreground">{files.length}/6</span>
      </div>
      <p className="text-xs text-muted-foreground">
        {hint ?? 'ارفع صوراً أو فيديو قصيراً يساعدنا على تقدير السعر بدقة (حتى 15 ميجا لكل ملف).'}
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
        multiple
        className="hidden"
        disabled={disabled}
        onChange={(e) => addFiles(e.target.files)}
      />

      <Button
        type="button"
        variant="outline"
        className="w-full gap-2"
        disabled={disabled || files.length >= 6}
        onClick={() => inputRef.current?.click()}
      >
        <ImagePlus className="h-4 w-4" />
        إضافة صور أو فيديو
      </Button>

      {error && (
        <p className="text-xs text-red-600 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
          {error}
        </p>
      )}

      {previews.length > 0 && (
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {previews.map((p, index) => (
            <li
              key={p.id}
              className="relative aspect-square rounded-lg overflow-hidden border bg-muted group"
            >
              {p.kind === 'image' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-muted">
                  <Video className="h-8 w-8 text-primary" />
                  <span className="text-[10px] px-2 text-center line-clamp-2">{p.name}</span>
                </div>
              )}
              <button
                type="button"
                disabled={disabled}
                onClick={() => removeAt(index)}
                className="absolute top-1 left-1 rounded-full bg-black/60 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="حذف"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {disabled && files.length > 0 && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          جاري رفع الملفات...
        </p>
      )}
    </div>
  );
}
