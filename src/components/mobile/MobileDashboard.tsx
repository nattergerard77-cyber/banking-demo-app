"use client";

import {
  ArrowLeftRight,
  Bell,
  Building2,
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
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAccount } from "@/context/AccountContext";
import type { SupabaseAccount, SupabaseTransaction } from "@/types/supabase";

import MobileShell from "./MobileShell";
import DemoModal from "../shared/DemoModal";

function money(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function signedMoney(value: number) {
  const formatted = money(Math.abs(value));
  return value >= 0 ? `+ ${formatted}` : `- ${formatted}`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getDate()} ${d.toLocaleDateString("fr-FR", { month: "long" })} ${d.getFullYear()}`;
}

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

  const { accounts, loading: accountsLoading, error: accountsError, isAccountBlocked, blockedAccount } = useAccount();
  const [transactions, setTransactions] = useState<SupabaseTransaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const txRes = await fetch("/api/transactions?limit=3");
        const txData = await txRes.json();

        if (txData.success) setTransactions(txData.transactions);
        else setTransactionsError("Impossible de charger les dernières opérations pour le moment.");
      } catch {
        setTransactionsError("Impossible de charger les dernières opérations pour le moment.");
      } finally {
        setTransactionsLoading(false);
      }
    }
    fetchTransactions();
  }, []);

  const totalBalance = accounts.reduce((sum: number, a: SupabaseAccount) => {
    return sum + Number(a.available_balance ?? a.balance ?? 0);
  }, 0);

  const accountIcon = (code: string) => {
    switch (code) {
      case "current": return Wallet;
      case "savings": return PiggyBank;
      case "joint": return Users;
      default: return Wallet;
    }
  };

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

        {isAccountBlocked && blockedAccount && (
          <div className="mx-4" style={{
            background: '#fee2e2',
            border: '2px solid #dc2626',
            borderRadius: '8px',
            padding: '12px',
            display: 'flex',
            gap: '10px'
          }}>
            <span style={{ fontSize: '20px', lineHeight: '1.2' }}>🔒</span>
            <div>
              <p style={{ fontWeight: 'bold', color: '#dc2626', margin: 0, fontSize: '14px' }}>
                COMPTE BLOQUÉ
              </p>
              <p style={{ color: '#7f1d1d', fontSize: '13px', margin: '4px 0 0 0' }}>
                Compte temporairement bloqué.
              </p>
              {blockedAccount.blocked_reason && (
                <>
                  <p style={{ color: '#7f1d1d', fontSize: '12px', margin: '6px 0 0 0', fontWeight: 'bold' }}>
                    Voici le motif :
                  </p>
                  <p style={{ color: '#7f1d1d', fontSize: '12px', margin: '2px 0 0 0' }}>
                    {blockedAccount.blocked_reason}
                  </p>
                </>
              )}
              <p style={{ color: '#991b1b', fontSize: '11px', margin: '8px 0 0 0' }}>
                Veuillez contacter votre conseiller.
              </p>
            </div>
          </div>
        )}

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
                {accountsLoading ? "" : money(totalBalance)}
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
              {accountsLoading ? (
                <div className="min-w-[210px] py-3">
                  <p className="text-[14px] text-[#6B7280]">Chargement...</p>
                </div>
              ) : accountsError ? (
                <div className="min-w-[210px] py-3">
                  <p className="text-[14px] text-[#6B7280]">{accountsError}</p>
                </div>
              ) : (
                accounts.map((accountItem: SupabaseAccount) => {
                  const Icon = accountIcon(accountItem.code);
                  const id = accountItem.code;
                  const label = accountItem.name;
                  const balance = money(Number(accountItem.available_balance ?? accountItem.balance));
                  const isSelected = selectedAccountId === id;

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSelectedAccountId(id)}
                      onPointerUp={() => setSelectedAccountId(id)}
                      aria-pressed={isSelected}
                      aria-label={`Sélectionner ${label}`}
                      className={`relative min-w-[210px] rounded-[10px] border p-3 text-left ${isAccountBlocked ? 'opacity-50' : ''} ${
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
                            isSelected ? "bg-[#EEF7D8] text-[#9ACD00]" : "bg-[#F3F4F6] text-[#050033]"
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
                            {label}
                          </p>
                          <p className={`mt-0.5 text-[15px] font-bold leading-tight ${isAccountBlocked ? 'text-[#9ca3af]' : 'text-[#090927]'}`}>
                            {balance}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-2 flex justify-center gap-1.5">
            {accounts.map((accountItem: SupabaseAccount) => (
              <span
                key={accountItem.code}
                className={`h-1.5 w-1.5 rounded-full ${
                  selectedAccountId === accountItem.code ? "bg-[#9ACD00]" : "bg-[#D1D5DB]"
                }`}
              />
            ))}
          </div>
        </MobileCard>

        <MobileCard className={`grid grid-cols-4 p-2 text-center ${isAccountBlocked ? 'opacity-50 pointer-events-none' : ''}`}>
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
                <span className={`flex h-11 w-11 items-center justify-center rounded-full ${isAccountBlocked ? 'bg-gray-200 text-gray-400' : 'bg-[#F3F4F6] text-[#050033]'}`}>
                  <Icon size={20} />
                </span>
                <span className={`mt-1.5 text-[11px] font-medium ${isAccountBlocked ? 'text-[#9ca3af]' : 'text-[#050033]'}`}>
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

          {transactionsLoading ? (
            <p className="py-3 text-[14px] text-[#6B7280]">Chargement...</p>
          ) : transactionsError ? (
            <p className="py-3 text-[14px] text-[#6B7280]">{transactionsError}</p>
          ) : transactions.length === 0 ? (
            <p className="py-3 text-[14px] text-[#6B7280]">Aucune opération récente.</p>
          ) : (
            transactions.map((tx: SupabaseTransaction, index: number) => {
              const positive = tx.direction === "credit";
              const amount = Number(tx.amount);
              const dateStr = formatDate(tx.transaction_date);
              const timeStr = tx.transaction_time ? tx.transaction_time.slice(0, 5) : "";
              return (
                <button
                  key={tx.id ?? `${tx.transaction_date}-${tx.amount}-${index}`}
                  type="button"
                  onClick={() => setModal({ title: tx.label, message: `Détail de l’opération: ${signedMoney(positive ? amount : -amount)} le ${dateStr} à ${timeStr}.` })}
                  className="flex w-full items-center gap-3 border-b border-[#E5E7EB] py-2.5 last:border-0 interactive-row"
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      positive
                        ? "bg-[#EEF7D8] text-[#7AA600]"
                        : "bg-[#F3F4F6] text-[#050033]"
                    }`}
                  >
                    <Building2 size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-[#090927]">
                      {tx.label}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#6B7280]">{dateStr}{timeStr ? ` · ${timeStr}` : ""}</p>
                  </div>

                  <p
                    className={`text-[13px] font-bold ${
                      positive ? "text-[#7AA600]" : "text-[#050033]"
                    }`}
                  >
                    {signedMoney(positive ? amount : -amount)}
                  </p>

                  <ChevronRight size={14} className="text-[#6B7280]" />
                </button>
              );
            })
          )}
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
