'use client';

import { ChevronLeft, Trash2, Pencil, FileText } from 'lucide-react';
import type { Transaction } from '@/lib/types';
import { GOLD, GREEN, findCategory } from '@/lib/constants';
import { fmtBRLBig, fmtDate } from '@/lib/format';

export default function TransactionDetail({
  tx, onClose, onEdit, onDelete,
}: {
  tx: Transaction;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const cat = findCategory(tx.category);
  const typeLabel =
    tx.type === 'income' ? 'Receita' :
    tx.type === 'expense' ? 'Despesa' :
    'Investimento';
  const sign = tx.type === 'income' ? '+' : tx.type === 'expense' ? '−' : '';
  const amountColor =
    tx.type === 'expense' ? '#fff' :
    tx.type === 'income' ? GREEN :
    GOLD;

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col anim-fade">
      <div className="pt-safe px-4 flex items-center justify-between shrink-0">
        <button
          onClick={onClose}
          className="w-11 h-11 -ml-2 flex items-center justify-center text-white active:opacity-60"
          aria-label="Voltar"
        >
          <ChevronLeft size={26} />
        </button>
        <div className="text-[15px] font-medium">{typeLabel}</div>
        <div className="w-11" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-10">
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold">
            {cat?.name || typeLabel}
          </div>
          <div
            className="mt-3 text-[42px] font-semibold tracking-tight tabular-nums leading-none"
            style={{ color: amountColor }}
          >
            {sign}{fmtBRLBig(Number(tx.amount))}
          </div>
          <div className="text-[13px] text-white/45 mt-3">{fmtDate(tx.date)}</div>
        </div>

        <div className="mt-8 bg-white/[0.04] rounded-2xl overflow-hidden">
          <DetailRow label="Descrição" value={tx.description} />
          {cat && <DetailRow label="Categoria" value={cat.name} />}
          <DetailRow label="Data" value={fmtDate(tx.date)} last />
        </div>

        {tx.receipt_url && (
          <div className="mt-6">
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold mb-3">
              Comprovante
            </div>
            {/\.pdf($|\?)/i.test(tx.receipt_url) ? (
              <a
                href={tx.receipt_url}
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
              <a href={tx.receipt_url} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={tx.receipt_url} alt="Comprovante" className="w-full rounded-2xl" />
              </a>
            )}
          </div>
        )}

        <button
          onClick={onEdit}
          className="mt-8 w-full py-4 bg-white/[0.06] text-white rounded-2xl font-medium text-[15px] flex items-center justify-center gap-2 active:bg-white/[0.09]"
        >
          <Pencil size={16} />
          Editar
        </button>
        <button
          onClick={onDelete}
          className="mt-3 w-full py-4 bg-[#ff453a]/12 text-[#ff453a] rounded-2xl font-medium text-[15px] flex items-center justify-center gap-2 active:bg-[#ff453a]/18"
        >
          <Trash2 size={16} />
          Excluir movimentação
        </button>
      </div>
    </div>
  );
}

function DetailRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex justify-between items-start gap-4 px-5 py-4 ${!last ? 'border-b border-white/[0.06]' : ''}`}>
      <div className="text-[14px] text-white/55">{label}</div>
      <div className="text-[15px] text-white font-medium text-right">{value}</div>
    </div>
  );
}
