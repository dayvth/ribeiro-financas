'use client';

import { useRef, useState } from 'react';
import { Paperclip, FileText, X, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { GOLD } from '@/lib/constants';

export default function ReceiptField({
  value, onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const isPdf = value ? /\.pdf($|\?)/i.test(value) : false;

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploading(true);
    try {
      const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from('receipts')
        .upload(path, file, { contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from('receipts').getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (err: any) {
      alert('Erro ao enviar comprovante: ' + (err?.message ?? 'tente novamente'));
    } finally {
      setUploading(false);
    }
  }

  if (value) {
    return (
      <div className="mt-6">
        <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold mb-3 px-1">
          Comprovante
        </div>
        <div className="relative">
          {isPdf ? (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white/[0.04] rounded-2xl px-4 py-4 active:bg-white/[0.06]"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(201,165,95,0.15)' }}
              >
                <FileText size={20} style={{ color: GOLD }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] text-white font-medium">Comprovante PDF</div>
                <div className="text-[12px] text-white/50">Toque para abrir</div>
              </div>
            </a>
          ) : (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt="Comprovante" className="w-full rounded-2xl" />
            </a>
          )}
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Remover comprovante"
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 backdrop-blur flex items-center justify-center active:bg-black/85"
          >
            <X size={15} className="text-white" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full py-3.5 bg-white/[0.04] rounded-2xl flex items-center justify-center gap-2.5 text-[14px] text-white/70 border border-white/[0.06] active:bg-white/[0.06] transition disabled:opacity-60"
      >
        {uploading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Enviando…
          </>
        ) : (
          <>
            <Paperclip size={15} className="text-white/60" />
            <span className="font-medium">Anexar comprovante</span>
            <span className="text-white/35 text-[12px]">Foto ou PDF</span>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
