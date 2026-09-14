'use client';

import { useMemo, useState } from 'react';
import {
  Receipt, ArrowUpRight, ArrowDownRight, Building2, Camera, Search, X,
} from 'lucide-react';
import type { Transaction, TransactionType, PartnerInvestment } from '@/lib/types';
import { findPartner } from '@/lib/types';
import { GOLD, GREEN, RED, findCategory } from '@/lib/constants';
import { fmtBRLBig, fmtDate } from '@/lib/format';
import Monogram from './Monogram';
import TransactionDetail from './TransactionDetail';

type Filter = 'all' | TransactionType;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'expense', label: 'Despesas' },
  { id: 'income', label: 'Receitas' },
  { id: 'investment', label: 'Investimentos' },
];

type MergedItem =
  | { kind: 'tx'; id: string; date: string; created_at: string; type: TransactionType; tx: Transaction }
  | { kind: 'inv'; id: string; date: string; created_at: string; type: 'investment'; inv: PartnerInvestment };

export default function Transactions({
  transactions, partnerInvestments,
  onDelete, onEdit,
  onDeletePartnerInvestment, onEditPartnerInvestment,
  onMenu,
}: {
  transactions: Transaction[];
  partnerInvestments: PartnerInvestment[];
  onDelete: (tx: Transaction) => void;
  onEdit: (tx: Transaction) => void;
  onDeletePartnerInvestment: (inv: PartnerInvestment) => void;
  onEditPartnerInvestment: (inv: PartnerInvestment) => void;
  onMenu: () => void;
}) {
  const [detailTx, setDetailTx] = useState<Transaction | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const merged = useMemo<MergedItem[]>(() => {
    const items: MergedItem[] = [
      ...transactions.map<MergedItem>((t) => ({
        kind: 'tx',
        id: `tx-${t.id}`,
        date: t.date,
        created_at: t.created_at,
        type: t.type,
        tx: t,
      })),
      ...partnerInvestments.map<MergedItem>((i) => ({
        kind: 'inv',
        id: `inv-${i.id}`,
        date: i.date,
        created_at: i.created_at,
        type: 'investment' as const,
        inv: i,
      })),
    ];
    return items.sort(
      (a, b) => b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at),
    );
  }, [transactions, partnerInvestments]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return merged.filter((m) => {
      if (filter !== 'all' && m.type !== filter) return false;
      if (!q) return true;
      if (m.kind === 'tx') {
        const cat = findCategory(m.tx.category)?.name?.toLowerCase() ?? '';
        return (
          m.tx.description.toLowerCase().includes(q) ||
          cat.includes(q) ||
          m.tx.date.includes(q)
        );
      }
      return (
        m.inv.description.toLowerCase().includes(q) ||
        m.inv.date.includes(q)
      );
    });
  }, [merged, query, filter]);

  return (
    <div className="pb-40 overflow-y-auto max-h-screen">
      <div className="pt-safe">
        <div className="pt-6 px-6 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold">
              Ribeiro Mineração
            </div>
            <h1 className="text-[30px] font-semibold tracking-tight mt-1 leading-none">
              Movimentações
            </h1>
          </div>
          <Monogram onClick={onMenu} />
        </div>
      </div>

      <div className="mt-8 px-6">
        <div className="flex items-center gap-2 bg-white/[0.06] rounded-xl px-3.5 py-2.5">
          <Search size={16} className="text-white/40 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar descrição, categoria…"
            className="flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-white/30"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Limpar"
              className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center active:bg-white/25"
            >
              <X size={11} className="text-white/70" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 px-6 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 min-w-max">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition whitespace-nowrap ${
                filter === f.id ? 'bg-white text-black' : 'bg-white/[0.06] text-white/70'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {merged.length === 0 ? (
        <div className="mt-24 flex flex-col items-center gap-3 px-6">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center">
            <Receipt size={24} className="text-white/40" />
          </div>
          <div className="text-white/60 text-[14px]">Nenhuma movimentação ainda</div>
          <div className="text-white/40 text-[13px]">Toque em + para adicionar</div>
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 px-6 text-center">
          <div className="text-white/60 text-[14px]">Nada encontrado</div>
          <div className="text-white/40 text-[13px]">Ajuste a busca ou o filtro</div>
        </div>
      ) : (
        <div className="mt-6 px-6">
          <div className="bg-white/[0.04] rounded-2xl overflow-hidden">
            {visible.map((m, i) =>
              m.kind === 'tx' ? (
                <TransactionRow
                  key={m.id}
                  tx={m.tx}
                  isFirst={i === 0}
                  onOpen={() => setDetailTx(m.tx)}
                />
              ) : (
                <InvestmentRow
                  key={m.id}
                  inv={m.inv}
                  isFirst={i === 0}
                  onOpen={() => onEditPartnerInvestment(m.inv)}
                />
              ),
            )}
          </div>
        </div>
      )}

      {detailTx && (
        <TransactionDetail
          tx={detailTx}
          onClose={() => setDetailTx(null)}
          onEdit={() => {
            const tx = detailTx;
            setDetailTx(null);
            onEdit(tx);
          }}
          onDelete={() => {
            const tx = detailTx;
            setDetailTx(null);
            onDelete(tx);
          }}
        />
      )}
    </div>
  );
}

