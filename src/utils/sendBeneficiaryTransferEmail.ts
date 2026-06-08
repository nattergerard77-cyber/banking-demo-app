import { generateBeneficiaryTransferPdfBase64 } from "./generateBeneficiaryTransferPdf";

export type EmailStatus = "idle" | "sending" | "sent" | "failed";

export type SendBeneficiaryTransferEmailPayload = {
  beneficiaryEmail: string;
  beneficiaryName: string;
  beneficiaryBank: string;
  beneficiaryIban: string;
  amount: string;
  reference: string;
  executionDate: string;
  validationDate: string;
  validationTime: string;
  reason: string;
  ordererName: string;
};

export type SendBeneficiaryTransferEmailResult = {
  status: EmailStatus;
  error?: string;
};

type SendBeneficiaryTransferEmailApiResponse = {
  success?: boolean;
  error?: string;
};

function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@");

  if (!localPart || !domain) return "invalid-email";

  return `${localPart[0] ?? "*"}***@${domain}`;
}

function logEmailSendFailure(message: string, reference?: string, email?: string, httpStatus?: number): void {
  console.error("[beneficiary-email] send failed:", {
    message,
    reference,
    email: email ? maskEmail(email) : undefined,
    httpStatus,
  });
}

export async function sendBeneficiaryTransferEmail(
  payload: SendBeneficiaryTransferEmailPayload,
): Promise<SendBeneficiaryTransferEmailResult> {
  const beneficiaryEmail = payload.beneficiaryEmail.trim();

  if (!beneficiaryEmail) {
    logEmailSendFailure("Email bénéficiaire manquant", payload.reference);
    return { status: "failed", error: "Email bénéficiaire manquant" };
  }

  if (!beneficiaryEmail.includes("@")) {
    logEmailSendFailure("Email bénéficiaire invalide", payload.reference, beneficiaryEmail);
    return { status: "failed", error: "Email bénéficiaire invalide" };
  }

  try {
    const pdf = generateBeneficiaryTransferPdfBase64({
      beneficiaryName: payload.beneficiaryName,
      beneficiaryBank: payload.beneficiaryBank,
      beneficiaryIban: payload.beneficiaryIban,
      ordererName: payload.ordererName,
      amount: payload.amount,
      reference: payload.reference,
      executionDate: payload.executionDate,
      validationDate: payload.validationDate,
      validationTime: payload.validationTime,
      reason: payload.reason,
    });

    if (!pdf.base64 || !pdf.fileName) {
      logEmailSendFailure("PDF impossible à générer", payload.reference, beneficiaryEmail);
      return { status: "failed", error: "PDF impossible à générer" };
    }

    const response = await fetch("/api/send-beneficiary-transfer-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        beneficiaryEmail,
        beneficiaryName: payload.beneficiaryName,
        amount: payload.amount,
        reference: payload.reference,
        executionDate: payload.executionDate,
        validationDate: payload.validationDate,
        validationTime: payload.validationTime,
        pdfBase64: pdf.base64,
        pdfFileName: pdf.fileName,
        ordererName: payload.ordererName,
        reason: payload.reason,
      }),
    });

    let data: SendBeneficiaryTransferEmailApiResponse = {};

    try {
      data = (await response.json()) as SendBeneficiaryTransferEmailApiResponse;
    } catch {
      logEmailSendFailure("Réponse API invalide", payload.reference, beneficiaryEmail, response.status);
      return { status: "failed", error: "Réponse API invalide" };
    }

    if (response.ok && data.success === true) {
      return { status: "sent" };
    }

    const errorMessage = data.error || "Réponse API success false";
    logEmailSendFailure(errorMessage, payload.reference, beneficiaryEmail, response.status);

    return {
      status: "failed",
      error: errorMessage,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "API inaccessible";
    logEmailSendFailure(message || "API inaccessible", payload.reference, beneficiaryEmail);

    return { status: "failed", error: message || "API inaccessible" };
  }
}
