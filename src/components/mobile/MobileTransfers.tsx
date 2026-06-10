"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Building2, Check, CheckCircle2, ChevronRight, Clock3, CreditCard, Download, Euro, FileText, Plus, ShieldCheck, User, Wallet, X, Zap } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useNotifications } from "@/context/NotificationContext";
import { useMessages } from "@/context/MessageContext";
import { generateTransferPdf } from "@/utils/generateTransferPdf";
import {
  type EmailStatus,
} from "@/utils/sendBeneficiaryTransferEmail";

import MobileShell from "./MobileShell";
import DemoSwitch from "../shared/DemoSwitch";
import DemoToast from "../shared/DemoToast";
import type { SupabaseAccount } from "@/types/supabase";
import { createSafeId } from "@/utils/safeId";

type Beneficiary = { id: string; name: string; type: string; iban: string; bank: string; email: string; phone: string; initials: string };
type RecentTransferItem = { id: string; beneficiaryName: string; date: string; reason: string | null; amount: string; status: string; reference: string };
type BeneficiariesApiResponse =
  | { success: true; beneficiaries: Array<{ id: string; code?: string | null; name: string; type?: string | null; iban: string; bank: string; email?: string | null; phone?: string | null; initials?: string | null; favorite: boolean; active: boolean }> }
  | { success: false; error: string };

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

