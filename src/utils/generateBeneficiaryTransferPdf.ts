import jsPDF from "jspdf";

function drawCheck(doc: jsPDF, cx: number, cy: number, r: number): void {
  doc.setFillColor(122, 166, 0);
  doc.setDrawColor(122, 166, 0);
  doc.circle(cx, cy, r, "DF");

  doc.setFillColor(255, 255, 255);
  const s = r * 0.42;
  doc.setLineWidth(2.5);
  doc.setDrawColor(255, 255, 255);
  doc.line(cx - s, cy, cx - s * 0.15, cy + s * 0.6);
  doc.line(cx + s * 0.15, cy + s * 0.6, cx + s, cy - s * 0.5);
}

function drawQrPlaceholder(doc: jsPDF, x: number, y: number, size: number): void {
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(248, 248, 248);
  doc.roundedRect(x, y, size, size, 2, 2, "DF");
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text("QR", x + size / 2, y + size / 2, { align: "center", baseline: "middle" });
}

type PdfPayload = {
  beneficiaryName: string;
  amount: string;
  ordererName: string;
  executionDate: string;
  reference: string;
  beneficiaryIban?: string;
  ordererIban?: string;
  reason?: string;
  // used by route.ts caller
  beneficiaryBank?: string;
  validationDate?: string;
  validationTime?: string;
};

type PdfResult = {
  fileName: string;
  base64: string;
};

