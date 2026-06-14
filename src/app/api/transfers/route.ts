import { cookies } from "next/headers";
import { scheduleAccountBlock } from "@/lib/schedule-account-block";
import { scheduleTransferReceipt } from "@/lib/schedule-transfer-receipt";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("banking_demo_session")?.value === "authenticated";
  } catch {
    return false;
  }
}

type TransferRequestBody = {
  accountCode?: string | null;
  accountId?: string | null;
  beneficiaryId?: string | null;
  beneficiaryName?: string;
  beneficiaryIban?: string;
  beneficiaryBic?: string | null;
  beneficiaryBank?: string | null;
  beneficiaryEmail?: string | null;
  amount?: number;
  reason?: string | null;
  transferType?: string;
  executionDate?: string | null;
  idempotencyKey?: string | null;
};

type TransferSuccessResponse = {
  success: true;
  transfer: TransferRecord;
  transaction: unknown;
  updatedAccount: unknown;
  emailStatus: EmailStatus;
};

type TransferErrorResponse = {
  success: false;
  error: string;
  message: string;
};

type TransferResponse = TransferSuccessResponse | TransferErrorResponse;

type EmailStatus = "idle" | "sending" | "sent" | "failed";

type TransferRecord = {
  id: string;
  reference: string;
  beneficiary_name: string;
  beneficiary_iban: string;
  beneficiary_bic: string | null;
  beneficiary_bank: string;
  beneficiary_email: string | null;
  amount: number | string;
  execution_date: string;
  email_status: EmailStatus;
  reason?: string | null;
  [key: string]: unknown;
};

type AccountRecord = {
  holder_name?: string | null;
  [key: string]: unknown;
};

type TransferListItem = {
  id: string;
  reference: string;
  beneficiaryName: string;
  beneficiaryIban: string;
  amount: number;
  currency: string;
  reason: string | null;
  transferType: string;
  executionDate: string;
  status: string;
  emailStatus: string;
  createdAt: string;
};

function jsonResponse(body: TransferResponse, status: number) {
  return Response.json(body, { status });
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === "object") {
    const obj = error as Record<string, unknown>;
    if (typeof obj.message === "string" && obj.message) return obj.message;
  }
  return "Unknown transfer error";
}

function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function normalizeTransferType(raw: string | undefined | null): string | null {
  if (!raw) return "instant";
  const lower = raw.toLowerCase().trim();
  if (lower === "immediate") return "instant";
  const allowed = new Set(["instant", "scheduled", "recurring", "direct"]);
  return allowed.has(lower) ? lower : null;
}

function parseRpcError(error: unknown): { code: string; message: string } {
  const msg = getErrorMessage(error);
  const knownErrors: Record<string, string> = {
    INVALID_AMOUNT: "Le montant doit être supérieur à 0",
    ACCOUNT_NOT_FOUND: "Compte introuvable",
    ACCOUNT_NOT_ACTIVE: "Le compte n'est pas actif",
    INSUFFICIENT_FUNDS: "Solde insuffisant pour effectuer ce virement",
    INVALID_TRANSFER_TYPE: "Type de virement invalide",
    REFERENCE_GENERATION_FAILED: "Erreur de génération de référence",
  };

  const msgUpper = msg.toUpperCase();

  for (const [code, humanMessage] of Object.entries(knownErrors)) {
    if (msgUpper.includes(code)) {
      return { code, message: humanMessage };
    }
  }

  console.error("[api/transfers] rpc error:", msg);
  return { code: "TRANSFER_RPC_FAILED", message: "Le virement a échoué" };
}

function rpcErrorStatus(error: unknown): number {
  const msg = getErrorMessage(error).toUpperCase();
  if (msg.includes("INVALID_AMOUNT") || msg.includes("INVALID_TRANSFER_TYPE")) return 400;
  if (msg.includes("ACCOUNT_NOT_FOUND")) return 404;
  return 422;
}

