"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Check, CheckCircle2, ChevronDown, ChevronRight, Clock3, Euro, FileText, Landmark, Plus, Repeat, ShieldCheck, User, Wallet, X, Zap } from "lucide-react";

import DesktopShell from "./DesktopShell";
import DemoSwitch from "../shared/DemoSwitch";
import DemoToast from "../shared/DemoToast";
import type { SupabaseAccount } from "@/types/supabase";
import { useLanguage } from "@/context/LanguageContext";
import { useNotifications } from "@/context/NotificationContext";
import { useMessages } from "@/context/MessageContext";
import { generateTransferPdf } from "@/utils/generateTransferPdf";
import {
  type EmailStatus,
} from "@/utils/sendBeneficiaryTransferEmail";

const transferTypes = [
  { id: "instant", label: "Virement immediat", description: "Execution des validation" },
  { id: "scheduled", label: "Virement differe", description: "Execution a une date choisie" },
  { id: "recurring", label: "Virement permanent", description: "Repetition automatique" },
];

type DebitAccountViewModel = {
  id: string;
  supabaseId: string;
  name: string;
  iban: string;
  last4: string;
  balance: string;
  rawBalance: number;
  currency: string;
  status: string;
};

type AccountsApiResponse =
  | { success: true; accounts: SupabaseAccount[] }
  | { success: false; error: string };

type Beneficiary = {
  id: string;
  name: string;
  type: string;
  iban: string;
  bank: string;
  email: string;
  phone: string;
  initials: string;
};

type RecentTransferItem = {
  id: string;
  beneficiaryName: string;
  date: string;
  reason: string | null;
  amount: string;
  status: string;
  reference: string;
};

const initialBeneficiaries: Beneficiary[] = [
  { id: "luca", name: "Luca Romano", type: "Particulier", iban: "LU28 0019 1111 2222 3333", bank: "Banque Raiffeisen Luxembourg", email: "luca.romano@example.com", phone: "+39 345 812 4470", initials: "LR" },
  { id: "sofia", name: "Sofia Bianchi", type: "Particulier", iban: "LU55 0019 4444 5555 6666", bank: "Banque de Luxembourg", email: "sofia.bianchi@example.com", phone: "+39 333 604 2198", initials: "SB" },
  { id: "marco", name: "Marco Conti", type: "Particulier", iban: "LU82 0019 7777 8888 9999", bank: "Banque Internationale à Luxembourg", email: "marco.conti@example.com", phone: "+39 347 920 1186", initials: "MC" },
];



function generateTemporaryReference() {
  const now = new Date();
  const y = String(now.getFullYear()).slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const suffix = String(Math.floor(Math.random() * 9000) + 1000);
  return `VR-${y}${m}${d}-${suffix}`;
}

