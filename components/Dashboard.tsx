'use client';

import { useMemo } from 'react';
import { Building2, MoreHorizontal } from 'lucide-react';
import type { Transaction, Period, CustomRange } from '@/lib/types';
import { GOLD, GREEN, RED, CATEGORIES } from '@/lib/constants';
import { filterByPeriod, fmtBRLBig } from '@/lib/format';
import Monogram from './Monogram';
import CustomDateModal from './CustomDateModal';

export default function Dashboard({
  transactions, period, setPeriod, custom, setCustom,
  customOpen, setCustomOpen, onMenu,
}: {
  transactions: Transaction[];
  period: Period;
  setPeriod: (p: Period) => void;
  custom: CustomRange;
  setCustom: (c: CustomRange) => void;
  customOpen: boolean;
  setCustomOpen: (b: boolean) => void;
  onMenu: () => void;
}) {
  const filtered = useMemo(
    () => filterByPeriod(transactions, period, custom),
    [transactions, period, custom],
  );

  const totals = useMemo(() => {
    const sum = (type: string) =>
      filtered.filter((t) => t.type === type).reduce((s, t) => s + Number(t.amount), 0);
    const income = sum('income');
    const expense = sum('expense');
    const investment = sum('investment');
    return { income, expense, result: income - expense, investment };
  }, [filtered]);

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.filter((t) => t.type === 'expense').forEach((t) => {
      const c = t.category || 'outros';
      map[c] = (map[c] || 0) + Number(t.amount);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const resultPositive = totals.result >= 0;

  return (
    <div className="pb-40 overflow-y-auto max-h-screen">
      <div className="pt-safe px-6 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold">
            Ribeiro Mineração
          </div>
          <h1 className="text-[28px] font-semibold tracking-tight mt-1 leading-none">Início</h1>
        </div>
        <Monogram onClick={onMenu} />
      </div>

      {/* Período */}
      <div className="mt-7 px-6">
        <div className="bg-white/[0.06] rounded-xl p-1 flex text-[12px] font-medium">
          {[
            { id: 'week' as const, label: 'Semana' },
            { id: 'month' as const, label: 'Mês' },
            { id: 'year' as const, label: 'Ano' },
            { id: 'custom' as const, label: 'Personalizado' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setPeriod(p.id);
                if (p.id === 'custom') setCustomOpen(true);
              }}
              className={`flex-1 py-2 rounded-lg transition-all whitespace-nowrap ${
                period === p.id ? 'bg-white text-black' : 'text-white/60'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resultado */}
      <div className="mt-10 px-6">
        <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold">
          Resultado
        </div>
        <div
          className="mt-3 text-[46px] font-semibold tracking-tight leading-none tabular-nums"
          style={{ color: resultPositive ? '#fff' : RED }}
        >
          {fmtBRLBig(totals.result)}
        </div>
        <div className="text-[13px] text-white/40 mt-2.5">
          Receitas menos despesas no período
        </div>
      </div>

      {/* Lucro + Despesas */}
      <div className="mt-8 px-6 grid grid-cols-2 gap-3">
        <StatCard label="Lucro bruto" value={totals.income} color={GREEN} />
        <StatCard label="Despesas" value={totals.expense} color={RED} />
      </div>

      {/* Investimento */}
      <div className="mt-3 px-6">
        <div className="bg-white/[0.04] rounded-2xl p-5">
          <div className="flex items-center gap-2.5">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: 'rgba(201,165,95,0.15)' }}
            >
              <Building2 size={14} style={{ color: GOLD }} />
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold">
              Investimento total
            </div>
          </div>
          <div className="mt-3 text-[30px] font-semibold tracking-tight tabular-nums text-white leading-none">
            {fmtBRLBig(totals.investment)}
          </div>
          <div className="text-[12px] text-white/40 mt-2">
            Não entra no cálculo de resultado
          </div>
        </div>
      </div>

      {/* Despesas por categoria */}
      {byCategory.length > 0 && (
        <div className="mt-10 px-6">
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold mb-3">
            Despesas por categoria
          </div>
          <div className="bg-white/[0.04] rounded-2xl overflow-hidden">
            {byCategory.map(([catId, val], i) => {
              const cat = CATEGORIES.find((c) => c.id === catId) ||
                { id: 'outros', name: 'Outros', icon: MoreHorizontal };
              const Icon = cat.icon;
              return (
                <div
                  key={catId}
                  className={`flex items-center px-5 py-3.5 ${
                    i > 0 ? 'border-t border-white/[0.06]' : ''
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center mr-3">
                    <Icon size={16} className="text-white/70" />
                  </div>
                  <div className="flex-1 text-[15px] text-white">{cat.name}</div>
                  <div className="text-[15px] font-medium tabular-nums text-white">
                    {fmtBRLBig(val)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="mt-16 px-6 text-center">
          <div className="text-white/40 text-[14px]">Nenhuma movimentação neste período</div>
        </div>
      )}

      {customOpen && (
        <CustomDateModal
          custom={custom}
          onApply={(c) => {
            setCustom(c);
            setCustomOpen(false);
          }}
          onClose={() => setCustomOpen(false)}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white/[0.04] rounded-2xl p-4">
      <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold">
        {label}
      </div>
      <div
        className="mt-2.5 text-[19px] font-semibold tracking-tight tabular-nums leading-none"
        style={{ color }}
      >
        {fmtBRLBig(value)}
      </div>
    </div>
  );
}