function escapeText(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function maskIbanRaw(iban: string): string {
  const c = iban.replace(/\s+/g, "");
  if (c.length < 10) return iban;
  return `${c.slice(0, 4)} **** **** ${c.slice(-4)}`;
}

export function generateBeneficiaryTransferPdf(payload: PdfPayload): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const PAGE_W = 210;
  const PAGE_H = 297;
  const M = 20;
  const bodyX = M;
  const bodyW = PAGE_W - 2 * M;
  let y = M;

  doc.setFont("Helvetica", "normal");

  // Colors
  const NAVY = [11, 31, 58] as const;
  const GOLD = [212, 175, 55] as const;
  const GREEN = [122, 166, 0] as const;
  const MUTED = [100, 116, 139] as const;
  const LIGHT_BG = [248, 250, 252] as const;
  const BORDER = [226, 232, 240] as const;

  // ── HEADER ──
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, 48, "F");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("RAIFFEISEN", PAGE_W / 2, 20, { align: "center" });

  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.8);
  doc.line(PAGE_W / 2 - 15, 25.5, PAGE_W / 2 + 15, 25.5);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(180, 190, 205);
  doc.text("Avis de virement reçu", PAGE_W / 2, 33, { align: "center" });
  doc.setFontSize(7);
  doc.text("Service Opérations Bancaires", PAGE_W / 2, 38.5, { align: "center" });

  y = 60;

  // ── CONFIRMATION BANNER ──
  doc.setFillColor(240, 244, 249);
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.6);
  doc.roundedRect(bodyX, y, bodyW, 16, 2, 2, "FD");

  drawCheck(doc, bodyX + 10, y + 8, 4.5);
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(30, 50, 70);
  doc.text("Virement enregistré avec succès — en cours de traitement", bodyX + 18, y + 11);

  y += 28;

  // ── AMOUNT CARD ──
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.4);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(bodyX, y, bodyW, 36, 3, 3, "FD");

  doc.setFillColor(...GREEN);
  doc.rect(bodyX, y, 3, 36, "F");

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("MONTANT REÇU", bodyX + 14, y + 9);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(...NAVY);
  doc.text(payload.amount, bodyX + 14, y + 30);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.text("Devise : EUR", bodyX + 14, y + 37); // outside card but close

  y += 48;

  // ── CARD helper ──
  function drawInfoCard(
    title: string,
    rows: [string, string][],
    startY: number,
    doc: jsPDF,
  ): number {
    const cardH = 12 + rows.length * 11;
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.4);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(bodyX, startY, bodyW, cardH, 3, 3, "FD");

    doc.setFillColor(...LIGHT_BG);
    doc.rect(bodyX + 1, startY + 1, bodyW - 2, 10, "F");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...NAVY);
    doc.text(title, bodyX + 12, startY + 8);

    let cy = startY + 20;
    for (const [label, value] of rows) {
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      doc.text(label, bodyX + 12, cy);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...NAVY);
      doc.text(value, bodyX + bodyW - 12, cy, { align: "right" });
      cy += 11;
    }
    return startY + cardH + 8;
  }

  // ── BENEFICIARY INFO ──
  const beneficiaryRows: [string, string][] = [
    ["Bénéficiaire", payload.beneficiaryName],
    ["IBAN bénéficiaire", payload.beneficiaryIban ? maskIbanRaw(payload.beneficiaryIban) : "-"],
  ];
  y = drawInfoCard("Informations du bénéficiaire", beneficiaryRows, y, doc);

  // ── ORDERER INFO ──
  const ordererRows: [string, string][] = [
    ["Donneur d'ordre", payload.ordererName],
  ];
  if (payload.reason) {
    ordererRows.push(["Raison du virement", payload.reason]);
  }
  if (payload.ordererIban) {
    ordererRows.push(["IBAN donneur", maskIbanRaw(payload.ordererIban)]);
  }
  y = drawInfoCard("Informations du donneur d'ordre", ordererRows, y, doc);

  // ── OPERATION INFO ──
  const opRows: [string, string][] = [
    ["Référence", payload.reference],
    ["Date d'exécution prévue", payload.executionDate],
    ["Statut", "Virement en cours de traitement"],
  ];
  y = drawInfoCard("Informations opération", opRows, y, doc);

  // Ensure space for amounts card
  if (y + 40 > PAGE_H - 30) {
    doc.addPage();
    y = M;
  }

  // ── AMOUNTS CARD ──
  const amountsRows: [string, string][] = [
    ["Montant virement", payload.amount],
    ["Frais", "0,00 EUR"],
    ["Total", payload.amount],
  ];
  y = drawInfoCard("Montants", amountsRows, y, doc);

  // ── QR CODE ──
  drawQrPlaceholder(doc, bodyX + bodyW - 28, y, 20);

  y += 30;

  // ── SECURITY NOTICE ──
  if (y + 20 > PAGE_H - 35) {
    doc.addPage();
    y = M;
  }

  doc.setDrawColor(253, 230, 138);
  doc.setFillColor(254, 243, 199);
  doc.roundedRect(bodyX, y, bodyW, 14, 2, 2, "FD");
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(124, 45, 18);
  doc.text("Par mesure de s\u00e9curit\u00e9, Raiffeisen ne vous demandera jamais de communiquer vos identifiants,", bodyX + 4, y + 5.5);
  doc.text("mots de passe ou codes de s\u00e9curit\u00e9 par email.", bodyX + 4, y + 11);

  y += 24;

  // ── FOOTER ──
  if (y + 30 > PAGE_H) {
    doc.addPage();
    y = M;
  }

  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.3);
  doc.line(bodyX, y, bodyX + bodyW, y);
  y += 6;
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.text(
    "Raiffeisen Bank — Service Opérations Bancaires | support@raiffeisen.com",
    bodyX,
    y,
  );
  y += 4;
  doc.text("Cet avis a été généré automatiquement. Aucune signature n'est requise.", bodyX, y);

  // ── PAGE NUMBERS ──
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(190, 190, 190);
    doc.text(
      `Page ${i} / ${pageCount}`,
      PAGE_W - M,
      PAGE_H - 10,
      { align: "right" },
    );
  }

  return doc;
}

function fileSafe(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function generateBeneficiaryTransferPdfBase64(payload: PdfPayload): PdfResult {
  const doc = generateBeneficiaryTransferPdf(payload);
  const fileName = `Avis-virement-${fileSafe(payload.beneficiaryName)}-${fileSafe(payload.reference)}.pdf`;
  const dataUri = doc.output("datauristring");
  const base64 = dataUri.includes("base64,") ? dataUri.split("base64,")[1] : dataUri;
  return { fileName, base64 };
}

export { escapeText, maskIbanRaw };
