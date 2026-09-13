'use client';

import { X, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

export function Sheet({
  open, onClose, title, children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[55] anim-fade" onClick={onClose} />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[55] anim-slide pb-safe">
        <div className="mx-3 mb-3 bg-[#1c1c1e] rounded-3xl overflow-hidden">
          <div className="px-5 pt-4 pb-2 flex items-center justify-between">
            <div className="text-[15px] font-semibold text-white">{title}</div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center active:bg-white/15"
              aria-label="Fechar"
            >
              <X size={16} className="text-white" />
            </button>
          </div>
          <div className="p-2 pt-1">{children}</div>
        </div>
        <button
          onClick={onClose}
          className="mx-3 mb-6 w-[calc(100%-1.5rem)] py-4 bg-[#1c1c1e] rounded-2xl text-white font-semibold text-[16px] active:bg-[#242426]"
        >
          Cancelar
        </button>
      </div>
    </>
  );
}

export function SheetOption({
  iconEl, iconBg, iconColor, label, sublabel, onClick,
}: {
  iconEl: ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  sublabel?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center px-3 py-3 active:bg-white/5 transition rounded-2xl"
    >
      <div className={`w-11 h-11 rounded-full ${iconBg} ${iconColor} flex items-center justify-center mr-3 shrink-0`}>
        {iconEl}
      </div>
      <div className="flex-1 text-left min-w-0">
        <div className="text-[16px] font-medium text-white">{label}</div>
        {sublabel && <div className="text-[12px] text-white/50 mt-0.5">{sublabel}</div>}
      </div>
      <ChevronRight size={18} className="text-white/25 ml-2" />
    </button>
  );
}
