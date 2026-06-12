"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Building2, CalendarDays, Check, CheckCircle2, Clock3, CreditCard, Download, Euro, FileText, Mail, Phone, Plus, User, Zap } from "lucide-react";

import MobileShell from "./MobileShell";
import DemoToast from "../shared/DemoToast";
import type { DirectTransferErrors, DirectTransferFormData, DirectTransferStep } from "@/types/direct-transfer";
import type { SupabaseAccount } from "@/types/supabase";
import { useLanguage } from "@/context/LanguageContext";
import { useNotifications } from "@/context/NotificationContext";
import { useMessages } from "@/context/MessageContext";
import { generateTransferPdf } from "@/utils/generateTransferPdf";
import {
  type EmailStatus,
} from "@/utils/sendBeneficiaryTransferEmail";
import { createSafeId } from "@/utils/safeId";
import { validateIban, formatIban, validateBic } from "@/lib/validators";

type DirectTransferLocalErrors = DirectTransferErrors & { executionDate?: string };

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

const initialFormData: DirectTransferFormData = {
  account: "current",
  transferType: "Virement immediat",
  beneficiaryName: "",
  bankName: "",
  iban: "",
  bic: "",
  email: "",
  phone: "",
  amount: "",
  executionDate: "Aujourd'hui",
  reason: "",
};

