export type TransactionType = 'expense' | 'income' | 'investment';

export type Transaction = {
  id: string;
  user_id: string | null;
  type: TransactionType;
  description: string;
  category: string | null;
  amount: number;
  date: string; // YYYY-MM-DD
  receipt_url: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Period = 'week' | 'month' | 'year' | 'custom';
export type CustomRange = { from: string; to: string };

export type NewTransactionInput = {
  type: TransactionType;
  description: string;
  amount: number;
  date: string;
  category: string | null;
  receipt_url: string | null;
};

export type AnalyzedReceipt = {
  description: string | null;
  amount: number | null;
  date: string | null;
  category: string | null;
};

export type Partner = 'dayvth' | 'dieinison';

export type PartnerInvestment = {
  id: string;
  partner: Partner;
  amount: number;
  description: string;
  date: string;
  receipt_url: string | null;
  user_id: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  created_at: string;
  updated_at: string;
};

export type NewPartnerInvestmentInput = {
  partner: Partner;
  amount: number;
  description: string;
  date: string;
  receipt_url: string | null;
};

export const PARTNERS: { id: Partner; name: string; photo: string }[] = [
  { id: 'dayvth', name: 'Dayvth', photo: '/partners/dayvth.jpg' },
  { id: 'dieinison', name: 'Dieinison', photo: '/partners/dieinison.jpg' },
];
