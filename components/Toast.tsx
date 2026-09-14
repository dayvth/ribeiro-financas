'use client';

import { useEffect, useState } from 'react';
import { GOLD } from '@/lib/constants';

export type ToastItem = {
  id: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
};

export default function Toast({
  toast, onDismiss,
}: {
  toast: ToastItem | null;
  onDismiss: (id: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!toast) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      // Aguarda anim de saida
      setTimeout(() => onDismiss(toast.id), 200);
    }, toast.duration ?? 5000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 z-[80] w-full max-w-[430px] px-4 transition-all duration-200 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
      style={{ bottom: 'calc(env(safe-area-inset-bottom) + 96px)' }}
    >
      <div className="bg-[#1c1c1e] border border-white/[0.06] rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3">
        <div className="flex-1 text-[14px] text-white leading-tight">{toast.message}</div>
        {toast.actionLabel && toast.onAction && (
          <button
            onClick={() => {
              toast.onAction!();
              onDismiss(toast.id);
            }}
            className="text-[14px] font-semibold py-1 px-2 -mx-1 active:opacity-60"
            style={{ color: GOLD }}
          >
            {toast.actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
