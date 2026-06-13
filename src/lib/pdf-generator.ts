import jsPDF from "jspdf";

type TransferPdfData = {
  beneficiaryName: string;
  beneficiaryIban: string;
  donorName: string;
  amount: number;
  currency: string;
  reference: string;
  date: string;
  status: string;
};

const NAVY = [0, 61, 165] as const;
const GREEN = [200, 231, 0] as const;
const WHITE = [255, 255, 255] as const;
const MUTED = [102, 102, 102] as const;
const LIGHT = [245, 245, 245] as const;
const BORDER = [200, 200, 200] as const;

function maskIban(iban: string): string {
  const c = iban.replace(/\s+/g, "");
  if (c.length < 10) return iban;
  return `${c.slice(0, 4)} **** **** ${c.slice(-4)}`;
}

export function generateTransferPdf(data: TransferPdfData): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const PW = 210;
  const PH = 297;
  const M = 18;
  const BW = PW - 2 * M;
  let y = M;

  function rect(x: number, w: number, h: number, color: readonly number[]) {
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(x, y, w, h, "F");
  }

  function line(x1: number, x2: number, color: readonly number[], width = 0.5) {
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(width);
    doc.line(x1, y, x2, y);
  }

  function text(
    str: string,
    x: number,
    ty: number,
    opts?: { size?: number; bold?: boolean; color?: readonly number[]; align?: "left" | "center" | "right" },
  ) {
    doc.setFont("Helvetica", opts?.bold ? "bold" : "normal");
    doc.setFontSize(opts?.size ?? 10);
    doc.setTextColor(
      (opts?.color ?? MUTED)[0],
      (opts?.color ?? MUTED)[1],
      (opts?.color ?? MUTED)[2],
    );
    doc.text(str, x, ty, { align: opts?.align ?? "left" });
  }

  // Header bar
  doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.rect(0, 0, PW, 44, "F");

  text("RAIFFEISEN", PW / 2, 16, { size: 20, bold: true, color: WHITE, align: "center" });
  doc.setDrawColor(GREEN[0], GREEN[1], GREEN[2]);
  doc.setLineWidth(0.6);
  doc.line(PW / 2 - 14, 20, PW / 2 + 14, 20);
  text("BANQUE", PW / 2, 28, { size: 8, color: [180, 190, 205], align: "center" });
  text("Avis de virement", PW / 2, 37, { size: 9, color: [180, 190, 205], align: "center" });

  y = 54;

  // Title
  text("AVIS DE VIREMENT", PW / 2, y, { size: 16, bold: true, color: NAVY, align: "center" });
  y += 5;
  text("Virement enregistr\u00e9 \u2014 En cours de traitement", PW / 2, y, { size: 9, color: MUTED, align: "center" });
  line(M, M + BW, BORDER, 0.3);
  y += 10;

  // Amount section
  doc.setDrawColor(GREEN[0], GREEN[1], GREEN[2]);
  doc.setLineWidth(1);
  doc.line(M, y + 22, M + BW, y + 22);

  text("MONTANT", M, y, { size: 9, bold: true, color: MUTED });
  y += 2;

  const amtStr = `${data.amount.toFixed(2)} ${data.currency}`;
  text(amtStr, M, y + 14, { size: 32, bold: true, color: NAVY });

  y += 34;

  // Details section
  function detailRow(label: string, value: string, mono = false) {
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
    doc.text(label, M, y);
    doc.setFont("Helvetica", mono ? "normal" : "bold");
    doc.setFontSize(9);
    doc.setTextColor(20, 20, 20);
    doc.text(value, M + 100, y);
    y += 7;
  }

  detailRow("B\u00e9n\u00e9ficiaire :", data.beneficiaryName);
  detailRow("IBAN :", maskIban(data.beneficiaryIban), true);
  detailRow("Donneur d'ordre :", data.donorName);
  detailRow("Raison :", "Virement");
  detailRow("R\u00e9f\u00e9rence :", data.reference, true);
  detailRow("Date d'ex\u00e9cution :", data.date);

  // Status with green
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.text("Statut :", M, y);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(GREEN[0], GREEN[1], GREEN[2]);
  doc.text(`\u2713 ${data.status}`, M + 100, y);
  y += 12;

  // Summary section
  line(M, M + BW, BORDER, 0.3);
  y += 6;

  function summaryRow(label: string, value: string) {
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
    doc.text(label, M, y);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(20, 20, 20);
    doc.text(value, M + BW, y, { align: "right" });
    y += 7;
  }

  summaryRow("Montant virement :", amtStr);
  summaryRow("Frais :", `0,00 ${data.currency}`);

  line(M, M + BW, BORDER, 0.3);
  y += 4;

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.text("TOTAL :", M, y);
  doc.setTextColor(GREEN[0], GREEN[1], GREEN[2]);
  doc.text(amtStr, M + BW, y, { align: "right" });

  // Footer
  const footerY = PH - 35;
  if (footerY > 0) {
    y = footerY;
    line(M, M + BW, NAVY, 0.6);
    y += 7;
    text("S\u00e9curit\u00e9 : Raiffeisen ne vous demandera jamais vos identifiants par email.", M, y + 2, { size: 7, color: MUTED });
    y += 5;
    text("Avis g\u00e9n\u00e9r\u00e9 automatiquement \u2014 Aucune signature requise", M, y + 2, { size: 7, color: MUTED });
    y += 5;
    text("Raiffeisen Bank \u2014 Service Op\u00e9rations Bancaires", M, y + 2, { size: 7, color: [150, 150, 150] });
  }

  // Page numbers
  const pc = doc.getNumberOfPages();
  for (let i = 1; i <= pc; i++) {
    doc.setPage(i);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(190, 190, 190);
    doc.text(`Page ${i} / ${pc}`, PW - M, PH - 10, { align: "right" });
  }

  return doc;
}

export function generateTransferPdfBase64(data: TransferPdfData): { fileName: string; base64: string } {
  const doc = generateTransferPdf(data);
  const safe = (v: string) =>
    v
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);
  const fileName = `Avis-virement-${safe(data.beneficiaryName)}-${safe(data.reference)}.pdf`;
  const dataUri = doc.output("datauristring");
  const base64 = dataUri.includes("base64,") ? dataUri.split("base64,")[1] : dataUri;
  return { fileName, base64 };
}
