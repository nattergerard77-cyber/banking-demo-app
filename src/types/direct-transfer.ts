export type DirectTransferStep = "form" | "recap" | "loading" | "success";

export type DirectTransferFormData = {
  account: string;
  transferType: string;
  beneficiaryName: string;
  bankName: string;
  iban: string;
  bic: string;
  email: string;
  phone: string;
  amount: string;
  executionDate: string;
  reason: string;
};

export type DirectTransferErrors = Partial<
  Record<"beneficiaryName" | "bankName" | "iban" | "bic" | "email" | "phone" | "amount", string>
>;
