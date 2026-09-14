-- ============================================================
-- V4: múltiplos comprovantes por lançamento
-- ============================================================

alter table public.transactions
  add column if not exists receipt_urls text[];

alter table public.partner_investments
  add column if not exists receipt_urls text[];

-- Backfill do campo antigo para o novo (mantém receipt_url para compatibilidade)
update public.transactions
set receipt_urls = array[receipt_url]
where receipt_url is not null and (receipt_urls is null or array_length(receipt_urls, 1) is null);

update public.partner_investments
set receipt_urls = array[receipt_url]
where receipt_url is not null and (receipt_urls is null or array_length(receipt_urls, 1) is null);
