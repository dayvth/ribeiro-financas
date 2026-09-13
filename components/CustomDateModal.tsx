'use client';

import { useState } from 'react';
import type { CustomRange } from '@/lib/types';
import { GOLD } from '@/lib/constants';

export default function CustomDateModal({
  custom, onApply, onClose,
}: {
  custom: CustomRange;
  onApply: (c: CustomRange) => void;
  onClose: () => void;
}) {
  const [from, setFrom] = useState(custom.from);
  const [to, setTo] = useState(custom.to);

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-[70] anim-fade" onClick={onClose} />
      <div className="fixed inset-x-0 top-1/2 -translate-y-1/2 z-[70] px-8 flex justify-center anim-scale">
        <div className="bg-[#1c1c1e] rounded-2xl max-w-[320px] w-full overflow-hidden">
          <div className="px-5 pt-5 pb-4">
            <div className="text-[16px] font-semibold text-white text-center">
              Período personalizado
            </div>
            <div className="mt-5 space-y-3">
              <div>
                <div className="text-[12px] text-white/50 mb-1.5">De</div>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full bg-white/[0.08] rounded-lg px-3 py-2.5 text-[15px] text-white outline-none"
                />
              </div>
              <div>
                <div className="text-[12px] text-white/50 mb-1.5">Até</div>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full bg-white/[0.08] rounded-lg px-3 py-2.5 text-[15px] text-white outline-none"
                />
              </div>
            </div>
          </div>
          <div className="border-t border-white/[0.1] flex">
            <button
              onClick={onClose}
              className="flex-1 py-3 text-[15px] text-white border-r border-white/[0.1] active:bg-white/5"
            >
              Cancelar
            </button>
            <button
              onClick={() => onApply({ from, to })}
              className="flex-1 py-3 text-[15px] font-semibold active:bg-white/5"
              style={{ color: GOLD }}
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