function parseAmount(value: string) {
  const normalized = value.replace(/\s/g, "").replace(",", ".");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function formatExecutionDate(value: string) {
  if (!value || value === "Aujourd'hui") return "Aujourd'hui";
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

function generateTemporaryReference() {
  const now = new Date();
  const y = String(now.getFullYear()).slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const suffix = String(Math.floor(Math.random() * 9000) + 1000);
  return `VR-${y}${m}${d}-${suffix}`;
}

function maskIban(iban: string) {
  const clean = iban.replace(/\s+/g, "").toUpperCase();
  if (clean.length < 8) return iban || "Non renseigne";
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

function createErrors(formData: DirectTransferFormData, availableBalance: number, transferTypeId: string): DirectTransferLocalErrors {
  const errors: DirectTransferLocalErrors = {};
  if (!formData.beneficiaryName.trim()) errors.beneficiaryName = "Champ obligatoire";
  if (!formData.bankName.trim()) errors.bankName = "Champ obligatoire";
  if (!formData.iban.trim()) errors.iban = "Champ obligatoire";
  else if (!validateIban(formData.iban)) errors.iban = "IBAN invalide";
  if (formData.bic.trim() && !validateBic(formData.bic)) errors.bic = "BIC invalide (ex: BNPAFRPP)";
  if (!formData.email.trim()) errors.email = "Champ obligatoire";
  if (formData.email && !formData.email.includes("@")) errors.email = "Email invalide";
  if (!formData.phone.trim()) errors.phone = "Champ obligatoire";
  if (!formData.amount.trim()) errors.amount = "Champ obligatoire";
  if (formData.amount.trim() && parseAmount(formData.amount) <= 0) errors.amount = "Montant invalide";
  if (formData.amount.trim() && parseAmount(formData.amount) > availableBalance) errors.amount = "Le montant dépasse le solde disponible du compte sélectionné.";
  if (transferTypeId === "scheduled" && (!formData.executionDate || formData.executionDate < todayInputValue())) errors.executionDate = "Veuillez choisir une date d'exécution valide.";
  return errors;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-[12px] text-[#DC2626]">{message}</p>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-2 block text-[13px] font-semibold text-[#090927]">{label}</label>{children}</div>;
}

export default function MobileDirectTransfer() {
  const { t } = useLanguage();
  const { addTransferNotification } = useNotifications();
  const { addTransferMessage } = useMessages();
  const [step, setStep] = useState<DirectTransferStep>("form");
  const [formData, setFormData] = useState<DirectTransferFormData>(initialFormData);
  const [errors, setErrors] = useState<DirectTransferLocalErrors>({});
  const [toast, setToast] = useState("");
  const [debitAccounts, setDebitAccounts] = useState<DebitAccountViewModel[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [accountsError, setAccountsError] = useState<string | null>(null);
  const [selectedDebitAccountId, setSelectedDebitAccountId] = useState("current");
  const [selectedTransferTypeId, setSelectedTransferTypeId] = useState("instant");
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [temporaryReference, setTemporaryReference] = useState("");
  const [finalReference, setFinalReference] = useState("");
  const amount = formatAmount(formData.amount || "0");
  const [validatedAt, setValidatedAt] = useState<Date | null>(null);
  const [emailStatus, setEmailStatus] = useState<EmailStatus>("idle");
  const [emailError, setEmailError] = useState<string | null>(null);
  const now = validatedAt ?? new Date();
  const selectedDebitAccount = debitAccounts.find((account) => account.id === selectedDebitAccountId) ?? debitAccounts[0] ?? null;
  const selectedTransferType = transferTypes.find((type) => type.id === selectedTransferTypeId) ?? transferTypes[0];
  const executionDate = selectedTransferTypeId === "scheduled" ? formatExecutionDate(formData.executionDate) : "Aujourd'hui";
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

  function downloadReceipt() {
    try {
        generateTransferPdf({
          holderName: "Frederico Di Mario",
          holderEmail: "fredericodimario8@gmail.com",
          debitAccountName: selectedDebitAccount?.name ?? "",
          debitIban: selectedDebitAccount?.iban ?? "",
        beneficiaryName: formData.beneficiaryName,
        beneficiaryBank: formData.bankName,
        beneficiaryIban: formData.iban,
        beneficiaryEmail: formData.email,
        beneficiaryPhone: formData.phone,
        transferType: selectedTransferType.label,
        executionDate,
        validationDate: now.toLocaleDateString("fr-FR"),
        validationTime: now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        temporaryReference,
        finalReference,
        reason: formData.reason,
        amount,
        fees: "0,00 EUR",
        total: amount,
      });
    } catch {
      const content = [
        `${t("transfers.receipt.title")}: ${finalReference}`,
        `${t("transfers.receipt.date")}: ${now.toLocaleDateString("fr-FR")}`,
        `${t("transfers.receipt.hour")}: ${now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`,
        `${t("transfers.receipt.debitAccount")}: ${selectedDebitAccount?.name ?? ""}`,
        `${t("transfers.receipt.debitIban")}: ${selectedDebitAccount?.iban ?? ""}`,
        `${t("transfers.receipt.transferType")}: ${selectedTransferType.label}`,
        `${t("transfers.receipt.executionDate")}: ${executionDate}`,
        `${t("transfers.receipt.beneficiary")}: ${formData.beneficiaryName}`,
        `${t("transfers.receipt.bank")}: ${formData.bankName}`,
        `${t("transfers.receipt.beneficiaryIban")}: ${formData.iban}`,
        `${t("transfers.receipt.email")}: ${formData.email}`,
        `${t("transfers.receipt.phone")}: ${formData.phone}`,
        `${t("transfers.receipt.amount")}: ${amount}`,
        `${t("transfers.receipt.fees")}: 0,00 EUR`,
        `${t("transfers.receipt.totalDebited")}: ${amount}`,
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
    setToast(t("transfers.receipt.downloaded"));
  }

  function nextStep() {
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

    const nextErrors = createErrors(formData, selectedDebitAccount.rawBalance, selectedTransferTypeId);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setToast("Veuillez completer les champs obligatoires.");
      return;
    }
    if (!temporaryReference) setTemporaryReference(generateTemporaryReference());
    setStep("recap");
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
      beneficiaryId: null,
      beneficiaryName: formData.beneficiaryName.trim(),
      beneficiaryIban: formData.iban.trim(),
      beneficiaryBic: formData.bic.trim() || null,
      beneficiaryBank: formData.bankName.trim(),
      beneficiaryEmail: formData.email.trim(),
      amount: parseAmount(formData.amount),
      reason: formData.reason.trim() || "Virement",
      transferType: selectedTransferTypeId,
      executionDate: selectedTransferTypeId === "scheduled" ? formData.executionDate : todayDateString(),
      idempotencyKey: createSafeId("transfer"),
    };
  }

  async function validateTransfer() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = getTransferPayload();
      const response = await fetch("/api/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json() as { success: boolean; transfer?: { reference?: string; email_status?: EmailStatus }; emailStatus?: EmailStatus; error?: string; message?: string };

      if (!result.success || !result.transfer?.reference) {
        const errorCode = result.error || "UNKNOWN";
        const errorMessage = result.message || "Une erreur est survenue lors du virement. Veuillez réessayer.";
        const codeMessages: Record<string, string> = {
          INVALID_AMOUNT: "Montant invalide.",
          MISSING_ACCOUNT: "Veuillez sélectionner un compte débiteur.",
          MISSING_BENEFICIARY_NAME: "Veuillez renseigner le nom du bénéficiaire.",
          MISSING_BENEFICIARY_IBAN: "Veuillez renseigner l'IBAN du bénéficiaire.",
          INSUFFICIENT_FUNDS: "Solde insuffisant pour effectuer ce virement.",
          ACCOUNT_NOT_FOUND: "Compte débiteur introuvable.",
          ACCOUNT_NOT_ACTIVE: "Ce compte n'est pas actif.",
          INVALID_TRANSFER_TYPE: "Type de virement invalide.",
        };
        setSubmitError(codeMessages[errorCode] || errorMessage);
        return;
      }

      const supabaseReference = result.transfer.reference;
      const currentDate = new Date();
      setValidatedAt(currentDate);
      setFinalReference(supabaseReference);
      setStep("loading");
      addTransferNotification({ beneficiary: formData.beneficiaryName, amount, reference: supabaseReference });
      addTransferMessage({
        beneficiary: formData.beneficiaryName,
        amount,
        reference: supabaseReference,
        accountName: selectedDebitAccount?.name ?? "",
        executionDate,
        validationDate: currentDate.toLocaleDateString("fr-FR"),
        validationTime: currentDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      });
      const nextEmailStatus = result.transfer?.email_status ?? result.emailStatus ?? "idle";
      setEmailStatus(nextEmailStatus);
      setEmailError(nextEmailStatus === "failed" ? "L'avis de virement n'a pas pu etre envoye au beneficiaire." : null);

      await new Promise((r) => setTimeout(r, 4000));
      setStep("success");

      setTimeout(() => {
        setStep("form");
        resetFlow();
      }, 3000);
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

  function selectTransferType(typeId: string) {
    resetEmailForNewTransfer();
    setSelectedTransferTypeId(typeId);
    setFormData((current) => ({ ...current, transferType: transferTypes.find((type) => type.id === typeId)?.label ?? current.transferType, executionDate: typeId === "scheduled" ? todayInputValue() : "Aujourd'hui" }));
    setShowTypePicker(false);
  }

  function resetFlow() {
    setFormData((prev) => ({ ...initialFormData, bic: prev.bic || "" }));
    setErrors({});
    setValidatedAt(null);
    setTemporaryReference("");
    setFinalReference("");
    resetEmailNotice();
    setSubmitError(null);
    setIsSubmitting(false);
    setStep("form");
  }

  return (
    <>
      <MobileShell>
        <div className="space-y-4 pb-4">
          <div>
            <button type="button" onClick={() => { if (step === "form") { window.history.back(); return; } resetEmailForNewTransfer(); setStep("form"); }} className="mb-2 inline-flex items-center gap-1 text-[13px] font-semibold text-[#050033]" aria-label={t("common.back")}><ArrowLeft size={15} />{t("common.back")}</button>
            <h1 className="text-[24px] font-bold tracking-tight text-[#090927]">{step === "form" ? t("transfers.directTransfer") : step === "recap" ? t("transfers.recap.title") : "Virement en cours..."}</h1>
            <p className="mt-1 text-[14px] text-[#6B7280]">{step === "form" ? "Beneficiaire non enregistre" : step === "recap" ? t("transfers.recap.subtitle") : step === "success" ? t("transfers.success.subtitle") : "Traitement en cours..."}</p>
          </div>

          {step === "form" ? (
            <section className="rounded-[18px] border border-[#E5E7EB] bg-white p-4 shadow-[0_10px_26px_rgba(5,0,51,0.07)]">
              <div className="mb-4 grid grid-cols-2 gap-2">
                <Link href="/virements" className="flex h-10 items-center justify-center gap-1 rounded-[10px] border border-[#050033] text-[12px] font-semibold text-[#050033]"><Plus size={14} />Nouveau beneficiaire</Link>
                <span className="flex h-10 items-center justify-center gap-1 rounded-[10px] border border-[#9ACD00] bg-[#FBFFF1] text-[12px] font-semibold text-[#050033]"><Zap size={14} className="text-[#7AA600]" />Virement direct</span>
              </div>

              <div className="space-y-4">
                <Field label="Compte a debiter"><button type="button" aria-label="Choisir le compte a debiter" onClick={() => setShowAccountPicker(true)} className="flex h-11 w-full items-center gap-2 rounded-[10px] border border-[#E5E7EB] px-3 text-[14px] font-semibold text-[#090927]"><CreditCard size={16} />{accountsLoading ? "Chargement des comptes..." : selectedDebitAccount ? `${selectedDebitAccount.name} - ${selectedDebitAccount.balance}` : accountsError ? "Impossible de charger les comptes." : "Aucun compte disponible."}<span className="ml-auto">▾</span></button></Field>
                <Field label="Type"><button type="button" aria-label="Choisir le type de virement" onClick={() => setShowTypePicker(true)} className="flex h-11 w-full items-center gap-2 rounded-[10px] border border-[#E5E7EB] px-3 text-[14px] font-semibold text-[#090927]"><Clock3 size={16} />{selectedTransferType.label}<span className="ml-auto">▾</span></button></Field>

                <Field label="Nom complet *"><input value={formData.beneficiaryName} onChange={(e) => setFormData((c) => ({ ...c, beneficiaryName: e.target.value }))} placeholder="Saisir le nom complet" className="h-11 w-full rounded-[10px] border border-[#E5E7EB] px-3 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-[#9ACD00]" /><FieldError message={errors.beneficiaryName} /></Field>
                <Field label="Banque *"><input value={formData.bankName} onChange={(e) => setFormData((c) => ({ ...c, bankName: e.target.value }))} placeholder="Nom de la banque" className="h-11 w-full rounded-[10px] border border-[#E5E7EB] px-3 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-[#9ACD00]" /><FieldError message={errors.bankName} /></Field>
                <Field label="BIC (optionnel)"><input value={formData.bic} onChange={(e) => setFormData((c) => ({ ...c, bic: e.target.value }))} placeholder="Ex: BNPAFRPP" className="h-11 w-full rounded-[10px] border border-[#E5E7EB] px-3 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-[#9ACD00]" /><FieldError message={errors.bic} /></Field>
                <Field label="IBAN *"><input value={formData.iban} onChange={(e) => setFormData((c) => ({ ...c, iban: e.target.value }))} onBlur={() => setFormData((c) => ({ ...c, iban: formatIban(c.iban) }))} placeholder="Saisir l'IBAN" className="h-11 w-full rounded-[10px] border border-[#E5E7EB] px-3 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-[#9ACD00]" /><FieldError message={errors.iban} /></Field>
                <Field label="Email *"><div className="flex h-11 items-center rounded-[10px] border border-[#E5E7EB] px-3"><Mail size={15} className="text-[#6B7280]" /><input type="email" value={formData.email} onChange={(e) => setFormData((c) => ({ ...c, email: e.target.value }))} placeholder="exemple@email.com" className="ml-2 w-full text-[14px] outline-none" /></div><FieldError message={errors.email} /></Field>
                <Field label="Numero de telephone *"><div className="flex h-11 items-center rounded-[10px] border border-[#E5E7EB] px-3"><Phone size={15} className="text-[#6B7280]" /><input value={formData.phone} onChange={(e) => setFormData((c) => ({ ...c, phone: e.target.value }))} placeholder="+352 6XX XXX XXX" className="ml-2 w-full text-[14px] outline-none" /></div><FieldError message={errors.phone} /></Field>
                <Field label="Montant *"><div className="flex h-11 items-center rounded-[10px] border border-[#E5E7EB] px-3"><Euro size={15} className="text-[#6B7280]" /><input value={formData.amount} onChange={(e) => setFormData((c) => ({ ...c, amount: e.target.value }))} placeholder="0,00" className="ml-2 min-w-0 flex-1 text-[14px] outline-none" /><span className="text-[12px] text-[#6B7280]">EUR</span></div><FieldError message={errors.amount} /></Field>
                <Field label="Date">{selectedTransferTypeId === "scheduled" ? <input type="date" min={todayInputValue()} value={formData.executionDate} onChange={(e) => setFormData((c) => ({ ...c, executionDate: e.target.value }))} className="h-11 w-full rounded-[10px] border border-[#E5E7EB] px-3 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-[#9ACD00]" /> : <div className="flex h-11 items-center gap-2 rounded-[10px] border border-[#E5E7EB] px-3 text-[14px] font-semibold text-[#090927]"><CalendarDays size={16} />{executionDate}</div>}<FieldError message={errors.executionDate} /></Field>
                <Field label="Motif"><input maxLength={140} value={formData.reason} onChange={(e) => setFormData((c) => ({ ...c, reason: e.target.value }))} placeholder="Ex. Remboursement, Facture, Cadeau..." className="h-11 w-full rounded-[10px] border border-[#E5E7EB] px-3 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-[#9ACD00]" /><p className="mt-1 text-right text-[11px] text-[#9CA3AF]">{formData.reason.length}/140</p></Field>

                <button type="button" onClick={nextStep} disabled={isAccountSelectionUnavailable} className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-[#050033] text-[15px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">Suivant <ArrowRight size={18} /></button>
                {accountsError ? <p className="text-[12px] text-[#DC2626]">Impossible de charger les comptes.</p> : null}
                {!accountsLoading && !accountsError && !selectedDebitAccount ? <p className="text-[12px] text-[#6B7280]">Aucun compte disponible.</p> : null}
                <p className="text-[12px] text-[#6B7280]">Verifiez les informations avant validation.</p>
              </div>
            </section>
          ) : null}

          {step === "recap" ? (
            <>
              <div className="flex items-center gap-2 text-[12px] font-medium mb-1">
                <span className="rounded-full bg-[#EEF7D8] px-3 py-1 text-[#7AA600] border border-[#7AA600]/10">1 Saisie</span>
                <span className="rounded-full bg-[#050033] px-3 py-1 text-white font-semibold shadow-sm">2 Récapitulatif</span>
                <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-[#9CA3AF]">3 Confirmation</span>
              </div>

              {(() => {
                const initials = formData.beneficiaryName
                  ? formData.beneficiaryName
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((part) => part[0]?.toUpperCase() ?? "")
                      .join("")
                  : "VD";
                return (
                  <div className="space-y-4" style={{ animation: 'fadeIn .25s ease' }}>
                    {/* Section 1 — Compte débité */}
                    <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                      <div className="mb-3 flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#050033]/[0.06]">
                          <CreditCard size={14} className="text-[#050033]" />
                        </div>
                        <span className="text-[13px] font-semibold uppercase tracking-wide text-[#6B7280]">{t("transfers.receipt.debitAccount")}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[14px] font-semibold text-[#090927]">{selectedDebitAccount?.name ?? ""}</span>
                          <span className="rounded-full bg-[#EEF7D8] px-2.5 py-0.5 text-[12px] font-medium text-[#7AA600]">{selectedDebitAccount?.balance ?? ""}</span>
                        </div>
                        <p className="text-[13px] text-[#6B7280] tracking-wide font-mono">{selectedDebitAccount?.iban ?? ""}</p>
                      </div>
                    </div>

                    {/* Section 2 — Bénéficiaire */}
                    <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                      <div className="mb-3 flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#050033]/[0.06]">
                          <User size={14} className="text-[#050033]" />
                        </div>
                        <span className="text-[13px] font-semibold uppercase tracking-wide text-[#6B7280]">{t("transfers.receipt.beneficiary")}</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#050033] to-[#1a1a5e] text-[14px] font-bold text-white shadow-sm mt-0.5">
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[15px] font-semibold text-[#090927]">{formData.beneficiaryName}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Building2 size={12} className="shrink-0 text-[#9CA3AF]" />
                            <span className="text-[13px] text-[#6B7280] truncate">{formData.bankName}</span>
                          </div>
                          <p className="mt-1 text-[12px] text-[#9CA3AF] font-mono tracking-wide truncate">{formData.iban}</p>
                          {formData.bic ? <p className="text-[11px] text-[#9CA3AF] font-mono">BIC: {formData.bic}</p> : null}
                          {(formData.email || formData.phone) && (
                            <div className="mt-2.5 border-t border-[#F3F4F6] pt-2.5 space-y-1">
                              {formData.email && (
                                <p className="flex items-center gap-1.5 text-[12px] text-[#6B7280]">
                                  <Mail size={12} className="text-[#9CA3AF]" />
                                  <span>{formData.email}</span>
                                </p>
                              )}
                              {formData.phone && (
                                <p className="flex items-center gap-1.5 text-[12px] text-[#6B7280]">
                                  <Phone size={12} className="text-[#9CA3AF]" />
                                  <span>{formData.phone}</span>
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Section 3 — Détails du virement */}
                    <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                      <div className="mb-3 flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#050033]/[0.06]">
                          <FileText size={14} className="text-[#050033]" />
                        </div>
                        <span className="text-[13px] font-semibold uppercase tracking-wide text-[#6B7280]">{t("transfers.recap.detailsTitle")}</span>
                      </div>

                      {/* Amount highlight */}
                      <div className="mb-3 rounded-[12px] bg-gradient-to-r from-[#F8F9FB] to-[#EEF7D8]/60 p-3 text-center">
                        <p className="text-[12px] font-medium text-[#6B7280] mb-0.5">{t("transfers.receipt.amount")}</p>
                        <p className="text-[26px] font-extrabold tracking-tight text-[#090927]">{amount}</p>
                      </div>

                      <div className="space-y-0">
                        <div className="flex items-center justify-between border-b border-[#F3F4F6] py-2.5">
                          <span className="text-[13px] text-[#6B7280]">{t("transfers.receipt.fees")}</span>
                          <span className="text-[13px] font-medium text-[#7AA600]">0,00 EUR</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-[#F3F4F6] py-2.5">
                          <span className="text-[13px] font-semibold text-[#090927]">{t("transfers.receipt.total")}</span>
                          <span className="text-[15px] font-bold text-[#090927]">{amount}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-[#F3F4F6] py-2.5">
                          <span className="text-[13px] text-[#6B7280]">{t("transfers.receipt.reason")}</span>
                          <span className="text-[13px] font-medium text-[#090927] text-right max-w-[55%] truncate">{formData.reason || "-"}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-[#F3F4F6] py-2.5">
                          <span className="text-[13px] text-[#6B7280]">{t("transfers.receipt.transferType")}</span>
                          <span className="text-[13px] font-medium text-[#090927]">{selectedTransferType.label}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-[#F3F4F6] py-2.5">
                          <span className="text-[13px] text-[#6B7280]">{t("transfers.receipt.executionDate")}</span>
                          <span className="text-[13px] font-medium text-[#090927]">{executionDate}</span>
                        </div>
                        <div className="flex items-center justify-between py-2.5">
                          <span className="text-[13px] text-[#6B7280]">{t("transfers.recap.tempRef")}</span>
                          <span className="text-[12px] font-mono text-[#9CA3AF]">{temporaryReference}</span>
                        </div>
                      </div>
                    </div>

                    {submitError ? <div className="rounded-[10px] border border-[#DC2626] bg-[#FEF2F2] p-3 text-[13px] text-[#DC2626]">{submitError}</div> : null}

                    {/* CTA Buttons */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => { resetEmailForNewTransfer(); setStep("form"); }}
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
                );
              })()}
            </>
          ) : null}

          {step === "loading" ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-[#E5E7EB] border-t-[#050033]" />
              <p className="mt-4 text-[16px] font-semibold text-[#090927]">Traitement en cours...</p>
            </div>
          ) : null}
          {step === "success" ? (
            <>
              <div className="flex items-center gap-2 text-[12px] font-medium mb-1">
                <span className="rounded-full bg-[#EEF7D8] px-3 py-1 text-[#7AA600] border border-[#7AA600]/10">1 Saisie</span>
                <span className="rounded-full bg-[#EEF7D8] px-3 py-1 text-[#7AA600] border border-[#7AA600]/10">2 Récapitulatif</span>
                <span className="rounded-full bg-[#B8E63C] px-3 py-1 text-[#050033] font-bold shadow-sm">3 Confirmation</span>
              </div>

              <div className="flex flex-col items-center pt-2 pb-5" style={{ animation: 'fadeIn .25s ease' }}>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#B8E63C] to-[#7AA600] shadow-[0_6px_20px_rgba(122,166,0,0.35)]" style={{ animation: 'scaleIn .4s cubic-bezier(.22,1,.36,1)' }}>
                  <CheckCircle2 size={32} className="text-white" />
                </div>
                <h2 className="mt-4 text-[20px] font-bold tracking-tight text-[#090927]">{t("transfers.success.title")}</h2>
                <p className="mt-1 text-[13px] text-[#6B7280]">{t("transfers.success.subtitle")}</p>
              </div>

              {(() => {
                const initials = formData.beneficiaryName
                  ? formData.beneficiaryName
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((part) => part[0]?.toUpperCase() ?? "")
                      .join("")
                  : "VD";
                return (
                  <div className="space-y-4" style={{ animation: 'fadeIn .25s ease' }}>
                    {/* Receipt Card */}
                    <div className="rounded-[16px] border border-[#E5E7EB] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
                      {/* Card header accent */}
                      <div className="h-1 bg-gradient-to-r from-[#9ACD00] via-[#B8E63C] to-[#7AA600]" />
                      <div className="p-4 space-y-0">
                        <div className="flex items-center justify-between border-b border-[#F3F4F6] py-2.5">
                          <span className="text-[13px] text-[#6B7280]">{t("transfers.receipt.reference")}</span>
                          <span className="text-[13px] font-bold font-mono text-[#050033]">{finalReference}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-[#F3F4F6] py-2.5">
                          <span className="text-[13px] text-[#6B7280]">{t("transfers.receipt.date")}</span>
                          <span className="text-[13px] font-medium text-[#090927]">{now.toLocaleDateString("fr-FR")}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-[#F3F4F6] py-2.5">
                          <span className="text-[13px] text-[#6B7280]">{t("transfers.receipt.hour")}</span>
                          <span className="text-[13px] font-medium text-[#090927]">{now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-[#F3F4F6] py-2.5">
                          <span className="text-[13px] text-[#6B7280]">{t("transfers.receipt.debitAccount")}</span>
                          <span className="text-[13px] font-medium text-[#090927]">{selectedDebitAccount?.name ?? ""}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-[#F3F4F6] py-2.5">
                          <span className="text-[13px] text-[#6B7280]">{t("transfers.receipt.beneficiaryIban")}</span>
                          <span className="text-[12px] font-mono text-[#9CA3AF]">{maskIban(formData.iban)}</span>
                        </div>
                        {formData.bic ? (
                        <div className="flex items-center justify-between border-b border-[#F3F4F6] py-2.5">
                          <span className="text-[13px] text-[#6B7280]">BIC</span>
                          <span className="text-[12px] font-mono text-[#9CA3AF]">{formData.bic}</span>
                        </div>
                        ) : null}
                        <div className="flex items-center justify-between border-b border-[#F3F4F6] py-2.5">
                          <span className="text-[13px] text-[#6B7280]">{t("transfers.receipt.beneficiary")}</span>
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#050033] text-[10px] font-bold text-white">
                              {initials}
                            </div>
                            <span className="text-[13px] font-medium text-[#090927]">{formData.beneficiaryName}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between border-b border-[#F3F4F6] py-2.5">
                          <span className="text-[13px] text-[#6B7280]">{t("transfers.receipt.transferType")}</span>
                          <span className="text-[13px] font-medium text-[#090927]">{selectedTransferType.label}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-[#F3F4F6] py-2.5">
                          <span className="text-[13px] text-[#6B7280]">{t("transfers.receipt.executionDate")}</span>
                          <span className="text-[13px] font-medium text-[#090927]">{executionDate}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-[#F3F4F6] py-2.5">
                          <span className="text-[13px] text-[#6B7280]">{t("transfers.receipt.fees")}</span>
                          <span className="text-[13px] font-medium text-[#7AA600]">0,00 EUR</span>
                        </div>
                      </div>

                      {/* Amount / Total highlight */}
                      <div className="border-t-2 border-dashed border-[#E5E7EB] bg-gradient-to-r from-[#FBFFF1] to-[#EEF7D8]/50 px-4 py-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] text-[#6B7280]">{t("transfers.receipt.amount")}</span>
                          <span className="text-[15px] font-bold text-[#090927]">{amount}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[14px] font-semibold text-[#090927]">{t("transfers.receipt.totalDebited")}</span>
                          <span className="text-[20px] font-extrabold text-[#050033]">{amount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status banner */}
                    <div className="flex items-start gap-3 rounded-[14px] bg-[#EEF7D8]/70 border border-[#9ACD00]/20 p-3.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#7AA600]/10 mt-0.5">
                        <Check size={16} className="text-[#7AA600]" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-[#090927]">{t("transfers.success.statusTitle")}</p>
                        <p className="mt-0.5 text-[12px] leading-relaxed text-[#6B7280]">{t("transfers.success.statusText")}</p>
                      </div>
                    </div>

                    {emailStatus !== "idle" ? (
                      <div className="rounded-[14px] border border-[#E5E7EB] bg-white p-3 text-[12px] text-[#6B7280]">
                        <p className="font-semibold text-[#090927]">{emailStatus === "sending" ? t("transfers.emailNotice.sending") : emailStatus === "sent" ? t("transfers.emailNotice.sent") : t("transfers.emailNotice.failed")}</p>
                        {emailStatus === "sent" ? <p className="mt-1">{t("transfers.emailNotice.sentTo")} : {formData.email}</p> : null}
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
                        {t("transfers.success.downloadPdf")}
                      </button>
                      <button
                        type="button"
                        onClick={resetFlow}
                        className="flex h-[50px] w-full items-center justify-center gap-2 rounded-[14px] border-2 border-[#050033]/20 text-[15px] font-semibold text-[#050033] transition-all active:scale-[0.97]"
                      >
                        {t("transfers.success.newTransfer")}
                      </button>
                      <Link
                        href="/dashboard"
                        className="flex h-[50px] items-center justify-center gap-2 rounded-[14px] bg-[#050033] text-[15px] font-bold text-white shadow-[0_4px_14px_rgba(5,0,51,0.25)] transition-all active:scale-[0.97]"
                      >
                        {t("transfers.success.home")}
                      </Link>
                    </div>
                  </div>
                );
              })()}
            </>
          ) : null}
        </div>
      </MobileShell>

      {showAccountPicker ? <div className="fixed inset-0 z-[1300] flex items-end bg-[#050033]/40 p-3"><div role="dialog" aria-modal="true" className="w-full rounded-2xl bg-white p-4"><div className="flex items-center justify-between"><h2 className="text-[18px] font-bold text-[#090927]">Choisir le compte a debiter</h2><button type="button" aria-label="Fermer" onClick={() => setShowAccountPicker(false)} className="text-[#6B7280]">Fermer</button></div><div className="mt-3 space-y-2">{accountsLoading ? <p className="text-[14px] text-[#6B7280]">Chargement des comptes...</p> : accountsError ? <p className="text-[14px] text-[#DC2626]">Impossible de charger les comptes.</p> : debitAccounts.length === 0 ? <p className="text-[14px] text-[#6B7280]">Aucun compte disponible.</p> : debitAccounts.map((account) => { const isSelected = selectedDebitAccountId === account.id; return <button key={account.id} type="button" aria-pressed={isSelected} aria-label={`Selectionner ${account.name}`} onClick={() => { resetEmailForNewTransfer(); setSelectedDebitAccountId(account.id); setShowAccountPicker(false); }} className={`flex w-full items-center justify-between rounded-[12px] border px-3 py-3 text-left ${isSelected ? "border-[#9ACD00] bg-[#F7FBEA]" : "border-[#E5E7EB] bg-white"}`}><span><span className="block text-[14px] font-semibold text-[#090927]">{account.name}</span><span className="block text-[12px] text-[#6B7280]">{account.balance} - {maskIban(account.iban)}</span></span>{isSelected ? <span className="text-[#7AA600]"><Check size={15} /></span> : null}</button>; })}</div></div></div> : null}

      {showTypePicker ? <div className="fixed inset-0 z-[1300] flex items-end bg-[#050033]/40 p-3"><div role="dialog" aria-modal="true" className="w-full rounded-2xl bg-white p-4"><div className="flex items-center justify-between"><h2 className="text-[18px] font-bold text-[#090927]">Choisir le type de virement</h2><button type="button" aria-label="Fermer" onClick={() => setShowTypePicker(false)} className="text-[#6B7280]">Fermer</button></div><div className="mt-3 space-y-2">{transferTypes.map((type) => <button key={type.id} type="button" aria-pressed={selectedTransferTypeId === type.id} onClick={() => selectTransferType(type.id)} className={`flex w-full items-center justify-between rounded-[12px] border px-3 py-3 text-left ${selectedTransferTypeId === type.id ? "border-[#9ACD00] bg-[#FBFFF1]" : "border-[#E5E7EB]"}`}><span><span className="block text-[14px] font-semibold text-[#090927]">{type.label}</span><span className="block text-[12px] text-[#6B7280]">{type.description}</span></span><span className="text-[#7AA600]">{selectedTransferTypeId === type.id ? "✓" : ""}</span></button>)}</div></div></div> : null}

      <DemoToast open={Boolean(toast)} message={toast} onClose={() => setToast("")} />
    </>
  );
}
