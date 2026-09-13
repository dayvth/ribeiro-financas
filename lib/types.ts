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
