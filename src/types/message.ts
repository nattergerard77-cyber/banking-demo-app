export type MessageCategory =
  | "advisor"
  | "documents"
  | "savings"
  | "cards"
  | "security"
  | "operations";

export type BankMessageInfo = [string, string][];

export type BankMessage = {
  id: string;
  title: string;
  sender: string;
  preview: string;
  date: string;
  category: string;
  unread: boolean;
  active?: boolean;
  detail: string;
  info: BankMessageInfo;
  attachment?: string;
  folder?: string;
};
