"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
  Euro,
  Lock,
  Plus,
  ShieldCheck,
  Zap,
} from "lucide-react";

import DesktopShell from "./DesktopShell";
import DemoToast from "../shared/DemoToast";
import type { DirectTransferErrors, DirectTransferFormData, DirectTransferStep } from "@/types/direct-transfer";
import { useLanguage } from "@/context/LanguageContext";
import { useNotifications } from "@/context/NotificationContext";
import { useMessages } from "@/context/MessageContext";
import { generateTransferPdf } from "@/utils/generateTransferPdf";
import {
  sendBeneficiaryTransferEmail,
  type EmailStatus,
} from "@/utils/sendBeneficiaryTransferEmail";

type DirectTransferLocalErrors = DirectTransferErrors & { executionDate?: string };

const debitAccounts = [
  { id: "current", name: "Compte courant", balance: "84.320,00 EUR", iban: "LU88 0019 2450 1234 5678", last4: "5678" },
  { id: "savings", name: "Compte épargne", balance: "185.680,00 EUR", iban: "LU44 0019 8800 2040 3301", last4: "3301" },
  { id: "joint", name: "Compte joint", balance: "30.000,00 EUR", iban: "LU76 0019 5520 7788 1140", last4: "1140" },
];

const transferTypes = [
  { id: "instant", label: "Virement immediat", description: "Execution des validation" },
  { id: "scheduled", label: "Virement differe", description: "Execution a une date choisie" },
  { id: "recurring", label: "Virement permanent", description: "Repetition automatique" },
];

