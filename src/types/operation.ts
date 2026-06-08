import { LucideIcon } from "lucide-react";

export interface OperationHistory {
  id: string;
  date: string; // ex: "24 mai 2024"
  time: string; // ex: "09:42"
  label: string;
  merchant: string;
  category: string;
  amount: number;
  positive: boolean;
  status: "Exécuté" | "En cours" | "Rejeté";
  account: string;
  iban: string;
  bank?: string;
  senderIban?: string;
  reference?: string;
  note?: string;
  icon: LucideIcon;
}
