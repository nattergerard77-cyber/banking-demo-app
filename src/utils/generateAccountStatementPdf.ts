import { jsPDF } from "jspdf";

export type AccountStatementTransaction = {
  date: string;
  label: string;
  category?: string;
  amount: number;
  positive?: boolean;
  status?: string;
  senderIban?: string;
};

export type AccountStatementPayload = {
  year: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientSince: string;
  accountName: string;
  accountIban: string;
  accountCurrency: string;
  transactions: AccountStatementTransaction[];
};

const NAVY = { r: 7, g: 17, b: 58 };
const GREEN = { r: 122, g: 166, b: 0 };
const BORDER = { r: 229, g: 231, b: 235 };
const TEXT = { r: 15, g: 23, b: 42 };
const MUTED = { r: 100, g: 116, b: 139 };

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

function formatEuro(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function drawHeader(doc: jsPDF): void {
  doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);
  doc.rect(0, 0, 210, 40, "F");

  doc.setDrawColor(38, 52, 92);
  doc.setLineWidth(0.18);
  for (let i = 0; i < 9; i++) {
    const x = 154 + i * 6;
    doc.line(x, 0, x + 14, 40);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("RAIFFEISEN", 105, 13, { align: "center" });

  doc.setFillColor(GREEN.r, GREEN.g, GREEN.b);
  doc.rect(94, 17, 22, 0.7, "F");

  doc.setFontSize(20);
  doc.text("Relevé de compte", 105, 30, { align: "center" });
}

function drawFooter(doc: jsPDF): void {
  doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);
  doc.rect(0, 285, 210, 4, "F");
}

