"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  ArrowDown,
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
  const [selectedAccountId, setSelectedAccountId] = useState("current");
  const [modal, setModal] = useState<{ title: string; message: string } | null>(null);
  const [toast, setToast] = useState("");

  const accounts = useMemo(() => [
    {
      id: "current",
      name: t("accounts.current"),
      iban: "LU12 •••• •••• 9000",
      balance: "84.320,00 €",
      icon: Wallet,
    },
    {
      id: "savings",
      name: t("accounts.savings"),
      iban: "LU34 •••• •••• 1000",
      balance: "185.680,00 €",
      icon: Wallet,
    },
    {
      id: "joint",
      name: t("accounts.joint"),
      iban: "LU78 •••• •••• 9000",
      balance: "30.000,00 €",
      icon: Users,
    },
  ], [t]);

  const transactions = useMemo(() => [
    {
      date: "15 juillet 2022",
      time: "14:37",
      label: t("transactions.italianTransfer"),
      category: t("transactions.internationalTransfer"),
      amount: "+ 18.750,00 €",
      positive: true,
      icon: ArrowDown,
    },
    {
      date: "15 janvier 2022",
      time: "09:18",
      label: t("transactions.italianTransfer"),
      category: t("transactions.internationalTransfer"),
      amount: "+ 18.750,00 €",
      positive: true,
      icon: ArrowDown,
    },
    {
      date: "15 juillet 2021",
      time: "16:05",
      label: t("transactions.italianTransfer"),
      category: t("transactions.internationalTransfer"),
      amount: "+ 18.750,00 €",
      positive: true,
      icon: ArrowDown,
    },
    {
      date: "15 janvier 2021",
      time: "10:42",
      label: t("transactions.italianTransfer"),
      category: t("transactions.internationalTransfer"),
      amount: "+ 18.750,00 €",
      positive: true,
      icon: ArrowDown,
    },
    {
      date: "15 juillet 2020",
      time: "13:26",
      label: t("transactions.italianTransfer"),
      category: t("transactions.internationalTransfer"),
      amount: "+ 18.750,00 €",
      positive: true,
      icon: ArrowDown,
    },
  ], [t]);

  const selectedAccount = useMemo(
    () => accounts.find((item) => item.id === selectedAccountId) ?? accounts[0],
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
            {selectedAccount.balance}
          </p>
          <p className="mt-0.5 text-[12px] text-[#6B7280]">
            {selectedAccount.name} — {selectedAccount.iban}
          </p>
        </MobileCard>

        <MobileCard className="p-3">
          <div className="-mx-1 overflow-x-auto px-1 pb-1 scrollbar-hide">
            <div className="flex gap-2.5">
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
        </MobileCard>

        <MobileCard className="p-3">
          <h2 className="text-[15px] font-bold text-[#090927]">
            {t("accounts.statements")}
          </h2>

          <div className="mt-2 divide-y divide-[#E5E7EB]">
            {[t("common.monthMay"), t("common.monthApril"), t("common.monthMarch")].map((month) => (
                <button
                  key={month}
                  type="button"
                  onClick={() => setToast('Document préparé pour consultation.')}
                  className="flex w-full items-center justify-between py-2.5 text-left"
                >
                <span className="flex items-center gap-2.5 text-[13px] font-semibold text-[#090927]">
                  <FileText size={16} className="text-[#050033]" />
                  {month}
                </span>

                <span className="flex items-center gap-1.5 text-[12px] text-[#6B7280]">
                  <Download size={15} />
                  {t("common.pdf")}
                </span>
              </button>
            ))}
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
