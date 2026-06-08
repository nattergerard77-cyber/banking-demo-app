import { jsPDF } from "jspdf";

export type TransferPdfPayload = {
  holderName: string;
  holderEmail: string;
  debitAccountName: string;
  debitIban: string;
  beneficiaryName: string;
  beneficiaryBank: string;
  beneficiaryIban: string;
  beneficiaryEmail?: string;
  beneficiaryPhone?: string;
  transferType: string;
  executionDate: string;
  validationDate: string;
  validationTime: string;
  temporaryReference: string;
  finalReference: string;
  reason: string;
  amount: string;
  fees: string;
  total: string;
};

// Colors
const NAVY = { r: 7, g: 17, b: 58 };
const GREEN = { r: 122, g: 166, b: 0 };
const GREEN_LIGHT = { r: 244, g: 249, b: 232 };
const BORDER = { r: 229, g: 231, b: 235 };
const TEXT = { r: 15, g: 23, b: 42 };
const MUTED = { r: 100, g: 116, b: 139 };

function ensureCurrency(value: string): string {
  if (!value) return "0,00 EUR";
  const clean = value.trim();
  if (clean.toUpperCase().includes("EUR") || clean.includes("€")) return clean;
  return `${clean} EUR`;
}

function maskIban(iban: string): string {
  const clean = iban.replace(/\s+/g, "").toUpperCase();
  if (clean.length < 8) return iban || "Non renseigné";
  return `${clean.slice(0, 4)} ${clean.slice(4, 8)} **** **** ${clean.slice(-4)}`;
}

function safeText(value: string | undefined | null): string {
  return value ? String(value) : "";
}

