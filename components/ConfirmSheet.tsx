'use client';

import { useEffect } from 'react';

export default function ConfirmSheet({
  open, title, description, confirmLabel = 'Excluir', destructive = true,
  onConfirm, onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[75] anim-fade"
        onClick={onCancel}
      />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[75] anim-slide pb-safe">
        <div className="mx-3 mb-3 bg-[#1c1c1e] rounded-3xl overflow-hidden">
          <div className="px-6 pt-6 pb-5 text-center">
            <div className="text-[17px] font-semibold text-white">{title}</div>
            {description && (
              <div className="text-[13px] text-white/55 mt-2 leading-relaxed">
                {description}
              </div>
            )}
          </div>
          <div className="border-t border-white/[0.08]">
            <button
              onClick={onConfirm}
              className={`w-full py-3.5 text-[16px] font-semibold active:bg-white/5 ${
                destructive ? 'text-[#ff453a]' : 'text-white'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
          <div className="border-t border-white/[0.08]">
            <button
              onClick={onCancel}
              className="w-full py-3.5 text-[16px] text-white active:bg-white/5"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
