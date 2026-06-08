import { jsPDF } from "jspdf";

export type BeneficiaryTransferPdfPayload = {
  beneficiaryName: string;
  beneficiaryBank: string;
  beneficiaryIban: string;
  ordererName: string;
  amount: string;
  reference: string;
  executionDate: string;
  validationDate: string;
  validationTime: string;
  reason: string;
};

export type BeneficiaryTransferPdfResult = {
  fileName: string;
  base64: string;
};

const NAVY = { r: 7, g: 17, b: 58 };
const GREEN = { r: 122, g: 166, b: 0 };
const GREEN_LIGHT = { r: 244, g: 249, b: 232 };
const TEXT = { r: 15, g: 23, b: 42 };
const MUTED = { r: 100, g: 116, b: 139 };
const BORDER = { r: 229, g: 231, b: 235 };
const WHITE = { r: 255, g: 255, b: 255 };

function safeText(value: string | undefined | null): string {
  return value && value.trim().length > 0 ? value.trim() : "-";
}

function fileSafe(value: string): string {
  const normalized = safeText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return normalized
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function ensureCurrency(value: string): string {
  const clean = safeText(value);

  if (clean.toUpperCase().includes("EUR") || clean.includes("€")) {
    return clean;
  }

  return `${clean} EUR`;
}

function drawCheck(doc: jsPDF, cx: number, cy: number): void {
  doc.setFillColor(GREEN_LIGHT.r, GREEN_LIGHT.g, GREEN_LIGHT.b);
  doc.ellipse(cx, cy, 10, 10, "F");

  doc.setDrawColor(GREEN.r, GREEN.g, GREEN.b);
  doc.setLineWidth(0.8);
  doc.ellipse(cx, cy, 6.5, 6.5, "D");

  doc.setLineWidth(1.3);
  doc.line(cx - 3, cy, cx - 0.8, cy + 2.4);
  doc.line(cx - 0.8, cy + 2.4, cx + 4, cy - 3.2);
}

function drawQrPlaceholder(doc: jsPDF, x: number, y: number, size: number): void {
  const cell = size / 9;
  const filledCells: [number, number][] = [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 6],
    [0, 7],
    [0, 8],
    [1, 0],
    [1, 2],
    [1, 4],
    [1, 6],
    [1, 8],
    [2, 0],
    [2, 1],
    [2, 2],
    [2, 5],
    [2, 6],
    [2, 7],
    [2, 8],
    [3, 1],
    [3, 3],
    [3, 5],
    [3, 7],
    [4, 0],
    [4, 2],
    [4, 4],
    [4, 6],
    [4, 8],
    [5, 1],
    [5, 3],
    [5, 5],
    [5, 7],
    [6, 0],
    [6, 1],
    [6, 2],
    [6, 4],
    [6, 7],
    [7, 0],
    [7, 2],
    [7, 5],
    [7, 8],
    [8, 0],
    [8, 1],
    [8, 2],
    [8, 4],
    [8, 6],
    [8, 8],
  ];

  doc.setFillColor(WHITE.r, WHITE.g, WHITE.b);
  doc.setDrawColor(BORDER.r, BORDER.g, BORDER.b);
  doc.setLineWidth(0.3);
  doc.rect(x, y, size, size, "FD");
  doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);

  for (const [row, col] of filledCells) {
    doc.rect(x + col * cell, y + row * cell, cell, cell, "F");
  }
}

function drawHeaderPattern(doc: jsPDF): void {
  doc.setDrawColor(38, 52, 92);
  doc.setLineWidth(0.18);

  for (let i = 0; i < 9; i++) {
    const x = 154 + i * 6;
    doc.line(x, 0, x + 14, 48);
  }
}