function fileSafe(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function drawHeaderPattern(doc: jsPDF): void {
  doc.setDrawColor(40, 55, 100);
  doc.setLineWidth(0.18);
  for (let i = 0; i < 9; i++) {
    const xs = 155 + i * 6;
    doc.line(xs, 0, xs + 14, 44);
  }
  for (let i = 0; i < 4; i++) {
    const xs = 170 + i * 8;
    doc.line(xs, 44, xs + 14, 0);
  }
}

function drawCheck(doc: jsPDF, cx: number, cy: number): void {
  // Halo
  doc.setFillColor(GREEN_LIGHT.r, GREEN_LIGHT.g, GREEN_LIGHT.b);
  doc.ellipse(cx, cy, 13, 13, "F");
  // Circle outline
  doc.setDrawColor(GREEN.r, GREEN.g, GREEN.b);
  doc.setLineWidth(0.9);
  doc.ellipse(cx, cy, 8, 8, "D");
  // Checkmark
  doc.setDrawColor(GREEN.r, GREEN.g, GREEN.b);
  doc.setLineWidth(1.5);
  doc.line(cx - 3.5, cy, cx - 0.8, cy + 2.8);
  doc.line(cx - 0.8, cy + 2.8, cx + 4.5, cy - 3.5);
}

function drawTicketRow(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
  separator: boolean,
): void {
  doc.setFontSize(9);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.setFont("helvetica", "normal");
  doc.text(label, x, y);

  doc.setTextColor(TEXT.r, TEXT.g, TEXT.b);
  doc.setFont("helvetica", "bold");
  doc.text(value, x + width, y, { align: "right" });

  if (separator) {
    doc.setDrawColor(BORDER.r, BORDER.g, BORDER.b);
    doc.setLineWidth(0.15);
    doc.line(x, y + 2.5, x + width, y + 2.5);
  }
}

/** Draws a realistic-looking QR code placeholder using a fixed 9×9 grid */
function drawQrPlaceholder(doc: jsPDF, x: number, y: number, size: number): void {
  const cellSize = size / 9;

  // White background with border
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(BORDER.r, BORDER.g, BORDER.b);
  doc.setLineWidth(0.3);
  doc.rect(x, y, size, size, "FD");

  // Fill color for modules
  doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);

  // Finder patterns (3×3 blocks in three corners)
  // Top-left finder
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      doc.rect(x + c * cellSize, y + r * cellSize, cellSize, cellSize, "F");
    }
  }
  // Inner white square of top-left finder
  doc.setFillColor(255, 255, 255);
  doc.rect(x + cellSize * 0.6, y + cellSize * 0.6, cellSize * 1.8, cellSize * 1.8, "F");
  doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);
  doc.rect(x + cellSize * 1.0, y + cellSize * 1.0, cellSize * 1.0, cellSize * 1.0, "F");

  // Top-right finder
  const trx = x + size - 3 * cellSize;
  doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      doc.rect(trx + c * cellSize, y + r * cellSize, cellSize, cellSize, "F");
    }
  }
  doc.setFillColor(255, 255, 255);
  doc.rect(trx + cellSize * 0.6, y + cellSize * 0.6, cellSize * 1.8, cellSize * 1.8, "F");
  doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);
  doc.rect(trx + cellSize * 1.0, y + cellSize * 1.0, cellSize * 1.0, cellSize * 1.0, "F");

  // Bottom-left finder
  const bly = y + size - 3 * cellSize;
  doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      doc.rect(x + c * cellSize, bly + r * cellSize, cellSize, cellSize, "F");
    }
  }
  doc.setFillColor(255, 255, 255);
  doc.rect(x + cellSize * 0.6, bly + cellSize * 0.6, cellSize * 1.8, cellSize * 1.8, "F");
  doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);
  doc.rect(x + cellSize * 1.0, bly + cellSize * 1.0, cellSize * 1.0, cellSize * 1.0, "F");

  // Deterministic data modules (fixed matrix, no Math.random)
  // Row, Col pairs for filled data cells (0-indexed, avoiding finder zones)
  const dataCells: [number, number][] = [
    [0, 4], [1, 3], [1, 5], [2, 4],
    [3, 1], [3, 3], [3, 5], [3, 7],
    [4, 0], [4, 2], [4, 4], [4, 6], [4, 8],
    [5, 1], [5, 3], [5, 5], [5, 7],
    [6, 4], [7, 3], [7, 5], [8, 4],
    [3, 4], [5, 4],
    [0, 5], [2, 3], [6, 5], [8, 3],
    [7, 7], [7, 8], [8, 7],
  ];

  doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);
  for (const [row, col] of dataCells) {
    // Skip cells that overlap with finder patterns
    const inTopLeft = row < 3 && col < 3;
    const inTopRight = row < 3 && col >= 6;
    const inBottomLeft = row >= 6 && col < 3;
    if (!inTopLeft && !inTopRight && !inBottomLeft) {
      doc.rect(x + col * cellSize, y + row * cellSize, cellSize, cellSize, "F");
    }
  }
}