const initialFormData: DirectTransferFormData = {
  account: "Compte courant - 84.320,00 EUR",
  transferType: "Virement immediat",
  beneficiaryName: "",
  bankName: "",
  iban: "",
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

function parseBalance(value: string) {
  return Number.parseFloat(value.replace(/\s/g, "").replace("EUR", "").replace(/\./g, "").replace(",", "."));
}

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function formatExecutionDate(value: string) {
  if (!value || value === "Aujourd'hui") return "Aujourd'hui";
  return new Date(`${value}T00:00:00`).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

function formatAmount(value: string) {
  const amount = parseAmount(value);
  return `${amount.toFixed(2).replace(".", ",")} EUR`;
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

function createErrors(formData: DirectTransferFormData, balance: string, transferTypeId: string): DirectTransferLocalErrors {
  const errors: DirectTransferLocalErrors = {};
  if (!formData.beneficiaryName.trim()) errors.beneficiaryName = "Le nom complet est obligatoire.";
  if (!formData.bankName.trim()) errors.bankName = "La banque est obligatoire.";
  if (!formData.iban.trim()) errors.iban = "L'IBAN est obligatoire.";
  if (!formData.email.trim()) errors.email = "L'email est obligatoire.";
  if (formData.email && !formData.email.includes("@")) errors.email = "L'email doit contenir @.";
  if (!formData.phone.trim()) errors.phone = "Le numero de telephone est obligatoire.";
  if (!formData.amount.trim()) errors.amount = "Le montant est obligatoire.";
  if (formData.amount.trim() && parseAmount(formData.amount) <= 0) errors.amount = "Le montant doit etre superieur a 0.";
  if (formData.amount.trim() && parseAmount(formData.amount) > parseBalance(balance)) errors.amount = "Le montant dépasse le solde disponible du compte sélectionné.";
  if (transferTypeId === "scheduled" && (!formData.executionDate || formData.executionDate < todayInputValue())) errors.executionDate = "Veuillez choisir une date d'exécution valide.";
  return errors;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-[12px] text-[#DC2626]">{message}</p>;
}

export default function DesktopDirectTransfer() {
  const { t } = useLanguage();
  const { addTransferNotification } = useNotifications();
  const { addTransferMessage } = useMessages();
  const [step, setStep] = useState<DirectTransferStep>("form");
  const [formData, setFormData] = useState<DirectTransferFormData>(initialFormData);
  const [errors, setErrors] = useState<DirectTransferLocalErrors>({});
  const [toast, setToast] = useState("");
  const [selectedDebitAccountId, setSelectedDebitAccountId] = useState("current");
  const [selectedTransferTypeId, setSelectedTransferTypeId] = useState("instant");
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);

  const [validatedAt, setValidatedAt] = useState<Date | null>(null);
  const [temporaryReference, setTemporaryReference] = useState("");
  const [finalReference, setFinalReference] = useState("");
  const [emailStatus, setEmailStatus] = useState<EmailStatus>("idle");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const now = validatedAt ?? new Date();
  const formattedAmount = formatAmount(formData.amount || "0");
  const selectedDebitAccount = debitAccounts.find((account) => account.id === selectedDebitAccountId) ?? debitAccounts[0];
  const selectedTransferType = transferTypes.find((type) => type.id === selectedTransferTypeId) ?? transferTypes[0];
  const executionDate = selectedTransferTypeId === "scheduled" ? formatExecutionDate(formData.executionDate) : "Aujourd'hui";

  function downloadReceipt() {
    try {
      generateTransferPdf({
        holderName: "Frederico Di Mario",
        holderEmail: "fredericodimario8@gmail.com",
        debitAccountName: selectedDebitAccount.name,
        debitIban: selectedDebitAccount.iban,
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
        amount: formattedAmount,
        fees: "0,00 EUR",
        total: formattedAmount,
      });
    } catch {
      const content = [
        `${t("transfers.receipt.title")}: ${finalReference}`,
        `${t("transfers.receipt.date")}: ${now.toLocaleDateString("fr-FR")}`,
        `${t("transfers.receipt.hour")}: ${now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`,
        `${t("transfers.receipt.debitAccount")}: ${selectedDebitAccount.name}`,
        `${t("transfers.receipt.debitIban")}: ${selectedDebitAccount.iban}`,
        `${t("transfers.receipt.transferType")}: ${selectedTransferType.label}`,
        `${t("transfers.receipt.executionDate")}: ${executionDate}`,
        `${t("transfers.receipt.beneficiary")}: ${formData.beneficiaryName}`,
        `${t("transfers.receipt.bank")}: ${formData.bankName}`,
        `${t("transfers.receipt.beneficiaryIban")}: ${formData.iban}`,
        `${t("transfers.receipt.email")}: ${formData.email}`,
        `${t("transfers.receipt.phone")}: ${formData.phone}`,
        `${t("transfers.receipt.amount")}: ${formattedAmount}`,
        `${t("transfers.receipt.fees")}: 0,00 EUR`,
        `${t("transfers.receipt.totalDebited")}: ${formattedAmount}`,
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

  function onNext() {
    const nextErrors = createErrors(formData, selectedDebitAccount.balance, selectedTransferTypeId);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setToast("Veuillez corriger les champs obligatoires.");
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
  }

  function sendBeneficiaryNotice(reference: string, validationDate: Date) {
    if (emailStatus === "sending" || emailStatus === "sent") return;

    if (!formData.email.trim()) {
      setEmailStatus("failed");
      setEmailError(t("transfers.emailNotice.missingEmail"));
      return;
    }

    setEmailStatus("sending");
    setEmailError(null);

    void sendBeneficiaryTransferEmail({
      beneficiaryEmail: formData.email,
      beneficiaryName: formData.beneficiaryName,
      beneficiaryBank: formData.bankName,
      beneficiaryIban: formData.iban,
      amount: formattedAmount,
      reference,
      executionDate,
      validationDate: validationDate.toLocaleDateString("fr-FR"),
      validationTime: validationDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      reason: formData.reason,
      ordererName: "Frederico Di Mario",
    }).then((result) => {
      setEmailStatus(result.status);
      setEmailError(result.error ?? null);
    });
  }

  function todayDateString(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function getTransferPayload() {
    return {
      accountCode: selectedDebitAccountId,
      accountId: null,
      beneficiaryId: null,
      beneficiaryName: formData.beneficiaryName.trim(),
      beneficiaryIban: formData.iban.trim(),
      beneficiaryBank: formData.bankName.trim(),
      beneficiaryEmail: formData.email.trim(),
      amount: parseAmount(formData.amount),
      reason: formData.reason.trim() || "Virement",
      transferType: selectedTransferTypeId,
      executionDate: selectedTransferTypeId === "scheduled" ? formData.executionDate : todayDateString(),
      idempotencyKey: crypto.randomUUID(),
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

      const result = await response.json() as { success: boolean; transfer?: { reference?: string }; error?: string; message?: string };

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
      setStep("success");
      addTransferNotification({ beneficiary: formData.beneficiaryName, amount: formattedAmount, reference: supabaseReference });
      addTransferMessage({
        beneficiary: formData.beneficiaryName,
        amount: formattedAmount,
        reference: supabaseReference,
        accountName: selectedDebitAccount.name,
        executionDate,
        validationDate: currentDate.toLocaleDateString("fr-FR"),
        validationTime: currentDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      });
      sendBeneficiaryNotice(supabaseReference, currentDate);
    } catch {
      setSubmitError("Une erreur réseau est survenue. Veuillez réessayer.");
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
    setFormData(initialFormData);
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
      <DesktopShell>
        <div className="space-y-5">
          {step === "form" ? (
            <>
              <div className="flex items-end justify-between">
                <div>
                  <h1 className="text-[26px] font-bold tracking-tight text-[#090927]">Virement direct</h1>
                  <p className="mt-1 text-[15px] text-[#6B7280]">Effectuez un virement vers un beneficiaire non enregistre.</p>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-5">
                <section className="col-span-8 rounded-[18px] border border-[#E5E7EB] bg-white p-5 shadow-[0_14px_34px_rgba(5,0,51,0.06)]">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <h2 className="text-[18px] font-bold text-[#090927]">Saisie du virement direct</h2>
                    <div className="flex items-center gap-2">
                      <Link href="/virements" className="flex h-11 items-center gap-2 rounded-[10px] border border-[#050033] px-4 text-[13px] font-semibold text-[#050033] hover:bg-[#F6F7F9]">
                        <Plus size={16} />
                        Nouveau beneficiaire
                      </Link>
                      <span className="flex h-11 items-center gap-2 rounded-[10px] border border-[#9ACD00] bg-[#FBFFF1] px-4 text-[13px] font-semibold text-[#050033]">
                        <Zap size={16} className="text-[#7AA600]" />
                        Virement direct
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-[13px] font-semibold text-[#090927]">Compte a debiter</label>
                      <button type="button" aria-label="Choisir le compte a debiter" onClick={() => setShowAccountPicker(true)} className="flex h-11 w-full items-center gap-3 rounded-[10px] border border-[#E5E7EB] px-3 text-[14px] font-medium text-[#090927]"><CreditCard size={18} />{selectedDebitAccount.name} - {selectedDebitAccount.balance}<span className="ml-auto">▾</span></button>
                    </div>
                    <div>
                      <label className="mb-2 block text-[13px] font-semibold text-[#090927]">Type de virement</label>
                      <button type="button" aria-label="Choisir le type de virement" onClick={() => setShowTypePicker(true)} className="flex h-11 w-full items-center gap-3 rounded-[10px] border border-[#E5E7EB] px-3 text-[14px] font-medium text-[#090927]"><Clock3 size={18} />{selectedTransferType.label}<span className="ml-auto">▾</span></button>
                    </div>

                    <div>
                      <label className="mb-2 block text-[13px] font-semibold text-[#090927]">Nom complet du beneficiaire *</label>
                      <input value={formData.beneficiaryName} onChange={(e) => setFormData((c) => ({ ...c, beneficiaryName: e.target.value }))} placeholder="Saisissez le nom complet du beneficiaire" className="h-11 w-full rounded-[10px] border border-[#E5E7EB] px-3 text-[14px] text-[#090927] outline-none focus-visible:ring-2 focus-visible:ring-[#9ACD00]" />
                      <FieldError message={errors.beneficiaryName} />
                    </div>
                    <div>
                      <label className="mb-2 block text-[13px] font-semibold text-[#090927]">Banque *</label>
                      <input value={formData.bankName} onChange={(e) => setFormData((c) => ({ ...c, bankName: e.target.value }))} placeholder="Nom de la banque du beneficiaire" className="h-11 w-full rounded-[10px] border border-[#E5E7EB] px-3 text-[14px] text-[#090927] outline-none focus-visible:ring-2 focus-visible:ring-[#9ACD00]" />
                      <FieldError message={errors.bankName} />
                    </div>

                    <div>
                      <label className="mb-2 block text-[13px] font-semibold text-[#090927]">IBAN *</label>
                      <input value={formData.iban} onChange={(e) => setFormData((c) => ({ ...c, iban: e.target.value }))} placeholder="Saisissez l'IBAN du beneficiaire" className="h-11 w-full rounded-[10px] border border-[#E5E7EB] px-3 text-[14px] text-[#090927] outline-none focus-visible:ring-2 focus-visible:ring-[#9ACD00]" />
                      <FieldError message={errors.iban} />
                    </div>
                    <div>
                      <label className="mb-2 block text-[13px] font-semibold text-[#090927]">Email *</label>
                      <input type="email" value={formData.email} onChange={(e) => setFormData((c) => ({ ...c, email: e.target.value }))} placeholder="exemple@domaine.com" className="h-11 w-full rounded-[10px] border border-[#E5E7EB] px-3 text-[14px] text-[#090927] outline-none focus-visible:ring-2 focus-visible:ring-[#9ACD00]" />
                      <FieldError message={errors.email} />
                    </div>

                    <div>
                      <label className="mb-2 block text-[13px] font-semibold text-[#090927]">Numero de telephone *</label>
                      <input value={formData.phone} onChange={(e) => setFormData((c) => ({ ...c, phone: e.target.value }))} placeholder="+352 621 123 456" className="h-11 w-full rounded-[10px] border border-[#E5E7EB] px-3 text-[14px] text-[#090927] outline-none focus-visible:ring-2 focus-visible:ring-[#9ACD00]" />
                      <FieldError message={errors.phone} />
                    </div>
                    <div>
                      <label className="mb-2 block text-[13px] font-semibold text-[#090927]">Montant *</label>
                      <div className="flex h-11 items-center rounded-[10px] border border-[#E5E7EB] px-3">
                        <Euro size={16} className="text-[#050033]" />
                        <input value={formData.amount} onChange={(e) => setFormData((c) => ({ ...c, amount: e.target.value }))} placeholder="0,00" className="ml-2 min-w-0 flex-1 text-[14px] text-[#090927] outline-none" />
                        <span className="text-[13px] text-[#6B7280]">EUR</span>
                      </div>
                      <FieldError message={errors.amount} />
                    </div>

                    <div>
                    <label className="mb-2 block text-[13px] font-semibold text-[#090927]">Date d&apos;execution</label>
                      {selectedTransferTypeId === "scheduled" ? <input type="date" min={todayInputValue()} value={formData.executionDate} onChange={(e) => setFormData((c) => ({ ...c, executionDate: e.target.value }))} className="h-11 w-full rounded-[10px] border border-[#E5E7EB] px-3 text-[14px] text-[#090927] outline-none focus-visible:ring-2 focus-visible:ring-[#9ACD00]" /> : <div className="flex h-11 items-center gap-3 rounded-[10px] border border-[#E5E7EB] px-3 text-[14px] font-medium text-[#090927]"><CalendarDays size={18} />{executionDate}</div>}
                      <FieldError message={errors.executionDate} />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="mb-2 block text-[13px] font-semibold text-[#090927]">Motif du virement</label>
                    <input maxLength={140} value={formData.reason} onChange={(e) => setFormData((c) => ({ ...c, reason: e.target.value }))} placeholder="Ex. : Facture, remboursement, cadeau..." className="h-11 w-full rounded-[10px] border border-[#E5E7EB] px-3 text-[14px] text-[#090927] outline-none focus-visible:ring-2 focus-visible:ring-[#9ACD00]" />
                  </div>

                  <div className="mt-5 flex items-center justify-between rounded-[14px] bg-[#F6F7F9] p-4">
                    <div className="flex items-center gap-3">
                      <ShieldCheck size={18} className="text-[#7AA600]" />
                      <div>
                        <p className="text-[14px] font-bold text-[#090927]">Securite de vos virements</p>
                        <p className="text-[12px] text-[#6B7280]">Vos operations sont protegees par des controles de securite avances.</p>
                      </div>
                    </div>
                    <Lock size={18} className="text-[#050033]" />
                  </div>
                </section>

                <aside className="col-span-4 space-y-5">
                  <div className="rounded-[18px] border border-[#E5E7EB] bg-white p-5 shadow-[0_14px_34px_rgba(5,0,51,0.06)]">
                    <h2 className="text-[18px] font-bold text-[#090927]">Resume du virement</h2>
                    <div className="mt-5 space-y-4 text-[14px]">
                      <div className="flex items-center justify-between"><span className="text-[#6B7280]">Montant</span><span className="font-bold text-[#050033]">{formattedAmount}</span></div>
                      <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-4"><span className="text-[#6B7280]">Frais</span><span className="font-bold text-[#7AA600]">0,00 EUR</span></div>
                      <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-4"><span className="text-[#6B7280]">Date d&apos;execution</span><span className="font-semibold text-[#090927]">{executionDate}</span></div>
                      <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-4"><span className="text-[#6B7280]">Beneficiaire</span><span className="font-semibold text-[#090927]">{formData.beneficiaryName || "Non renseigne"}</span></div>
                    </div>
                    <button type="button" onClick={onNext} className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-[#050033] text-[15px] font-bold text-white">Suivant <ArrowRight size={18} /></button>
                    <p className="mt-3 text-[12px] leading-[1.45] text-[#6B7280]">Les frais et le montant final seront confirmes a l&apos;etape suivante.</p>
                  </div>

                  <div className="rounded-[18px] border border-[#E5E7EB] bg-white p-5 shadow-[0_14px_34px_rgba(5,0,51,0.06)]">
                    <h3 className="text-[17px] font-bold text-[#090927]">Conseils de securite</h3>
                    <div className="mt-4 space-y-3 text-[13px]">
                      <p><span className="font-semibold text-[#090927]">Verifiez attentivement les informations.</span><br />Assurez-vous que l&apos;IBAN et le nom du beneficiaire sont corrects.</p>
                      <p><span className="font-semibold text-[#090927]">Ne partagez jamais vos codes.</span><br />Raiffeisen ne vous demandera jamais vos codes d&apos;acces ou de validation.</p>
                      <p><span className="font-semibold text-[#090927]">En cas de doute, contactez-nous.</span><br />Notre equipe est a votre disposition pour vous aider.</p>
                    </div>
                    <button type="button" onClick={() => setToast("Informations de securite disponibles.")} className="mt-4 text-[13px] font-semibold text-[#050033] underline">En savoir plus sur la securite</button>
                  </div>
                </aside>
              </div>
            </>
          ) : null}

          {step === "recap" ? (
            <>
              <div className="flex items-end justify-between">
                <div>
                  <h1 className="text-[26px] font-bold tracking-tight text-[#090927]">{t("transfers.recap.title")}</h1>
                  <p className="mt-1 text-[15px] text-[#6B7280]">{t("transfers.recap.subtitle")}</p>
                </div>
                <span className="flex items-center gap-2 rounded-full bg-[#EEF7D8] px-4 py-2 text-[13px] font-semibold text-[#050033]"><ShieldCheck size={16} className="text-[#7AA600]" />{t("transfers.recap.secure")}</span>
              </div>

              <div className="grid grid-cols-12 gap-5">
                <section className="col-span-8 rounded-[18px] border border-[#E5E7EB] bg-white p-5 shadow-[0_14px_34px_rgba(5,0,51,0.06)] space-y-4 text-[14px]">
                  <div className="flex items-start justify-between border-b border-[#E5E7EB] pb-4"><span className="font-semibold text-[#6B7280]">{t("transfers.receipt.debitAccount")}</span><span className="text-right font-semibold text-[#090927]">{selectedDebitAccount.name}<br />{selectedDebitAccount.iban}<br />{"Solde : "}{selectedDebitAccount.balance}</span></div>
                  <div className="flex items-center justify-between"><span className="font-semibold text-[#6B7280]">{t("transfers.receipt.transferType")}</span><span className="font-semibold text-[#090927]">{selectedTransferType.label}</span></div>
                  <div className="flex items-center justify-between"><span className="font-semibold text-[#6B7280]">{t("transfers.receipt.beneficiary")}</span><span className="font-semibold text-[#090927]">{formData.beneficiaryName}</span></div>
                  <div className="flex items-center justify-between"><span className="font-semibold text-[#6B7280]">{t("transfers.receipt.bank")}</span><span className="font-semibold text-[#090927]">{formData.bankName}</span></div>
                  <div className="flex items-center justify-between"><span className="font-semibold text-[#6B7280]">{t("transfers.receipt.beneficiaryIban")}</span><span className="font-semibold text-[#090927]">{formData.iban}</span></div>
                  <div className="flex items-center justify-between"><span className="font-semibold text-[#6B7280]">{t("transfers.receipt.email")}</span><span className="font-semibold text-[#090927]">{formData.email}</span></div>
                  <div className="flex items-center justify-between"><span className="font-semibold text-[#6B7280]">{t("transfers.receipt.phone")}</span><span className="font-semibold text-[#090927]">{formData.phone}</span></div>
                  <div className="flex items-center justify-between"><span className="font-semibold text-[#6B7280]">{t("transfers.receipt.amount")}</span><span className="font-semibold text-[#090927]">{formattedAmount}</span></div>
                  <div className="flex items-center justify-between"><span className="font-semibold text-[#6B7280]">{t("transfers.receipt.fees")}</span><span className="font-semibold text-[#7AA600]">0,00 EUR</span></div>
                  <div className="flex items-center justify-between"><span className="font-semibold text-[#6B7280]">{t("transfers.receipt.executionDate")}</span><span className="font-semibold text-[#090927]">{executionDate}</span></div>
                  <div className="flex items-center justify-between"><span className="font-semibold text-[#6B7280]">{t("transfers.receipt.reason")}</span><span className="font-semibold text-[#090927]">{formData.reason || "Non renseigne"}</span></div>
                  <div className="flex items-center justify-between"><span className="font-semibold text-[#6B7280]">{t("transfers.recap.tempRef")}</span><span className="font-semibold text-[#050033]">{temporaryReference}</span></div>
                </section>

                <aside className="col-span-4 space-y-5">
                  <div className="rounded-[18px] border border-[#E5E7EB] bg-white p-5 shadow-[0_14px_34px_rgba(5,0,51,0.06)]">
                    <h2 className="text-[18px] font-bold text-[#090927]">Resume du virement</h2>
                    <div className="mt-5 space-y-3 text-[14px]">
                      <div className="flex items-center justify-between"><span className="text-[#6B7280]">Montant total</span><span className="font-bold text-[#050033]">{formattedAmount}</span></div>
                      <div className="flex items-center justify-between"><span className="text-[#6B7280]">Frais</span><span className="font-semibold text-[#7AA600]">0,00 EUR</span></div>
                      <div className="flex items-center justify-between"><span className="text-[#6B7280]">Execution</span><span className="font-semibold text-[#090927]">{executionDate}</span></div>
                    </div>
                    {submitError ? <div className="mt-3 rounded-[10px] border border-[#DC2626] bg-[#FEF2F2] p-3 text-[13px] text-[#DC2626]">{submitError}</div> : null}
                    <button type="button" onClick={validateTransfer} disabled={isSubmitting} className={`mt-5 h-11 w-full rounded-[10px] ${isSubmitting ? "cursor-not-allowed bg-[#6B7280]" : "bg-[#050033]"} text-[15px] font-bold text-white`}>{isSubmitting ? "Traitement en cours..." : t("common.validate")}</button>
                    <button type="button" onClick={() => { resetEmailForNewTransfer(); setStep("form"); }} disabled={isSubmitting} className="mt-2 h-11 w-full rounded-[10px] border border-[#050033] text-[14px] font-semibold text-[#050033]">{t("common.back")}</button>
                    <p className="mt-3 text-[12px] text-[#6B7280]">En validant, vous confirmez les informations du virement.</p>
                  </div>

                  <div className="rounded-[18px] border border-[#E5E7EB] bg-white p-5 shadow-[0_14px_34px_rgba(5,0,51,0.06)]">
                    <h3 className="text-[17px] font-bold text-[#090927]">Securite renforcee</h3>
                    <p className="mt-2 text-[13px] text-[#6B7280]">Nous utilisons des protocoles de securite avances pour proteger vos operations.</p>
                    <ul className="mt-3 space-y-1 text-[13px] text-[#090927]"><li>Connexion protegee</li><li>Donnees cryptees</li><li>Controle renforce</li></ul>
                    <button type="button" onClick={() => setToast("Informations de securite disponibles.")} className="mt-4 text-[13px] font-semibold text-[#050033] underline">En savoir plus</button>
                  </div>
                </aside>
              </div>
            </>
          ) : null}

          {step === "success" ? (
            <>
              <div className="flex items-end justify-between">
                <div>
                  <h1 className="text-[26px] font-bold tracking-tight text-[#090927]">{t("transfers.success.title")}</h1>
                  <p className="mt-1 text-[15px] text-[#6B7280]">{t("transfers.success.subtitle")}</p>
                  <button type="button" onClick={resetFlow} className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-[#050033] underline"><ArrowLeft size={14} />{t("common.back")}</button>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-5">
                <section className="col-span-8 rounded-[18px] border border-[#E5E7EB] bg-white p-5 shadow-[0_14px_34px_rgba(5,0,51,0.06)]">
                  <div className="rounded-[14px] bg-[#FBFFF1] p-4 text-center">
                    <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#9ACD00] text-white"><CheckCircle2 size={34} /></span>
                    <p className="mt-3 text-[18px] font-bold text-[#090927]">{t("transfers.success.registered")}</p>
                    <p className="mt-1 text-[13px] text-[#6B7280]">{t("transfers.success.thanks")}</p>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3 text-[14px]">
                    <p><span className="text-[#6B7280]">{t("transfers.receipt.reference")}</span><br /><span className="font-semibold text-[#090927]">{finalReference}</span></p>
                    <p><span className="text-[#6B7280]">{t("transfers.receipt.date")}</span><br /><span className="font-semibold text-[#090927]">{now.toLocaleDateString("fr-FR")}</span></p>
                    <p><span className="text-[#6B7280]">{t("transfers.receipt.hour")}</span><br /><span className="font-semibold text-[#090927]">{now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span></p>
                    <p><span className="text-[#6B7280]">{t("transfers.receipt.debitAccount")}</span><br /><span className="font-semibold text-[#090927]">{selectedDebitAccount.name}</span></p>
                    <p><span className="text-[#6B7280]">{t("transfers.receipt.debitIban")}</span><br /><span className="font-semibold text-[#090927]">{maskIban(selectedDebitAccount.iban)}</span></p>
                    <p><span className="text-[#6B7280]">{t("transfers.receipt.transferType")}</span><br /><span className="font-semibold text-[#090927]">{selectedTransferType.label}</span></p>
                    <p><span className="text-[#6B7280]">{t("transfers.receipt.executionDate")}</span><br /><span className="font-semibold text-[#090927]">{executionDate}</span></p>
                    <p><span className="text-[#6B7280]">{t("transfers.receipt.beneficiary")}</span><br /><span className="font-semibold text-[#090927]">{formData.beneficiaryName}</span></p>
                    <p><span className="text-[#6B7280]">{t("transfers.receipt.bank")}</span><br /><span className="font-semibold text-[#090927]">{formData.bankName}</span></p>
                    <p><span className="text-[#6B7280]">{t("transfers.receipt.beneficiaryIban")}</span><br /><span className="font-semibold text-[#090927]">{maskIban(formData.iban)}</span></p>
                    <p><span className="text-[#6B7280]">{t("transfers.receipt.email")}</span><br /><span className="font-semibold text-[#090927]">{formData.email}</span></p>
                    <p><span className="text-[#6B7280]">{t("transfers.receipt.phone")}</span><br /><span className="font-semibold text-[#090927]">{formData.phone}</span></p>
                    <p><span className="text-[#6B7280]">{t("transfers.receipt.amount")}</span><br /><span className="font-semibold text-[#090927]">{formattedAmount}</span></p>
                    <p><span className="text-[#6B7280]">{t("transfers.receipt.fees")}</span><br /><span className="font-semibold text-[#7AA600]">0,00 EUR</span></p>
                    <p><span className="text-[#6B7280]">{t("transfers.receipt.totalDebited")}</span><br /><span className="font-semibold text-[#090927]">{formattedAmount}</span></p>
                  </div>
                  {emailStatus !== "idle" ? <div className="mt-4 rounded-[12px] border border-[#E5E7EB] bg-[#F8F9FB] p-3 text-[13px] text-[#6B7280]"><p className="font-semibold text-[#090927]">{emailStatus === "sending" ? t("transfers.emailNotice.sending") : emailStatus === "sent" ? t("transfers.emailNotice.sent") : t("transfers.emailNotice.failed")}</p>{emailStatus === "sent" ? <p className="mt-1">{t("transfers.emailNotice.sentTo")} : {formData.email}</p> : null}{emailError ? <p className="mt-1 text-[12px] text-[#DC2626]">{emailError}</p> : null}</div> : null}
                  <div className="mt-6 flex gap-2">
                    <button type="button" onClick={downloadReceipt} className="flex h-11 items-center gap-2 rounded-[10px] border border-[#050033] px-4 text-[14px] font-semibold text-[#050033]"><Download size={16} />{t("transfers.success.downloadPdf")}</button>
                    <button type="button" onClick={resetFlow} className="h-11 rounded-[10px] border border-[#050033] px-4 text-[14px] font-semibold text-[#050033]">{t("transfers.success.newTransfer")}</button>
                    <Link href="/dashboard" className="flex h-11 items-center rounded-[10px] bg-[#050033] px-4 text-[14px] font-semibold text-white">{t("transfers.success.backToDashboard")}</Link>
                  </div>
                </section>

                <aside className="col-span-4 space-y-5">
                  <div className="rounded-[18px] border border-[#E5E7EB] bg-white p-5 shadow-[0_14px_34px_rgba(5,0,51,0.06)]">
                    <h2 className="text-[18px] font-bold text-[#090927]">Suivi du virement</h2>
                    <p className="mt-2 text-[14px] text-[#6B7280]">Statut : <span className="font-semibold text-[#090927]">Planifie</span></p>
                    <p className="text-[13px] text-[#6B7280]">Votre virement sera execute aujourd&apos;hui.</p>
                    <div className="mt-4 space-y-3 text-[13px]"><p>Virement enregistre - {now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p><p>En cours de traitement - {now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p><p>Execution prevue - {now.toLocaleDateString("fr-FR")}</p></div>
                    <div className="mt-4 space-y-1 text-[13px] font-semibold text-[#050033]"><button type="button" onClick={() => setToast("Option recurrente disponible.")} className="block">Ajouter comme virement recurrent</button><button type="button" onClick={() => setToast("Ajout beneficiaire disponible.")} className="block">Ajouter le beneficiaire</button><button type="button" onClick={() => setToast("Liste des virements ouverte.")} className="block">Voir tous les virements</button></div>
                    <div className="mt-4 rounded-[12px] bg-[#F6F7F9] p-3 text-[12px] text-[#6B7280]">Vos operations sont protegees. Vos transactions sont suivies par nos controles.</div>
                  </div>
                </aside>
              </div>

              <div className="rounded-[18px] border border-[#E5E7EB] bg-white p-5 shadow-[0_14px_34px_rgba(5,0,51,0.06)]">
                <div className="flex items-center justify-between"><p className="text-[15px] font-bold text-[#090927]">Besoin d&apos;aide ?</p><button type="button" onClick={() => setToast("Le helpdesk est disponible pour vous accompagner.")} className="h-10 rounded-[10px] border border-[#050033] px-4 text-[13px] font-semibold text-[#050033]">Contacter le helpdesk</button></div>
              </div>
            </>
          ) : null}
        </div>
      </DesktopShell>

      {showAccountPicker ? (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-[#050033]/40 p-4">
          <div role="dialog" aria-modal="true" className="w-full max-w-xl rounded-2xl border border-[#E5E7EB] bg-white p-5">
            <div className="flex items-center justify-between"><h2 className="text-[20px] font-bold text-[#090927]">Choisir le compte a debiter</h2><button type="button" aria-label="Fermer" onClick={() => setShowAccountPicker(false)} className="text-[#6B7280]">Fermer</button></div>
            <div className="mt-4 space-y-2">{debitAccounts.map((account) => { const isSelected = selectedDebitAccountId === account.id; return <button key={account.id} type="button" aria-pressed={isSelected} aria-label={`Selectionner ${account.name}`} onClick={() => { resetEmailForNewTransfer(); setSelectedDebitAccountId(account.id); setShowAccountPicker(false); }} className={`flex w-full items-center justify-between rounded-[12px] border px-3 py-3 text-left ${isSelected ? "border-[#9ACD00] bg-[#F7FBEA]" : "border-[#E5E7EB] bg-white"}`}><span><span className="block text-[14px] font-semibold text-[#090927]">{account.name}</span><span className="block text-[12px] text-[#6B7280]">{account.balance} - {maskIban(account.iban)}</span></span>{isSelected ? <span className="text-[#7AA600]"><Check size={15} /></span> : null}</button>; })}</div>
          </div>
        </div>
      ) : null}

      {showTypePicker ? (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-[#050033]/40 p-4">
          <div role="dialog" aria-modal="true" className="w-full max-w-xl rounded-2xl border border-[#E5E7EB] bg-white p-5">
            <div className="flex items-center justify-between"><h2 className="text-[20px] font-bold text-[#090927]">Choisir le type de virement</h2><button type="button" aria-label="Fermer" onClick={() => setShowTypePicker(false)} className="text-[#6B7280]">Fermer</button></div>
            <div className="mt-4 space-y-2">{transferTypes.map((type) => <button key={type.id} type="button" aria-pressed={selectedTransferTypeId === type.id} onClick={() => selectTransferType(type.id)} className={`flex w-full items-center justify-between rounded-[12px] border px-3 py-3 text-left ${selectedTransferTypeId === type.id ? "border-[#9ACD00] bg-[#FBFFF1]" : "border-[#E5E7EB]"}`}><span><span className="block text-[14px] font-semibold text-[#090927]">{type.label}</span><span className="block text-[12px] text-[#6B7280]">{type.description}</span></span><span className="text-[#7AA600]">{selectedTransferTypeId === type.id ? "✓" : ""}</span></button>)}</div>
          </div>
        </div>
      ) : null}

      <DemoToast open={Boolean(toast)} message={toast} onClose={() => setToast("")} />
    </>
  );
}
