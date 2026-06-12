export interface Beneficiary {
  id: string;
  name: string;
  iban: string;
  bic?: string;
  bank: string;
  email: string;
  phone: string;
}