export async function GET(request: Request) {
  try {
    if (!(await isAuthenticated())) {
      return Response.json({ success: false, error: "UNAUTHORIZED", message: "Non authentifié" }, { status: 401 });
    }
    const url = new URL(request.url);
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? Math.min(Math.max(1, parseInt(limitParam)), 50) : 10;

    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from("transfers")
      .select("id, reference, beneficiary_name, beneficiary_iban, amount, currency, reason, transfer_type, execution_date, status, email_status, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[api/transfers] GET failed:", error.message);
      return Response.json({ success: false, error: "TRANSFERS_FETCH_FAILED", message: "Erreur lors du chargement des virements" }, { status: 500 });
    }

    const transfers: TransferListItem[] = (data ?? []).map((item) => ({
      id: item.id,
      reference: item.reference,
      beneficiaryName: item.beneficiary_name,
      beneficiaryIban: item.beneficiary_iban,
      amount: Number(item.amount),
      currency: item.currency ?? "EUR",
      reason: item.reason,
      transferType: item.transfer_type,
      executionDate: item.execution_date,
      status: item.status,
      emailStatus: item.email_status,
      createdAt: item.created_at,
    }));

    return Response.json({ success: true, transfers }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[api/transfers] GET failed:", message);
    return Response.json({ success: false, error: "TRANSFERS_FETCH_FAILED", message: "Erreur lors du chargement des virements" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAuthenticated())) {
      return jsonResponse({ success: false, error: "UNAUTHORIZED", message: "Non authentifié" }, 401);
    }
    let body: TransferRequestBody;
    try {
      body = await request.json() as TransferRequestBody;
    } catch {
      return jsonResponse({ success: false, error: "INVALID_JSON", message: "Corps de la requête invalide" }, 400);
    }

    const accountCode = body.accountCode ?? null;
    const accountId = body.accountId ?? null;

    if (!accountCode && !accountId) {
      return jsonResponse({ success: false, error: "MISSING_ACCOUNT", message: "accountCode ou accountId requis" }, 400);
    }

    const beneficiaryName = body.beneficiaryName?.trim();
    if (!beneficiaryName) {
      return jsonResponse({ success: false, error: "MISSING_BENEFICIARY_NAME", message: "Nom du bénéficiaire requis" }, 400);
    }

    const beneficiaryIban = body.beneficiaryIban?.trim();
    if (!beneficiaryIban) {
      return jsonResponse({ success: false, error: "MISSING_BENEFICIARY_IBAN", message: "IBAN du bénéficiaire requis" }, 400);
    }

    const rawAmount = body.amount;
    const amount = typeof rawAmount === "number" && Number.isFinite(rawAmount) ? rawAmount : Number(rawAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return jsonResponse({ success: false, error: "INVALID_AMOUNT", message: "Le montant doit être un nombre supérieur à 0" }, 400);
    }

    const transferType = normalizeTransferType(body.transferType);
    if (!transferType) {
      return jsonResponse({ success: false, error: "INVALID_TRANSFER_TYPE", message: "Type de virement invalide" }, 400);
    }

    const executionDate = body.executionDate?.trim() || getTodayDateString();
    const reason = body.reason?.trim() || "Virement";
    const beneficiaryBank = body.beneficiaryBank?.trim() || null;
    const beneficiaryBic = body.beneficiaryBic?.trim() || null;
    const beneficiaryEmail = body.beneficiaryEmail?.trim() || null;
    const idempotencyKey = body.idempotencyKey?.trim() || crypto.randomUUID();
    const beneficiaryId = body.beneficiaryId ?? null;

    const supabase = createServerSupabaseClient();

    const { data: blockingCheck } = await supabase
      .from("accounts")
      .select("is_blocked")
      .or(accountId ? `id.eq.${accountId}` : `code.eq.${accountCode}`)
      .single();

    if (blockingCheck?.is_blocked) {
      return jsonResponse({ success: false, error: "ACCOUNT_BLOCKED", message: "Votre compte est temporairement bloqué. Veuillez contacter votre conseiller." }, 403);
    }

    const { data, error } = await supabase.rpc("create_transfer_and_debit_account", {
      p_account_code: accountCode,
      p_account_id: accountId,
      p_beneficiary_id: beneficiaryId,
      p_beneficiary_name: beneficiaryName,
      p_beneficiary_iban: beneficiaryIban,
      p_beneficiary_bic: beneficiaryBic,
      p_beneficiary_bank: beneficiaryBank,
      p_beneficiary_email: beneficiaryEmail,
      p_amount: amount,
      p_reason: reason,
      p_transfer_type: transferType,
      p_execution_date: executionDate,
      p_idempotency_key: idempotencyKey,
    });

    if (error) {
      const parsed = parseRpcError(error);
      return jsonResponse({ success: false, error: parsed.code, message: parsed.message }, rpcErrorStatus(error));
    }

    const rpcData = data as Record<string, unknown> | null;
    if (!rpcData || !rpcData.transfer) {
      console.error("[api/transfers] rpc returned empty data");
      return jsonResponse({ success: false, error: "TRANSFER_RPC_FAILED", message: "Le virement a échoué" }, 500);
    }

    const transfer = rpcData.transfer as TransferRecord;
    const updatedAccount = (rpcData.updated_account ?? null) as AccountRecord | null;
    const accountToSchedule = updatedAccount?.id && typeof updatedAccount.id === "string"
      ? updatedAccount.id
      : typeof transfer.account_id === "string"
        ? transfer.account_id
        : null;

    let finalEmailStatus: EmailStatus = transfer.email_status ?? "idle";
    try {
      await scheduleTransferReceipt(transfer.id, 4);

      if (accountToSchedule) {
        await scheduleAccountBlock(accountToSchedule, 24);
      }
    } catch (bgError) {
      finalEmailStatus = "failed";
      const { error: updateError } = await supabase
        .from("transfers")
        .update({ email_status: finalEmailStatus })
        .eq("id", transfer.id);

      if (updateError) {
        console.error("[DB ERROR] failed to update scheduled transfer email_status", {
          reference: transfer.reference,
          transferId: transfer.id,
          emailStatus: finalEmailStatus,
          message: updateError.message,
        });
      }

      console.error("[EMAIL] unexpected error", {
        transferId: transfer.id,
        message: getErrorMessage(bgError),
      });
    }

    console.log("[ACCOUNT BLOCK] scheduled", {
      accountId: accountToSchedule,
      reference: transfer.reference,
      timestamp: new Date().toISOString(),
    });

    return jsonResponse({
      success: true,
      transfer: {
        ...transfer,
        email_status: finalEmailStatus,
      },
      transaction: rpcData.transaction,
      updatedAccount: rpcData.updated_account,
      emailStatus: finalEmailStatus,
    }, 201);
  } catch (error) {
    console.error("[api/transfers] unexpected error:", getErrorMessage(error));
    return jsonResponse({ success: false, error: "INTERNAL_ERROR", message: "Erreur interne du serveur" }, 500);
  }
}
