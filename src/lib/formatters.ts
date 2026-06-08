export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatSignedCurrency = (amount: number): string => {
  const formatted = formatCurrency(Math.abs(amount));
  return amount >= 0 ? `+ ${formatted}` : `- ${formatted}`;
};

export const formatDateFR = (date: string | Date): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(date));
};

export const formatShortDateFR = (date: string | Date): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(date));
};

export const maskIban = (iban: string): string => {
  if (!iban || iban.length < 9) return iban;
  const first4 = iban.substring(0, 4);
  const last4 = iban.substring(iban.length - 4);
  return `${first4} •••• •••• ${last4}`;
};

export const formatIban = (iban: string): string => {
  if (!iban) return iban;
  return iban.replace(/(.{4})/g, '$1 ').trim();
};

export const maskCardNumber = (last4: string): string => {
  return `•••• ${last4}`;
};

export const formatPercent = (value: number): string => {
  return `${value} %`;
};