export function generateAccountStatementPdf(payload: AccountStatementPayload): void {
  const doc = new jsPDF("portrait", "mm", "a4");

  drawHeader(doc);

  const totalCredits = payload.transactions
    .filter((t) => t.positive !== false && t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalDebits = payload.transactions
    .filter((t) => t.positive === false || t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const soldeIndicatif = totalCredits - totalDebits;

  let y = 56;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(TEXT.r, TEXT.g, TEXT.b);
  doc.text(`Relevé de compte ${payload.year}`, 24, y);
  y += 8;

  doc.setFontSize(8);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.setFont("helvetica", "normal");
  doc.text("Document de démonstration — ne constitue pas un relevé bancaire officiel", 24, y);
  y += 8;

  doc.setDrawColor(BORDER.r, BORDER.g, BORDER.b);
  doc.setLineWidth(0.3);
  doc.line(24, y, 186, y);
  y += 6;

  doc.setFontSize(7.5);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.setFont("helvetica", "bold");
  doc.text("INFORMATIONS DU CLIENT", 24, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(TEXT.r, TEXT.g, TEXT.b);

  const infoRows: [string, string][] = [
    ["Client", payload.clientName],
    ["Email", payload.clientEmail],
    ["Téléphone", payload.clientPhone],
    ["Client depuis", payload.clientSince],
  ];

  for (const [label, value] of infoRows) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
    doc.text(label, 24, y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(TEXT.r, TEXT.g, TEXT.b);
    doc.text(safeText(value), 58, y);
    y += 5;
  }

  y += 2;

  doc.setFontSize(7.5);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.setFont("helvetica", "bold");
  doc.text("INFORMATIONS DU COMPTE", 24, y);
  y += 5;

  const accountInfo: [string, string][] = [
    ["Compte", payload.accountName],
    ["IBAN", payload.accountIban],
    ["Devise", payload.accountCurrency],
    ["Période", `Année ${payload.year}`],
    ["Date d'édition", new Date().toLocaleDateString("fr-FR")],
  ];

  for (const [label, value] of accountInfo) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
    doc.text(label, 24, y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(TEXT.r, TEXT.g, TEXT.b);
    doc.text(safeText(value), 58, y);
    y += 5;
  }

  y += 4;

  doc.setDrawColor(BORDER.r, BORDER.g, BORDER.b);
  doc.setLineWidth(0.3);
  doc.line(24, y, 186, y);
  y += 6;

  doc.setFontSize(7.5);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.setFont("helvetica", "bold");
  doc.text("OPÉRATIONS", 24, y);
  y += 6;

  const tableLeft = 24;
  const tableRight = 186;
  const colDate = 28;
  const colLabel = 36;
  const colCategory = 30;
  const colStatus = 20;
  let colX = tableLeft;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.text("Date", colX, y);
  colX += colDate;
  doc.text("Libellé", colX, y);
  colX += colLabel;
  doc.text("Catégorie", colX, y);
  colX += colCategory;
  doc.text("Statut", colX, y);
  colX += colStatus;
  doc.text("Montant", colX, y, { align: "right" });
  y += 3;

  doc.setDrawColor(BORDER.r, BORDER.g, BORDER.b);
  doc.setLineWidth(0.15);
  doc.line(tableLeft, y, tableRight, y);
  y += 3;

  for (const tx of payload.transactions) {
    if (y > 268) {
      drawFooter(doc);
      doc.addPage();
      drawHeader(doc);
      y = 56;
    }

    colX = tableLeft;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(TEXT.r, TEXT.g, TEXT.b);
    doc.text(safeText(tx.date), colX, y);
    colX += colDate;

    const labelLines = doc.splitTextToSize(safeText(tx.label), colLabel + 8);
    doc.text(labelLines[0] as string, colX, y);
    colX += colLabel;

    doc.text(safeText(tx.category), colX, y);
    colX += colCategory;

    doc.text(safeText(tx.status), colX, y);
    colX += colStatus;

    const isCredit = tx.positive !== false && tx.amount >= 0;
    doc.setTextColor(isCredit ? GREEN.r : TEXT.r, isCredit ? GREEN.g : TEXT.g, isCredit ? GREEN.b : TEXT.b);
    doc.setFont("helvetica", "bold");
    doc.text(`${isCredit ? "+" : "-"}${formatEuro(Math.abs(tx.amount))}`, colX, y, { align: "right" });

    doc.setTextColor(TEXT.r, TEXT.g, TEXT.b);
    y += 6;
  }

  y += 4;
  doc.setDrawColor(BORDER.r, BORDER.g, BORDER.b);
  doc.setLineWidth(0.3);
  doc.line(tableLeft, y, tableRight, y);
  y += 6;

  const summaryLeft = 110;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.text("RÉSUMÉ ANNUEL", summaryLeft, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.text("Total crédits", summaryLeft, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(GREEN.r, GREEN.g, GREEN.b);
  doc.text(formatEuro(totalCredits), tableRight, y, { align: "right" });
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.text("Total débits", summaryLeft, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(TEXT.r, TEXT.g, TEXT.b);
  doc.text(formatEuro(totalDebits), tableRight, y, { align: "right" });
  y += 5;

  doc.setDrawColor(BORDER.r, BORDER.g, BORDER.b);
  doc.setLineWidth(0.15);
  doc.line(summaryLeft, y, tableRight, y);
  y += 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.text("Solde indicatif annuel", summaryLeft, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
  doc.text(formatEuro(soldeIndicatif), tableRight, y, { align: "right" });
  y += 8;

  doc.setDrawColor(BORDER.r, BORDER.g, BORDER.b);
  doc.setLineWidth(0.3);
  doc.line(24, y, 186, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.text("Document de démonstration — ne constitue pas un relevé bancaire officiel", 105, y, { align: "center" });
  y += 4;
  doc.text("Aucun tampon, signature ou élément d'authentification n'est apposé sur ce document.", 105, y, { align: "center" });

  drawFooter(doc);

  const fileName = `releve-compte-${payload.year}-${fileSafe(payload.clientName)}.pdf`;
  doc.save(fileName);
}
