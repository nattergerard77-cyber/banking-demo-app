import { buildBeneficiaryTransferHtml } from "@/emails/beneficiaryTransferEmail";
import { sendEmail } from "@/lib/smtpClient";
import { generateBeneficiaryTransferPdfBase64 } from "@/utils/generateBeneficiaryTransferPdf";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type TransferRequestBody = {
  accountCode?: string | null;
  accountId?: string | null;
  beneficiaryId?: string | null;
  beneficiaryName?: string;
  beneficiaryIban?: string;
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

function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@");

  if (!localPart || !domain) return "invalid-email";

  return `${localPart[0] ?? "*"}***@${domain}`;
}

function formatTransferAmount(amount: number | string): string {
  const parsed = typeof amount === "number" ? amount : Number(amount);

  if (!Number.isFinite(parsed)) return String(amount);

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parsed);
}

async function sendTransferEmail(
  transfer: TransferRecord,
  ordererName: string,
): Promise<EmailStatus> {
  const beneficiaryEmail = transfer.beneficiary_email?.trim();

  if (!beneficiaryEmail) {
    return "idle";
  }

  const executionDateFormatted = new Date(`${transfer.execution_date}T00:00:00`).toLocaleDateString("fr-FR");
  const now = new Date();

  const htmlContent = buildBeneficiaryTransferHtml({
    beneficiaryName: transfer.beneficiary_name,
    amount: formatTransferAmount(transfer.amount),
    ordererName,
    executionDate: executionDateFormatted,
    reference: transfer.reference,
    beneficiaryIban: transfer.beneficiary_iban,
    reason: typeof transfer.reason === "string" ? transfer.reason : undefined,
  });

  let pdfAttachment: { filename: string; content: Buffer; contentType: string } | null = null;

  try {
    const pdf = generateBeneficiaryTransferPdfBase64({
      beneficiaryName: transfer.beneficiary_name,
      beneficiaryBank: transfer.beneficiary_bank || "",
      beneficiaryIban: transfer.beneficiary_iban,
      ordererName,
      amount: formatTransferAmount(transfer.amount),
      reference: transfer.reference,
      executionDate: executionDateFormatted,
      validationDate: now.toLocaleDateString("fr-FR"),
      validationTime: now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      reason: typeof transfer.reason === "string" ? transfer.reason : "",
    });

    pdfAttachment = {
      filename: pdf.fileName,
      content: Buffer.from(pdf.base64, "base64"),
      contentType: "application/pdf",
    };
  } catch (pdfError) {
    console.error("[EMAIL PDF ERROR] Failed to generate PDF attachment", {
      reference: transfer.reference,
      error: getErrorMessage(pdfError),
    });
    return "failed";
  }

  try {
    const emailResult = await sendEmail({
      to: beneficiaryEmail,
      subject: "Avis de virement en votre faveur",
      html: htmlContent,
      attachments: pdfAttachment ? [pdfAttachment] : [],
    });

    if (emailResult.success) {
      console.log("[EMAIL SENT] beneficiary transfer notice", {
        reference: transfer.reference,
        email: maskEmail(beneficiaryEmail),
        messageId: emailResult.messageId,
      });
      return "sent";
    }

    console.error("[EMAIL FAILED]", {
      reference: transfer.reference,
      email: maskEmail(beneficiaryEmail),
      error: emailResult.error,
    });
    return "failed";
  } catch (error) {
    console.error("[EMAIL ERROR] beneficiary transfer send failed", {
      reference: transfer.reference,
      email: maskEmail(beneficiaryEmail),
      message: getErrorMessage(error),
    });
    return "failed";
  }
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

export async function POST(request: Request) {
  try {
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
    const beneficiaryEmail = body.beneficiaryEmail?.trim() || null;
    const idempotencyKey = body.idempotencyKey?.trim() || crypto.randomUUID();
    const beneficiaryId = body.beneficiaryId ?? null;

    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase.rpc("create_transfer_and_debit_account", {
      p_account_code: accountCode,
      p_account_id: accountId,
      p_beneficiary_id: beneficiaryId,
      p_beneficiary_name: beneficiaryName,
      p_beneficiary_iban: beneficiaryIban,
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
    const ordererName = updatedAccount?.holder_name?.trim() || "Frederico Di Mario";

    void sendTransferEmail(transfer, ordererName)
      .then(async (emailStatus) => {
        if (emailStatus === "idle") return;

        const { error: updateError } = await supabase
          .from("transfers")
          .update({ email_status: emailStatus })
          .eq("id", transfer.id);

        if (updateError) {
          console.error("[DB ERROR] failed to update transfer email_status", {
            reference: transfer.reference,
            transferId: transfer.id,
            emailStatus,
            message: updateError.message,
          });
        } else {
          console.log("[DB] transfer email_status updated", {
            reference: transfer.reference,
            transferId: transfer.id,
            emailStatus,
          });
        }
      })
      .catch((bgError) => {
        console.error("[BACKGROUND EMAIL] unexpected error", {
          transferId: transfer.id,
          message: getErrorMessage(bgError),
        });
      });

    return jsonResponse({
      success: true,
      transfer: {
        ...transfer,
        email_status: "sending",
      },
      transaction: rpcData.transaction,
      updatedAccount: rpcData.updated_account,
      emailStatus: "sending",
    }, 201);
  } catch (error) {
    console.error("[api/transfers] unexpected error:", getErrorMessage(error));
    return jsonResponse({ success: false, error: "INTERNAL_ERROR", message: "Erreur interne du serveur" }, 500);
  }
}
