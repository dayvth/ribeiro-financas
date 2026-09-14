-- ============================================================
-- V2: whitelist no banco + soft delete + auditoria
-- ============================================================

-- 1) Tabela de emails permitidos (para não precisar deploy pra add sócio)
create table if not exists public.allowed_users (
  email text primary key,
  added_at timestamptz default now()
);

insert into public.allowed_users (email) values
  ('dayvtholiveira@gmail.com'),
  ('dieinison2015@gmail.com')
on conflict (email) do nothing;

alter table public.allowed_users enable row level security;
drop policy if exists "auth read allowed_users" on public.allowed_users;
create policy "auth read allowed_users" on public.allowed_users
  for select to authenticated using (true);

-- 2) Soft delete + auditoria em transactions
alter table public.transactions
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references auth.users(id) on delete set null;
create index if not exists transactions_active_idx on public.transactions (date desc) where deleted_at is null;

-- 3) Soft delete + auditoria em partner_investments
alter table public.partner_investments
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references auth.users(id) on delete set null;
create index if not exists partner_investments_active_idx on public.partner_investments (date desc) where deleted_at is null;

-- 4) Trigger para setar user_id automaticamente em partner_investments
create or replace function public.set_partner_investment_user_id()
returns trigger as $$
begin
  if new.user_id is null then
    new.user_id = auth.uid();
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_partner_investments_user_id on public.partner_investments;
create trigger trg_partner_investments_user_id
  before insert on public.partner_investments
  for each row execute function public.set_partner_investment_user_id();