function drawInfoRow(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
  separator: boolean,
): void {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.text(label, x, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(TEXT.r, TEXT.g, TEXT.b);
  const valueLines = doc.splitTextToSize(safeText(value), 78) as string[];
  doc.text(valueLines.slice(0, 2), x + width, y, { align: "right" });

  if (separator) {
    doc.setDrawColor(BORDER.r, BORDER.g, BORDER.b);
    doc.setLineWidth(0.15);
    doc.line(x, y + 5, x + width, y + 5);
  }
}

function drawCardTitle(doc: jsPDF, title: string, x: number, y: number): void {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
  doc.text(title, x, y);
}

export function generateBeneficiaryTransferPdfBase64(
  payload: BeneficiaryTransferPdfPayload,
): BeneficiaryTransferPdfResult {
  const doc = new jsPDF("portrait", "mm", "a4");
  const fileName = `Avis-virement-${fileSafe(payload.beneficiaryName)}-${fileSafe(
    payload.reference,
  )}.pdf`;

  doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);
  doc.rect(0, 0, 210, 48, "F");
  drawHeaderPattern(doc);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(WHITE.r, WHITE.g, WHITE.b);
  doc.text("RAIFFEISEN", 105, 15, { align: "center" });

  doc.setFillColor(GREEN.r, GREEN.g, GREEN.b);
  doc.rect(94, 21, 22, 0.8, "F");

  doc.setFontSize(24);
  doc.text("Avis de virement", 105, 36, { align: "center" });

  drawCheck(doc, 105, 66);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(GREEN.r, GREEN.g, GREEN.b);
  doc.text("Virement en cours de traitement", 105, 84, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(TEXT.r, TEXT.g, TEXT.b);
  doc.text("Un virement a été enregistré en votre faveur", 105, 93, {
    align: "center",
  });

  doc.setFontSize(10);
  doc.text(`Bonjour ${safeText(payload.beneficiaryName)},`, 24, 108);
  doc.text(
    "Nous vous informons qu’un virement a été enregistré en votre faveur.",
    24,
    116,
  );

  doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);
  doc.roundedRect(24, 128, 162, 34, 3, 3, "F");
  doc.setFillColor(GREEN.r, GREEN.g, GREEN.b);
  doc.rect(24, 128, 3, 34, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(WHITE.r, WHITE.g, WHITE.b);
  doc.text("Montant reçu", 34, 141);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text(ensureCurrency(payload.amount), 34, 156);

  doc.setFillColor(WHITE.r, WHITE.g, WHITE.b);
  doc.setDrawColor(BORDER.r, BORDER.g, BORDER.b);
  doc.setLineWidth(0.25);
  doc.roundedRect(24, 174, 162, 42, 3, 3, "FD");
  drawCardTitle(doc, "Informations du bénéficiaire", 34, 187);
  drawInfoRow(doc, "Bénéficiaire", payload.beneficiaryName, 34, 199, 142, true);
  drawInfoRow(doc, "Banque bénéficiaire", payload.beneficiaryBank, 34, 208, 142, true);
  drawInfoRow(doc, "IBAN bénéficiaire", payload.beneficiaryIban, 34, 217, 142, false);

  doc.setFillColor(WHITE.r, WHITE.g, WHITE.b);
  doc.setDrawColor(BORDER.r, BORDER.g, BORDER.b);
  doc.roundedRect(24, 224, 162, 52, 3, 3, "FD");
  drawCardTitle(doc, "Informations opération", 34, 237);
  drawInfoRow(doc, "Donneur d’ordre", payload.ordererName, 34, 247, 142, true);
  drawInfoRow(doc, "Date d’exécution", payload.executionDate, 34, 255, 142, true);
  drawInfoRow(doc, "Date de validation", payload.validationDate, 34, 263, 142, true);
  drawInfoRow(doc, "Heure", payload.validationTime, 34, 271, 142, false);

  doc.setFillColor(GREEN_LIGHT.r, GREEN_LIGHT.g, GREEN_LIGHT.b);
  doc.setDrawColor(GREEN.r, GREEN.g, GREEN.b);
  doc.roundedRect(24, 280, 162, 8, 3, 3, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
  doc.text("Référence", 34, 285);
  doc.text("Motif", 104, 285);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(TEXT.r, TEXT.g, TEXT.b);
  doc.text(safeText(payload.reference), 54, 285);
  doc.text(doc.splitTextToSize(safeText(payload.reason), 58)[0], 115, 285);

  doc.setDrawColor(BORDER.r, BORDER.g, BORDER.b);
  doc.setLineWidth(0.25);
  doc.line(24, 289, 186, 289);
  drawQrPlaceholder(doc, 24, 291, 4);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(TEXT.r, TEXT.g, TEXT.b);
  doc.text("Service Opérations — Raiffeisen", 32, 292);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.text("Document établi électroniquement et destiné au bénéficiaire.", 32, 295);
  doc.text("Page 1 / 1", 176, 295, { align: "right" });

  const dataUri = doc.output("datauristring");
  const base64 = dataUri.split(",")[1];

  return {
    fileName,
    base64,
  };
}
