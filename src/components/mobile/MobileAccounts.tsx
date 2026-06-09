"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";

import MobileShell from "./MobileShell";
import DemoModal from "../shared/DemoModal";
import DemoToast from "../shared/DemoToast";
import type { SupabaseAccount, SupabaseTransaction } from "@/types/supabase";
import { mockUser } from "@/data/user";
import { operationsHistoryData } from "@/data/operations-history";
import { generateAccountStatementPdf } from "@/utils/generateAccountStatementPdf";

type AccountsApiResponse =
  | { success: true; accounts: SupabaseAccount[] }
  | { success: false; error: string };

type TransactionsApiResponse =
  | { success: true; transactions: SupabaseTransaction[] }
  | { success: false; error: string };

type AccountViewModel = {
  id: string;
  supabaseId: string;
  name: string;
  type: SupabaseAccount["type"];
  iban: string;
  balance: string;
  rawBalance: number;
  currency: SupabaseAccount["currency"];
  icon: typeof Wallet;
};

type TransactionViewModel = {
  id: string;
  date: string;
  time: string;
  label: string;
  category: string;
  amount: string;
  positive: boolean;
  icon: typeof ArrowDown;
};

function formatCurrency(value: number | string, currency = "EUR") {
  const amount = Number(value);

  if (!Number.isFinite(amount)) return "Montant indisponible";

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(amount);
}

function formatSignedCurrency(value: number | string, direction: SupabaseTransaction["direction"], currency = "EUR") {
  const amount = Math.abs(Number(value));

  if (!Number.isFinite(amount)) return "Montant indisponible";

  return `${direction === "credit" ? "+" : "-"} ${formatCurrency(amount, currency)}`;
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTime(value?: string | null) {
  if (!value) return "--:--";
  return value.slice(0, 5);
}

function maskIban(iban: string) {
  const clean = iban.replace(/\s+/g, "");
  if (clean.length < 8) return iban;

  return `${clean.slice(0, 4)} •••• •••• ${clean.slice(-4)}`;
}

function getAccountIcon(account: Pick<SupabaseAccount, "code" | "type">) {
  return account.code === "joint" || account.type === "joint" ? Users : Wallet;
}

function mapAccount(account: SupabaseAccount): AccountViewModel {
  const rawBalance = Number(account.available_balance ?? account.balance);

  return {
    id: account.code,
    supabaseId: account.id,
    name: account.name,
    type: account.type,
    iban: maskIban(account.iban),
    balance: formatCurrency(rawBalance, account.currency),
    rawBalance: Number.isFinite(rawBalance) ? rawBalance : 0,
    currency: account.currency,
    icon: getAccountIcon(account),
  };
}

function mapTransaction(transaction: SupabaseTransaction): TransactionViewModel {
  return {
    id: transaction.id || transaction.reference || `${transaction.transaction_date}-${transaction.transaction_time}`,
    date: formatDate(transaction.transaction_date),
    time: formatTime(transaction.transaction_time),
    label: transaction.label,
    category: transaction.category ?? "Opération",
    amount: formatSignedCurrency(transaction.amount, transaction.direction, transaction.currency),
    positive: transaction.direction === "credit",
    icon: transaction.direction === "credit" ? ArrowDown : ArrowUp,
  };
}

function MobileCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[18px] border border-[#E5E7EB] bg-white shadow-[0_10px_26px_rgba(5,0,51,0.07)] ${className}`}
    >
      {children}
    </div>
  );
}

