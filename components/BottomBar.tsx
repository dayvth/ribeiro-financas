'use client';

import { Plus, House, Receipt } from 'lucide-react';
import { GOLD_SOFT, GOLD_DEEP } from '@/lib/constants';

type Tab = 'dashboard' | 'transactions';

export default function BottomBar({
  tab, setTab, onAdd,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  onAdd: () => void;
}) {
  return (
    <>
      <button
        onClick={onAdd}
        aria-label="Adicionar"
        className="fixed bottom-7 left-1/2 -translate-x-1/2 z-40 w-[62px] h-[62px] rounded-full flex items-center justify-center active:scale-95 transition-transform"
        style={{
          background: `linear-gradient(135deg, ${GOLD_SOFT} 0%, ${GOLD_DEEP} 100%)`,
          boxShadow: '0 12px 32px rgba(201,165,95,0.35), 0 2px 6px rgba(0,0,0,0.4)',
          marginBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <Plus size={28} className="text-black" strokeWidth={2.6} />
      </button>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-30 pointer-events-none pb-safe">
        <div
          className="mx-4 mb-4 bg-white/[0.04] border border-white/[0.06] rounded-2xl h-[62px] flex items-center px-2 pointer-events-auto"
          style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
        >
          <TabButton
            icon={<House size={22} />}
            label="Início"
            active={tab === 'dashboard'}
            onClick={() => setTab('dashboard')}
          />
          <div className="w-[62px] shrink-0" />
          <TabButton
            icon={<Receipt size={22} />}
            label="Movimentações"
            active={tab === 'transactions'}
            onClick={() => setTab('transactions')}
          />
        </div>
      </div>
    </>
  );
}

function TabButton({
  icon, label, active, onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 h-full flex flex-col items-center justify-center gap-1 transition ${
        active ? 'text-white' : 'text-white/40'
      }`}
    >
      {icon}
      <div className="text-[10px] font-medium">{label}</div>
    </button>
  );
}
