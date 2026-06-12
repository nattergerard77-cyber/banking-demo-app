-- Phase B Supabase - schema, seeds, and transfer RPC.
-- Copy this file into Supabase SQL Editor and run it manually.
-- Do not store API keys or application secrets in this SQL file.

-- 1. Extensions
create extension if not exists "pgcrypto";

-- 2. Helpers updated_at
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 3. Tables
create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  type text not null check (type in ('current', 'savings', 'joint')),
  iban text unique not null,
  currency char(3) not null default 'EUR',
  balance numeric(14,2) not null default 0 check (balance >= 0),
  available_balance numeric(14,2) not null default 0 check (available_balance >= 0),
  status text not null default 'active' check (status in ('active', 'blocked', 'closed')),
  holder_name text not null,
  holder_email text,
  display_order int not null default 0,
  is_blocked boolean not null default false,
  blocked_reason text,
  blocked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists beneficiaries (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  name text not null,
  type text not null default 'individual' check (type in ('individual', 'company')),
  iban text not null,
  bic varchar(11),
  bank text not null,
  email text,
  phone text,
  initials text,
  favorite boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists transfers (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  account_id uuid not null references accounts(id),
  beneficiary_id uuid references beneficiaries(id),
  beneficiary_name text not null,
  beneficiary_iban text not null,
  beneficiary_bic varchar(11),
  beneficiary_bank text not null,
  beneficiary_email text,
  amount numeric(14,2) not null check (amount > 0),
  fees numeric(14,2) not null default 0 check (fees >= 0),
  total_amount numeric(14,2) generated always as (amount + fees) stored,
  currency char(3) not null default 'EUR',
  reason text,
  transfer_type text not null check (transfer_type in ('instant', 'scheduled', 'recurring', 'direct')),
  execution_date date not null,
  status text not null default 'processing' check (status in ('pending', 'scheduled', 'processing', 'executed', 'failed', 'cancelled')),
  email_status text not null default 'idle' check (email_status in ('idle', 'sending', 'sent', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id),
  transfer_id uuid references transfers(id),
  reference text unique,
  label text not null,
  merchant text,
  category text,
  amount numeric(14,2) not null,
  currency char(3) not null default 'EUR',
  direction text not null check (direction in ('credit', 'debit')),
  status text not null default 'executed' check (status in ('pending', 'executed', 'cancelled')),
  transaction_date date not null,
  transaction_time time,
  iban text,
  bank text,
  sender_iban text,
  note text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Indexes
create index if not exists accounts_status_idx on accounts(status);
create index if not exists accounts_display_order_idx on accounts(display_order);
create index if not exists accounts_code_idx on accounts(code);
create index if not exists accounts_is_blocked_idx on accounts(is_blocked);

create index if not exists beneficiaries_active_idx on beneficiaries(active);
create index if not exists beneficiaries_name_idx on beneficiaries(name);
create index if not exists beneficiaries_code_idx on beneficiaries(code);

create index if not exists transfers_account_id_idx on transfers(account_id);
create index if not exists transfers_beneficiary_id_idx on transfers(beneficiary_id);
create index if not exists transfers_execution_date_idx on transfers(execution_date);
create index if not exists transfers_status_idx on transfers(status);
create index if not exists transfers_reference_idx on transfers(reference);

create index if not exists transactions_account_date_idx on transactions(account_id, transaction_date desc);
create index if not exists transactions_transfer_id_idx on transactions(transfer_id);
create index if not exists transactions_direction_idx on transactions(direction);
create index if not exists transactions_reference_idx on transactions(reference);

-- 5. Triggers
drop trigger if exists accounts_set_updated_at on accounts;
create trigger accounts_set_updated_at
before update on accounts
for each row
execute function set_updated_at();

drop trigger if exists beneficiaries_set_updated_at on beneficiaries;
create trigger beneficiaries_set_updated_at
before update on beneficiaries
for each row
execute function set_updated_at();

drop trigger if exists transfers_set_updated_at on transfers;
create trigger transfers_set_updated_at
before update on transfers
for each row
execute function set_updated_at();

drop trigger if exists transactions_set_updated_at on transactions;
create trigger transactions_set_updated_at
before update on transactions
for each row
execute function set_updated_at();

-- 6. Seeds
insert into accounts (
  code,
  name,
  type,
  iban,
  currency,
  balance,
  available_balance,
  status,
  holder_name,
  holder_email,
  display_order
)
values
  -- Re-run this seed to update demo IBANs in an existing Supabase database.
  ('current', 'Compte courant', 'current', 'LU12 0019 1234 5678 9101', 'EUR', 84320.00, 84320.00, 'active', 'Frederico Di Mario', 'fredericodimario8@gmail.com', 1),
  ('savings', 'Compte épargne', 'savings', 'LU44 0019 9876 5432 1001', 'EUR', 185680.00, 185680.00, 'active', 'Frederico Di Mario', 'fredericodimario8@gmail.com', 2),
  ('joint', 'Compte joint', 'joint', 'LU76 0019 4567 8901 2301', 'EUR', 30000.00, 30000.00, 'active', 'Frederico Di Mario', 'fredericodimario8@gmail.com', 3)
on conflict (code) do update set
  -- Important: balances are not updated on seed re-runs to avoid overwriting real transfer state.
  name = excluded.name,
  type = excluded.type,
  iban = excluded.iban,
  currency = excluded.currency,
  status = excluded.status,
  holder_name = excluded.holder_name,
  holder_email = excluded.holder_email,
  display_order = excluded.display_order;

insert into beneficiaries (
  code,
  name,
  type,
  iban,
  bank,
  email,
  phone,
  initials,
  favorite,
  active
)
values
  ('luca-romano', 'Luca Romano', 'individual', 'LU28 0019 1111 2222 3333', 'Banque Raiffeisen Luxembourg', 'luca.romano@example.com', '+39 06 1234 5678', 'LR', true, true),
  ('sofia-bianchi', 'Sofia Bianchi', 'individual', 'LU55 0019 4444 5555 6666', 'Banque de Luxembourg', 'sofia.bianchi@example.com', '+39 06 2345 6789', 'SB', true, true),
  ('marco-conti', 'Marco Conti', 'individual', 'LU82 0019 7777 8888 9999', 'Banque Internationale à Luxembourg', 'marco.conti@example.com', '+39 06 3456 7890', 'MC', false, true)
on conflict (code) do update set
  name = excluded.name,
  type = excluded.type,
  iban = excluded.iban,
  bank = excluded.bank,
  email = excluded.email,
  phone = excluded.phone,
  initials = excluded.initials,
  favorite = excluded.favorite,
  active = excluded.active;

-- Historical Italian incoming transfers. These rows seed displayable history only.
-- The current balance remains stored in accounts and is not recalculated by this seed.
with current_account as (
  select id from accounts where code = 'current'
), historical_transactions as (
  select * from (values
    ('HIST-IT-201501', '2015-01-15'::date, '09:12'::time, 18500.00::numeric),
    ('HIST-IT-201507', '2015-07-15'::date, '16:49'::time, 19000.00::numeric),
    ('HIST-IT-201601', '2016-01-15'::date, '08:41'::time, 17500.00::numeric),
    ('HIST-IT-201607', '2016-07-15'::date, '14:08'::time, 20000.00::numeric),
    ('HIST-IT-201701', '2017-01-15'::date, '10:03'::time, 21000.00::numeric),
    ('HIST-IT-201707', '2017-07-15'::date, '12:22'::time, 19500.00::numeric),
    ('HIST-IT-201801', '2018-01-15'::date, '09:47'::time, 22000.00::numeric),
    ('HIST-IT-201807', '2018-07-15'::date, '17:31'::time, 20500.00::numeric),
    ('HIST-IT-201901', '2019-01-15'::date, '11:09'::time, 23000.00::numeric),
    ('HIST-IT-201907', '2019-07-15'::date, '15:14'::time, 24000.00::numeric),
    ('HIST-IT-202001', '2020-01-15'::date, '08:55'::time, 21500.00::numeric),
    ('HIST-IT-202007', '2020-07-15'::date, '13:26'::time, 22500.00::numeric),
    ('HIST-IT-202101', '2021-01-15'::date, '10:42'::time, 23500.00::numeric),
    ('HIST-IT-202107', '2021-07-15'::date, '16:05'::time, 24500.00::numeric),
    ('HIST-IT-202201', '2022-01-15'::date, '09:18'::time, 25000.00::numeric),
    ('HIST-IT-202207', '2022-07-15'::date, '14:37'::time, 26000.00::numeric)
  ) as item(reference, transaction_date, transaction_time, amount)
)
insert into transactions (
  account_id,
  reference,
  label,
  merchant,
  category,
  amount,
  currency,
  direction,
  status,
  transaction_date,
  transaction_time,
  iban,
  bank,
  sender_iban,
  note,
  metadata
)
select
  current_account.id,
  historical_transactions.reference,
  'Virement reçu — Compte luxembourgeois',
    'Banque Raiffeisen Luxembourg',
    'Virement',
    historical_transactions.amount,
    'EUR',
    'credit',
    'executed',
    historical_transactions.transaction_date,
    historical_transactions.transaction_time,
    'LU12 0019 1234 5678 9101',
    'Banque Raiffeisen Luxembourg',
    'LU28 0019 1111 2222 3333',
    'Virement entrant semestriel depuis un compte luxembourgeois',
  jsonb_build_object('seed', true, 'source', 'italian_history')
from historical_transactions
cross join current_account
on conflict (reference) do update set
  account_id = excluded.account_id,
  label = excluded.label,
  merchant = excluded.merchant,
  category = excluded.category,
  amount = excluded.amount,
  currency = excluded.currency,
  direction = excluded.direction,
  status = excluded.status,
  transaction_date = excluded.transaction_date,
  transaction_time = excluded.transaction_time,
  iban = excluded.iban,
  bank = excluded.bank,
  sender_iban = excluded.sender_iban,
  note = excluded.note,
  metadata = excluded.metadata;

-- 7. RPC
drop function if exists create_transfer_and_debit_account(
  text,
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  text,
  numeric,
  text,
  text,
  date,
  text
);

create function create_transfer_and_debit_account(
  p_account_code text default null,
  p_account_id uuid default null,
  p_beneficiary_id uuid default null,
  p_beneficiary_name text default null,
  p_beneficiary_iban text default null,
  p_beneficiary_bic text default null,
  p_beneficiary_bank text default null,
  p_beneficiary_email text default null,
  p_amount numeric default null,
  p_reason text default null,
  p_transfer_type text default 'instant',
  p_execution_date date default current_date,
  p_idempotency_key text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account accounts%rowtype;
  v_transfer transfers%rowtype;
  v_transaction transactions%rowtype;
  v_reference text;
  v_fees numeric(14,2) := 0;
  v_total numeric(14,2);
  v_attempt int := 0;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'INVALID_AMOUNT';
  end if;

  if p_transfer_type not in ('instant', 'scheduled', 'recurring', 'direct') then
    raise exception 'INVALID_TRANSFER_TYPE';
  end if;

  select *
  into v_account
  from accounts
  where (p_account_id is not null and id = p_account_id)
     or (p_account_id is null and p_account_code is not null and code = p_account_code)
  for update;

  if not found then
    raise exception 'ACCOUNT_NOT_FOUND';
  end if;

  if v_account.status <> 'active' then
    raise exception 'ACCOUNT_NOT_ACTIVE';
  end if;

  v_total := p_amount + v_fees;

  if v_account.available_balance < v_total then
    raise exception 'INSUFFICIENT_FUNDS';
  end if;

  loop
    v_attempt := v_attempt + 1;
    v_reference := 'VIR-' || to_char(now(), 'YYYYMMDD-HH24MI') || '-' || lpad(floor(random() * 10000)::int::text, 4, '0');

    exit when not exists (select 1 from transfers where reference = v_reference);

    if v_attempt >= 10 then
      raise exception 'REFERENCE_GENERATION_FAILED';
    end if;
  end loop;

  update accounts
  set
    balance = balance - v_total,
    available_balance = available_balance - v_total
  where id = v_account.id
  returning * into v_account;

  insert into transfers (
    reference,
    account_id,
    beneficiary_id,
    beneficiary_name,
    beneficiary_iban,
    beneficiary_bic,
    beneficiary_bank,
    beneficiary_email,
    amount,
    fees,
    currency,
    reason,
    transfer_type,
    execution_date,
    status,
    email_status
  )
  values (
    v_reference,
    v_account.id,
    p_beneficiary_id,
    coalesce(nullif(trim(p_beneficiary_name), ''), 'Bénéficiaire'),
    coalesce(nullif(trim(p_beneficiary_iban), ''), 'Non renseigné'),
    nullif(trim(p_beneficiary_bic), ''),
    coalesce(nullif(trim(p_beneficiary_bank), ''), 'Non renseigné'),
    nullif(trim(p_beneficiary_email), ''),
    p_amount,
    v_fees,
    'EUR',
    p_reason,
    p_transfer_type,
    p_execution_date,
    'processing',
    'idle'
  )
  returning * into v_transfer;

  insert into transactions (
    account_id,
    transfer_id,
    reference,
    label,
    merchant,
    category,
    amount,
    currency,
    direction,
    status,
    transaction_date,
    transaction_time,
    iban,
    bank,
    note,
    metadata
  )
  values (
    v_account.id,
    v_transfer.id,
    v_reference,
    'Virement sortant — ' || coalesce(nullif(trim(p_beneficiary_name), ''), 'Bénéficiaire'),
    coalesce(nullif(trim(p_beneficiary_name), ''), 'Bénéficiaire'),
    'Virement',
    -v_total,
    'EUR',
    'debit',
    'executed',
    current_date,
    current_time,
    coalesce(nullif(trim(p_beneficiary_iban), ''), 'Non renseigné'),
    coalesce(nullif(trim(p_beneficiary_bank), ''), 'Non renseigné'),
    p_reason,
    jsonb_strip_nulls(jsonb_build_object(
      'idempotency_key', p_idempotency_key,
      'transfer_type', p_transfer_type
    ))
  )
  returning * into v_transaction;

  -- Block the account after a successful transfer
  update accounts
  set
    is_blocked = true,
    blocked_reason = 'Compte bloqué après virement',
    blocked_at = now()
  where id = v_account.id
  returning * into v_account;

  -- TODO Phase ulterieure: add a dedicated transfer_idempotency table to block duplicate calls.
  -- For now, p_idempotency_key is stored in transaction metadata for traceability only.

  return jsonb_build_object(
    'transfer', to_jsonb(v_transfer),
    'transaction', to_jsonb(v_transaction),
    'updated_account', to_jsonb(v_account)
  );
end;
$$;

-- The RPC is called only by Next.js API routes via SUPABASE_SERVICE_ROLE_KEY.
-- Do not expose this function directly to the browser.
revoke execute on function create_transfer_and_debit_account(
  text,
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  text,
  numeric,
  text,
  text,
  date,
  text
) from public;

revoke execute on function create_transfer_and_debit_account(
  text,
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  text,
  numeric,
  text,
  text,
  date,
  text
) from anon;

revoke execute on function create_transfer_and_debit_account(
  text,
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  text,
  numeric,
  text,
  text,
  date,
  text
) from authenticated;

-- 8. Notes RLS
alter table accounts enable row level security;
alter table beneficiaries enable row level security;
alter table transfers enable row level security;
alter table transactions enable row level security;

-- RLS is enabled, but no permissive public policies are created in Phase B.
-- Future Next.js API routes should use SUPABASE_SERVICE_ROLE_KEY on the server only.
-- Public anon policies can be added later if direct client reads become necessary with real auth.
-- Do not create broad policies such as "allow all public" for banking data.
