-- ============================================================
-- Ribeiro Mineração — Partner Investments
-- Tabela para registrar investimentos pessoais dos sócios
-- Cole tudo isto no SQL Editor do Supabase e rode
-- ============================================================

create table if not exists public.partner_investments (
  id uuid primary key default gen_random_uuid(),
  partner text not null check (partner in ('dayvth', 'dieinison')),
  amount numeric(14,2) not null check (amount > 0),
  description text not null,
  date date not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists partner_investments_partner_idx on public.partner_investments (partner);
create index if not exists partner_investments_date_idx on public.partner_investments (date desc);

drop trigger if exists trg_partner_investments_updated_at on public.partner_investments;
create trigger trg_partner_investments_updated_at
  before update on public.partner_investments
  for each row execute function public.set_updated_at();

alter table public.partner_investments enable row level security;

drop policy if exists "auth read partner_inv"   on public.partner_investments;
drop policy if exists "auth insert partner_inv" on public.partner_investments;
drop policy if exists "auth update partner_inv" on public.partner_investments;
drop policy if exists "auth delete partner_inv" on public.partner_investments;

create policy "auth read partner_inv"   on public.partner_investments for select to authenticated using (true);
create policy "auth insert partner_inv" on public.partner_investments for insert to authenticated with check (true);
create policy "auth update partner_inv" on public.partner_investments for update to authenticated using (true) with check (true);
create policy "auth delete partner_inv" on public.partner_investments for delete to authenticated using (true);

alter publication supabase_realtime add table public.partner_investments;