export function generateTransferPdf(payload: TransferPdfPayload): void {
  const doc = new jsPDF("portrait", "mm", "a4");
  const clientRef = "12345678";

  // ── 1. HEADER NAVY (h = 44) ──
  doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);
  doc.rect(0, 0, 210, 44, "F");

  drawHeaderPattern(doc);

  // Brand
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("RAIFFEISEN", 105, 13, { align: "center" });

  // Green line
  doc.setFillColor(GREEN.r, GREEN.g, GREEN.b);
  doc.rect(94, 18.5, 22, 0.7, "F");

  // Title
  doc.setFontSize(22);
  doc.text("Reçu de virement", 105, 33, { align: "center" });

  // ── 2. SUCCESS BADGE ──
  drawCheck(doc, 105, 64);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(GREEN.r, GREEN.g, GREEN.b);
  doc.text("Virement effectué avec succès", 105, 85, { align: "center" });

  // ── 3. TICKET CARD (y = 94, h = 88) ──
  // Shadow
  doc.setDrawColor(245, 246, 248);
  doc.setLineWidth(0.3);
  doc.roundedRect(24.4, 94.4, 162, 88, 3, 3, "D");

  // Card
  doc.setDrawColor(BORDER.r, BORDER.g, BORDER.b);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(24, 94, 162, 88, 3, 3, "FD");

  // Notches (r = 3.2, at y = 138)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(BORDER.r, BORDER.g, BORDER.b);
  doc.setLineWidth(0.25);
  doc.ellipse(24, 138, 3.2, 3.2, "FD");
  doc.ellipse(186, 138, 3.2, 3.2, "FD");

  // ── 3a. 4-column summary ──
  const colW = 35.5;
  const colX = 34;

  doc.setFontSize(6.5);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.setFont("helvetica", "bold");
  doc.text("Référence", colX, 107);
  doc.text("Date", colX + colW, 107);
  doc.text("Heure", colX + colW * 2, 107);
  doc.text("Type de virement", colX + colW * 3, 107);

  doc.setFontSize(8);
  doc.setTextColor(TEXT.r, TEXT.g, TEXT.b);
  doc.text(safeText(payload.finalReference), colX, 114);
  doc.text(safeText(payload.validationDate), colX + colW, 114);
  doc.text(safeText(payload.validationTime), colX + colW * 2, 114);
  doc.text(safeText(payload.transferType), colX + colW * 3, 114);

  // Column separators
  doc.setDrawColor(BORDER.r, BORDER.g, BORDER.b);
  doc.setLineWidth(0.15);
  doc.line(colX + colW - 2, 102, colX + colW - 2, 119);
  doc.line(colX + colW * 2 - 2, 102, colX + colW * 2 - 2, 119);
  doc.line(colX + colW * 3 - 2, 102, colX + colW * 3 - 2, 119);

  // Horizontal separator
  doc.line(34, 127, 176, 127);

  // ── 3b. Detail rows ──
  const ry = 137;
  const rh = 7.5;
  drawTicketRow(doc, "Date d'exécution", safeText(payload.executionDate), 34, ry, 142, true);
  drawTicketRow(doc, "Bénéficiaire", safeText(payload.beneficiaryName), 34, ry + rh, 142, true);
  drawTicketRow(doc, "Banque", safeText(payload.beneficiaryBank), 34, ry + rh * 2, 142, true);
  drawTicketRow(doc, "IBAN bénéficiaire", safeText(payload.beneficiaryIban), 34, ry + rh * 3, 142, true);
  drawTicketRow(doc, "Compte à débiter", safeText(payload.debitAccountName), 34, ry + rh * 4, 142, true);
  drawTicketRow(doc, "IBAN débité", maskIban(payload.debitIban), 34, ry + rh * 5, 142, true);
  drawTicketRow(doc, "Motif", safeText(payload.reason) || "-", 34, ry + rh * 6, 142, false);

  // ── 4. AMOUNT BLOCK (y = 190, h = 36) ──
  doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);
  doc.roundedRect(24, 190, 162, 36, 2, 2, "F");

  // Green left bar
  doc.setFillColor(GREEN.r, GREEN.g, GREEN.b);
  doc.rect(24, 190, 2.5, 36, "F");

  // Decorative diagonal lines
  doc.setDrawColor(30, 45, 90);
  doc.setLineWidth(0.2);
  for (let i = 0; i < 5; i++) {
    const xs = 162 + i * 4;
    doc.line(xs, 190, xs + 8, 226);
  }

  // Amount label + value
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.text("Montant viré", 34, 201);

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(ensureCurrency(payload.amount), 34, 219);

  // Vertical separator
  doc.setDrawColor(80, 95, 140);
  doc.setLineWidth(0.25);
  doc.line(116, 196, 116, 221);

  // Fees
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.text("Frais", 126, 201);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(payload.fees, 126, 210);

  // Separator
  doc.setDrawColor(80, 95, 140);
  doc.setLineWidth(0.15);
  doc.line(126, 214, 153, 214);

  // Total
  doc.setFontSize(8);
  doc.setTextColor(GREEN.r, GREEN.g, GREEN.b);
  doc.setFont("helvetica", "normal");
  doc.text("Total débité", 126, 219);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text(ensureCurrency(payload.total), 176, 219, { align: "right" });

  // ── 5. TRACKING BLOCK (y = 233, h = 28) ──
  doc.setFillColor(GREEN_LIGHT.r, GREEN_LIGHT.g, GREEN_LIGHT.b);
  doc.setDrawColor(GREEN.r, GREEN.g, GREEN.b);
  doc.setLineWidth(0.35);
  doc.roundedRect(24, 233, 162, 28, 3, 3, "FD");

  // Check icon
  doc.setFillColor(GREEN.r, GREEN.g, GREEN.b);
  doc.ellipse(38, 247, 3.5, 3.5, "F");
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.8);
  doc.line(36, 247, 37.5, 248.5);
  doc.line(37.5, 248.5, 40.5, 245.5);

  // Text
  doc.setFontSize(10);
  doc.setTextColor(TEXT.r, TEXT.g, TEXT.b);
  doc.setFont("helvetica", "bold");
  doc.text("Suivi de l'opération", 50, 242);

  doc.setTextColor(GREEN.r, GREEN.g, GREEN.b);
  doc.text("Pris en compte", 50, 248);

  doc.setFontSize(7.5);
  doc.setTextColor(TEXT.r, TEXT.g, TEXT.b);
  doc.setFont("helvetica", "normal");
  doc.text("Votre virement a été pris en compte et sera exécuté à la date indiquée.", 50, 254);
  doc.text("Vous serez informé dès que l'opération sera réalisée.", 50, 257.5);

  // Faint bank building watermark
  doc.setFillColor(232, 242, 218);
  doc.rect(162, 246, 2.5, 8, "F");
  doc.rect(167.5, 246, 2.5, 8, "F");
  doc.rect(173, 246, 2.5, 8, "F");
  doc.triangle(160, 245, 178, 245, 169, 240, "F");
  doc.rect(159, 254, 20, 1.2, "F");

  // ── 6. FOOTER ──
  // Separator
  doc.setDrawColor(BORDER.r, BORDER.g, BORDER.b);
  doc.setLineWidth(0.3);
  doc.line(24, 269, 186, 269);

  // QR code placeholder (16×16)
  drawQrPlaceholder(doc, 24, 273, 16);

  // Footer text
  doc.setFontSize(7.5);
  doc.setTextColor(TEXT.r, TEXT.g, TEXT.b);
  doc.setFont("helvetica", "bold");
  doc.text("Document généré automatiquement", 45, 276);

  doc.setFontSize(6.5);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.setFont("helvetica", "normal");
  doc.text("Ce document est établi électroniquement", 45, 280);
  doc.text("et ne nécessite pas de signature.", 45, 283);

  // Separator 1
  doc.setDrawColor(BORDER.r, BORDER.g, BORDER.b);
  doc.line(112, 273, 112, 288);

  // Client reference
  doc.setFontSize(7);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.text("Référence client", 122, 277);
  doc.setFontSize(8.5);
  doc.setTextColor(TEXT.r, TEXT.g, TEXT.b);
  doc.setFont("helvetica", "bold");
  doc.text(clientRef, 122, 284);

  // Separator 2
  doc.setDrawColor(BORDER.r, BORDER.g, BORDER.b);
  doc.line(154, 273, 154, 288);

  // Page number
  doc.setFontSize(7);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.setFont("helvetica", "normal");
  doc.text("Page", 166, 277);
  doc.setFontSize(8.5);
  doc.setTextColor(TEXT.r, TEXT.g, TEXT.b);
  doc.setFont("helvetica", "bold");
  doc.text("1 / 1", 166, 284);

  // ── 7. BOTTOM NAVY STRIPE ──
  doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);
  doc.rect(0, 293, 210, 4, "F");

  // Save
  doc.save(`Bordereau-virement-${fileSafe(payload.finalReference)}.pdf`);
}
