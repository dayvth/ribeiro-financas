'use client';

import { useState, type ReactNode } from 'react';
import { ChevronRight, X, Check, Plus, MoreHorizontal, type LucideIcon } from 'lucide-react';
import type { TransactionType, NewTransactionInput } from '@/lib/types';
import { GOLD, CATEGORIES, type Category } from '@/lib/constants';
import { fmtBRL, todayISO } from '@/lib/format';
import ReceiptField from './ReceiptField';

type Prefill = {
  description?: string;
  amount?: number;
  category?: string;
  date?: string;
  receipts?: string[];
};

export default function TransactionForm({
  type, prefill, onCancel, onSave,
}: {
  type: TransactionType;
  prefill?: Prefill;
  onCancel: () => void;
  onSave: (tx: NewTransactionInput) => Promise<void>;
}) {
  const [description, setDescription] = useState(prefill?.description || '');
  const [amount, setAmount] = useState(prefill?.amount || 0);
  const [amountStr, setAmountStr] = useState(
    prefill?.amount ? fmtBRL(prefill.amount) : '',
  );
  const [category, setCategory] = useState(prefill?.category || 'diesel');
  const [date, setDate] = useState(prefill?.date || todayISO());
  const [receiptUrls, setReceiptUrls] = useState<string[]>(prefill?.receipts ?? []);
  const [catPickerOpen, setCatPickerOpen] = useState(false);
  const [newCatOpen, setNewCatOpen] = useState(false);
  const [customCats, setCustomCats] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);

  const allCats: Category[] = [...CATEGORIES, ...customCats];
  const currentCat = allCats.find((c) => c.id === category);

  const title =
    type === 'income' ? 'Nova receita' :
    type === 'investment' ? 'Novo investimento' :
    'Nova despesa';

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
        type,
        description: description.trim(),
        amount,
        date,
        category: type === 'expense' ? category : null,
        receipt_urls: receiptUrls,
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
            autoFocus={!prefill}
          />
        </div>

        <div className="mt-8 bg-white/[0.04] rounded-2xl overflow-hidden">
          <FormRow label="Descrição">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                type === 'income' ? 'Ex: Venda de ouro' :
                type === 'investment' ? 'Ex: Escavadeira' :
                'Ex: Diesel Posto'
              }
              className="w-full bg-transparent text-[15px] text-white text-right outline-none placeholder:text-white/25"
            />
          </FormRow>

          {type === 'expense' && (
            <FormRow label="Categoria" onClick={() => setCatPickerOpen(true)}>
              <div className="flex items-center justify-end gap-2 text-[15px] text-white">
                {currentCat && <currentCat.icon size={15} className="text-white/60" />}
                <span>{currentCat?.name}</span>
                <ChevronRight size={16} className="text-white/30 -mr-1" />
              </div>
            </FormRow>
          )}

          <FormRow label="Data" last>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-[15px] text-white outline-none text-right"
            />
          </FormRow>
        </div>

        <ReceiptField value={receiptUrls} onChange={setReceiptUrls} />

        {prefill && (
          <div className="mt-4 flex items-start gap-2.5 px-2">
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center mt-0.5 shrink-0"
              style={{ background: GOLD }}
            >
              <Check size={10} className="text-black" strokeWidth={3.5} />
            </div>
            <div className="text-[12px] text-white/50 leading-relaxed">
              Dados identificados pela IA. Revise antes de salvar.
            </div>
          </div>
        )}
      </div>

      {catPickerOpen && (
        <CategoryPicker
          selected={category}
          categories={allCats}
          onSelect={(id) => {
            setCategory(id);
            setCatPickerOpen(false);
          }}
          onClose={() => setCatPickerOpen(false)}
          onNewCategory={() => {
            setCatPickerOpen(false);
            setNewCatOpen(true);
          }}
        />
      )}

      {newCatOpen && (
        <NewCategoryModal
          onCancel={() => setNewCatOpen(false)}
          onCreate={(name) => {
            const id = 'custom-' + Date.now();
            setCustomCats((prev) => [...prev, { id, name, icon: MoreHorizontal }]);
            setCategory(id);
            setNewCatOpen(false);
          }}
        />
      )}
    </div>
  );
}

