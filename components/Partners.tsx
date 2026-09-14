'use client';

import { useMemo } from 'react';
import { Plus, Trash2, Pencil, Paperclip } from 'lucide-react';
import type { Partner, PartnerInvestment } from '@/lib/types';
import { PARTNERS } from '@/lib/types';
import { GOLD, GOLD_SOFT, GOLD_DEEP } from '@/lib/constants';
import { fmtBRL, fmtBRLBig, fmtDate } from '@/lib/format';
import Monogram from './Monogram';

type Totals = Record<Partner, number>;

export default function Partners({
  investments, onAdd, onEdit, onDelete, onMenu,
}: {
  investments: PartnerInvestment[];
  onAdd: (partner: Partner) => void;
  onEdit: (inv: PartnerInvestment) => void;
  onDelete: (id: string) => void;
  onMenu: () => void;
}) {
  const totals: Totals = useMemo(() => {
    const t: Totals = { dayvth: 0, dieinison: 0 };
    for (const inv of investments) {
      t[inv.partner] = (t[inv.partner] ?? 0) + Number(inv.amount);
    }
    return t;
  }, [investments]);

  const grandTotal = totals.dayvth + totals.dieinison;

  const pct = (p: Partner) =>
    grandTotal > 0 ? (totals[p] / grandTotal) * 100 : 0;

  return (
    <div className="pb-40 overflow-y-auto max-h-screen">
      <div className="pt-safe px-6 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold">
            Ribeiro Mineração
          </div>
          <h1 className="text-[28px] font-semibold tracking-tight mt-1 leading-none">Sócios</h1>
        </div>
        <Monogram onClick={onMenu} />
      </div>

      {/* Resumo */}
      <div className="mt-8 px-6">
        <div className="bg-white/[0.04] rounded-2xl p-5">
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold">
            Investimento total
          </div>
          <div className="mt-3 text-[34px] font-semibold tracking-tight tabular-nums text-white leading-none">
            {fmtBRLBig(grandTotal)}
          </div>

          {/* Barra */}
          <div className="mt-5 h-2 rounded-full overflow-hidden bg-white/[0.06] flex">
            <div
              className="h-full transition-all"
              style={{
                width: `${pct('dayvth')}%`,
                background: `linear-gradient(90deg, ${GOLD_SOFT}, ${GOLD_DEEP})`,
              }}
            />
            <div
              className="h-full bg-white/25 transition-all"
              style={{ width: `${pct('dieinison')}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-[12px]">
            <div className="flex items-center gap-1.5">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ background: GOLD }}
              />
              <span className="text-white/70">
                Dayvth <span className="text-white/90 font-medium tabular-nums">{fmtPct(pct('dayvth'))}</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-white/40" />
              <span className="text-white/70">
                Dieinison <span className="text-white/90 font-medium tabular-nums">{fmtPct(pct('dieinison'))}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Blocos por sócio */}
      <div className="mt-6 px-6 space-y-6">
        {PARTNERS.map((p) => (
          <PartnerCard
            key={p.id}
            partner={p.id}
            name={p.name}
            total={totals[p.id]}
            participation={pct(p.id)}
            investments={investments.filter((i) => i.partner === p.id)}
            onAdd={() => onAdd(p.id)}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

function PartnerCard({
  partner, name, total, participation, investments, onAdd, onEdit, onDelete,
}: {
  partner: Partner;
  name: string;
  total: number;
  participation: number;
  investments: PartnerInvestment[];
  onAdd: () => void;
  onEdit: (inv: PartnerInvestment) => void;
  onDelete: (id: string) => void;
}) {
  const sorted = [...investments].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return a.created_at < b.created_at ? 1 : -1;
  });

  return (
    <div className="bg-white/[0.04] rounded-2xl overflow-hidden">
      <div className="px-5 pt-5 pb-4">
        <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold">
          {name}
        </div>
        <div className="mt-2 flex items-baseline gap-3">
          <div className="text-[28px] font-semibold tracking-tight tabular-nums text-white leading-none">
            {fmtBRLBig(total)}
          </div>
          <div className="text-[13px] text-white/40 tabular-nums">
            {fmtPct(participation)}
          </div>
        </div>

        <button
          onClick={onAdd}
          className="mt-4 w-full py-3 rounded-xl text-[14px] font-semibold text-black transition active:scale-[0.98] flex items-center justify-center gap-2"
          style={{ background: `linear-gradient(135deg, ${GOLD_SOFT} 0%, ${GOLD_DEEP} 100%)` }}
        >
          <Plus size={16} strokeWidth={2.5} />
          Adicionar investimento
        </button>
      </div>

      {sorted.length > 0 && (
        <div className="border-t border-white/[0.06]">
          {sorted.map((inv, i) => (
            <div
              key={inv.id}
              className={`flex items-center gap-3 px-5 py-3.5 ${
                i > 0 ? 'border-t border-white/[0.04]' : ''
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-semibold text-white tabular-nums">
                  {fmtBRL(Number(inv.amount))}
                </div>
                <div className="text-[13px] text-white/60 truncate">{inv.description}</div>
                <div className="text-[11px] text-white/35 mt-0.5 flex items-center gap-1.5">
                  <span className="tabular-nums">{fmtDate(inv.date)}</span>
                  {inv.receipt_url && (
                    <>
                      <span className="w-0.5 h-0.5 rounded-full bg-white/30" />
                      <Paperclip size={10} />
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => onEdit(inv)}
                className="w-9 h-9 rounded-full flex items-center justify-center active:bg-white/10"
                aria-label="Editar"
              >
                <Pencil size={15} className="text-white/50" />
              </button>
              <button
                onClick={() => {
                  if (confirm('Excluir este investimento?')) onDelete(inv.id);
                }}
                className="w-9 h-9 rounded-full flex items-center justify-center active:bg-white/10"
                aria-label="Excluir"
              >
                <Trash2 size={15} className="text-white/50" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function fmtPct(v: number): string {
  if (!isFinite(v)) return '0%';
  return `${v.toLocaleString('pt-BR', { minimumFractionDigits: v % 1 === 0 ? 0 : 1, maximumFractionDigits: 1 })}%`;
}