function TransactionRow({
  tx, isFirst, onOpen,
}: {
  tx: Transaction;
  isFirst: boolean;
  onOpen: () => void;
}) {
  const cat = findCategory(tx.category);
  const partner = findPartner(tx.partner);
  const Icon =
    tx.type === 'income' ? ArrowUpRight :
    tx.type === 'investment' ? Building2 :
    (cat?.icon ?? ArrowDownRight);

  const color =
    tx.type === 'income' ? GREEN :
    tx.type === 'investment' ? GOLD :
    RED;

  const bg =
    tx.type === 'income' ? 'bg-[#34c47a]/12' :
    tx.type === 'investment' ? 'bg-[#c9a55f]/15' :
    'bg-[#ff453a]/12';

  const sign = tx.type === 'income' ? '+' : tx.type === 'expense' ? '−' : '';
  const subtitle =
    tx.type === 'income' ? 'Receita' :
    tx.type === 'investment' ? 'Investimento' :
    (cat?.name ?? 'Despesa');
  const amountColor = tx.type === 'expense' ? RED : tx.type === 'income' ? GREEN : '#fff';

  return (
    <button
      onClick={onOpen}
      className={`w-full flex items-center px-5 py-3.5 text-left active:bg-white/[0.03] transition ${
        !isFirst ? 'border-t border-white/[0.06]' : ''
      }`}
    >
      <div className="relative mr-3 shrink-0">
        <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center`}>
          <Icon size={17} style={{ color }} />
        </div>
        {partner && (
          <div
            className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full overflow-hidden ring-2 ring-black"
            title={partner.name}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={partner.photo} alt={partner.name} className="w-full h-full object-cover" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[15px] text-white font-medium truncate leading-tight">
          {tx.description}
        </div>
        <div className="text-[12px] text-white/45 mt-1 flex items-center gap-1.5">
          <span>{subtitle}</span>
          <span className="w-0.5 h-0.5 rounded-full bg-white/30" />
          <span>{fmtDate(tx.date)}</span>
          {partner && (
            <>
              <span className="w-0.5 h-0.5 rounded-full bg-white/30" />
              <span>{partner.name}</span>
            </>
          )}
          {(tx.receipt_urls?.length || tx.receipt_url) && (
            <>
              <span className="w-0.5 h-0.5 rounded-full bg-white/30" />
              <Camera size={11} />
            </>
          )}
        </div>
      </div>
      <div
        className="text-[15px] font-semibold tabular-nums ml-2 shrink-0"
        style={{ color: amountColor }}
      >
        {sign}{fmtBRLBig(Number(tx.amount))}
      </div>
    </button>
  );
}

function InvestmentRow({
  inv, isFirst, onOpen,
}: {
  inv: PartnerInvestment;
  isFirst: boolean;
  onOpen: () => void;
}) {
  const partner = findPartner(inv.partner);
  const hasReceipt = (inv.receipt_urls?.length || inv.receipt_url);

  return (
    <button
      onClick={onOpen}
      className={`w-full flex items-center px-5 py-3.5 text-left active:bg-white/[0.03] transition ${
        !isFirst ? 'border-t border-white/[0.06]' : ''
      }`}
    >
      <div className="relative mr-3 shrink-0">
        <div className="w-10 h-10 rounded-full bg-[#c9a55f]/15 flex items-center justify-center">
          <Building2 size={17} style={{ color: GOLD }} />
        </div>
        {partner && (
          <div
            className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full overflow-hidden ring-2 ring-black"
            title={partner.name}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={partner.photo} alt={partner.name} className="w-full h-full object-cover" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[15px] text-white font-medium truncate leading-tight">
          {inv.description}
        </div>
        <div className="text-[12px] text-white/45 mt-1 flex items-center gap-1.5">
          <span>Investimento</span>
          <span className="w-0.5 h-0.5 rounded-full bg-white/30" />
          <span>{fmtDate(inv.date)}</span>
          {partner && (
            <>
              <span className="w-0.5 h-0.5 rounded-full bg-white/30" />
              <span>{partner.name}</span>
            </>
          )}
          {hasReceipt && (
            <>
              <span className="w-0.5 h-0.5 rounded-full bg-white/30" />
              <Camera size={11} />
            </>
          )}
        </div>
      </div>
      <div className="text-[15px] font-semibold tabular-nums ml-2 shrink-0 text-white">
        {fmtBRLBig(Number(inv.amount))}
      </div>
    </button>
  );
}
