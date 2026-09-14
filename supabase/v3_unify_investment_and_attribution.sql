-- ============================================================
-- V3: unifica investimentos + atribui todo lançamento ao sócio
-- ============================================================

-- 1) Coluna partner em transactions (quem lançou)
alter table public.transactions
  add column if not exists partner text check (partner in ('dayvth', 'dieinison'));

create index if not exists transactions_partner_idx on public.transactions (partner) where deleted_at is null;

-- 2) Trigger para preencher partner automaticamente pelo email do usuário
create or replace function public.set_transaction_partner()
returns trigger as $$
declare v_email text;
begin
  if new.partner is null then
    select email into v_email from auth.users
      where id = coalesce(new.user_id, auth.uid());
    new.partner := case
      when lower(v_email) = 'dayvtholiveira@gmail.com' then 'dayvth'
      when lower(v_email) = 'dieinison2015@gmail.com'  then 'dieinison'
      else null
    end;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_transactions_partner on public.transactions;
create trigger trg_transactions_partner
  before insert on public.transactions
  for each row execute function public.set_transaction_partner();

-- 3) Backfill partner para transações antigas
update public.transactions t
set partner = case
  when lower(u.email) = 'dayvtholiveira@gmail.com' then 'dayvth'
  when lower(u.email) = 'dieinison2015@gmail.com'  then 'dieinison'
end
from auth.users u
where u.id = t.user_id and t.partner is null;

-- 4) Migrar registros com type='investment' para partner_investments
insert into public.partner_investments (partner, amount, description, date, receipt_url, user_id, created_at)
select
  case
    when lower(u.email) = 'dayvtholiveira@gmail.com' then 'dayvth'
    when lower(u.email) = 'dieinison2015@gmail.com'  then 'dieinison'
  end,
  t.amount, t.description, t.date, t.receipt_url, t.user_id, t.created_at
from public.transactions t
join auth.users u on u.id = t.user_id
where t.type = 'investment'
  and t.deleted_at is null
  and lower(u.email) in ('dayvtholiveira@gmail.com', 'dieinison2015@gmail.com');

-- 5) Soft-delete os investimentos antigos que foram migrados (não somem, só saem do fluxo)
update public.transactions
set deleted_at = now(),
    deleted_by = user_id
where type = 'investment' and deleted_at is null;
