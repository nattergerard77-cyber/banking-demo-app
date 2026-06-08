export type SupabaseAccount = {
  id: string;
  code: string;
  name: string;
  type: "current" | "savings" | "joint";
  iban: string;
  currency: "EUR";
  balance: number;
  available_balance: number;
  status: "active" | "blocked" | "closed";
};

export type SupabaseBeneficiary = {
  id: string;
  code?: string | null;
  name: string;
  iban: string;
  bank: string;
  email?: string | null;
  phone?: string | null;
  initials?: string | null;
  favorite: boolean;
  active: boolean;
};