function parseAmount(value: string) {
  const parsed = Number.parseFloat(value.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function formatExecutionDate(value: string) {
  if (!value) return "Aujourd'hui";
  return new Date(`${value}T00:00:00`).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

function formatAmount(value: string) {
  return `${parseAmount(value).toFixed(2).replace(".", ",")} EUR`;
}

function formatCurrency(value: number, currency = "EUR") {
  if (!Number.isFinite(value)) return "Montant indisponible";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(value);
}

function todayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function maskIban(iban: string) {
  const clean = iban.replace(/\s+/g, "");
  if (clean.length < 10) return iban;
  return `${clean.slice(0, 4)} ${clean.slice(4, 8)} **** **** ${clean.slice(-4)}`;
}

function mapDebitAccount(account: SupabaseAccount): DebitAccountViewModel {
  const rawBalance = Number(account.available_balance ?? account.balance ?? 0);

  return {
    id: account.code,
    supabaseId: account.id,
    name: account.name,
    iban: account.iban,
    last4: account.iban.replace(/\s+/g, "").slice(-4),
    balance: formatCurrency(rawBalance, account.currency ?? "EUR"),
    rawBalance: Number.isFinite(rawBalance) ? rawBalance : 0,
    currency: account.currency ?? "EUR",
    status: account.status,
  };
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function getSubmitErrorMessage(errorCode?: string, fallbackMessage?: string) {
  const codeMessages: Record<string, string> = {
    INVALID_AMOUNT: "Montant invalide.",
    MISSING_ACCOUNT: "Veuillez sélectionner un compte débiteur.",
    MISSING_BENEFICIARY_NAME: "Veuillez sélectionner un bénéficiaire.",
    MISSING_BENEFICIARY_IBAN: "L'IBAN du bénéficiaire est manquant.",
    INSUFFICIENT_FUNDS: "Solde insuffisant pour effectuer ce virement.",
    ACCOUNT_NOT_FOUND: "Compte débiteur introuvable.",
    ACCOUNT_NOT_ACTIVE: "Ce compte n'est pas actif.",
    INVALID_TRANSFER_TYPE: "Type de virement invalide.",
  };

  return codeMessages[errorCode ?? ""] || fallbackMessage || "Une erreur est survenue lors du virement. Veuillez réessayer.";
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[18px] border border-[#E5E7EB] bg-white shadow-[0_14px_34px_rgba(5,0,51,0.06)] ${className}`}>{children}</div>;
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="mb-2 block text-[13px] font-semibold text-[#090927]">{children}</label>;
}

export default function DesktopTransfers() {
  const { t } = useLanguage();
  const { addTransferNotification } = useNotifications();
  const { addTransferMessage } = useMessages();
  const [beneficiaries, setBeneficiaries] = useState(initialBeneficiaries);
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState("luca");
  const [debitAccounts, setDebitAccounts] = useState<DebitAccountViewModel[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [accountsError, setAccountsError] = useState<string | null>(null);
  const [selectedDebitAccountId, setSelectedDebitAccountId] = useState("current");
  const [selectedTransferTypeId, setSelectedTransferTypeId] = useState("instant");
  const [amount, setAmount] = useState("120");
  const [reason, setReason] = useState("Règlement privé");
  const [scheduledDate, setScheduledDate] = useState(todayInputValue());
  const [isRecurring, setIsRecurring] = useState(false);
  const [amountError, setAmountError] = useState("");
  const [dateError, setDateError] = useState("");
  const [toast, setToast] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [newBeneficiary, setNewBeneficiary] = useState({ name: "", iban: "", bank: "", email: "", phone: "" });
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});

  const [showRecap, setShowRecap] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [recentTransfers, setRecentTransfers] = useState<RecentTransferItem[]>([]);
  const [recentTransfersLoading, setRecentTransfersLoading] = useState(true);
  const [showDetail, setShowDetail] = useState<RecentTransferItem | null>(null);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [validatedAt, setValidatedAt] = useState<Date | null>(null);
  const [temporaryReference, setTemporaryReference] = useState("");
  const [finalReference, setFinalReference] = useState("");
  const [emailStatus, setEmailStatus] = useState<EmailStatus>("idle");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const selectedBeneficiary = useMemo(() => beneficiaries.find((item) => item.id === selectedBeneficiaryId) ?? beneficiaries[0], [beneficiaries, selectedBeneficiaryId]);
  const selectedDebitAccount = useMemo(() => debitAccounts.find((account) => account.id === selectedDebitAccountId) ?? debitAccounts[0] ?? null, [debitAccounts, selectedDebitAccountId]);
  const selectedTransferType = useMemo(() => transferTypes.find((type) => type.id === selectedTransferTypeId) ?? transferTypes[0], [selectedTransferTypeId]);
  const totalFormatted = formatAmount(amount || "0");
  const executionDate = selectedTransferTypeId === "scheduled" ? formatExecutionDate(scheduledDate) : "Aujourd'hui";
  const isAccountSelectionUnavailable = accountsLoading || Boolean(accountsError) || !selectedDebitAccount;

  useEffect(() => {
    let ignore = false;

    async function loadAccounts() {
      setAccountsLoading(true);
      setAccountsError(null);

      try {
        const response = await fetch("/api/accounts");
        const result = (await response.json()) as AccountsApiResponse;

        if (!response.ok || !result.success) {
          throw new Error("ACCOUNTS_FETCH_FAILED");
        }

        if (ignore) return;

        const nextAccounts = result.accounts.map(mapDebitAccount);
        setDebitAccounts(nextAccounts);
        setSelectedDebitAccountId((current) => {
          if (nextAccounts.some((account) => account.id === current)) return current;
          const currentAccount = nextAccounts.find((account) => account.id === "current");
          return currentAccount?.id ?? nextAccounts[0]?.id ?? "";
        });
      } catch {
        if (!ignore) {
          setDebitAccounts([]);
          setAccountsError("Impossible de charger les comptes.");
        }
      } finally {
        if (!ignore) setAccountsLoading(false);
      }
    }

    void loadAccounts();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    void (async () => {
      setRecentTransfersLoading(true);
      try {
        const res = await fetch("/api/transfers?limit=5");
        const json = await res.json() as { success: boolean; transfers?: Array<Record<string, unknown>> };
        if (ignore) return;
        if (!json.success || !json.transfers) {
          setRecentTransfers([]);
          return;
        }
        const mapped: RecentTransferItem[] = json.transfers.map((item) => ({
          id: String(item.id ?? ""),
          beneficiaryName: String(item.beneficiaryName ?? ""),
          date: item.executionDate
            ? new Date(`${String(item.executionDate)}T00:00:00`).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
            : "",
          reason: item.reason ? String(item.reason) : null,
          amount: `${Number(item.amount).toFixed(2).replace(".", ",")} EUR`,
          status: item.status === "executed" ? "Exécuté" : String(item.status ?? ""),
          reference: String(item.reference ?? ""),
        }));
        setRecentTransfers(mapped);
      } catch {
        if (!ignore) setRecentTransfers([]);
      } finally {
        if (!ignore) setRecentTransfersLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  async function refreshRecentTransfers() {
    try {
      const res = await fetch("/api/transfers?limit=5");
      const json = await res.json() as { success: boolean; transfers?: Array<Record<string, unknown>> };
      if (!json.success || !json.transfers) {
        setRecentTransfers([]);
        return;
      }
      const mapped: RecentTransferItem[] = json.transfers.map((item) => ({
        id: String(item.id ?? ""),
        beneficiaryName: String(item.beneficiaryName ?? ""),
        date: item.executionDate
          ? new Date(`${String(item.executionDate)}T00:00:00`).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
          : "",
        reason: item.reason ? String(item.reason) : null,
        amount: `${Number(item.amount).toFixed(2).replace(".", ",")} EUR`,
        status: item.status === "executed" ? "Exécuté" : String(item.status ?? ""),
        reference: String(item.reference ?? ""),
      }));
      setRecentTransfers(mapped);
    } catch {
      setRecentTransfers([]);
    }
  }

  function selectTransferType(typeId: string) {
    resetEmailForNewTransfer();
    setSelectedTransferTypeId(typeId);
    if (typeId === "recurring") setIsRecurring(true);
    if (typeId === "instant") setIsRecurring(false);
    if (typeId === "scheduled" && !scheduledDate) setScheduledDate(todayInputValue());
    setShowTypePicker(false);
  }

  function openRecap() {
    setSubmitError(null);
    if (accountsLoading) {
      setToast("Chargement des comptes...");
      return;
    }
    if (accountsError) {
      setToast("Impossible de charger les comptes.");
      return;
    }
    if (!selectedDebitAccount) {
      setToast("Aucun compte disponible.");
      return;
    }
    const parsedAmount = parseAmount(amount);
    if (!amount.trim() || parsedAmount <= 0) {
      setAmountError("Veuillez saisir un montant valide.");
      return;
    }
    if (parsedAmount > selectedDebitAccount.rawBalance) {
      setAmountError("Le montant dépasse le solde disponible du compte sélectionné.");
      return;
    }
    if (selectedTransferTypeId === "scheduled" && (!scheduledDate || scheduledDate < todayInputValue())) {
      setDateError("Veuillez choisir une date d'exécution valide.");
      return;
    }
    setAmountError("");
    setDateError("");
    if (!temporaryReference) setTemporaryReference(generateTemporaryReference());
    setShowRecap(true);
  }

  function addBeneficiary() {
    const errors: Record<string, string> = {};
    if (!newBeneficiary.name.trim()) errors.name = "Nom obligatoire";
    if (!newBeneficiary.iban.trim()) errors.iban = "IBAN obligatoire";
    if (!newBeneficiary.bank.trim()) errors.bank = "Banque obligatoire";
    if (!newBeneficiary.email.trim()) errors.email = "Email obligatoire";
    if (!newBeneficiary.phone.trim()) errors.phone = "Telephone obligatoire";
    if (newBeneficiary.email.trim() && !newBeneficiary.email.includes("@")) errors.email = "Email invalide";
    setAddErrors(errors);
    if (Object.keys(errors).length) return;

    const nextId = `benef-${Date.now()}`;
    const initials = newBeneficiary.name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "NB";
    const added: Beneficiary = { id: nextId, name: newBeneficiary.name.trim(), type: "Particulier", iban: newBeneficiary.iban.trim(), bank: newBeneficiary.bank.trim(), email: newBeneficiary.email.trim(), phone: newBeneficiary.phone.trim(), initials };
    setBeneficiaries((current) => [added, ...current]);
    setSelectedBeneficiaryId(nextId);
    setShowAdd(false);
    setNewBeneficiary({ name: "", iban: "", bank: "", email: "", phone: "" });
    setAddErrors({});
    setToast("Beneficiaire ajoute.");
  }

  function resetEmailNotice() {
    setEmailStatus("idle");
    setEmailError(null);
  }

  function resetEmailForNewTransfer() {
    resetEmailNotice();
    setFinalReference("");
    setSubmitError(null);
  }

  function getTransferPayload() {
    return {
      accountCode: selectedDebitAccountId,
      accountId: null,
      beneficiaryId: isUuid(selectedBeneficiary.id) ? selectedBeneficiary.id : null,
      beneficiaryName: selectedBeneficiary.name.trim(),
      beneficiaryIban: selectedBeneficiary.iban.trim(),
      beneficiaryBank: selectedBeneficiary.bank.trim(),
      beneficiaryEmail: selectedBeneficiary.email.trim(),
      amount: parseAmount(amount),
      reason: reason.trim() || "Virement",
      transferType: selectedTransferTypeId || "instant",
      executionDate: selectedTransferTypeId === "scheduled" ? (scheduledDate || todayDateString()) : todayDateString(),
      idempotencyKey: crypto.randomUUID(),
    };
  }

  async function validateTransfer() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = getTransferPayload();

      if (!payload.accountCode) {
        setSubmitError(getSubmitErrorMessage("MISSING_ACCOUNT"));
        return;
      }

      if (!payload.beneficiaryName) {
        setSubmitError(getSubmitErrorMessage("MISSING_BENEFICIARY_NAME"));
        return;
      }

      if (!payload.beneficiaryIban) {
        setSubmitError(getSubmitErrorMessage("MISSING_BENEFICIARY_IBAN"));
        return;
      }

      if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
        setSubmitError(getSubmitErrorMessage("INVALID_AMOUNT"));
        return;
      }

      if (!payload.transferType) {
        setSubmitError(getSubmitErrorMessage("INVALID_TRANSFER_TYPE"));
        return;
      }

      if (payload.transferType === "scheduled" && (!payload.executionDate || payload.executionDate < todayDateString())) {
        setSubmitError("Veuillez choisir une date d'exécution valide.");
        return;
      }

      const response = await fetch("/api/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json() as { success: boolean; transfer?: { reference?: string; email_status?: EmailStatus }; emailStatus?: EmailStatus; error?: string; message?: string };

      if (!result.success || !result.transfer?.reference) {
        setSubmitError(getSubmitErrorMessage(result.error, result.message));
        return;
      }

      const supabaseReference = result.transfer.reference;
      const now = new Date();
      setValidatedAt(now);
      setFinalReference(supabaseReference);
      setShowRecap(false);
      setShowSuccess(true);
      addTransferNotification({ beneficiary: selectedBeneficiary.name, amount: totalFormatted, reference: supabaseReference });
      addTransferMessage({
        beneficiary: selectedBeneficiary.name,
        amount: totalFormatted,
        reference: supabaseReference,
        accountName: selectedDebitAccount?.name ?? "",
        executionDate,
        validationDate: now.toLocaleDateString("fr-FR"),
        validationTime: now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      });
      const nextEmailStatus = result.transfer.email_status ?? result.emailStatus ?? "idle";
      setEmailStatus(nextEmailStatus);
      setEmailError(nextEmailStatus === "failed" ? "L'avis de virement n'a pas pu etre envoye au beneficiaire." : null);
      void refreshRecentTransfers();
    } catch (error) {
      console.error("[transfer] submit failed", error);
      setSubmitError(
        error instanceof Error && error.message
          ? error.message
          : "Une erreur réseau est survenue. Veuillez réessayer."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function downloadReceipt() {
    try {
      generateTransferPdf({
        holderName: "Frederico Di Mario",
        holderEmail: "fredericodimario8@gmail.com",
        debitAccountName: selectedDebitAccount?.name ?? "",
        debitIban: selectedDebitAccount?.iban ?? "",
        beneficiaryName: selectedBeneficiary.name,
        beneficiaryBank: selectedBeneficiary.bank,
        beneficiaryIban: selectedBeneficiary.iban,
        transferType: selectedTransferType.label,
        executionDate,
        validationDate: (validatedAt ?? new Date()).toLocaleDateString("fr-FR"),
        validationTime: (validatedAt ?? new Date()).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        temporaryReference,
        finalReference,
        reason,
        amount: totalFormatted,
        fees: "0,00 EUR",
        total: totalFormatted,
      });
    } catch {
      const content = [
        "Recu de virement",
        `Reference: ${finalReference}`,
        `Date: ${(validatedAt ?? new Date()).toLocaleDateString("fr-FR")}`,
        `Heure: ${(validatedAt ?? new Date()).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`,
        `Compte debite: ${selectedDebitAccount?.name ?? ""}`,
        `IBAN compte debite: ${selectedDebitAccount?.iban ?? ""}`,
        `Type de virement: ${selectedTransferType.label}`,
        `Date d'execution: ${executionDate}`,
        `Beneficiaire: ${selectedBeneficiary.name}`,
        `IBAN: ${selectedBeneficiary.iban}`,
        `Montant: ${totalFormatted}`,
        "Frais: 0,00 EUR",
        `Total: ${totalFormatted}`,
      ].join("\n");
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `recu-virement-${finalReference || "virement"}.txt`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    }
    setToast("Recu prepare pour consultation.");
  }

  return (
    <>
      <DesktopShell>
        <div className="space-y-5">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-[26px] font-bold tracking-tight text-[#090927]">Effectuer un virement</h1>
              <p className="mt-1 text-[15px] text-[#6B7280]">Votre virement est pret.</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-[#EEF7D8] px-4 py-2 text-[13px] font-semibold text-[#050033]"><ShieldCheck size={16} className="text-[#7AA600]" />Securite renforcee</div>
          </div>

          <div className="grid grid-cols-12 gap-5">
            <Card className="col-span-8 p-5">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-[18px] font-bold text-[#090927]">Nouveau virement</h2>
                  <p className="mt-1 text-[13px] text-[#6B7280]">Completez les informations necessaires au virement.</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button type="button" onClick={() => setShowAdd(true)} className="flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-[10px] border border-[#050033] px-4 text-[13px] font-semibold text-[#050033] hover:bg-[#F6F7F9]"><Plus size={16} />Nouveau beneficiaire</button>
                  <Link href="/virements/direct" className="flex h-11 min-w-fit shrink-0 items-center gap-2 whitespace-nowrap rounded-[10px] bg-[#050033] px-4 text-[13px] font-semibold text-white"><Zap size={16} className="text-[#9ACD00]" />Virement direct</Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Compte a debiter</FieldLabel>
                  <button type="button" aria-label="Choisir le compte a debiter" onClick={() => setShowAccountPicker(true)} className="flex h-11 w-full items-center gap-3 rounded-[10px] border border-[#E5E7EB] bg-white px-3 text-[14px] font-medium text-[#090927]"><Wallet size={18} className="text-[#050033]" />{accountsLoading ? "Chargement des comptes..." : selectedDebitAccount ? `${selectedDebitAccount.name} - ${selectedDebitAccount.balance}` : accountsError ? "Impossible de charger les comptes." : "Aucun compte disponible."}<ChevronDown size={16} className="ml-auto text-[#6B7280]" /></button>
                </div>
                <div>
                  <FieldLabel>Type de virement</FieldLabel>
                  <button type="button" aria-label="Choisir le type de virement" onClick={() => setShowTypePicker(true)} className="flex h-11 w-full items-center gap-3 rounded-[10px] border border-[#E5E7EB] bg-white px-3 text-[14px] font-medium text-[#090927]"><Clock3 size={18} className="text-[#050033]" />{selectedTransferType.label}<ChevronDown size={16} className="ml-auto text-[#6B7280]" /></button>
                </div>
              </div>

              <div className="mt-5">
                <p className="mb-2 text-[13px] font-semibold text-[#090927]">Beneficiaires recents</p>
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {beneficiaries.map((item) => (
                    <button key={item.id} type="button" aria-pressed={selectedBeneficiaryId === item.id} onClick={() => { resetEmailForNewTransfer(); setSelectedBeneficiaryId(item.id); }} className={`flex min-w-[185px] items-center gap-3 rounded-[14px] border px-3 py-3 text-left ${selectedBeneficiaryId === item.id ? "border-[#9ACD00] bg-[#FBFFF1]" : "border-[#E5E7EB] bg-white"}`}>
                      <span className={`flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-bold ${selectedBeneficiaryId === item.id ? "bg-[#050033] text-white" : "bg-[#F3F4F6] text-[#050033]"}`}>{item.initials}</span>
                      <span className="min-w-0"><span className="block truncate text-[14px] font-bold text-[#090927]">{item.name}</span><span className="mt-1 block truncate text-[12px] text-[#6B7280]">{item.iban}</span></span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Beneficiaire</FieldLabel>
                  <div className="flex h-11 items-center gap-3 rounded-[10px] border border-[#E5E7EB] bg-white px-3"><User size={18} className="text-[#050033]" /><span className="truncate text-[14px] font-medium text-[#090927]">{selectedBeneficiary.name}</span></div>
                </div>
                <div>
                  <FieldLabel>IBAN du beneficiaire</FieldLabel>
                  <div className="flex h-11 items-center gap-3 rounded-[10px] border border-[#E5E7EB] bg-white px-3"><FileText size={18} className="text-[#050033]" /><input readOnly value={selectedBeneficiary.iban} className="min-w-0 flex-1 bg-transparent text-[14px] font-medium text-[#090927] outline-none" /></div>
                </div>
                <div>
                  <FieldLabel>Montant</FieldLabel>
                  <div className="flex h-11 items-center gap-3 rounded-[10px] border border-[#E5E7EB] bg-white px-3"><Euro size={18} className="text-[#050033]" /><input value={amount} onChange={(e) => setAmount(e.target.value)} className="min-w-0 flex-1 bg-transparent text-[14px] font-bold text-[#090927] outline-none" /><span className="text-[13px] text-[#6B7280]">EUR</span></div>
                  {amountError ? <p className="mt-1 text-[12px] text-[#DC2626]">{amountError}</p> : null}
                </div>
                <div>
                  <FieldLabel>Date d&apos;execution</FieldLabel>
                  {selectedTransferTypeId === "scheduled" ? <input type="date" min={todayInputValue()} value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="h-11 w-full rounded-[10px] border border-[#E5E7EB] bg-white px-3 text-[14px] font-medium text-[#090927] outline-none" /> : <div className="flex h-11 items-center gap-3 rounded-[10px] border border-[#E5E7EB] bg-white px-3"><CalendarDays size={18} className="text-[#050033]" /><span className="text-[14px] font-medium text-[#090927]">{executionDate}</span></div>}
                  {dateError ? <p className="mt-1 text-[12px] text-[#DC2626]">{dateError}</p> : null}
                </div>
              </div>

              <div className="mt-5">
                <FieldLabel>Motif du virement</FieldLabel>
                <div className="flex h-11 items-center gap-3 rounded-[10px] border border-[#E5E7EB] bg-white px-3"><FileText size={18} className="text-[#050033]" /><input value={reason} onChange={(e) => setReason(e.target.value)} className="min-w-0 flex-1 bg-transparent text-[14px] font-medium text-[#090927] outline-none" /></div>
              </div>

              <div className="mt-5 flex items-center justify-between rounded-[14px] bg-[#F6F7F9] p-4">
                <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EEF7D8] text-[#7AA600]"><Repeat size={19} /></span><div><p className="text-[14px] font-bold text-[#090927]">Virement recurrent</p><p className="text-[12px] text-[#6B7280]">{isRecurring ? "Active pour cette operation." : "Non active pour cette operation."}</p></div></div>
                <DemoSwitch checked={isRecurring} onChange={setIsRecurring} label="Activer le virement recurrent" />
              </div>
            </Card>

            <div className="col-span-4 space-y-5">
              <Card className="p-5">
                 <h2 className="text-[18px] font-bold text-[#090927]">Resume du virement</h2>
                <div className="mt-5 space-y-4 text-[14px]">
                  <div className="flex items-center justify-between"><span className="text-[#6B7280]">Beneficiaire</span><span className="font-semibold text-[#090927]">{selectedBeneficiary.name}</span></div>
                  <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-4"><span className="text-[#6B7280]">Compte debite</span><span className="font-semibold text-[#090927]">{accountsLoading ? "Chargement des comptes..." : selectedDebitAccount ? `${selectedDebitAccount.name} - ${selectedDebitAccount.last4}` : accountsError ? "Impossible de charger les comptes." : "Aucun compte disponible."}</span></div>
                  <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-4"><span className="text-[#6B7280]">Type</span><span className="font-semibold text-[#090927]">{selectedTransferType.label}</span></div>
                  <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-4"><span className="text-[#6B7280]">IBAN</span><span className="font-semibold text-[#090927]">{selectedBeneficiary.iban}</span></div>
                  <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-4"><span className="text-[#6B7280]">Montant</span><span className="font-bold text-[#050033]">{totalFormatted}</span></div>
                  <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-4"><span className="text-[#6B7280]">Date</span><span className="font-semibold text-[#090927]">{executionDate}</span></div>
                  <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-4"><span className="text-[#6B7280]">Motif</span><span className="font-semibold text-[#090927]">{reason || "-"}</span></div>
                  <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-4"><span className="text-[#6B7280]">Frais</span><span className="font-bold text-[#7AA600]">0,00 EUR</span></div>
                  <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-4"><span className="text-[#6B7280]">Total</span><span className="text-[20px] font-bold text-[#050033]">{totalFormatted}</span></div>
                </div>
                <button type="button" onClick={openRecap} disabled={isAccountSelectionUnavailable} className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-[#050033] text-[15px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">Continuer <ChevronRight size={18} /></button>
                {accountsError ? <p className="mt-3 text-[12px] text-[#DC2626]">Impossible de charger les comptes.</p> : null}
                {!accountsLoading && !accountsError && !selectedDebitAccount ? <p className="mt-3 text-[12px] text-[#6B7280]">Aucun compte disponible.</p> : null}
                <p className="mt-4 text-[12px] leading-[1.45] text-[#6B7280]">Verifiez attentivement les informations avant de continuer.</p>
              </Card>

              <Card className="p-5">
                <h2 className="text-[17px] font-bold text-[#090927]">Virements recents</h2>
                <div className="mt-4 divide-y divide-[#E5E7EB]">
                  {recentTransfersLoading ? (
                    <p className="py-3 text-[13px] text-[#6B7280]">Chargement...</p>
                  ) : recentTransfers.length === 0 ? (
                    <p className="py-3 text-[13px] text-[#6B7280]">Aucun virement recent.</p>
                  ) : recentTransfers.map((item) => (
                    <button key={item.id} type="button" onClick={() => setShowDetail(item)} className="w-full py-3 text-left">
                      <div className="flex items-start justify-between gap-3"><div><p className="text-[14px] font-bold text-[#090927]">{item.beneficiaryName}</p><p className="mt-1 text-[12px] text-[#6B7280]">{item.reason}</p></div><p className="text-[14px] font-bold text-[#050033]">- {item.amount}</p></div>
                      <div className="mt-2 flex items-center justify-between text-[12px] text-[#6B7280]"><span>{item.date}</span><span className="flex items-center gap-1 text-[#7AA600]"><CheckCircle2 size={14} />{item.status}</span></div>
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </DesktopShell>

      {showAdd ? (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-[#050033]/40 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-[#E5E7EB] bg-white p-5">
            <div className="flex items-center justify-between"><h2 className="text-[20px] font-bold text-[#090927]">Ajouter un beneficiaire</h2><button type="button" aria-label="Fermer" onClick={() => setShowAdd(false)}><X size={18} /></button></div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-[14px]">
              <div><FieldLabel>Nom complet</FieldLabel><input value={newBeneficiary.name} onChange={(e) => setNewBeneficiary((c) => ({ ...c, name: e.target.value }))} className="h-11 w-full rounded-[10px] border border-[#E5E7EB] px-3 outline-none" />{addErrors.name ? <p className="mt-1 text-[12px] text-[#DC2626]">{addErrors.name}</p> : null}</div>
              <div><FieldLabel>IBAN</FieldLabel><input value={newBeneficiary.iban} onChange={(e) => setNewBeneficiary((c) => ({ ...c, iban: e.target.value }))} className="h-11 w-full rounded-[10px] border border-[#E5E7EB] px-3 outline-none" />{addErrors.iban ? <p className="mt-1 text-[12px] text-[#DC2626]">{addErrors.iban}</p> : null}</div>
              <div><FieldLabel>Banque</FieldLabel><input value={newBeneficiary.bank} onChange={(e) => setNewBeneficiary((c) => ({ ...c, bank: e.target.value }))} className="h-11 w-full rounded-[10px] border border-[#E5E7EB] px-3 outline-none" />{addErrors.bank ? <p className="mt-1 text-[12px] text-[#DC2626]">{addErrors.bank}</p> : null}</div>
              <div><FieldLabel>Email</FieldLabel><input value={newBeneficiary.email} onChange={(e) => setNewBeneficiary((c) => ({ ...c, email: e.target.value }))} className="h-11 w-full rounded-[10px] border border-[#E5E7EB] px-3 outline-none" />{addErrors.email ? <p className="mt-1 text-[12px] text-[#DC2626]">{addErrors.email}</p> : null}</div>
              <div className="col-span-2"><FieldLabel>Telephone</FieldLabel><input value={newBeneficiary.phone} onChange={(e) => setNewBeneficiary((c) => ({ ...c, phone: e.target.value }))} className="h-11 w-full rounded-[10px] border border-[#E5E7EB] px-3 outline-none" />{addErrors.phone ? <p className="mt-1 text-[12px] text-[#DC2626]">{addErrors.phone}</p> : null}</div>
            </div>
            <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setShowAdd(false)} className="h-10 rounded-[10px] border border-[#E5E7EB] px-4 text-[14px] font-semibold">Annuler</button><button type="button" onClick={addBeneficiary} className="h-10 rounded-[10px] bg-[#050033] px-4 text-[14px] font-semibold text-white">Ajouter</button></div>
          </div>
        </div>
      ) : null}

      {showRecap ? (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-[#050033]/40 p-4">
          <div role="dialog" aria-modal="true" className="w-full max-w-4xl rounded-[24px] border border-[#E5E7EB] bg-white p-6 shadow-2xl">
             <h2 className="text-[24px] font-bold text-[#090927]">Recapitulatif du virement</h2>
            <p className="mt-1 text-[14px] text-[#6B7280]">Verifiez les informations avant validation.</p>
            <div className="mt-5 grid grid-cols-12 gap-5">
              <div className="col-span-8 space-y-3 rounded-[16px] border border-[#E5E7EB] p-4 text-[14px]">
                <div className="flex items-start justify-between"><span className="flex items-center gap-2 text-[#6B7280]"><Wallet size={16} />Compte debite</span><span className="text-right font-semibold text-[#090927]">{selectedDebitAccount?.name ?? ""}<br />{selectedDebitAccount?.iban ?? ""}<br />Solde : {selectedDebitAccount?.balance ?? ""}</span></div>
                <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-3"><span className="flex items-center gap-2 text-[#6B7280]"><Clock3 size={16} />Type de virement</span><span className="font-semibold text-[#090927]">{selectedTransferType.label}</span></div>
                <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-3"><span className="flex items-center gap-2 text-[#6B7280]"><User size={16} />Beneficiaire</span><span className="font-semibold text-[#090927]">{selectedBeneficiary.name} - {selectedBeneficiary.type}</span></div>
                <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-3"><span className="flex items-center gap-2 text-[#6B7280]"><Landmark size={16} />Banque</span><span className="font-semibold text-[#090927]">{selectedBeneficiary.bank}</span></div>
                <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-3"><span className="text-[#6B7280]">IBAN beneficiaire</span><span className="font-semibold text-[#090927]">{selectedBeneficiary.iban}</span></div>
                <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-3"><span className="text-[#6B7280]">Montant</span><span className="font-semibold text-[#090927]">{totalFormatted}</span></div>
                <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-3"><span className="text-[#6B7280]">Frais</span><span className="font-semibold text-[#7AA600]">0,00 EUR</span></div>
                <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-3"><span className="text-[#6B7280]">Date d&apos;execution</span><span className="font-semibold text-[#090927]">{executionDate}</span></div>
                <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-3"><span className="text-[#6B7280]">Motif</span><span className="font-semibold text-[#090927]">{reason || "Non renseigne"}</span></div>
                <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-3"><span className="text-[#6B7280]">Virement recurrent</span><span className="font-semibold text-[#090927]">{isRecurring ? "Oui" : "Non"}</span></div>
                 <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-3"><span className="text-[#6B7280]">Reference provisoire</span><span className="font-semibold text-[#050033]">{temporaryReference}</span></div>
              </div>
              <div className="col-span-4 rounded-[16px] border border-[#E5E7EB] p-4">
                <h3 className="text-[16px] font-bold text-[#090927]">Resume</h3>
                <div className="mt-4 space-y-3 text-[14px]">
                  <div className="flex items-center justify-between"><span className="text-[#6B7280]">Montant total</span><span className="font-bold text-[#050033]">{totalFormatted}</span></div>
                  <div className="flex items-center justify-between"><span className="text-[#6B7280]">Frais</span><span className="font-semibold text-[#7AA600]">0,00 EUR</span></div>
                  <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-3"><span className="text-[#6B7280]">Total debite</span><span className="text-[18px] font-bold text-[#050033]">{totalFormatted}</span></div>
                </div>
              </div>
            </div>
             {submitError ? <div className="mt-4 rounded-[10px] border border-[#DC2626] bg-[#FEF2F2] p-3 text-[13px] text-[#DC2626]">{submitError}</div> : null}
            <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setShowRecap(false)} disabled={isSubmitting} className="h-10 rounded-[10px] border border-[#050033] px-4 text-[14px] font-semibold text-[#050033] disabled:cursor-not-allowed disabled:opacity-50">Retour</button><button type="button" onClick={validateTransfer} disabled={isSubmitting} className="h-10 rounded-[10px] bg-[#050033] px-4 text-[14px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? "Traitement en cours..." : "Valider"}</button></div>
          </div>
        </div>
      ) : null}

      {showSuccess ? (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-[#050033]/40 p-4">
          <div role="dialog" aria-modal="true" className="w-full max-w-3xl rounded-[24px] border border-[#E5E7EB] bg-white p-6 shadow-2xl">
            <div className="text-center"><span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#9ACD00] text-white"><CheckCircle2 size={34} /></span><h2 className="mt-3 text-[24px] font-bold text-[#090927]">Virement effectue avec succes</h2><p className="mt-1 text-[14px] text-[#6B7280]">Virement effectue avec succes.</p><p className="text-[13px] text-[#6B7280]">Recu prepare pour consultation.</p></div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-[14px]"><p><span className="text-[#6B7280]">Reference</span><br /><span className="font-semibold text-[#090927]">{finalReference}</span></p><p><span className="text-[#6B7280]">Date</span><br /><span className="font-semibold text-[#090927]">{(validatedAt ?? new Date()).toLocaleDateString("fr-FR")}</span></p><p><span className="text-[#6B7280]">Heure</span><br /><span className="font-semibold text-[#090927]">{(validatedAt ?? new Date()).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span></p><p><span className="text-[#6B7280]">Date d&apos;execution</span><br /><span className="font-semibold text-[#090927]">{executionDate}</span></p><p><span className="text-[#6B7280]">Compte debite</span><br /><span className="font-semibold text-[#090927]">{selectedDebitAccount?.name ?? ""}</span></p><p><span className="text-[#6B7280]">IBAN compte debite</span><br /><span className="font-semibold text-[#090927]">{maskIban(selectedDebitAccount?.iban ?? "")}</span></p><p><span className="text-[#6B7280]">Type de virement</span><br /><span className="font-semibold text-[#090927]">{selectedTransferType.label}</span></p><p><span className="text-[#6B7280]">Beneficiaire</span><br /><span className="font-semibold text-[#090927]">{selectedBeneficiary.name}</span></p><p><span className="text-[#6B7280]">Banque</span><br /><span className="font-semibold text-[#090927]">{selectedBeneficiary.bank}</span></p><p><span className="text-[#6B7280]">IBAN beneficiaire</span><br /><span className="font-semibold text-[#090927]">{maskIban(selectedBeneficiary.iban)}</span></p><p><span className="text-[#6B7280]">Montant</span><br /><span className="font-semibold text-[#090927]">{totalFormatted}</span></p><p><span className="text-[#6B7280]">Frais</span><br /><span className="font-semibold text-[#7AA600]">0,00 EUR</span></p><p><span className="text-[#6B7280]">Total debite</span><br /><span className="text-[18px] font-bold text-[#050033]">{totalFormatted}</span></p></div>
            {emailStatus !== "idle" ? <div className="mt-4 rounded-[12px] border border-[#E5E7EB] bg-[#F8F9FB] p-3 text-[13px] text-[#6B7280]"><p className="font-semibold text-[#090927]">{emailStatus === "sending" ? t("transfers.emailNotice.sending") : emailStatus === "sent" ? t("transfers.emailNotice.sent") : t("transfers.emailNotice.failed")}</p>{emailStatus === "sent" ? <p className="mt-1">{t("transfers.emailNotice.sentTo")} : {selectedBeneficiary.email}</p> : null}{emailError ? <p className="mt-1 text-[12px] text-[#DC2626]">{emailError}</p> : null}</div> : null}
            <div className="mt-6 flex flex-wrap justify-end gap-2"><button type="button" onClick={downloadReceipt} className="h-10 rounded-[10px] border border-[#050033] px-4 text-[14px] font-semibold text-[#050033]">Telecharger le recu</button><button type="button" onClick={() => { setShowSuccess(false); setAmount(""); setReason(""); setTemporaryReference(""); setFinalReference(""); setValidatedAt(null); resetEmailNotice(); setSubmitError(null); setIsSubmitting(false); }} className="h-10 rounded-[10px] border border-[#050033] px-4 text-[14px] font-semibold text-[#050033]">Faire un autre virement</button><button type="button" onClick={() => { setShowSuccess(false); setValidatedAt(null); resetEmailForNewTransfer(); }} className="h-10 rounded-[10px] bg-[#050033] px-4 text-[14px] font-semibold text-white">Fermer</button></div>
          </div>
        </div>
      ) : null}

      {showAccountPicker ? (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-[#050033]/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#E5E7EB] bg-white p-5">
            <div className="flex items-center justify-between"><h2 className="text-[20px] font-bold text-[#090927]">Choisir le compte a debiter</h2><button type="button" aria-label="Fermer" onClick={() => setShowAccountPicker(false)}><X size={18} /></button></div>
            <div className="mt-4 space-y-2">{accountsLoading ? <p className="text-[14px] text-[#6B7280]">Chargement des comptes...</p> : accountsError ? <p className="text-[14px] text-[#DC2626]">Impossible de charger les comptes.</p> : debitAccounts.length === 0 ? <p className="text-[14px] text-[#6B7280]">Aucun compte disponible.</p> : debitAccounts.map((account) => { const isSelected = selectedDebitAccountId === account.id; return <button key={account.id} type="button" aria-pressed={isSelected} aria-label={`Selectionner ${account.name}`} onClick={() => { resetEmailForNewTransfer(); setSelectedDebitAccountId(account.id); setShowAccountPicker(false); }} className={`flex w-full items-center justify-between rounded-[12px] border px-3 py-3 text-left ${isSelected ? "border-[#9ACD00] bg-[#F7FBEA]" : "border-[#E5E7EB] bg-white"}`}><span><span className="block text-[14px] font-semibold text-[#090927]">{account.name}</span><span className="block text-[12px] text-[#6B7280]">{account.balance} - {maskIban(account.iban)}</span></span>{isSelected ? <span className="text-[#7AA600]"><Check size={15} /></span> : null}</button>; })}</div>
          </div>
        </div>
      ) : null}

      {showTypePicker ? (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-[#050033]/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#E5E7EB] bg-white p-5">
            <div className="flex items-center justify-between"><h2 className="text-[20px] font-bold text-[#090927]">Choisir le type de virement</h2><button type="button" aria-label="Fermer" onClick={() => setShowTypePicker(false)}><X size={18} /></button></div>
            <div className="mt-4 space-y-2">{transferTypes.map((type) => <button key={type.id} type="button" aria-pressed={selectedTransferTypeId === type.id} onClick={() => selectTransferType(type.id)} className={`flex w-full items-center justify-between rounded-[12px] border px-3 py-3 text-left ${selectedTransferTypeId === type.id ? "border-[#9ACD00] bg-[#FBFFF1]" : "border-[#E5E7EB]"}`}><span><span className="block text-[14px] font-semibold text-[#090927]">{type.label}</span><span className="block text-[12px] text-[#6B7280]">{type.description}</span></span><span className="text-[#7AA600]">{selectedTransferTypeId === type.id ? "✓" : ""}</span></button>)}</div>
          </div>
        </div>
      ) : null}

      {showDetail ? (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-[#050033]/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#E5E7EB] bg-white p-5">
            <h2 className="text-[20px] font-bold text-[#090927]">Detail du virement</h2>
            <div className="mt-4 space-y-2 text-[14px]"><p>Beneficiaire : {showDetail.beneficiaryName}</p><p>Date : {showDetail.date}</p><p>Montant : {showDetail.amount}</p><p>Motif : {showDetail.reason}</p><p>Statut : {showDetail.status}</p><p>Reference : {showDetail.reference}</p></div>
            <div className="mt-5 flex justify-end"><button type="button" onClick={() => setShowDetail(null)} className="h-10 rounded-[10px] bg-[#050033] px-4 text-[14px] font-semibold text-white">Fermer</button></div>
          </div>
        </div>
      ) : null}

      <DemoToast open={Boolean(toast)} message={toast} onClose={() => setToast("")} />
    </>
  );
}
