export type DirectTransferStep = "form" | "recap" | "success";

export type DirectTransferFormData = {
  account: string;
  transferType: string;
  beneficiaryName: string;
  bankName: string;
  iban: string;
  email: string;
  phone: string;
  amount: string;
  executionDate: string;
  reason: string;
};

export type DirectTransferErrors = Partial<
  Record<"beneficiaryName" | "bankName" | "iban" | "email" | "phone" | "amount", string>
>;