export function MobileAccounts() {
  const { t } = useLanguage();
  const [accounts, setAccounts] = useState<AccountViewModel[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [accountsError, setAccountsError] = useState("");
  const [transactions, setTransactions] = useState<TransactionViewModel[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("current");
  const [modal, setModal] = useState<{ title: string; message: string } | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadAccounts() {
      setAccountsLoading(true);
      setAccountsError("");

      try {
        const response = await fetch("/api/accounts");
        const result = (await response.json()) as AccountsApiResponse;

        if (!response.ok || !result.success) {
          throw new Error("ACCOUNTS_FETCH_FAILED");
        }

        if (!ignore) {
          const nextAccounts = result.accounts.map(mapAccount);
          setAccounts(nextAccounts);
          setSelectedAccountId((current) => nextAccounts.some((item) => item.id === current) ? current : nextAccounts[0]?.id ?? "");
        }
      } catch {
        if (!ignore) setAccountsError("Impossible de charger les comptes pour le moment.");
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

    async function loadTransactions() {
      setTransactionsLoading(true);
      setTransactionsError("");

      try {
        const response = await fetch("/api/transactions");
        const result = (await response.json()) as TransactionsApiResponse;

        if (!response.ok || !result.success) {
          throw new Error("TRANSACTIONS_FETCH_FAILED");
        }

        if (!ignore) setTransactions(result.transactions.map(mapTransaction));
      } catch {
        if (!ignore) setTransactionsError("Impossible de charger les transactions pour le moment.");
      } finally {
        if (!ignore) setTransactionsLoading(false);
      }
    }

    void loadTransactions();

    return () => {
      ignore = true;
    };
  }, []);

  const selectedAccount = useMemo(
    () => accounts.find((item) => item.id === selectedAccountId) ?? accounts[0] ?? null,
    [selectedAccountId, accounts],
  );

  return (
    <>
    <MobileShell>
      <div className="space-y-3">
        <section>
          <h1 className="text-[20px] font-bold tracking-tight text-[#090927]">
            {t("accounts.title")}
          </h1>
          <p className="mt-0.5 text-[13px] text-[#6B7280]">
            {t("accounts.subtitle")}
          </p>
        </section>

        <MobileCard className="p-4">
          <p className="text-[13px] font-semibold text-[#6B7280]">
            {t("accounts.availableBalance")}
          </p>
          <p className="mt-2 text-[28px] font-bold tracking-tight text-[#050033]">
            {accountsLoading ? "Chargement des comptes..." : selectedAccount?.balance ?? "Solde indisponible"}
          </p>
          <p className="mt-0.5 text-[12px] text-[#6B7280]">
            {accountsError || (selectedAccount ? `${selectedAccount.name} — ${selectedAccount.iban}` : "Aucun compte disponible.")}
          </p>
        </MobileCard>

        <MobileCard className="p-3">
          {accountsError ? <p className="px-1 pb-2 text-[12px] text-[#DC2626]">{accountsError}</p> : null}
          <div className="-mx-1 overflow-x-auto px-1 pb-1 scrollbar-hide">
            <div className="flex gap-2.5">
            {accountsLoading ? <p className="px-1 py-3 text-[13px] text-[#6B7280]">Chargement des comptes...</p> : null}
            {!accountsLoading && !accountsError && accounts.length === 0 ? <p className="px-1 py-3 text-[13px] text-[#6B7280]">Aucun compte disponible.</p> : null}
            {accounts.map((accountItem) => {
              const Icon = accountItem.icon;
              const isSelected = selectedAccountId === accountItem.id;

              return (
              <button
                key={accountItem.id}
                type="button"
                onClick={() => setSelectedAccountId(accountItem.id)}
                onPointerUp={() => setSelectedAccountId(accountItem.id)}
                aria-pressed={isSelected}
                aria-label={`Sélectionner ${accountItem.name}`}
                className={`min-w-[200px] rounded-[12px] border p-3 text-left interactive-card transition-all duration-200 ${
                  isSelected
                    ? "border-2 border-[#9ACD00] bg-[#FBFFF1]"
                    : "border-[#E5E7EB] bg-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] transition-colors duration-200 ${
                      isSelected
                        ? "bg-[#050033] text-white"
                        : "bg-[#F3F4F6] text-[#050033]"
                    }`}
                  >
                    <Icon size={19} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <p
                        className={`truncate text-[12px] font-semibold ${
                          isSelected ? "text-[#090927]" : "text-[#6B7280]"
                        }`}
                      >
                        {accountItem.name}
                      </p>

                      {isSelected && (
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#9ACD00] text-[9px] font-bold text-white">
                          ✓
                        </span>
                      )}
                    </div>

                    <p className="mt-0.5 text-[15px] font-bold text-[#090927]">
                      {accountItem.balance}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#6B7280]">
                      {accountItem.iban}
                    </p>
                  </div>
                </div>
              </button>
              );
            })}
            </div>
          </div>

          <div className="mt-1.5 flex justify-center gap-1.5">
            {accounts.map((a) => (
              <span
                key={a.id}
                className={`h-1.5 w-1.5 rounded-full transition-colors duration-200 ${
                  selectedAccountId === a.id ? "bg-[#9ACD00]" : "bg-[#D1D5DB]"
                }`}
              />
            ))}
          </div>
        </MobileCard>

        <MobileCard className="p-3">
          <h2 className="text-[15px] font-bold text-[#090927]">
            {t("accounts.details")}
          </h2>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-[12px] bg-[#F6F7F9] p-2.5">
              <p className="text-[11px] text-[#6B7280]">{t("accounts.inflows")}</p>
              <p className="mt-0.5 text-[14px] font-bold text-[#7AA600]">
                + 1 250,00 €
              </p>
            </div>

            <div className="rounded-[12px] bg-[#F6F7F9] p-2.5">
              <p className="text-[11px] text-[#6B7280]">{t("accounts.outflows")}</p>
              <p className="mt-0.5 text-[14px] font-bold text-[#050033]">
                - 2 140,50 €
              </p>
            </div>

            <div className="rounded-[12px] bg-[#F6F7F9] p-2.5">
              <p className="text-[11px] text-[#6B7280]">{t("accounts.netBalance")}</p>
              <p className="mt-0.5 text-[14px] font-bold text-[#050033]">
                - 890,50 €
              </p>
            </div>

            <div className="rounded-[12px] bg-[#F6F7F9] p-2.5">
              <p className="text-[11px] text-[#6B7280]">{t("accounts.variation")}</p>
              <p className="mt-0.5 text-[14px] font-bold text-[#050033]">
                -22 %
              </p>
            </div>
          </div>
        </MobileCard>

        <MobileCard className="p-3">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-[#090927]">
              {t("accounts.history")}
            </h2>
            <Link
              href="/comptes"
              className="text-[12px] font-semibold text-[#7AA600] interactive-link"
            >
              {t("common.seeAll")}
            </Link>
          </div>

          {transactions.map((transaction, index) => {
            const Icon = transaction.icon;

            return (
              <button
                key={`${transaction.date}-${transaction.time}-${transaction.label}-${transaction.amount}-${index}`}
                type="button"
                onClick={() => setModal({ title: transaction.label, message: `Détail du compte ${transaction.amount} le ${transaction.date} à ${transaction.time}.` })}
                className="flex items-center gap-2.5 border-b border-[#E5E7EB] py-2.5 last:border-0"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    transaction.positive
                      ? "bg-[#EEF7D8] text-[#7AA600]"
                      : "bg-[#F3F4F6] text-[#050033]"
                  }`}
                >
                  <Icon size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-[#090927]">
                    {transaction.label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#6B7280]">
                    {transaction.date} · {transaction.time} · {transaction.category}
                  </p>
                </div>

                <p
                  className={`text-[13px] font-bold ${
                    transaction.positive ? "text-[#7AA600]" : "text-[#050033]"
                  }`}
                >
                  {transaction.amount}
                </p>

                <CheckCircle2 size={15} className="text-[#7AA600]" />
              </button>
            );
          })}
          {transactionsLoading ? <p className="border-b border-[#E5E7EB] py-2.5 text-[13px] text-[#6B7280]">Chargement des transactions...</p> : null}
          {transactionsError ? <p className="border-b border-[#E5E7EB] py-2.5 text-[13px] text-[#DC2626]">{transactionsError}</p> : null}
          {!transactionsLoading && !transactionsError && transactions.length === 0 ? <p className="border-b border-[#E5E7EB] py-2.5 text-[13px] text-[#6B7280]">Aucune transaction disponible.</p> : null}
        </MobileCard>

        <MobileCard className="p-3">
          <h2 className="text-[15px] font-bold text-[#090927]">
            {t("accounts.statements")}
          </h2>

          <div className="mt-2 divide-y divide-[#E5E7EB]">
            <button
              type="button"
              onClick={() => {
                const currentAccount = accounts.find((item) => item.id === "current") ?? null;
                generateAccountStatementPdf({
                  year: 2015,
                  clientName: mockUser.name,
                  clientEmail: mockUser.email,
                  clientPhone: mockUser.phone,
                  clientSince: mockUser.clientSince,
                  accountName: "Compte courant",
                  accountIban: currentAccount?.iban ?? "LU12 0019 1234 5678 9101",
                  accountCurrency: "EUR",
                  transactions: operationsHistoryData
                    .filter((op) => op.date.includes("2015"))
                    .map((op) => ({
                      date: op.date,
                      label: op.label,
                      category: op.category,
                      amount: op.amount,
                      positive: op.positive,
                      status: op.status,
                      senderIban: op.senderIban,
                    })),
                });
                setToast("Relevé 2015 téléchargé avec succès.");
              }}
              className="flex w-full items-center justify-between py-2.5 text-left"
            >
              <span className="flex items-center gap-2.5 text-[13px] font-semibold text-[#090927]">
                <FileText size={16} className="text-[#050033]" />
                Relevé annuel 2015 — Compte courant
              </span>

              <span className="flex items-center gap-1.5 text-[12px] text-[#6B7280]">
                <Download size={15} />
                {t("common.pdf")}
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setModal({ title: t('accounts.allStatements'), message: 'Liste complète des relevés ouverte.' })}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-[10px] border border-[#050033] py-2.5 text-[13px] font-semibold text-[#050033]"
          >
            {t("accounts.allStatements")}
            <ChevronRight size={14} />
          </button>
        </MobileCard>
      </div>
    </MobileShell>
    <DemoModal open={Boolean(modal)} title={modal?.title ?? ''} message={modal?.message ?? ''} onClose={() => setModal(null)} />
    <DemoToast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </>
  );
}

export default MobileAccounts;
