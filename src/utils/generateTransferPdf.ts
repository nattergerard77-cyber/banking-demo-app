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
  holderName?: string;
  holderEmail?: string;
  debitAccountName?: string;
  debitIban?: string;
  ordererName?: string;
  ordererIban?: string;
  beneficiaryName: string;
  beneficiaryBank?: string;
  beneficiaryIban: string;
  beneficiaryEmail?: string;
  beneficiaryPhone?: string;
  transferType?: string;
  amount: string;
  executionDate: string;
  reference?: string;
  temporaryReference?: string;
  finalReference?: string;
  validationDate?: string;
  validationTime?: string;
  reason?: string;
  fees?: string;
  total?: string;
};

export function generateTransferPdf(payload: PdfPayload): jsPDF {
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
  doc.text("Confirmation de virement", PAGE_W / 2, 33, { align: "center" });
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
  doc.text("Virement enregistr\u00e9 avec succ\u00e8s", bodyX + 18, y + 11);

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
  doc.text("MONTANT D\u00c9BIT\u00c9", bodyX + 14, y + 9);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(...NAVY);
  doc.text(payload.amount, bodyX + 14, y + 30);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.text("Devise : EUR", bodyX + 14, y + 37);

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

  // ── ORDERER INFO ──
  const ordererRows: [string, string][] = [
    ["Donneur d'ordre", payload.ordererName || payload.holderName || "-"],
    ["IBAN donneur", payload.ordererIban || payload.debitIban || "-"],
  ];
  if (payload.debitAccountName) {
    ordererRows.push(["Compte débité", payload.debitAccountName]);
  }
  y = drawInfoCard("Informations du donneur d'ordre", ordererRows, y, doc);

  // ── BENEFICIARY INFO ──
  const beneficiaryRows: [string, string][] = [
    ["B\u00e9n\u00e9ficiaire", payload.beneficiaryName],
    ["IBAN b\u00e9n\u00e9ficiaire", payload.beneficiaryIban],
  ];
  if (payload.beneficiaryBank) {
    beneficiaryRows.push(["Banque", payload.beneficiaryBank]);
  }
  y = drawInfoCard("Informations du b\u00e9n\u00e9ficiaire", beneficiaryRows, y, doc);

  // ── OPERATION INFO ──
  const displayRef = payload.finalReference || payload.reference || "-";
  const opRows: [string, string][] = [
    ["R\u00e9f\u00e9rence", displayRef],
    ["Date d'ex\u00e9cution pr\u00e9vue", payload.executionDate],
    ["Statut", "Virement en cours de traitement"],
  ];
  if (payload.transferType) {
    opRows.push(["Type", payload.transferType]);
  }
  if (payload.reason) {
    opRows.push(["Raison", payload.reason]);
  }
  if (payload.validationDate && payload.validationTime) {
    opRows.push(["Validé le", `${payload.validationDate} à ${payload.validationTime}`]);
  }
  y = drawInfoCard("Informations op\u00e9ration", opRows, y, doc);

  // Ensure space for amounts card
  if (y + 40 > PAGE_H - 30) {
    doc.addPage();
    y = M;
  }

  // ── AMOUNTS CARD ──
  const amountsRows: [string, string][] = [
    ["Montant virement", payload.amount],
    ["Frais", payload.fees || "0,00 EUR"],
    ["Total", payload.total || payload.amount],
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
    "Raiffeisen Bank \u2014 Service Op\u00e9rations Bancaires | support@raiffeisen.com",
    bodyX,
    y,
  );
  y += 4;
  doc.text("Cet avis a \u00e9t\u00e9 g\u00e9n\u00e9r\u00e9 automatiquement. Aucune signature n'est requise.", bodyX, y);

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
