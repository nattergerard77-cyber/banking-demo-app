// Fix RPC Supabase — Instructions à exécuter dans Supabase SQL Editor
// Exécute : node scripts/fix-rpc.mjs

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "..", ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Variables d'environnement manquantes");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function checkState() {
  console.log("\n1. Vérification de l'état actuel...\n");

  // Test RPC avec tous les paramètres (13 params)
  const { error } = await supabase.rpc("create_transfer_and_debit_account", {
    p_account_code: "current",
    p_account_id: null,
    p_beneficiary_id: null,
    p_beneficiary_name: "Test",
    p_beneficiary_iban: "LU1234567890",
    p_beneficiary_bic: "BCEELULL",
    p_beneficiary_bank: "Test Bank",
    p_beneficiary_email: "test@test.com",
    p_amount: 10,
    p_reason: "Test",
    p_transfer_type: "instant",
    p_execution_date: "2026-06-13",
    p_idempotency_key: `test-fix-${Date.now()}`,
  });

  if (!error) {
    console.log("  ✅ RPC fonctionne déjà correctement !");
    return "OK";
  }

  if (error.message?.includes("PGRST203")) {
    console.log("  ❌ DEUX versions de la RPC (12 et 13 params)");
    console.log("  → Doit supprimer l'ancienne version");
    return "OVERLOADED";
  }

  if (error.message?.includes("beneficiary_bic")) {
    console.log("  ❌ Colonne beneficiary_bic manquante dans transfers");
    return "MISSING_COLUMN";
  }

  if (error.message?.includes("does not exist") || error.message?.includes("Could not find")) {
    console.log("  ❌ RPC introuvable dans Supabase");
    return "MISSING_RPC";
  }

  console.log(`  ❌ Erreur: ${error.message}`);
  return "UNKNOWN";
}

function printSQL(state) {
  console.log("\n2. SQL À EXÉCUTER DANS SUPABASE SQL EDITOR\n");
  console.log("=".repeat(70));

  if (state === "MISSING_COLUMN" || state === "OVERLOADED") {
    console.log("-- Ajouter la colonne manquante");
    console.log("ALTER TABLE transfers ADD COLUMN IF NOT EXISTS beneficiary_bic VARCHAR(11);\n");

    console.log("-- Ajouter BIC à beneficiaries (si pas déjà fait)");
    console.log("ALTER TABLE beneficiaries ADD COLUMN IF NOT EXISTS bic VARCHAR(11);\n");
  }

  if (state === "OVERLOADED") {
    console.log("-- Supprimer l'ancienne RPC (12 params, sans BIC)");
    console.log(`DROP FUNCTION IF EXISTS public.create_transfer_and_debit_account(
  text, uuid, uuid, text, text, text, text, text, numeric, text, text, date, text
);\n`);
  }

  console.log("-- Recréer la RPC (exécute la section 7. RPC du schema_seed.sql)");
  console.log("-- Copie-colle les lignes 285-525 de supabase/schema_seed.sql\n");

  if (state === "MISSING_RPC") {
    console.log("-- La RPC n'existe pas du tout. Exécute TOUT le fichier schema_seed.sql\n");
  }

  console.log("-- Vérification après exécution");
  console.log("SELECT proname, pg_get_function_arguments(oid) AS args");
  console.log("FROM pg_proc");
  console.log("WHERE proname = 'create_transfer_and_debit_account';\n");
  console.log("=".repeat(70));
}

async function main() {
  console.log("🔧 Fix RPC Supabase — create_transfer_and_debit_account");

  const state = await checkState();

  if (state === "OK") {
    console.log("\n✅ Aucun correctif nécessaire.");
    return;
  }

  printSQL(state);

  console.log(`\n📌 Problème: ${state}`);
  console.log("   Exécute le SQL ci-dessus dans Supabase Dashboard → SQL Editor");
}

main().catch(console.error);
