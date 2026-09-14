'use client';

import { useMemo, useState } from 'react';
import { Plus, Trash2, Pencil, Paperclip } from 'lucide-react';
import type { Partner, PartnerInvestment } from '@/lib/types';
import { PARTNERS } from '@/lib/types';
import { GOLD, GOLD_SOFT, GOLD_DEEP } from '@/lib/constants';
import { fmtBRL, fmtBRLBig, fmtDate } from '@/lib/format';
import Monogram from './Monogram';

type Totals = Record<Partner, number>;

type PartnerPeriod = 'all' | 'month' | 'year';

const PERIODS: { id: PartnerPeriod; label: string }[] = [
  { id: 'all', label: 'Total' },
  { id: 'year', label: 'Ano' },
  { id: 'month', label: 'Mês' },
];

function inPeriod(dateISO: string, period: PartnerPeriod): boolean {
  if (period === 'all') return true;
  const d = new Date(dateISO + 'T12:00:00');
  const now = new Date();
  if (period === 'year') return d.getFullYear() === now.getFullYear();
  if (period === 'month') {
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }
  return true;
}

export default function Partners({
  investments, onAdd, onEdit, onDelete, onMenu,
}: {
  investments: PartnerInvestment[];
  onAdd: (partner: Partner) => void;
  onEdit: (inv: PartnerInvestment) => void;
  onDelete: (inv: PartnerInvestment) => void;
  onMenu: () => void;
}) {
  const [period, setPeriod] = useState<PartnerPeriod>('all');

  const filtered = useMemo(
    () => investments.filter((i) => inPeriod(i.date, period)),
    [investments, period],
  );

  const totals: Totals = useMemo(() => {
    const t: Totals = { dayvth: 0, dieinison: 0 };
    for (const inv of filtered) {
      t[inv.partner] = (t[inv.partner] ?? 0) + Number(inv.amount);
    }
    return t;
  }, [filtered]);

  const grandTotal = totals.dayvth + totals.dieinison;
  const pct = (p: Partner) => (grandTotal > 0 ? (totals[p] / grandTotal) * 100 : 0);

  return (
    <div className="pb-40 overflow-y-auto max-h-screen">
      <div className="pt-safe">
        <div className="pt-6 px-6 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold">
              Ribeiro Mineração
            </div>
            <h1 className="text-[30px] font-semibold tracking-tight mt-1 leading-none">Sócios</h1>
          </div>
          <Monogram onClick={onMenu} />
        </div>
      </div>

      {/* Filtro de período */}
      <div className="mt-8 px-6">
        <div className="bg-white/[0.06] rounded-xl p-1 flex text-[12px] font-medium">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`flex-1 py-2 rounded-lg transition-all whitespace-nowrap ${
                period === p.id ? 'bg-white text-black' : 'text-white/60'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Investimento total centralizado */}
      <div className="mt-10 px-6 text-center">
        <div className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-semibold">
          Investimento total
        </div>
        <div className="mt-3 text-[42px] font-semibold tracking-tight tabular-nums text-white leading-none">
          {fmtBRLBig(grandTotal)}
        </div>
      </div>

      {/* Avatares + participação (estilo Apple Fitness) */}
      <div className="mt-10 px-6">
        <div className="grid grid-cols-2 gap-3">
          {PARTNERS.map((p) => (
            <PartnerAvatarCard
              key={p.id}
              photo={p.photo}
              name={p.name}
              amount={totals[p.id]}
              percentage={pct(p.id)}
            />
          ))}
        </div>

        <div className="mt-5">
          <div className="h-1.5 rounded-full overflow-hidden bg-white/[0.06] flex">
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
        </div>
      </div>

      {/* Blocos individuais com histórico */}
      <div className="mt-10 px-6 space-y-6">
        {PARTNERS.map((p) => (
          <PartnerHistoryCard
            key={p.id}
            partner={p.id}
            name={p.name}
            photo={p.photo}
            total={totals[p.id]}
            investments={filtered.filter((i) => i.partner === p.id)}
            onAdd={() => onAdd(p.id)}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

function PartnerAvatarCard({
  photo, name, amount, percentage,
}: {
  photo: string;
  name: string;
  amount: number;
  percentage: number;
}) {
  const size = 108;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const displayPct = Math.max(0, Math.min(100, percentage));
  const dash = (displayPct / 100) * circumference;

  return (
    <div className="bg-white/[0.04] rounded-2xl px-3 pt-5 pb-4 flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="absolute inset-0 -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={stroke}
            fill="none"
          />
          <defs>
            <linearGradient id={`ring-${name}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={GOLD_SOFT} />
              <stop offset="100%" stopColor={GOLD_DEEP} />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#ring-${name})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${dash} ${circumference - dash}`}
            style={{ transition: 'stroke-dasharray 400ms ease' }}
          />
        </svg>
        <div
          className="absolute rounded-full overflow-hidden"
          style={{
            top: stroke + 4,
            left: stroke + 4,
            width: size - (stroke + 4) * 2,
            height: size - (stroke + 4) * 2,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt={name} className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="mt-3 text-[15px] font-semibold text-white">{name}</div>
      <div
        className="mt-1 text-[22px] font-semibold tracking-tight tabular-nums leading-none"
        style={{
          background: `linear-gradient(135deg, ${GOLD_SOFT}, ${GOLD_DEEP})`,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        }}
      >
        {fmtPct(percentage)}
      </div>
      <div className="mt-1 text-[11px] text-white/45 tabular-nums">
        {fmtBRLBig(amount)}
      </div>
    </div>
  );
}

function PartnerHistoryCard({
  partner, name, photo, total, investments, onAdd, onEdit, onDelete,
}: {
  partner: Partner;
  name: string;
  photo: string;
  total: number;
  investments: PartnerInvestment[];
  onAdd: () => void;
  onEdit: (inv: PartnerInvestment) => void;
  onDelete: (inv: PartnerInvestment) => void;
}) {
  const sorted = [...investments].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return a.created_at < b.created_at ? 1 : -1;
  });

  return (
    <div className="bg-white/[0.04] rounded-2xl overflow-hidden">
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 ring-1 ring-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt={name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold">
              {name}
            </div>
            <div className="text-[24px] font-semibold tracking-tight tabular-nums text-white leading-none mt-1">
              {fmtBRLBig(total)}
            </div>
          </div>
        </div>

        <button
          onClick={onAdd}
          className="mt-5 w-full py-3 rounded-xl text-[14px] font-semibold text-black transition active:scale-[0.98] flex items-center justify-center gap-2"
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
                  {(inv.receipt_urls?.length || inv.receipt_url) && (
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
                onClick={() => onDelete(inv)}
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
