-- Script de maintenance demo.
-- Reinitialise les IBAN et les soldes des comptes de demonstration.
-- A executer manuellement dans Supabase SQL Editor.
-- Ne supprime aucune transaction ni aucun virement.
-- Objectif : revenir au total initial de 300 000 EUR.

-- 1. Remet a jour les comptes : IBAN LU, soldes initiaux
update accounts
set
  iban = case code
    when 'current' then 'LU12 0019 1234 5678 9101'
    when 'savings' then 'LU44 0019 9876 5432 1001'
    when 'joint'   then 'LU76 0019 4567 8901 2301'
    else iban
  end,
  balance = case code
    when 'current' then 84320.00
    when 'savings' then 185680.00
    when 'joint'   then 30000.00
    else balance
  end,
  available_balance = case code
    when 'current' then 84320.00
    when 'savings' then 185680.00
    when 'joint'   then 30000.00
    else available_balance
  end,
  is_blocked = false,
  blocked_reason = null,
  blocked_at = null
where code in ('current', 'savings', 'joint');

-- 2. Remet a jour les beneficiaires : IBAN LU, banque LU
update beneficiaries
set
  iban = case code
    when 'luca-romano'  then 'LU28 0019 1111 2222 3333'
    when 'sofia-bianchi' then 'LU55 0019 4444 5555 6666'
    when 'marco-conti'  then 'LU82 0019 7777 8888 9999'
    else iban
  end,
  bank = case code
    when 'luca-romano'  then 'Banque Raiffeisen Luxembourg'
    when 'sofia-bianchi' then 'Banque de Luxembourg'
    when 'marco-conti'  then 'Banque Internationale a Luxembourg'
    else bank
  end
where code in ('luca-romano', 'sofia-bianchi', 'marco-conti');

-- 3. Met a jour les transactions historiques (IBAN LU, labels)
update transactions
set
  iban = 'LU12 0019 1234 5678 9101',
  bank = 'Banque Raiffeisen Luxembourg',
  sender_iban = 'LU28 0019 1111 2222 3333',
  merchant = 'Banque Raiffeisen Luxembourg',
  label = replace(label, 'Compte italien', 'Compte luxembourgeois')
where reference like 'HIST-IT-%'
   or (metadata->>'source' = 'italian_history');

-- 4. Verifie les comptes mis a jour
select
  code,
  name,
  iban,
  balance,
  available_balance
from accounts
where code in ('current', 'savings', 'joint')
order by display_order;

-- 5. Verifie le total des soldes
select
  sum(balance) as total_balance,
  sum(available_balance) as total_available_balance
from accounts
where code in ('current', 'savings', 'joint');

-- 6. Verifie les beneficiaires mis a jour
select
  code,
  name,
  iban,
  bank
from beneficiaries
where code in ('luca-romano', 'sofia-bianchi', 'marco-conti')
order by code;

-- 7. Verifie les transactions historiques
select
  reference,
  label,
  iban,
  sender_iban,
  bank
from transactions
where reference like 'HIST-IT-%'
limit 5;
