const IBAN_LENGTHS: Record<string, number> = {
  AD: 24, AE: 23, AL: 28, AT: 20, AZ: 28, BA: 20, BE: 16, BG: 22, BH: 22, BR: 29,
  CH: 21, CR: 22, CY: 28, CZ: 24, DE: 22, DK: 18, DO: 28, EE: 20, ES: 24, FI: 18,
  FO: 18, FR: 27, GB: 22, GI: 23, GL: 18, GR: 27, GT: 28, HR: 21, HU: 28, IE: 22,
  IL: 23, IS: 26, IT: 27, KW: 30, KZ: 20, LB: 28, LI: 21, LT: 20, LU: 20, LV: 21,
  MC: 27, MD: 24, ME: 22, MK: 19, MR: 27, MT: 31, MU: 30, NL: 18, NO: 15, PK: 24,
  PL: 28, PS: 29, PT: 25, QA: 29, RO: 24, RS: 22, SA: 24, SE: 24, SI: 19, SK: 24,
  SM: 27, TL: 23, TN: 24, TR: 26, UA: 29, VG: 24, XK: 20,
};

export function validateIban(iban: string): boolean {
  const cleaned = iban.replace(/\s+/g, "").toUpperCase();
  const countryCode = cleaned.slice(0, 2);
  const expectedLength = IBAN_LENGTHS[countryCode];

  if (!expectedLength) return false;
  if (cleaned.length !== expectedLength) return false;

  const reordered = cleaned.slice(4) + cleaned.slice(0, 4);
  let numeric = "";
  for (const char of reordered) {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      numeric += String(code - 55);
    } else {
      numeric += char;
    }
  }
  let remainder = 0;
  for (let i = 0; i < numeric.length; i++) {
    remainder = (remainder * 10 + Number(numeric[i])) % 97;
  }
  return remainder === 1;
}

export function formatIban(iban: string): string {
  const cleaned = iban.replace(/\s+/g, "").toUpperCase();
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(" ") : cleaned;
}

export function validateBic(bic: string): boolean {
  const cleaned = bic.replace(/\s+/g, "").toUpperCase();
  return /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(cleaned);
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
