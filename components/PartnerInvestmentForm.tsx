'use client';

import { useState, type ReactNode } from 'react';
import type { Partner, NewPartnerInvestmentInput, PartnerInvestment } from '@/lib/types';
import { GOLD } from '@/lib/constants';
import { fmtBRL, todayISO } from '@/lib/format';
import { PARTNERS } from '@/lib/types';
import ReceiptField from './ReceiptField';

export default function PartnerInvestmentForm({
  partner, initial, onCancel, onSave,
}: {
  partner: Partner;
  initial?: PartnerInvestment;
  onCancel: () => void;
  onSave: (input: NewPartnerInvestmentInput) => Promise<void>;
}) {
  const [description, setDescription] = useState(initial?.description ?? '');
  const [amount, setAmount] = useState<number>(initial?.amount ?? 0);
  const [amountStr, setAmountStr] = useState(
    initial?.amount ? fmtBRL(initial.amount) : '',
  );
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [receiptUrl, setReceiptUrl] = useState<string | null>(initial?.receipt_url ?? null);
  const [saving, setSaving] = useState(false);

  const partnerName = PARTNERS.find((p) => p.id === partner)?.name ?? partner;
  const title = initial ? 'Editar investimento' : `Investimento — ${partnerName}`;
  const canSave = amount > 0 && description.trim().length > 0 && !saving;

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '');
    const num = digits ? parseInt(digits, 10) / 100 : 0;
    setAmount(num);
    setAmountStr(num > 0 ? fmtBRL(num) : '');
  }

  async function handleSubmit() {
    if (!canSave) return;
    setSaving(true);
    try {
      await onSave({
        partner,
        description: description.trim(),
        amount,
        date,
        receipt_url: receiptUrl,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      <div className="pt-safe px-5 flex items-center justify-between shrink-0">
        <button
          onClick={onCancel}
          className="text-[16px] text-white/70 py-2 -mx-2 px-2 active:opacity-60"
          disabled={saving}
        >
          Cancelar
        </button>
        <div className="text-[15px] font-semibold text-white">{title}</div>
        <button
          onClick={handleSubmit}
          disabled={!canSave}
          className="text-[16px] font-semibold py-2 -mx-2 px-2 transition"
          style={{ color: canSave ? GOLD : 'rgba(255,255,255,0.25)' }}
        >
          Salvar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-10 pb-8">
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold">Valor</div>
          <input
            type="text"
            inputMode="numeric"
            value={amountStr}
            onChange={handleAmountChange}
            placeholder="R$ 0,00"
            className="mt-3 w-full text-center bg-transparent text-[44px] font-semibold tracking-tight tabular-nums outline-none placeholder:text-white/20 text-white"
            autoFocus={!initial}
          />
        </div>

        <div className="mt-8 bg-white/[0.04] rounded-2xl overflow-hidden">
          <FormRow label="Descrição">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Compra da escavadeira"
              className="w-full bg-transparent text-[15px] text-white text-right outline-none placeholder:text-white/25"
            />
          </FormRow>
          <FormRow label="Data" last>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-[15px] text-white outline-none text-right"
            />
          </FormRow>
        </div>

        <ReceiptField value={receiptUrl} onChange={setReceiptUrl} />
      </div>
    </div>
  );
}

function FormRow({
  label, children, last,
}: {
  label: string;
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`w-full flex items-center gap-4 px-5 py-3.5 ${
        !last ? 'border-b border-white/[0.06]' : ''
      }`}
    >
      <div className="text-[14px] text-white/60 shrink-0">{label}</div>
      <div className="flex-1 text-right min-w-0">{children}</div>
    </div>
  );
}