function FormRow({
  label, children, onClick, last,
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
  last?: boolean;
}) {
  const Cmp: any = onClick ? 'button' : 'div';
  return (
    <Cmp
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-5 py-3.5 ${
        !last ? 'border-b border-white/[0.06]' : ''
      } ${onClick ? 'active:bg-white/5' : ''}`}
    >
      <div className="text-[14px] text-white/60 shrink-0">{label}</div>
      <div className="flex-1 text-right min-w-0">{children}</div>
    </Cmp>
  );
}

function CategoryPicker({
  selected, categories, onSelect, onClose, onNewCategory,
}: {
  selected: string;
  categories: Category[];
  onSelect: (id: string) => void;
  onClose: () => void;
  onNewCategory: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-[70] anim-fade" onClick={onClose} />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[70] anim-slide pb-safe">
        <div className="mx-3 mb-3 bg-[#1c1c1e] rounded-3xl overflow-hidden max-h-[75vh] flex flex-col">
          <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-white/[0.06]">
            <div className="text-[15px] font-semibold text-white">Categoria</div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center active:bg-white/15"
              aria-label="Fechar"
            >
              <X size={16} className="text-white" />
            </button>
          </div>
          <div className="overflow-y-auto flex-1">
            {categories.map((cat) => {
              const Icon: LucideIcon = cat.icon;
              const isSelected = cat.id === selected;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelect(cat.id)}
                  className="w-full flex items-center px-5 py-3.5 active:bg-white/5"
                >
                  <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center mr-3">
                    <Icon size={16} className="text-white/70" />
                  </div>
                  <div className="flex-1 text-left text-[15px] text-white">{cat.name}</div>
                  {isSelected && <Check size={18} style={{ color: GOLD }} strokeWidth={2.5} />}
                </button>
              );
            })}
            <button
              onClick={onNewCategory}
              className="w-full flex items-center px-5 py-3.5 active:bg-white/5 border-t border-white/[0.06]"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mr-3"
                style={{ background: 'rgba(201,165,95,0.15)' }}
              >
                <Plus size={16} style={{ color: GOLD }} />
              </div>
              <div className="text-[15px] font-medium" style={{ color: GOLD }}>
                Nova categoria
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function NewCategoryModal({
  onCancel, onCreate,
}: {
  onCancel: () => void;
  onCreate: (name: string) => void;
}) {
  const [name, setName] = useState('');
  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-[80] anim-fade" onClick={onCancel} />
      <div className="fixed inset-x-0 top-1/2 -translate-y-1/2 z-[80] px-8 flex justify-center anim-scale">
        <div className="bg-[#1c1c1e] rounded-2xl max-w-[300px] w-full overflow-hidden">
          <div className="px-6 pt-5 pb-4 text-center">
            <div className="text-[16px] font-semibold text-white">Nova categoria</div>
            <div className="text-[13px] text-white/50 mt-1">Digite o nome</div>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Peças"
              className="mt-4 w-full bg-white/[0.08] rounded-lg px-3 py-2 text-[15px] text-white outline-none placeholder:text-white/30 text-center"
            />
          </div>
          <div className="border-t border-white/[0.1] flex">
            <button
              onClick={onCancel}
              className="flex-1 py-3 text-[15px] text-white border-r border-white/[0.1] active:bg-white/5"
            >
              Cancelar
            </button>
            <button
              onClick={() => name.trim() && onCreate(name.trim())}
              disabled={!name.trim()}
              className="flex-1 py-3 text-[15px] font-semibold active:bg-white/5"
              style={{ color: name.trim() ? GOLD : 'rgba(255,255,255,0.3)' }}
            >
              Criar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
