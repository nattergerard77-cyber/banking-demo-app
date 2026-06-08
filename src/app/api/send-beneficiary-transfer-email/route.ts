import { BrevoClient } from "@getbrevo/brevo";

import { buildBeneficiaryTransferHtml } from "@/emails/beneficiaryTransferEmail";

export const runtime = "nodejs";

type SendBeneficiaryTransferEmailBody = {
  beneficiaryEmail?: unknown;
  beneficiaryName?: unknown;
  amount?: unknown;
  reference?: unknown;
  executionDate?: unknown;
  validationDate?: unknown;
  validationTime?: unknown;
  pdfBase64?: unknown;
  pdfFileName?: unknown;
  ordererName?: unknown;
  reason?: unknown;
};

const MAX_PDF_BYTES = 10 * 1024 * 1024;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function jsonResponse(body: { success: false; error: string } | { success: true; emailId?: string }, status: number) {
  return Response.json(body, { status });
}

function getRequiredString(
  body: SendBeneficiaryTransferEmailBody,
  field: keyof SendBeneficiaryTransferEmailBody,
): string | null {
  const value = body[field];

  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  return value.trim();
}

function getPdfByteLength(pdfBase64: string): number {
  return Buffer.byteLength(pdfBase64, "base64");
}

function getSafeErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unknown Brevo error";
}

export async function POST(request: Request) {
  let body: SendBeneficiaryTransferEmailBody;

  try {
    const parsedBody: unknown = await request.json();

    if (
      typeof parsedBody !== "object" ||
      parsedBody === null ||
      Array.isArray(parsedBody)
    ) {
      return jsonResponse({ success: false, error: "Payload invalide" }, 400);
    }

    body = parsedBody as SendBeneficiaryTransferEmailBody;
  } catch {
    return jsonResponse({ success: false, error: "Payload invalide" }, 400);
  }

  const beneficiaryEmail = getRequiredString(body, "beneficiaryEmail");
  const beneficiaryName = getRequiredString(body, "beneficiaryName");
  const amount = getRequiredString(body, "amount");
  const reference = getRequiredString(body, "reference");
  const executionDate = getRequiredString(body, "executionDate");
  const pdfBase64 = getRequiredString(body, "pdfBase64");
  const pdfFileName = getRequiredString(body, "pdfFileName");
  const ordererName = getRequiredString(body, "ordererName");

  if (
    !beneficiaryEmail ||
    !beneficiaryName ||
    !amount ||
    !reference ||
    !executionDate ||
    !pdfBase64 ||
    !pdfFileName ||
    !ordererName
  ) {
    return jsonResponse({ success: false, error: "Payload invalide" }, 400);
  }

  if (!beneficiaryEmail.match(EMAIL_REGEX)) {
    return jsonResponse({ success: false, error: "Email bénéficiaire invalide" }, 400);
  }

  if (pdfBase64.length === 0) {
    return jsonResponse({ success: false, error: "Pièce jointe PDF manquante" }, 400);
  }

  if (getPdfByteLength(pdfBase64) > MAX_PDF_BYTES) {
    return jsonResponse({ success: false, error: "Pièce jointe PDF trop volumineuse" }, 400);
  }

  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "Raiffeisen";

  if (!apiKey || !senderEmail) {
    console.error("[brevo] configuration missing:", {
      hasApiKey: Boolean(apiKey),
      hasSenderEmail: Boolean(senderEmail),
    });
    return jsonResponse({ success: false, error: "BREVO_NOT_CONFIGURED" }, 500);
  }

  const htmlContent = buildBeneficiaryTransferHtml({
    beneficiaryName,
    amount,
    ordererName,
    executionDate,
    reference,
  });

  try {
    const brevo = new BrevoClient({ apiKey });
    const result = await brevo.transactionalEmails.sendTransacEmail({
      sender: { email: senderEmail, name: senderName },
      to: [{ email: beneficiaryEmail, name: beneficiaryName }],
      subject: "Avis de virement en votre faveur",
      htmlContent,
      attachment: [
        {
          name: pdfFileName,
          content: pdfBase64,
        },
      ],
    });

    return jsonResponse({ success: true, emailId: result.messageId }, 200);
  } catch (error) {
    console.error("[brevo] send failed:", getSafeErrorMessage(error));
    return jsonResponse({ success: false, error: "BREVO_SEND_FAILED" }, 500);
  }
}
