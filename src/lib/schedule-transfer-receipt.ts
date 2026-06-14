import { buildBeneficiaryTransferHtml } from "@/emails/beneficiaryTransferEmail";

import { sendEmail } from "./emailClient";
import { generateTransferPdfBase64 } from "./pdf-generator";
import { createServerSupabaseClient } from "./supabase/server";

const RECEIPT_DELAY_MINUTES = 4;

type ReceiptEmailStatus = "idle" | "sent" | "failed";

type TransferReceiptRecord = {
  id: string;
  reference: string;
  account_id: string;
  beneficiary_name: string;
  beneficiary_iban: string;
  beneficiary_bank: string;
  beneficiary_email: string | null;
  amount: number | string;
  currency: string;
  execution_date: string;
  created_at: string;
  email_status: string;
  status: string;
  reason?: string | null;
};

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

async function resolveOrdererName(accountId: string): Promise<string> {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("accounts")
    .select("holder_name")
    .eq("id", accountId)
    .maybeSingle();

  return data?.holder_name?.trim() || "Frederico Di Mario";
}

async function sendTransferReceiptEmail(
  transfer: TransferReceiptRecord,
  ordererName: string,
): Promise<ReceiptEmailStatus> {
  const beneficiaryEmail = transfer.beneficiary_email?.trim();

  if (!beneficiaryEmail) {
    console.error("[EMAIL DELIVERY] skipped: missing beneficiary email", {
      reference: transfer.reference,
      transferId: transfer.id,
    });
    return "failed";
  }

  const executionDateFormatted = new Date(`${transfer.execution_date}T00:00:00`).toLocaleDateString("fr-FR");

  let pdfAttachment: { filename: string; content: Buffer; contentType: string } | null = null;

  try {
    const pdf = generateTransferPdfBase64({
      beneficiaryName: transfer.beneficiary_name,
      beneficiaryIban: transfer.beneficiary_iban,
      donorName: ordererName,
      amount: Number(transfer.amount),
      currency: transfer.currency ?? "EUR",
      reference: transfer.reference,
      date: executionDateFormatted,
      status: "En cours de traitement",
    });

    pdfAttachment = {
      filename: pdf.fileName,
      content: Buffer.from(pdf.base64, "base64"),
      contentType: "application/pdf",
    };
  } catch (error) {
    console.error("[EMAIL PDF ERROR] Failed to generate delayed receipt PDF", {
      reference: transfer.reference,
      transferId: transfer.id,
      error: error instanceof Error ? error.message : String(error),
    });
    return "failed";
  }

  try {
    const htmlContent = buildBeneficiaryTransferHtml({
      beneficiaryName: transfer.beneficiary_name,
      amount: formatTransferAmount(transfer.amount),
      ordererName,
      executionDate: executionDateFormatted,
      reference: transfer.reference,
      beneficiaryIban: transfer.beneficiary_iban,
      reason: typeof transfer.reason === "string" ? transfer.reason : undefined,
    });

    const emailResult = await sendEmail({
      to: beneficiaryEmail,
      subject: "Avis de virement reçu — Raiffeisen",
      html: htmlContent,
      attachments: pdfAttachment ? [pdfAttachment] : [],
    });

    console.log("[EMAIL DELIVERY] delayed receipt sent", {
      reference: transfer.reference,
      transferId: transfer.id,
      to: maskEmail(beneficiaryEmail),
      messageId: emailResult.id,
      timestamp: new Date().toISOString(),
    });

    return "sent";
  } catch (error) {
    console.error("[EMAIL DELIVERY] delayed receipt failed", {
      reference: transfer.reference,
      transferId: transfer.id,
      to: maskEmail(beneficiaryEmail),
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    return "failed";
  }
}

export async function scheduleTransferReceipt(transferId: string, delayMinutes = RECEIPT_DELAY_MINUTES) {
  const supabase = createServerSupabaseClient();
  const executeAt = new Date();
  executeAt.setMinutes(executeAt.getMinutes() + delayMinutes);

  const { error } = await supabase
    .from("transfers")
    .update({ email_status: "idle" })
    .eq("id", transferId);

  if (error) {
    console.error("[EMAIL DELIVERY] failed to schedule delayed receipt", {
      transferId,
      error: error.message,
    });
    throw error;
  }

  console.log("[EMAIL DELIVERY] delayed receipt scheduled", {
    transferId,
    executeAt: executeAt.toISOString(),
  });

  return executeAt.toISOString();
}

export async function processScheduledTasks(delayMinutes = RECEIPT_DELAY_MINUTES) {
  const supabase = createServerSupabaseClient();
  const executeBefore = new Date();
  executeBefore.setMinutes(executeBefore.getMinutes() - delayMinutes);

  const { data: transfers, error } = await supabase
    .from("transfers")
    .select("id, reference, account_id, beneficiary_name, beneficiary_iban, beneficiary_bank, beneficiary_email, amount, currency, execution_date, created_at, email_status, status, reason")
    .eq("status", "processing")
    .eq("email_status", "idle")
    .lte("created_at", executeBefore.toISOString());

  if (error) {
    console.error("[EMAIL DELIVERY] failed to fetch delayed receipt tasks", error);
    throw error;
  }

  let sent = 0;
  let failed = 0;

  for (const transfer of (transfers ?? []) as TransferReceiptRecord[]) {
    try {
      const ordererName = await resolveOrdererName(transfer.account_id);
      const emailStatus = await sendTransferReceiptEmail(transfer, ordererName);

      const { error: updateError } = await supabase
        .from("transfers")
        .update({ email_status: emailStatus })
        .eq("id", transfer.id);

      if (updateError) {
        console.error("[EMAIL DELIVERY] failed to persist delayed receipt status", {
          transferId: transfer.id,
          reference: transfer.reference,
          emailStatus,
          error: updateError.message,
        });
        failed += 1;
        continue;
      }

      if (emailStatus === "sent") {
        sent += 1;
      } else {
        failed += 1;
      }
    } catch (error) {
      console.error("[EMAIL DELIVERY] unexpected delayed receipt error", {
        transferId: transfer.id,
        reference: transfer.reference,
        error: error instanceof Error ? error.message : String(error),
      });

      const { error: updateError } = await supabase
        .from("transfers")
        .update({ email_status: "failed" })
        .eq("id", transfer.id);

      if (updateError) {
        console.error("[EMAIL DELIVERY] failed to mark delayed receipt as failed", {
          transferId: transfer.id,
          reference: transfer.reference,
          error: updateError.message,
        });
      }

      failed += 1;
    }
  }

  return {
    processed: transfers?.length ?? 0,
    sent,
    failed,
    timestamp: new Date().toISOString(),
  };
}
