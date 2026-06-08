"use client";

import {
  ArrowLeftRight,
  Bell,
  ChevronRight,
  CreditCard,
  Eye,
  FileText,
  PiggyBank,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

import MobileShell from "./MobileShell";
import DemoModal from "../shared/DemoModal";

function MobileCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[18px] border border-[#E5E7EB] bg-white shadow-[0_12px_30px_rgba(5,0,51,0.08)] ${className}`}
    >
      {children}
    </div>
  );
}

export function MobileDashboard() {
  const router = useRouter();
  const { t } = useLanguage();
  const [modal, setModal] = useState<{ title: string; message: string } | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState("current");

  const accounts = [
    {
      id: "current",
      label: t("dashboard.currentAccount"),
      balance: "84.320,00 €",
      icon: Wallet,
      activeBg: "bg-[#EEF7D8] text-[#9ACD00]",
    },
    {
      id: "savings",
      label: t("dashboard.savingsAccount"),
      balance: "185.680,00 €",
      icon: PiggyBank,
      activeBg: "bg-[#EEF7D8] text-[#9ACD00]",
    },
    {
      id: "joint",
      label: t("dashboard.mobile.jointAccount"),
      balance: "30.000,00 €",
      icon: Users,
      activeBg: "bg-[#EEF7D8] text-[#9ACD00]",
    },
  ];

  return (
    <>
    <MobileShell>
      <div className="space-y-3">
        <div className="px-4 pt-5 pb-1">
          <h1 className="text-[28px] font-bold tracking-[-0.03em] text-[#07002F]">
            {t("dashboard.title")}
          </h1>
          <p className="mt-2 text-[15px] leading-6 text-[#6B7280]">
            {t("dashboard.subtitle")}
          </p>
        </div>

        <MobileCard className="p-3.5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-[14px] font-semibold text-[#6B7280]">
                  {t("dashboard.mobile.totalBalance")}
                </p>
                <Eye size={16} className="text-[#6B7280]" />
              </div>

              <p className="mt-1 text-[28px] font-bold tracking-[0.02em] text-[#050033]">
                300.000,00 €
              </p>

              <p className="mt-0.5 text-[13px] text-[#6B7280]">
                {t("dashboard.mobile.allAccounts")}
              </p>
            </div>

            <div className="mt-1 flex h-[48px] w-[48px] items-center justify-center rounded-full bg-[#EEF7D8] text-[#9ACD00]">
              <TrendingUp size={24} />
            </div>
          </div>
        </MobileCard>

        <MobileCard className="p-3">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-2.5 px-1 pb-1">
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
                    aria-label={`Sélectionner ${accountItem.label}`}
                    className={`relative min-w-[210px] rounded-[10px] border p-3 text-left ${
                      isSelected ? "border-[#9ACD00] bg-white shadow-sm" : "border-[#E5E7EB] bg-white"
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#9ACD00] text-white text-[10px]">
                        ✓
                      </span>
                    )}
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                          isSelected ? accountItem.activeBg : "bg-[#F3F4F6] text-[#050033]"
                        }`}
                      >
                        <Icon size={20} />
                      </div>
                      <div>
                        <p
                          className={`font-semibold text-[13px] leading-tight ${
                            isSelected ? "text-[#090927]" : "text-[#6B7280]"
                          }`}
                        >
                          {accountItem.label}
                        </p>
                        <p className="mt-0.5 text-[15px] font-bold text-[#090927] leading-tight">
                          {accountItem.balance}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-2 flex justify-center gap-1.5">
            {accounts.map((accountItem) => (
              <span
                key={accountItem.id}
                className={`h-1.5 w-1.5 rounded-full ${
                  selectedAccountId === accountItem.id ? "bg-[#9ACD00]" : "bg-[#D1D5DB]"
                }`}
              />
            ))}
          </div>
        </MobileCard>

        <MobileCard className="grid grid-cols-4 p-2 text-center">
          {[
            { icon: ArrowLeftRight, label: t("dashboard.quickActionTransfer"), href: "/virements", ariaLabel: "Accéder aux virements" },
            { icon: CreditCard, label: t("dashboard.mobile.cards"), href: "/cartes", ariaLabel: "Accéder aux cartes" },
            { icon: PiggyBank, label: t("dashboard.mobile.savings"), href: "/epargne", ariaLabel: "Accéder à l’épargne" },
            { icon: FileText, label: t("dashboard.mobile.statements"), href: "/comptes", ariaLabel: "Accéder aux relevés" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.ariaLabel}
                className="flex flex-col items-center py-2 interactive-button rounded-[12px]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F3F4F6] text-[#050033]">
                  <Icon size={20} />
                </span>
                <span className="mt-1.5 text-[11px] font-medium text-[#050033]">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </MobileCard>

        <MobileCard className="p-3.5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-[#090927]">
              {t("dashboard.mobile.latestTransactions")}
            </h2>
            <Link href="/operations" className="flex items-center gap-0.5 text-[12px] font-semibold text-[#7AA600] interactive-link">
              {t("dashboard.mobile.seeAll")}
              <ChevronRight size={13} className="arrow-icon" />
            </Link>
          </div>

          {[
            {
              icon: Wallet,
              name: t("dashboard.operations.italianTransfer"),
              date: "15 juillet 2022",
              time: "14:37",
              amount: "+18.750,00 €",
              positive: true,
            },
            {
              icon: Wallet,
              name: t("dashboard.operations.italianTransfer"),
              date: "15 janvier 2022",
              time: "09:18",
              amount: "+18.750,00 €",
              positive: true,
            },
            {
              icon: Wallet,
              name: t("dashboard.operations.italianTransfer"),
              date: "15 juillet 2021",
              time: "16:05",
              amount: "+18.750,00 €",
              positive: true,
            },
          ].map((tx, index) => {
            const Icon = tx.icon;
            return (
              <button
                key={`${tx.date}-${tx.time}-${tx.name}-${tx.amount}-${index}`}
                type="button"
                onClick={() => setModal({ title: tx.name, message: `Détail de l’opération: ${tx.amount} le ${tx.date} à ${tx.time}.` })}
                className="flex w-full items-center gap-3 border-b border-[#E5E7EB] py-2.5 last:border-0 interactive-row"
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${
                    tx.positive
                      ? "bg-[#EEF7D8] text-[#7AA600]"
                      : "bg-[#F3F4F6] text-[#050033]"
                  }`}
                >
                  <Icon size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-[#090927]">
                    {tx.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#6B7280]">{tx.date} · {tx.time}</p>
                </div>

                <p
                  className={`text-[13px] font-bold ${
                    tx.positive ? "text-[#7AA600]" : "text-[#050033]"
                  }`}
                >
                  {tx.amount}
                </p>

                <ChevronRight size={14} className="text-[#6B7280]" />
              </button>
            );
          })}
        </MobileCard>

        <button type="button" onClick={() => router.push('/epargne')} className="w-full text-left interactive-card rounded-[18px]">
        <MobileCard className="flex items-center gap-3 p-3">
          <div className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full border-[6px] border-[#9ACD00] text-[14px] font-bold text-[#050033]">
            72%
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-[14px] font-bold text-[#090927]">{t("dashboard.mobile.projectSavings")}</h2>
            <p className="mt-0.5 text-[12px] text-[#6B7280]">
              {t("dashboard.vacations")}
            </p>
            <p className="mt-0.5 text-[13px] font-semibold text-[#090927]">
              2 160,00 €{" "}
              <span className="font-normal text-[#6B7280]">/ 3 000,00 €</span>
            </p>
          </div>

          <ChevronRight size={16} className="text-[#050033]" />
        </MobileCard>
        </button>

        <button type="button" onClick={() => router.push('/notifications')} className="w-full text-left interactive-card rounded-[18px]">
        <MobileCard className="flex items-center gap-3 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-[#050033]">
            <Bell size={18} />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-[14px] font-bold text-[#090927]">
              {t("dashboard.mobile.newFeature")}
            </h2>
            <p className="mt-0.5 text-[12px] leading-snug text-[#6B7280]">
              {t("dashboard.mobile.newFeatureDesc")}
            </p>
          </div>

          <ChevronRight size={16} className="text-[#050033]" />
        </MobileCard>
        </button>
      </div>
    </MobileShell>
    <DemoModal open={Boolean(modal)} title={modal?.title ?? ''} message={modal?.message ?? ''} onClose={() => setModal(null)} />
    </>
  );
}

export default MobileDashboard;
