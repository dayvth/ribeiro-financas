import type { CustomRange, Period, Transaction } from './types';

const BRL_FULL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
});

const BRL_BIG = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const fmtBRL = (v: number) => BRL_FULL.format(v);
export const fmtBRLBig = (v: number) => BRL_BIG.format(v);

export function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function filterByPeriod(
  txs: Transaction[],
  period: Period,
  custom?: CustomRange,
): Transaction[] {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  let start: Date;
  let end: Date = now;

  if (period === 'week') {
    start = new Date(now);
    start.setDate(now.getDate() - 7);
    start.setHours(0, 0, 0, 0);
  } else if (period === 'month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (period === 'year') {
    start = new Date(now.getFullYear(), 0, 1);
  } else if (period === 'custom' && custom) {
    start = new Date(custom.from + 'T00:00:00');
    if (custom.to) end = new Date(custom.to + 'T23:59:59');
  } else {
    start = new Date(0);
  }

  return txs.filter((t) => {
    const d = new Date(t.date + 'T12:00:00');
    return d >= start && d <= end;
  });
}
