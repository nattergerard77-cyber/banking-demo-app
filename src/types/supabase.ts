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
  holder_name?: string;
  holder_email?: string | null;
  display_order?: number;
  is_blocked?: boolean;
  blocked_reason?: string | null;
  blocked_at?: string | null;
  created_at?: string;
  updated_at?: string;
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
  type?: string | null;
};

export type SupabaseTransaction = {
  id: string;
  account_id: string;
  transfer_id?: string | null;
  reference?: string | null;
  label: string;
  merchant?: string | null;
  category?: string | null;
  amount: number | string;
  currency: "EUR";
  direction: "credit" | "debit";
  status: "pending" | "executed" | "cancelled";
  transaction_date: string;
  transaction_time?: string | null;
  iban?: string | null;
  bank?: string | null;
  sender_iban?: string | null;
  note?: string | null;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
};
