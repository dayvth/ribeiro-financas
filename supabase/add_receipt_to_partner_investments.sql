-- Migration: adiciona coluna de comprovante em partner_investments
alter table public.partner_investments
  add column if not exists receipt_url text;
