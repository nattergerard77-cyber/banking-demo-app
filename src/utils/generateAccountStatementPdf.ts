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

const NAVY = { r: 7, g: 18, b: 58 };
const GREEN = { r: 120, g: 185, b: 0 };
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

function formatEuroPdf(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  const absolute = Math.abs(value);
  const formatted = absolute
    .toFixed(2)
    .replace(".", ",")
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${sign}${formatted} EUR`;
}

function formatEuroPdfNoSign(value: number): string {
  const absolute = Math.abs(value);
  return absolute
    .toFixed(2)
    .replace(".", ",")
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ")
    + " EUR";
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 1) + "...";
}

function cleanLabel(label: string): string {
  return label.replace("Compte italien", "Compte luxembourgeois");
}

function drawHeader(doc: jsPDF): void {
  doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);
  doc.rect(0, 0, 210, 42, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text("RAIFFEISEN", 105, 16, { align: "center" });

  doc.setFillColor(GREEN.r, GREEN.g, GREEN.b);
  doc.rect(88, 20, 34, 0.8, "F");

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("Relevé de compte", 105, 33, { align: "center" });
}

function drawFooter(doc: jsPDF): void {
  doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);
  doc.rect(0, 285, 210, 4, "F");
}

export function generateAccountStatementPdf(payload: AccountStatementPayload): void {
  const doc = new jsPDF("portrait", "mm", "a4");

  const safeIban =
    payload.accountIban && payload.accountIban.startsWith("LU")
      ? payload.accountIban
      : "LU12 0019 1234 5678 9101";

  const totalCredits = payload.transactions
    .filter((t) => t.positive !== false && t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalDebits = payload.transactions
    .filter((t) => t.positive === false || t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const soldeIndicatif = totalCredits - totalDebits;

  drawHeader(doc);

  let y = 56;

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(TEXT.r, TEXT.g, TEXT.b);
  doc.text(`Relevé de compte ${payload.year}`, 24, y);
  y += 11;

  doc.setDrawColor(BORDER.r, BORDER.g, BORDER.b);
  doc.setLineWidth(0.3);
  doc.line(24, y, 186, y);
  y += 8;

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.text("INFORMATIONS DU CLIENT", 24, y);
  y += 6;

  const infoRows: [string, string][] = [
    ["Client", payload.clientName],
    ["Email", payload.clientEmail],
    ["Téléphone", payload.clientPhone],
    ["Client depuis", payload.clientSince],
  ];

  for (const [label, value] of infoRows) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
    doc.text(label, 24, y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(TEXT.r, TEXT.g, TEXT.b);
    doc.text(safeText(value), 62, y);
    y += 5.2;
  }

  y += 3;

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.text("INFORMATIONS DU COMPTE", 24, y);
  y += 6;

  const accountInfo: [string, string][] = [
    ["Compte", payload.accountName],
    ["IBAN", safeIban],
    ["Devise", payload.accountCurrency],
    ["Période", `Année ${payload.year}`],
    ["Date d'édition", new Date().toLocaleDateString("fr-FR")],
  ];

  for (const [label, value] of accountInfo) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
    doc.text(label, 24, y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(TEXT.r, TEXT.g, TEXT.b);
    doc.text(safeText(value), 62, y);
    y += 5.2;
  }

  y += 5;

  doc.setDrawColor(BORDER.r, BORDER.g, BORDER.b);
  doc.setLineWidth(0.3);
  doc.line(24, y, 186, y);
  y += 8;

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.text("OPÉRATIONS", 24, y);
  y += 7;

  const colXs = [24, 54, 118, 152, 186];
  const headers = ["Date", "Libellé", "Catégorie", "Statut", "Montant"];

  doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);
  doc.rect(24, y - 2, 162, 5.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  for (let i = 0; i < headers.length; i++) {
    const align = i === headers.length - 1 ? "right" : "left";
    doc.text(headers[i], colXs[i] + (i === 0 ? 1 : 0), y + 1.5, { align });
  }
  y += 6;

  const rowH = 5.5;

  for (let i = 0; i < payload.transactions.length; i++) {
    if (y > 268) {
      drawFooter(doc);
      doc.addPage();
      drawHeader(doc);
      y = 56;
    }

    const tx = payload.transactions[i];

    if (i % 2 === 1) {
      doc.setFillColor(248, 249, 251);
      doc.rect(24, y - 2, 162, rowH, "F");
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(TEXT.r, TEXT.g, TEXT.b);

    const dateText = safeText(tx.date);
    doc.text(dateText, colXs[0] + 1, y + 1);

    const labelText = cleanLabel(safeText(tx.label));
    const truncatedLabel = truncateText(labelText, 38);
    doc.text(truncatedLabel, colXs[1], y + 1);

    const categoryText = cleanLabel(safeText(tx.category));
    doc.text(categoryText, colXs[2], y + 1);

    const statusText = safeText(tx.status);
    if (statusText.toLowerCase() === "exécuté" || statusText.toLowerCase() === "executé") {
      doc.setTextColor(GREEN.r, GREEN.g, GREEN.b);
      doc.setFont("helvetica", "bold");
    }
    doc.text(statusText, colXs[3], y + 1);
    doc.setTextColor(TEXT.r, TEXT.g, TEXT.b);

    const isCredit = tx.positive !== false && tx.amount >= 0;
    doc.setTextColor(isCredit ? GREEN.r : TEXT.r, isCredit ? GREEN.g : TEXT.g, isCredit ? GREEN.b : TEXT.b);
    doc.setFont("helvetica", "bold");
    doc.text(formatEuroPdf(tx.amount), colXs[4], y + 1, { align: "right" });

    doc.setTextColor(TEXT.r, TEXT.g, TEXT.b);
    y += rowH;
  }

  y += 3;
  doc.setDrawColor(BORDER.r, BORDER.g, BORDER.b);
  doc.setLineWidth(0.3);
  doc.line(24, y, 186, y);
  y += 7;

  const summaryRight = 186;
  const summaryLeft = 112;

  doc.setDrawColor(BORDER.r, BORDER.g, BORDER.b);
  doc.setLineWidth(0.5);
  doc.rect(summaryLeft, y - 2, summaryRight - summaryLeft, 32, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
  doc.text("RÉSUMÉ ANNUEL", summaryLeft + 3, y + 2);

  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.text("Total crédits", summaryLeft + 3, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(GREEN.r, GREEN.g, GREEN.b);
  doc.text(formatEuroPdfNoSign(totalCredits), summaryRight - 3, y, { align: "right" });
  y += 4.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.text("Total débits", summaryLeft + 3, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(TEXT.r, TEXT.g, TEXT.b);
  doc.text(formatEuroPdfNoSign(totalDebits), summaryRight - 3, y, { align: "right" });
  y += 4.5;

  doc.setDrawColor(BORDER.r, BORDER.g, BORDER.b);
  doc.setLineWidth(0.15);
  doc.line(summaryLeft + 3, y + 0.5, summaryRight - 3, y + 0.5);
  y += 3;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.text("Solde indicatif annuel", summaryLeft + 3, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(GREEN.r, GREEN.g, GREEN.b);
  doc.text(formatEuroPdfNoSign(soldeIndicatif), summaryRight - 3, y, { align: "right" });

  y += 12;

  doc.setDrawColor(BORDER.r, BORDER.g, BORDER.b);
  doc.setLineWidth(0.3);
  doc.line(24, y, 186, y);

  drawFooter(doc);

  const fileName = `releve-compte-${payload.year}-${fileSafe(payload.clientName)}.pdf`;
  doc.save(fileName);
}
