-- ============================================================
-- Ribeiro Mineração — Schema
-- Cole tudo isto no SQL Editor do Supabase e rode
-- ============================================================

-- Tabela de categorias (para categorias customizadas criadas pelo app)
create table if not exists public.categories (
  id text primary key,
  name text not null,
  created_at timestamptz default now()
);

-- Tabela principal de movimentações
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  type text not null check (type in ('expense', 'income', 'investment')),
  description text not null,
  category text,
  amount numeric(14,2) not null check (amount > 0),
  date date not null,
  receipt_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists transactions_date_idx on public.transactions (date desc);
create index if not exists transactions_type_idx on public.transactions (type);

-- Trigger para updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_transactions_updated_at on public.transactions;
create trigger trg_transactions_updated_at
  before update on public.transactions
  for each row execute function public.set_updated_at();

-- Set user_id automaticamente ao inserir
create or replace function public.set_user_id()
returns trigger as $$
begin
  if new.user_id is null then
    new.user_id = auth.uid();
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_transactions_user_id on public.transactions;
create trigger trg_transactions_user_id
  before insert on public.transactions
  for each row execute function public.set_user_id();

-- ============================================================
-- RLS — todo usuário autenticado tem acesso total
-- (são só 2 usuários, sem separação por dono)
-- ============================================================
alter table public.transactions enable row level security;
alter table public.categories enable row level security;

drop policy if exists "auth read all txns"   on public.transactions;
drop policy if exists "auth insert txns"     on public.transactions;
drop policy if exists "auth update txns"     on public.transactions;
drop policy if exists "auth delete txns"     on public.transactions;

create policy "auth read all txns"   on public.transactions for select to authenticated using (true);
create policy "auth insert txns"     on public.transactions for insert to authenticated with check (true);
create policy "auth update txns"     on public.transactions for update to authenticated using (true) with check (true);
create policy "auth delete txns"     on public.transactions for delete to authenticated using (true);

drop policy if exists "auth read cats"   on public.categories;
drop policy if exists "auth insert cats" on public.categories;

create policy "auth read cats"   on public.categories for select to authenticated using (true);
create policy "auth insert cats" on public.categories for insert to authenticated with check (true);

-- ============================================================
-- Realtime — habilita para transactions
-- ============================================================
alter publication supabase_realtime add table public.transactions;

-- ============================================================
-- Storage bucket para recibos
-- (também dá para criar via UI: Storage > New bucket > "receipts", public)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', true)
on conflict (id) do nothing;

-- Policies de storage
drop policy if exists "auth upload receipts" on storage.objects;
drop policy if exists "public read receipts" on storage.objects;
drop policy if exists "auth delete receipts" on storage.objects;

create policy "auth upload receipts" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'receipts');

create policy "public read receipts" on storage.objects
  for select to public
  using (bucket_id = 'receipts');

create policy "auth delete receipts" on storage.objects
  for delete to authenticated
  using (bucket_id = 'receipts');
