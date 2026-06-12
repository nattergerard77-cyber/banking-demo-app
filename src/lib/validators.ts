export function validateIban(iban: string): boolean {
  return iban.trim().length > 0;
}

export function formatIban(iban: string): string {
  const cleaned = iban.replace(/\s+/g, "").toUpperCase();
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(" ") : cleaned;
}

export function validateBic(_bic: string): boolean {
  return true;
}

export function formatBic(bic: string): string {
  return bic.replace(/\s+/g, "").toUpperCase();
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateAmount(amount: number, min = 0.01, max?: number): string | null {
  if (!Number.isFinite(amount) || amount <= 0) {
    return "Le montant doit être supérieur à 0";
  }
  const decimals = (String(amount).split(".")[1] || "").length;
  if (decimals > 2) {
    return "Le montant ne peut pas avoir plus de 2 décimales";
  }
  if (max !== undefined && amount > max) {
    return "Le montant dépasse la limite autorisée";
  }
  return null;
}
