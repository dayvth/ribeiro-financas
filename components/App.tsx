'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  ArrowDownRight, ArrowUpRight, Building2, Camera, PenLine, Loader2, LogOut,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type {
  Transaction, Period, CustomRange, TransactionType, NewTransactionInput, AnalyzedReceipt,
  PartnerInvestment, NewPartnerInvestmentInput, Partner,
} from '@/lib/types';
import { GOLD } from '@/lib/constants';
import Dashboard from './Dashboard';
import Transactions from './Transactions';
import TransactionForm from './TransactionForm';
import Partners from './Partners';
import PartnerInvestmentForm from './PartnerInvestmentForm';
import BottomBar from './BottomBar';
import { Sheet, SheetOption } from './Sheet';

type FormState = {
  type: TransactionType;
  editingId?: string;
  prefill?: {
    description?: string;
    amount?: number;
    category?: string;
    date?: string;
    receipt?: string;
  };
} | null;

type PartnerFormState = { partner: Partner; initial?: PartnerInvestment } | null;

export default function App({ userEmail }: { userEmail: string }) {
  const supabase = createClient();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [partnerInvestments, setPartnerInvestments] = useState<PartnerInvestment[]>([]);
  const [tab, setTab] = useState<'dashboard' | 'transactions' | 'partners'>('dashboard');
  const [addSheet, setAddSheet] = useState(false);
  const [expenseTypeSheet, setExpenseTypeSheet] = useState(false);
  const [menuSheet, setMenuSheet] = useState(false);
  const [form, setForm] = useState<FormState>(null);
  const [partnerForm, setPartnerForm] = useState<PartnerFormState>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [period, setPeriod] = useState<Period>('month');
  const [custom, setCustom] = useState<CustomRange>(() => {
    const now = new Date();
    return {
      from: `${now.getFullYear()}-01-01`,
      to: `${now.getFullYear()}-12-31`,
    };
  });
  const [customOpen, setCustomOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadTransactions = useCallback(async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) {
      console.error('load error', error);
      return;
    }
    if (data) setTransactions(data as Transaction[]);
  }, [supabase]);

  const loadPartnerInvestments = useCallback(async () => {
    const { data, error } = await supabase
      .from('partner_investments')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) {
      console.error('load partner_investments error', error);
      return;
    }
    if (data) setPartnerInvestments(data as PartnerInvestment[]);
  }, [supabase]);

  useEffect(() => {
    loadTransactions();
    loadPartnerInvestments();
    const channel = supabase
      .channel('ribeiro-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        () => { loadTransactions(); },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'partner_investments' },
        () => { loadPartnerInvestments(); },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadTransactions, loadPartnerInvestments, supabase]);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setExpenseTypeSheet(false);
    setAnalyzing(true);

    try {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('receipts')
        .upload(path, file, { contentType: file.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from('receipts').getPublicUrl(path);
      const receiptUrl = pub.publicUrl;

      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/analyze-receipt', { method: 'POST', body: fd });
      const analyzed: Partial<AnalyzedReceipt> = res.ok ? await res.json() : {};

      setAnalyzing(false);
      setForm({
        type: 'expense',
        prefill: {
          description: analyzed.description ?? '',
          category: analyzed.category ?? 'diesel',
          amount: analyzed.amount ?? 0,
          date: analyzed.date ?? new Date().toISOString().slice(0, 10),
          receipt: receiptUrl,
        },
      });
    } catch (err: any) {
      console.error('receipt error', err);
      setAnalyzing(false);
      alert('Erro ao processar recibo: ' + (err?.message ?? 'tente novamente'));
    }
  }

  async function handleSave(tx: NewTransactionInput) {
    const editingId = form?.editingId;
    if (editingId) {
      const prev = transactions;
      setTransactions((list) =>
        list.map((t) => (t.id === editingId ? { ...t, ...tx } as Transaction : t)),
      );
      const { error } = await supabase
        .from('transactions')
        .update({
          type: tx.type,
          description: tx.description,
          amount: tx.amount,
          date: tx.date,
          category: tx.category,
          receipt_url: tx.receipt_url,
        })
        .eq('id', editingId);
      if (error) {
        alert('Erro ao atualizar: ' + error.message);
        setTransactions(prev);
        return;
      }
      setForm(null);
      return;
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        type: tx.type,
        description: tx.description,
        amount: tx.amount,
        date: tx.date,
        category: tx.category,
        receipt_url: tx.receipt_url,
      })
      .select()
      .single();

    if (error) {
      alert('Erro ao salvar: ' + error.message);
      return;
    }

    if (data) {
      setTransactions((prev) => {
        if (prev.some((t) => t.id === (data as Transaction).id)) return prev;
        return [data as Transaction, ...prev];
      });
    }
    setForm(null);
  }

  function handleEditTransaction(tx: Transaction) {
    setForm({
      type: tx.type,
      editingId: tx.id,
      prefill: {
        description: tx.description,
        amount: Number(tx.amount),
        category: tx.category ?? undefined,
        date: tx.date,
        receipt: tx.receipt_url ?? undefined,
      },
    });
  }

  async function handleDelete(id: string) {
    const prev = transactions;
    setTransactions((p) => p.filter((t) => t.id !== id));
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) {
      alert('Erro ao excluir: ' + error.message);
      setTransactions(prev);
    }
  }

  async function handleSavePartnerInvestment(input: NewPartnerInvestmentInput) {
    const editingId = partnerForm?.initial?.id;
    if (editingId) {
      const prev = partnerInvestments;
      setPartnerInvestments((list) =>
        list.map((i) => (i.id === editingId ? { ...i, ...input } as PartnerInvestment : i)),
      );
      const { error } = await supabase
        .from('partner_investments')
        .update({
          partner: input.partner,
          amount: input.amount,
          description: input.description,
          date: input.date,
          receipt_url: input.receipt_url,
        })
        .eq('id', editingId);
      if (error) {
        alert('Erro ao atualizar: ' + error.message);
        setPartnerInvestments(prev);
        return;
      }
    } else {
      const { data, error } = await supabase
        .from('partner_investments')
        .insert({
          partner: input.partner,
          amount: input.amount,
          description: input.description,
          date: input.date,
          receipt_url: input.receipt_url,
        })
        .select()
        .single();
      if (error) {
        alert('Erro ao salvar: ' + error.message);
        return;
      }
      if (data) {
        setPartnerInvestments((prev) => {
          if (prev.some((i) => i.id === (data as PartnerInvestment).id)) return prev;
          return [data as PartnerInvestment, ...prev];
        });
      }
    }
    setPartnerForm(null);
  }

  async function handleDeletePartnerInvestment(id: string) {
    const prev = partnerInvestments;
    setPartnerInvestments((p) => p.filter((i) => i.id !== id));
    const { error } = await supabase.from('partner_investments').delete().eq('id', id);
    if (error) {
      alert('Erro ao excluir: ' + error.message);
      setPartnerInvestments(prev);
    }
  }

  async function handleSignOut() {
    await fetch('/auth/signout', { method: 'POST' });
    window.location.href = '/login';
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-[430px] min-h-screen bg-black relative overflow-hidden">
        {tab === 'dashboard' && (
          <Dashboard
            transactions={transactions}
            partnerInvestments={partnerInvestments}
            period={period} setPeriod={setPeriod}
            custom={custom} setCustom={setCustom}
            customOpen={customOpen} setCustomOpen={setCustomOpen}
            onMenu={() => setMenuSheet(true)}
            onGoPartners={() => setTab('partners')}
          />
        )}
        {tab === 'transactions' && (
          <Transactions
            transactions={transactions}
            onDelete={handleDelete}
            onEdit={handleEditTransaction}
            onMenu={() => setMenuSheet(true)}
          />
        )}
        {tab === 'partners' && (
          <Partners
            investments={partnerInvestments}
            onAdd={(p) => setPartnerForm({ partner: p })}
            onEdit={(inv) => setPartnerForm({ partner: inv.partner, initial: inv })}
            onDelete={handleDeletePartnerInvestment}
            onMenu={() => setMenuSheet(true)}
          />
        )}

        <BottomBar tab={tab} setTab={setTab} onAdd={() => setAddSheet(true)} />

        <Sheet open={addSheet} onClose={() => setAddSheet(false)} title="Adicionar">
          <SheetOption
            iconEl={<ArrowDownRight size={22} />}
            iconBg="bg-[#ff453a]/12" iconColor="text-[#ff453a]"
            label="Nova despesa"
            onClick={() => { setAddSheet(false); setExpenseTypeSheet(true); }}
          />
          <SheetOption
            iconEl={<ArrowUpRight size={22} />}
            iconBg="bg-[#34c47a]/12" iconColor="text-[#34c47a]"
            label="Nova receita"
            onClick={() => { setAddSheet(false); setForm({ type: 'income' }); }}
          />
          <SheetOption
            iconEl={<Building2 size={22} />}
            iconBg="bg-[#c9a55f]/15" iconColor="text-[#c9a55f]"
            label="Novo investimento"
            onClick={() => { setAddSheet(false); setForm({ type: 'investment' }); }}
          />
        </Sheet>

        <Sheet
          open={expenseTypeSheet}
          onClose={() => setExpenseTypeSheet(false)}
          title="Nova despesa"
        >
          <SheetOption
            iconEl={<Camera size={22} />}
            iconBg="bg-[#c9a55f]/15" iconColor="text-[#c9a55f]"
            label="Fotografar recibo"
            sublabel="A IA identifica os dados"
            onClick={() => fileInputRef.current?.click()}
          />
          <SheetOption
            iconEl={<PenLine size={22} />}
            iconBg="bg-white/10" iconColor="text-white"
            label="Inserir manualmente"
            onClick={() => { setExpenseTypeSheet(false); setForm({ type: 'expense' }); }}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileSelect}
          />
        </Sheet>

        <Sheet open={menuSheet} onClose={() => setMenuSheet(false)} title="Conta">
          <div className="px-3 pt-1 pb-3">
            <div className="text-[13px] text-white/50">Conectado como</div>
            <div className="text-[15px] text-white font-medium truncate">{userEmail}</div>
          </div>
          <SheetOption
            iconEl={<LogOut size={20} />}
            iconBg="bg-white/10" iconColor="text-white"
            label="Sair"
            onClick={handleSignOut}
          />
        </Sheet>

        {analyzing && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[70] flex flex-col items-center justify-center gap-5 anim-fade">
            <Loader2 size={38} className="animate-spin" style={{ color: GOLD }} />
            <div className="text-center px-8">
              <div className="text-white text-[17px] font-medium">Analisando recibo</div>
              <div className="text-white/50 text-[13px] mt-1.5">
                Identificando descrição, valor e categoria
              </div>
            </div>
          </div>
        )}

        {form && (
          <TransactionForm
            type={form.type}
            prefill={form.prefill}
            onCancel={() => setForm(null)}
            onSave={handleSave}
          />
        )}

        {partnerForm && (
          <PartnerInvestmentForm
            partner={partnerForm.partner}
            initial={partnerForm.initial}
            onCancel={() => setPartnerForm(null)}
            onSave={handleSavePartnerInvestment}
          />
        )}
      </div>
    </div>
  );
}