function parseAmount(value: string) { const p = Number.parseFloat(value.replace(/\s/g, "").replace(",", ".")); return Number.isFinite(p) ? p : 0; }
function formatCurrency(value: number, currency = "EUR") {
  if (!Number.isFinite(value)) return "Montant indisponible";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(value);
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
function formatAmount(value: string) { return `${parseAmount(value).toFixed(2).replace(".", ",")} EUR`; }
function maskIban(iban: string) { const c = iban.replace(/\s+/g, ""); return `${c.slice(0, 4)} ${c.slice(4, 8)} **** **** ${c.slice(-4)}`; }
function generateTemporaryReference() { const n = new Date(); return `VR-${String(n.getFullYear()).slice(-2)}${String(n.getMonth() + 1).padStart(2, "0")}${String(n.getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 9000) + 1000)}`; }
function todayInputValue() { return new Date().toISOString().slice(0, 10); }
function formatExecutionDate(value: string) { if (!value) return "Aujourd'hui"; return new Date(`${value}T00:00:00`).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }); }
function todayDateString() { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`; }
function isUuid(value: string) { return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value); }
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

function Card({ children, className = "" }: { children: ReactNode; className?: string }) { return <div className={`rounded-[18px] border border-[#E5E7EB] bg-white shadow-[0_10px_26px_rgba(5,0,51,0.07)] ${className}`}>{children}</div>; }

export default function MobileTransfers() {
  const { t } = useLanguage();
  const { addTransferNotification } = useNotifications();
  const { addTransferMessage } = useMessages();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [beneficiariesLoading, setBeneficiariesLoading] = useState(true);
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState("");
  const [selectedDebitAccountId, setSelectedDebitAccountId] = useState("current");
  const [selectedTransferTypeId, setSelectedTransferTypeId] = useState("instant");
  const [amount, setAmount] = useState("120");
  const [reason, setReason] = useState("Règlement privé");
  const [scheduledDate, setScheduledDate] = useState(todayInputValue());
  const [isRecurring, setIsRecurring] = useState(false);
  const [amountError, setAmountError] = useState("");
  const [dateError, setDateError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newBeneficiary, setNewBeneficiary] = useState({ name: "", iban: "", bank: "", email: "", phone: "" });
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});
  const [showRecap, setShowRecap] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDetail, setShowDetail] = useState<RecentTransferItem | null>(null);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [toast, setToast] = useState("");
  const [validatedAt, setValidatedAt] = useState<Date | null>(null);
  const [temporaryReference, setTemporaryReference] = useState("");
  const [finalReference, setFinalReference] = useState("");
  const [emailStatus, setEmailStatus] = useState<EmailStatus>("idle");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [debitAccounts, setDebitAccounts] = useState<DebitAccountViewModel[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [accountsError, setAccountsError] = useState<string | null>(null);

  const transferTypes = useMemo(() => [
    { id: "instant", label: t("transfers.types.instant"), description: t("transfers.types.instantDesc") },
    { id: "scheduled", label: t("transfers.types.scheduled"), description: t("transfers.types.scheduledDesc") },
    { id: "recurring", label: t("transfers.types.permanent"), description: t("transfers.types.permanentDesc") },
  ], [t]);

  const [recentTransfers, setRecentTransfers] = useState<RecentTransferItem[]>([]);
  const [recentTransfersLoading, setRecentTransfersLoading] = useState(true);

  const selectedBeneficiary = useMemo(() => beneficiaries.find((b) => b.id === selectedBeneficiaryId) ?? beneficiaries[0] ?? { id: "", name: "", type: "Particulier", iban: "", bank: "", email: "", phone: "", initials: "" }, [selectedBeneficiaryId, beneficiaries]);
  const selectedDebitAccount = useMemo(() => debitAccounts.find((a) => a.id === selectedDebitAccountId) ?? debitAccounts[0] ?? null, [selectedDebitAccountId, debitAccounts]);
  const selectedTransferType = useMemo(() => transferTypes.find((item) => item.id === selectedTransferTypeId) ?? transferTypes[0], [selectedTransferTypeId, transferTypes]);
  const totalFormatted = formatAmount(amount);
  const executionDate = selectedTransferTypeId === "scheduled" ? formatExecutionDate(scheduledDate) : t("common.today");
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

  useEffect(() => {
    let ignore = false;
    void (async () => {
      setBeneficiariesLoading(true);
      try {
        const res = await fetch("/api/beneficiaries");
        const json = await res.json() as BeneficiariesApiResponse;
        if (ignore) return;
        if (!json.success || !json.beneficiaries) {
          setBeneficiaries([]);
          return;
        }
        const mapped: Beneficiary[] = json.beneficiaries.map((b) => ({
          id: b.id,
          name: b.name,
          type: b.type ?? "Particulier",
          iban: b.iban,
          bank: b.bank,
          email: b.email ?? "",
          phone: b.phone ?? "",
          initials: b.initials ?? (b.name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "NB"),
        }));
        setBeneficiaries(mapped);
        if (mapped.length > 0 && !selectedBeneficiaryId) {
          setSelectedBeneficiaryId(mapped[0].id);
        }
      } catch {
        if (!ignore) setBeneficiaries([]);
      } finally {
        if (!ignore) setBeneficiariesLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function refreshBeneficiaries() {
    try {
      const res = await fetch("/api/beneficiaries", { cache: "no-store" });
      const json = await res.json() as BeneficiariesApiResponse;
      if (!json.success || !json.beneficiaries) {
        return;
      }
      const mapped: Beneficiary[] = json.beneficiaries.map((b) => ({
        id: b.id,
        name: b.name,
        type: b.type ?? "Particulier",
        iban: b.iban,
        bank: b.bank,
        email: b.email ?? "",
        phone: b.phone ?? "",
        initials: b.initials ?? (b.name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "NB"),
      }));
      setBeneficiaries(mapped);
      if (mapped.length > 0 && !mapped.some((b) => b.id === selectedBeneficiaryId)) {
        setSelectedBeneficiaryId(mapped[0].id);
      }
    } catch {
      // silent
    }
  }

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

  function selectTransferType(typeId: string) { resetEmailForNewTransfer(); setSelectedTransferTypeId(typeId); setIsRecurring(typeId === "recurring"); if (typeId === "scheduled" && !scheduledDate) setScheduledDate(todayInputValue()); setShowTypePicker(false); }

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
    if (!amount.trim() || parsedAmount <= 0) { setAmountError(t("transfers.errors.invalidAmount")); return; }
    if (parsedAmount > selectedDebitAccount.rawBalance) { setAmountError(t("transfers.errors.amountExceedsBalance")); return; }
    if (selectedTransferTypeId === "scheduled" && (!scheduledDate || scheduledDate < todayInputValue())) { setDateError(t("transfers.errors.invalidExecutionDate")); return; }
    setAmountError(""); setDateError(""); if (!temporaryReference) setTemporaryReference(generateTemporaryReference()); setShowRecap(true);
  }

  async function addBeneficiary() {
    const errors: Record<string, string> = {};
    if (!newBeneficiary.name.trim()) errors.name = t("transfers.errors.requiredName");
    if (!newBeneficiary.iban.trim()) errors.iban = t("transfers.errors.requiredIban");
    if (!newBeneficiary.bank.trim()) errors.bank = t("transfers.errors.requiredBank");
    if (!newBeneficiary.email.trim()) errors.email = t("transfers.errors.requiredEmail");
    if (newBeneficiary.email.trim() && !newBeneficiary.email.includes("@")) errors.email = t("transfers.errors.invalidEmail");
    if (!newBeneficiary.phone.trim()) errors.phone = t("transfers.errors.requiredPhone");
    setAddErrors(errors);
    if (Object.keys(errors).length) return;

    try {
      const res = await fetch("/api/beneficiaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newBeneficiary.name.trim(),
          iban: newBeneficiary.iban.trim(),
          bank: newBeneficiary.bank.trim(),
          email: newBeneficiary.email.trim(),
          phone: newBeneficiary.phone.trim(),
        }),
      });

      const json = await res.json() as { success: boolean; beneficiary?: { id: string }; error?: string; message?: string };

      if (!json.success || !json.beneficiary) {
        setToast(json.message ?? "Erreur lors de l'ajout du bénéficiaire.");
        return;
      }

      setShowAdd(false);
      setNewBeneficiary({ name: "", iban: "", bank: "", email: "", phone: "" });
      setAddErrors({});
      setToast(t("transfers.beneficiaryAdded"));
      setSelectedBeneficiaryId(json.beneficiary.id);
      void refreshBeneficiaries();
    } catch {
      setToast("Erreur réseau lors de l'ajout du bénéficiaire.");
    }
  }

  function resetEmailNotice() { setEmailStatus("idle"); setEmailError(null); }

  function resetEmailForNewTransfer() { resetEmailNotice(); setFinalReference(""); setSubmitError(null); }

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
      idempotencyKey: createSafeId("transfer"),
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
      const validationDate = new Date();
      setValidatedAt(validationDate);
      setFinalReference(supabaseReference);
      setShowRecap(false);
      setShowSuccess(true);
      addTransferNotification({ beneficiary: selectedBeneficiary.name, amount: totalFormatted, reference: supabaseReference });
      addTransferMessage({ beneficiary: selectedBeneficiary.name, amount: totalFormatted, reference: supabaseReference, accountName: selectedDebitAccount?.name ?? "", executionDate, validationDate: validationDate.toLocaleDateString("fr-FR"), validationTime: validationDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) });
      const nextEmailStatus = result.transfer?.email_status ?? result.emailStatus ?? "idle";
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
    const receiptDate = validatedAt ?? new Date();
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
        validationDate: receiptDate.toLocaleDateString("fr-FR"),
        validationTime: receiptDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        temporaryReference,
        finalReference,
        reason,
        amount: totalFormatted,
        fees: "0,00 EUR",
        total: totalFormatted,
      });
    } catch {
       const content = [`Recu de virement`, `Reference: ${finalReference}`, `Date: ${receiptDate.toLocaleDateString("fr-FR")}`, `Heure: ${receiptDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`, `Compte debite: ${selectedDebitAccount?.name ?? ""}`, `IBAN compte debite: ${selectedDebitAccount?.iban ?? ""}`, `Type de virement: ${selectedTransferType.label}`, `Date d'execution: ${executionDate}`, `Beneficiaire: ${selectedBeneficiary.name}`, `Banque: ${selectedBeneficiary.bank}`, `IBAN beneficiaire: ${selectedBeneficiary.iban}`, `Montant: ${totalFormatted}`, `Frais: 0,00 EUR`, `Total: ${totalFormatted}`, `Motif: ${reason || "-"}`].join("\n");
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `recu-virement-${finalReference || "virement"}.txt`;
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    }
  }

  return (
    <>
      <MobileShell>
        <div className="space-y-4 pb-6">
          <section><h1 className="text-[24px] font-bold text-[#090927]">{t("transfers.title")}</h1></section>
          <Card className="p-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3"><button type="button" onClick={() => setShowAdd(true)} className="flex h-11 items-center justify-center gap-2 rounded-[10px] border border-[#050033]"><Plus size={16} />{t("transfers.newBeneficiary")}</button><Link href="/virements/direct" className="flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#050033] text-white"><Zap size={16} />{t("transfers.directTransfer")}</Link></div>
              <div><label className="mb-2 block text-[13px] font-semibold text-[#090927]">{t("transfers.debitAccount")}</label><button type="button" onClick={() => setShowAccountPicker(true)} className="flex h-11 w-full items-center gap-3 rounded-[10px] border border-[#E5E7EB] bg-white px-3 text-[14px] font-semibold text-[#090927]"><Wallet size={18} />{accountsLoading ? "Chargement des comptes..." : selectedDebitAccount ? `${selectedDebitAccount.name} - ${selectedDebitAccount.balance}` : accountsError ? "Impossible de charger les comptes." : "Aucun compte disponible."}<ChevronRight size={16} className="ml-auto" /></button></div>
              <div><label className="mb-2 block text-[13px] font-semibold text-[#090927]">{t("common.type")}</label><button type="button" onClick={() => setShowTypePicker(true)} className="flex h-11 w-full items-center gap-3 rounded-[10px] border border-[#E5E7EB] bg-white px-3 text-[14px] font-semibold text-[#090927]"><Clock3 size={16} />{selectedTransferType.label}</button></div>
              {selectedTransferTypeId === "scheduled" ? <div><label className="mb-2 block text-[13px] font-semibold text-[#090927]">{t("transfers.executionDate")}</label><input type="date" min={todayInputValue()} value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="h-11 w-full rounded-[10px] border border-[#E5E7EB] px-3 text-[14px] outline-none" />{dateError ? <p className="mt-1 text-[12px] text-[#DC2626]">{dateError}</p> : null}</div> : null}
              <div className="flex gap-2 overflow-auto">{beneficiariesLoading ? <p className="py-3 text-[13px] text-[#6B7280]">Chargement...</p> : beneficiaries.length === 0 ? <p className="py-3 text-[13px] text-[#6B7280]">Aucun bénéficiaire.</p> : beneficiaries.map((b) => <button key={b.id} type="button" onClick={() => { resetEmailForNewTransfer(); setSelectedBeneficiaryId(b.id); }} className={`rounded-[13px] border px-3 py-2 ${selectedBeneficiaryId === b.id ? "border-[#9ACD00] bg-[#FBFFF1]" : "border-[#E5E7EB]"}`}>{b.name}</button>)}</div>
              <div><div className="flex h-11 items-center gap-3 rounded-[10px] border border-[#E5E7EB] px-3"><Euro size={16} /><input value={amount} onChange={(e) => setAmount(e.target.value)} className="flex-1 outline-none" /><span className="text-[12px] text-[#6B7280]">EUR</span></div>{amountError ? <p className="mt-1 text-[12px] text-[#DC2626]">{amountError}</p> : null}</div>
              <div className="flex h-11 items-center gap-3 rounded-[10px] border border-[#E5E7EB] px-3"><FileText size={16} /><input value={reason} onChange={(e) => setReason(e.target.value)} className="flex-1 outline-none" /></div>
              <div className="flex items-center justify-between rounded-[14px] bg-[#F6F7F9] p-3"><span className="font-semibold">{t("transfers.recurring")}</span><DemoSwitch checked={isRecurring} onChange={setIsRecurring} label={t("common.enable")} /></div>
            </div>
          </Card>
          <Card className="p-4"><div className="space-y-2 text-[14px]"><p className="flex justify-between"><span>{t("transfers.debitAccount")}</span><span>{accountsLoading ? "Chargement des comptes..." : selectedDebitAccount ? `${selectedDebitAccount.name} - ${selectedDebitAccount.last4}` : accountsError ? "Impossible de charger les comptes." : "Aucun compte disponible."}</span></p><p className="flex justify-between"><span>{t("transfers.beneficiary")}</span><span>{selectedBeneficiary.name}</span></p><p className="flex justify-between"><span>{t("common.amount")}</span><span>{totalFormatted}</span></p><p className="flex justify-between"><span>{t("common.date")}</span><span>{executionDate}</span></p></div><button type="button" onClick={openRecap} disabled={isAccountSelectionUnavailable} className="mt-4 h-11 w-full rounded-[10px] bg-[#050033] text-white disabled:cursor-not-allowed disabled:opacity-60">{t("common.continueBtn")}</button>{accountsError ? <p className="mt-2 text-[12px] text-[#DC2626]">Impossible de charger les comptes.</p> : null}{!accountsLoading && !accountsError && !selectedDebitAccount ? <p className="mt-2 text-[12px] text-[#6B7280]">Aucun compte disponible.</p> : null}</Card>
          <Card className="p-4"><h2 className="font-bold">{t("transfers.recent")}</h2>{recentTransfersLoading ? <p className="py-3 text-[13px] text-[#6B7280]">Chargement...</p> : recentTransfers.length === 0 ? <p className="py-3 text-[13px] text-[#6B7280]">Aucun virement recent.</p> : recentTransfers.map((item) => <button key={item.id} type="button" onClick={() => setShowDetail(item)} className="flex w-full items-center justify-between py-2 text-left"><span>{item.beneficiaryName}</span><span>- {item.amount}</span></button>)}</Card>
        </div>
      </MobileShell>

      {showAdd ? <div className="fixed inset-0 z-[1300] flex items-end bg-[#050033]/40 p-3"><div className="w-full rounded-2xl bg-white p-4"><div className="flex items-center justify-between"><h2 className="text-[18px] font-bold">{t("transfers.newBeneficiary")}</h2><button type="button" onClick={() => setShowAdd(false)}><X size={18} /></button></div><div className="mt-3 space-y-3"><input placeholder={t("transfers.fullName")} value={newBeneficiary.name} onChange={(e) => setNewBeneficiary((c) => ({ ...c, name: e.target.value }))} className="h-11 w-full rounded-[10px] border border-[#E5E7EB] px-3" />{addErrors.name ? <p className="text-[12px] text-[#DC2626]">{addErrors.name}</p> : null}<input placeholder="IBAN" value={newBeneficiary.iban} onChange={(e) => setNewBeneficiary((c) => ({ ...c, iban: e.target.value }))} className="h-11 w-full rounded-[10px] border border-[#E5E7EB] px-3" />{addErrors.iban ? <p className="text-[12px] text-[#DC2626]">{addErrors.iban}</p> : null}<input placeholder={t("common.bank")} value={newBeneficiary.bank} onChange={(e) => setNewBeneficiary((c) => ({ ...c, bank: e.target.value }))} className="h-11 w-full rounded-[10px] border border-[#E5E7EB] px-3" />{addErrors.bank ? <p className="text-[12px] text-[#DC2626]">{addErrors.bank}</p> : null}<input placeholder="Email" value={newBeneficiary.email} onChange={(e) => setNewBeneficiary((c) => ({ ...c, email: e.target.value }))} className="h-11 w-full rounded-[10px] border border-[#E5E7EB] px-3" />{addErrors.email ? <p className="text-[12px] text-[#DC2626]">{addErrors.email}</p> : null}<input placeholder={t("transfers.phone")} value={newBeneficiary.phone} onChange={(e) => setNewBeneficiary((c) => ({ ...c, phone: e.target.value }))} className="h-11 w-full rounded-[10px] border border-[#E5E7EB] px-3" />{addErrors.phone ? <p className="text-[12px] text-[#DC2626]">{addErrors.phone}</p> : null}<button type="button" onClick={addBeneficiary} className="h-11 w-full rounded-[10px] bg-[#050033] text-white">{t("beneficiaries.add")}</button></div></div></div> : null}
      {/* ── RECAP PREMIUM BOTTOM SHEET ── */}
      {showRecap ? (
        <div className="fixed inset-0 z-[1300] flex items-end bg-[#050033]/50 backdrop-blur-[2px]" style={{ animation: 'fadeIn .25s ease' }}>
          <div className="w-full max-h-[92vh] overflow-y-auto rounded-t-[24px] bg-[#F8F9FB] pb-6 shadow-[0_-8px_40px_rgba(5,0,51,0.18)]" style={{ animation: 'slideUp .3s cubic-bezier(.22,1,.36,1)' }}>
            {/* Drag handle */}
            <div className="sticky top-0 z-10 flex justify-center bg-[#F8F9FB] pt-3 pb-1 rounded-t-[24px]">
              <div className="h-[5px] w-10 rounded-full bg-[#D1D5DB]" />
            </div>

            <div className="px-5">
              {/* Header */}
              <div className="flex flex-col items-center pt-2 pb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#B8E63C] to-[#7AA600] shadow-[0_4px_14px_rgba(122,166,0,0.3)]">
                  <ShieldCheck size={24} className="text-white" />
                </div>
                <h2 className="mt-3 text-[20px] font-bold tracking-tight text-[#090927]">Récapitulatif du virement</h2>
                <p className="mt-1 text-[13px] text-[#6B7280]">Vérifiez les informations avant validation</p>
              </div>

              {/* Section 1 — Compte débité */}
              <div className="mb-3 rounded-[16px] border border-[#E5E7EB] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#050033]/[0.06]">
                    <CreditCard size={14} className="text-[#050033]" />
                  </div>
                  <span className="text-[13px] font-semibold uppercase tracking-wide text-[#6B7280]">{t("transfers.debitAccount")}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-semibold text-[#090927]">{selectedDebitAccount.name}</span>
                    <span className="rounded-full bg-[#EEF7D8] px-2.5 py-0.5 text-[12px] font-medium text-[#7AA600]">{selectedDebitAccount.balance}</span>
                  </div>
                  <p className="text-[13px] text-[#6B7280] tracking-wide font-mono">{selectedDebitAccount.iban}</p>
                </div>
              </div>

              {/* Section 2 — Bénéficiaire */}
              <div className="mb-3 rounded-[16px] border border-[#E5E7EB] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#050033]/[0.06]">
                    <User size={14} className="text-[#050033]" />
                  </div>
                  <span className="text-[13px] font-semibold uppercase tracking-wide text-[#6B7280]">{t("transfers.beneficiary")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#050033] to-[#1a1a5e] text-[14px] font-bold text-white shadow-sm">
                    {selectedBeneficiary.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold text-[#090927]">{selectedBeneficiary.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Building2 size={12} className="shrink-0 text-[#9CA3AF]" />
                      <span className="text-[13px] text-[#6B7280] truncate">{selectedBeneficiary.bank}</span>
                    </div>
                    <p className="mt-1 text-[12px] text-[#9CA3AF] font-mono tracking-wide truncate">{selectedBeneficiary.iban}</p>
                  </div>
                </div>
              </div>

              {/* Section 3 — Détails du virement */}
              <div className="mb-3 rounded-[16px] border border-[#E5E7EB] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#050033]/[0.06]">
                    <FileText size={14} className="text-[#050033]" />
                  </div>
                  <span className="text-[13px] font-semibold uppercase tracking-wide text-[#6B7280]">Détails du virement</span>
                </div>

                {/* Amount highlight */}
                <div className="mb-3 rounded-[12px] bg-gradient-to-r from-[#F8F9FB] to-[#EEF7D8]/60 p-3 text-center">
                  <p className="text-[12px] font-medium text-[#6B7280] mb-0.5">{t("common.amount")}</p>
                  <p className="text-[26px] font-extrabold tracking-tight text-[#090927]">{totalFormatted}</p>
                </div>

                <div className="space-y-0">
                  <div className="flex items-center justify-between border-b border-[#F3F4F6] py-2.5">
                    <span className="text-[13px] text-[#6B7280]">{t("transfers.fees")}</span>
                    <span className="text-[13px] font-medium text-[#7AA600]">0,00 EUR</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#F3F4F6] py-2.5">
                    <span className="text-[13px] font-semibold text-[#090927]">{t("transfers.total")}</span>
                    <span className="text-[15px] font-bold text-[#090927]">{totalFormatted}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#F3F4F6] py-2.5">
                    <span className="text-[13px] text-[#6B7280]">{t("common.reason")}</span>
                    <span className="text-[13px] font-medium text-[#090927] text-right max-w-[55%] truncate">{reason || "-"}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#F3F4F6] py-2.5">
                    <span className="text-[13px] text-[#6B7280]">{t("common.type")}</span>
                    <span className="text-[13px] font-medium text-[#090927]">{selectedTransferType.label}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#F3F4F6] py-2.5">
                    <span className="text-[13px] text-[#6B7280]">{t("transfers.executionDate")}</span>
                    <span className="text-[13px] font-medium text-[#090927]">{executionDate}</span>
                  </div>
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-[13px] text-[#6B7280]">{t("transfers.tempRef")}</span>
                    <span className="text-[12px] font-mono text-[#9CA3AF]">{temporaryReference}</span>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="mt-4 grid grid-cols-2 gap-3 pb-2">
                {submitError ? <div className="col-span-2 rounded-[12px] border border-[#DC2626] bg-[#FEF2F2] p-3 text-[13px] text-[#DC2626]">{submitError}</div> : null}
                <button
                  type="button"
                  onClick={() => setShowRecap(false)}
                  disabled={isSubmitting}
                  className="flex h-[50px] items-center justify-center rounded-[14px] border-2 border-[#050033]/20 text-[15px] font-semibold text-[#050033] transition-all active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t("common.back")}
                </button>
                <button
                  type="button"
                  onClick={validateTransfer}
                  disabled={isSubmitting}
                  className="flex h-[50px] items-center justify-center gap-2 rounded-[14px] bg-[#050033] text-[15px] font-bold text-white shadow-[0_4px_14px_rgba(5,0,51,0.25)] transition-all active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Traitement en cours..." : t("common.validate")}
                  {isSubmitting ? null : <ArrowRight size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── SUCCESS PREMIUM BOTTOM SHEET ── */}
      {showSuccess ? (
        <div className="fixed inset-0 z-[1300] flex items-end bg-[#050033]/50 backdrop-blur-[2px]" style={{ animation: 'fadeIn .25s ease' }}>
          <div className="w-full max-h-[92vh] overflow-y-auto rounded-t-[24px] bg-[#F8F9FB] pb-6 shadow-[0_-8px_40px_rgba(5,0,51,0.18)]" style={{ animation: 'slideUp .3s cubic-bezier(.22,1,.36,1)' }}>
            {/* Drag handle */}
            <div className="sticky top-0 z-10 flex justify-center bg-[#F8F9FB] pt-3 pb-1 rounded-t-[24px]">
              <div className="h-[5px] w-10 rounded-full bg-[#D1D5DB]" />
            </div>

            <div className="px-5">
              {/* Success Header */}
              <div className="flex flex-col items-center pt-2 pb-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#B8E63C] to-[#7AA600] shadow-[0_6px_20px_rgba(122,166,0,0.35)]" style={{ animation: 'scaleIn .4s cubic-bezier(.22,1,.36,1)' }}>
                  <CheckCircle2 size={32} className="text-white" />
                </div>
                <h2 className="mt-4 text-[20px] font-bold tracking-tight text-[#090927]">Virement effectué avec succès</h2>
                <p className="mt-1 text-[13px] text-[#6B7280]">Votre virement a bien été enregistré</p>
              </div>

              {/* Receipt Card */}
              <div className="mb-3 rounded-[16px] border border-[#E5E7EB] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
                {/* Card header accent */}
                <div className="h-1 bg-gradient-to-r from-[#9ACD00] via-[#B8E63C] to-[#7AA600]" />
                <div className="p-4 space-y-0">
                  <div className="flex items-center justify-between border-b border-[#F3F4F6] py-2.5">
                    <span className="text-[13px] text-[#6B7280]">{t("common.reference")}</span>
                    <span className="text-[13px] font-bold font-mono text-[#050033]">{finalReference}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#F3F4F6] py-2.5">
                    <span className="text-[13px] text-[#6B7280]">{t("common.date")}</span>
                    <span className="text-[13px] font-medium text-[#090927]">{(validatedAt ?? new Date()).toLocaleDateString("fr-FR")}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#F3F4F6] py-2.5">
                    <span className="text-[13px] text-[#6B7280]">{t("common.hour")}</span>
                    <span className="text-[13px] font-medium text-[#090927]">{(validatedAt ?? new Date()).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#F3F4F6] py-2.5">
                    <span className="text-[13px] text-[#6B7280]">{t("transfers.debitAccount")}</span>
                    <span className="text-[13px] font-medium text-[#090927]">{selectedDebitAccount.name}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#F3F4F6] py-2.5">
                    <span className="text-[13px] text-[#6B7280]">IBAN</span>
                    <span className="text-[12px] font-mono text-[#9CA3AF]">{maskIban(selectedDebitAccount.iban)}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#F3F4F6] py-2.5">
                    <span className="text-[13px] text-[#6B7280]">{t("transfers.beneficiary")}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#050033] text-[10px] font-bold text-white">
                        {selectedBeneficiary.initials}
                      </div>
                      <span className="text-[13px] font-medium text-[#090927]">{selectedBeneficiary.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#F3F4F6] py-2.5">
                    <span className="text-[13px] text-[#6B7280]">{t("common.type")}</span>
                    <span className="text-[13px] font-medium text-[#090927]">{selectedTransferType.label}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#F3F4F6] py-2.5">
                    <span className="text-[13px] text-[#6B7280]">{t("transfers.executionDate")}</span>
                    <span className="text-[13px] font-medium text-[#090927]">{executionDate}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#F3F4F6] py-2.5">
                    <span className="text-[13px] text-[#6B7280]">{t("transfers.fees")}</span>
                    <span className="text-[13px] font-medium text-[#7AA600]">0,00 EUR</span>
                  </div>
                </div>

                {/* Amount / Total highlight */}
                <div className="border-t-2 border-dashed border-[#E5E7EB] bg-gradient-to-r from-[#FBFFF1] to-[#EEF7D8]/50 px-4 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-[#6B7280]">{t("common.amount")}</span>
                    <span className="text-[15px] font-bold text-[#090927]">{totalFormatted}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[14px] font-semibold text-[#090927]">{t("transfers.total")}</span>
                    <span className="text-[20px] font-extrabold text-[#050033]">{totalFormatted}</span>
                  </div>
                </div>
              </div>

              {/* Status banner */}
              <div className="mb-4 flex items-start gap-3 rounded-[14px] bg-[#EEF7D8]/70 border border-[#9ACD00]/20 p-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#7AA600]/10 mt-0.5">
                  <Check size={16} className="text-[#7AA600]" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#090927]">Pris en compte</p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-[#6B7280]">Le traitement du virement est en cours selon la date d&apos;exécution prévue.</p>
                </div>
              </div>

              {emailStatus !== "idle" ? (
                <div className="mb-4 rounded-[14px] border border-[#E5E7EB] bg-white p-3 text-[12px] text-[#6B7280]">
                  <p className="font-semibold text-[#090927]">{emailStatus === "sending" ? t("transfers.emailNotice.sending") : emailStatus === "sent" ? t("transfers.emailNotice.sent") : t("transfers.emailNotice.failed")}</p>
                  {emailStatus === "sent" ? <p className="mt-1">{t("transfers.emailNotice.sentTo")} : {selectedBeneficiary.email}</p> : null}
                  {emailError ? <p className="mt-1 text-[#DC2626]">{emailError}</p> : null}
                </div>
              ) : null}

              {/* Action Buttons */}
              <div className="space-y-2.5 pb-2">
                <button
                  type="button"
                  onClick={downloadReceipt}
                  className="flex h-[50px] w-full items-center justify-center gap-2 rounded-[14px] border-2 border-[#050033]/20 text-[15px] font-semibold text-[#050033] transition-all active:scale-[0.97]"
                >
                  <Download size={18} />
                  {t("transfers.downloadReceipt")}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowSuccess(false); setShowRecap(false); setTemporaryReference(""); setFinalReference(""); setValidatedAt(null); resetEmailNotice(); setSubmitError(null); setIsSubmitting(false); }}
                  className="flex h-[50px] w-full items-center justify-center gap-2 rounded-[14px] bg-[#050033] text-[15px] font-bold text-white shadow-[0_4px_14px_rgba(5,0,51,0.25)] transition-all active:scale-[0.97]"
                >
                  Faire un autre virement
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {showAccountPicker ? <div className="fixed inset-0 z-[1300] flex items-end bg-[#050033]/40 p-3"><div className="w-full rounded-2xl bg-white p-4"><div className="flex items-center justify-between"><h2 className="text-[18px] font-bold">{t("transfers.chooseAccount")}</h2><button type="button" onClick={() => setShowAccountPicker(false)}><X size={18} /></button></div><div className="mt-3 space-y-2">{accountsLoading ? <p className="text-[14px] text-[#6B7280]">Chargement des comptes...</p> : accountsError ? <p className="text-[14px] text-[#DC2626]">Impossible de charger les comptes.</p> : debitAccounts.length === 0 ? <p className="text-[14px] text-[#6B7280]">Aucun compte disponible.</p> : debitAccounts.map((account) => { const isSelected = selectedDebitAccountId === account.id; return <button key={account.id} type="button" aria-pressed={isSelected} aria-label={`Selectionner ${account.name}`} onClick={() => { resetEmailForNewTransfer(); setSelectedDebitAccountId(account.id); setShowAccountPicker(false); }} className={`flex w-full items-center justify-between rounded-[12px] border px-3 py-3 text-left ${isSelected ? "border-[#9ACD00] bg-[#F7FBEA]" : "border-[#E5E7EB] bg-white"}`}><span><span className="block text-[14px] font-semibold">{account.name}</span><span className="block text-[12px] text-[#6B7280]">{account.balance} - {maskIban(account.iban)}</span></span>{isSelected ? <span className="text-[#7AA600]"><Check size={15} /></span> : null}</button>; })}</div></div></div> : null}
      {showTypePicker ? <div className="fixed inset-0 z-[1300] flex items-end bg-[#050033]/40 p-3"><div className="w-full rounded-2xl bg-white p-4">{transferTypes.map((type) => <button key={type.id} type="button" aria-pressed={selectedTransferTypeId === type.id} onClick={() => selectTransferType(type.id)} className={`mb-2 flex w-full items-center justify-between rounded-[12px] border p-3 text-left ${selectedTransferTypeId === type.id ? "border-[#9ACD00] bg-[#FBFFF1]" : "border-[#E5E7EB]"}`}><span>{type.label}</span>{selectedTransferTypeId === type.id ? <span className="text-[#7AA600]"><Check size={15} /></span> : null}</button>)}</div></div> : null}
      {showDetail ? <div className="fixed inset-0 z-[1300] flex items-end bg-[#050033]/40 p-3"><div className="w-full rounded-2xl bg-white p-4"><p>{t("transfers.beneficiary")} : {showDetail.beneficiaryName}</p><p>{t("common.reference")} : {showDetail.reference}</p><button type="button" onClick={() => setShowDetail(null)} className="mt-4 h-10 w-full rounded-[10px] bg-[#050033] text-white">{t("common.close")}</button></div></div> : null}
      <DemoToast open={Boolean(toast)} message={toast} onClose={() => setToast("")} />
    </>
  );
}
