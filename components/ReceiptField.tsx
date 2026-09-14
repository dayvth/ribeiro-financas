'use client';

import { useRef, useState } from 'react';
import { Paperclip, FileText, X, Loader2, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { GOLD } from '@/lib/constants';

export default function ReceiptField({
  value, onChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage
          .from('receipts')
          .upload(path, file, { contentType: file.type });
        if (error) throw error;
        const { data } = supabase.storage.from('receipts').getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
      onChange([...value, ...uploaded]);
    } catch (err: any) {
      alert('Erro ao enviar comprovante: ' + (err?.message ?? 'tente novamente'));
    } finally {
      setUploading(false);
    }
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  const hasReceipts = value.length > 0;

  return (
    <div className="mt-6">
      {hasReceipts && (
        <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold mb-3 px-1">
          Comprovantes <span className="text-white/30">({value.length})</span>
        </div>
      )}

      {hasReceipts && (
        <div className="space-y-3">
          {value.map((url, i) => (
            <ReceiptItem key={`${url}-${i}`} url={url} onRemove={() => removeAt(i)} />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={`${hasReceipts ? 'mt-3' : ''} w-full py-3.5 bg-white/[0.04] rounded-2xl flex items-center justify-center gap-2.5 text-[14px] text-white/70 border border-white/[0.06] active:bg-white/[0.06] transition disabled:opacity-60`}
      >
        {uploading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Enviando…
          </>
        ) : hasReceipts ? (
          <>
            <Plus size={15} className="text-white/60" />
            <span className="font-medium">Anexar mais um</span>
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
        multiple
        className="hidden"
        onChange={handleFiles}
      />
    </div>
  );
}

function ReceiptItem({ url, onRemove }: { url: string; onRemove: () => void }) {
  const isPdf = /\.pdf($|\?)/i.test(url);
  return (
    <div className="relative">
      {isPdf ? (
        <a
          href={url}
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
        <a href={url} target="_blank" rel="noopener noreferrer" className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Comprovante" className="w-full rounded-2xl" />
        </a>
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remover"
        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 backdrop-blur flex items-center justify-center active:bg-black/85"
      >
        <X size={15} className="text-white" />
      </button>
    </div>
  );
}
