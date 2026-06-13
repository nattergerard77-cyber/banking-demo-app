-- Migration: Ajouter colonne rejected_at et statut rejected aux transfers

-- 1. Ajouter la colonne rejected_at
ALTER TABLE transfers
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP NULL;

-- 2. Étendre la contrainte CHECK du statut pour inclure 'rejected'
ALTER TABLE transfers
DROP CONSTRAINT IF EXISTS transfers_status_check;

ALTER TABLE transfers
ADD CONSTRAINT transfers_status_check
CHECK (status IN ('pending', 'scheduled', 'processing', 'executed', 'failed', 'cancelled', 'rejected'));

-- 3. Index pour les requêtes de rejet
CREATE INDEX IF NOT EXISTS transfers_rejected_at_idx
ON transfers(rejected_at);

-- 4. Index pour la recherche des virements à rejeter
CREATE INDEX IF NOT EXISTS transfers_reject_search_idx
ON transfers(status, created_at, rejected_at)
WHERE status = 'executed' AND rejected_at IS NULL;
