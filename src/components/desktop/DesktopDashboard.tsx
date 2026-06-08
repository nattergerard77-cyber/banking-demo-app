"use client";

import {
  ArrowLeftRight,
  Building2,
  ChevronRight,
  Download,
  PiggyBank,
  ShieldCheck,
  UserPlus,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import ClientOnlyChart from "../shared/ClientOnlyChart";
import DemoModal from "../shared/DemoModal";
import DemoToast from "../shared/DemoToast";

import DesktopShell from "./DesktopShell";

const chartData = [
  { day: "26 avr.", solde: 240000 },
  { day: "29 avr.", solde: 252000 },
  { day: "3 mai", solde: 268000 },
  { day: "6 mai", solde: 281000 },
  { day: "10 mai", solde: 292000 },
  { day: "13 mai", solde: 295000 },
  { day: "17 mai", solde: 297000 },
  { day: "20 mai", solde: 298000 },
  { day: "24 mai", solde: 299000 },
  { day: "Aujourd’hui", solde: 300000 },
];

const operations = [
  {
    icon: Building2,
    title: "Virement reçu — Compte italien",
    subtitle: "Istituto Bancario Italiano",
    date: "15 juillet 2022",
    time: "14:37",
    amount: 18750,
    positive: true,
  },
  {
    icon: Building2,
    title: "Virement reçu — Compte italien",
    subtitle: "Istituto Bancario Italiano",
    date: "15 janvier 2022",
    time: "09:18",
    amount: 18750,
    positive: true,
  },
  {
    icon: Building2,
    title: "Virement reçu — Compte italien",
    subtitle: "Istituto Bancario Italiano",
    date: "15 juillet 2021",
    time: "16:05",
    amount: 18750,
    positive: true,
  },
  {
    icon: Building2,
    title: "Virement reçu — Compte italien",
    subtitle: "Istituto Bancario Italiano",
    date: "15 janvier 2021",
    time: "10:42",
    amount: 18750,
    positive: true,
  },
  {
    icon: Building2,
    title: "Virement reçu — Compte italien",
    subtitle: "Istituto Bancario Italiano",
    date: "15 juillet 2020",
    time: "13:26",
    amount: 18750,
    positive: true,
  },
];

const quickActions = [
  { icon: ArrowLeftRight, label: "Virement" },
  { icon: UserPlus, label: "Ajouter un bénéficiaire" },
  { icon: Download, label: "Télécharger mon RIB" },
];

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

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[20px] border border-[#E5E7EB] bg-white shadow-[0_18px_45px_rgba(5,0,51,0.07)] ${className}`}
    >
      {children}
    </div>
  );
}

export function DesktopDashboard() {
  const router = useRouter();
  const { t } = useLanguage();
  const [range, setRange] = useState("30J");
  const [notificationsRead, setNotificationsRead] = useState(false);
  const [modal, setModal] = useState<{ title: string; message: string } | null>(null);
  const [toast, setToast] = useState("");

  const goQuickAction = (label: string) => {
    if (label === t("dashboard.quickActionTransfer")) router.push("/virements");
    else if (label === t("dashboard.quickActionAddBeneficiary")) router.push("/beneficiaires");
    else setToast("Document préparé pour consultation.");
  };

  const quickActions = [
    { icon: ArrowLeftRight, label: t("dashboard.quickActionTransfer") },
    { icon: UserPlus, label: t("dashboard.quickActionAddBeneficiary") },
    { icon: Download, label: t("dashboard.quickActionDownloadRIB") },
  ];

  const operations = [
    {
      icon: Building2,
      title: t("dashboard.operations.italianTransfer"),
      subtitle: t("dashboard.operations.italianBank"),
      date: "15 juillet 2022",
      time: "14:37",
      amount: 18750,
      positive: true,
    },
    {
      icon: Building2,
      title: t("dashboard.operations.italianTransfer"),
      subtitle: t("dashboard.operations.italianBank"),
      date: "15 janvier 2022",
      time: "09:18",
      amount: 18750,
      positive: true,
    },
    {
      icon: Building2,
      title: t("dashboard.operations.italianTransfer"),
      subtitle: t("dashboard.operations.italianBank"),
      date: "15 juillet 2021",
      time: "16:05",
      amount: 18750,
      positive: true,
    },
    {
      icon: Building2,
      title: t("dashboard.operations.italianTransfer"),
      subtitle: t("dashboard.operations.italianBank"),
      date: "15 janvier 2021",
      time: "10:42",
      amount: 18750,
      positive: true,
    },
    {
      icon: Building2,
      title: t("dashboard.operations.italianTransfer"),
      subtitle: t("dashboard.operations.italianBank"),
      date: "15 juillet 2020",
      time: "13:26",
      amount: 18750,
      positive: true,
    },
  ];

  return (
    <>
    <DesktopShell>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[26px] font-bold tracking-tight text-[#090927]">
              {t("dashboard.title")}
            </h1>
            <p className="mt-1 text-[14px] text-[#6B7280]">
              {t("dashboard.subtitle")}
            </p>
          </div>

          <p className="pt-1 text-[13px] text-[#6B7280]">
            {t("dashboard.lastLogin")}
          </p>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <Card className="relative col-span-5 overflow-hidden p-5 flex flex-col justify-between interactive-card">
            <div className="absolute left-0 top-0 h-full w-[4px] bg-[#9ACD00]" />

            <div className="flex items-start justify-between pl-1">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[14px] font-semibold text-[#090927]">
                    {t("dashboard.totalBalance")}
                  </p>
                  <span className="flex h-[16px] w-[16px] items-center justify-center rounded-full bg-[#F3F4F6] text-[10px] font-bold text-[#6B7280]">
                    ?
                  </span>
                </div>

                <p className="mt-4 text-[28px] font-bold tracking-tight text-[#050033]">
                  300.000,00 €
                </p>
                <p className="mt-0.5 text-[13px] text-[#6B7280]">
                  {t("dashboard.encours")} • 3 comptes
                </p>
              </div>

              <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-[#EEF7D8] text-[#050033]">
                <Wallet size={24} strokeWidth={1.8} />
              </div>
            </div>
          </Card>

          <Card className="col-span-3 p-5 flex flex-col justify-between interactive-card">
            <div>
              <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-[#050033] text-white">
                <Wallet size={18} />
              </div>

              <p className="mt-4 text-[14px] font-semibold text-[#090927]">
                {t("dashboard.currentAccount")}
              </p>
              <p className="mt-0.5 text-[11px] text-[#6B7280]">
                LU12 0019 1234 5678 9000
              </p>
            </div>

            <div className="mt-3 flex items-end justify-between">
              <div>
                <p className="text-[22px] font-bold text-[#050033]">
                  84.320,00 €
                </p>
                <p className="mt-0.5 text-[12px] text-[#6B7280]">{t("dashboard.available")}</p>
              </div>

              <Link href="/comptes" aria-label="Voir le compte courant" className="mb-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#050033] text-white interactive-link">
                <ChevronRight size={15} />
              </Link>
            </div>
          </Card>

          <Card className="col-span-4 p-5 flex flex-col justify-between interactive-card">
            <div>
              <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-[#050033] text-white">
                <PiggyBank size={18} />
              </div>

              <p className="mt-4 text-[14px] font-semibold text-[#090927]">
                {t("dashboard.savingsAccount")}
              </p>
              <p className="mt-0.5 text-[11px] text-[#6B7280]">
                LU34 0019 9876 5432 1000
              </p>
            </div>

            <div className="mt-3 flex items-end justify-between">
              <div>
                <p className="text-[22px] font-bold text-[#050033]">
                  185.680,00 €
                </p>
                <p className="mt-0.5 text-[12px] text-[#6B7280]">{t("dashboard.available")}</p>
              </div>

              <Link href="/comptes" aria-label="Voir le compte épargne" className="mb-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#050033] text-white interactive-link">
                <ChevronRight size={15} />
              </Link>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <Card className="col-span-7 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-bold text-[#090927]">
                  {t("dashboard.balanceEvolution")}
                  <span className="ml-1 text-[13px] font-normal text-[#6B7280]">
                    {t("dashboard.last30Days")}
                  </span>
                </h2>
              </div>

              <div className="flex items-center gap-1 text-[12px] font-semibold">
                <button type="button" onClick={() => setRange("7J")} className={`rounded px-2 py-1 ${range === "7J" ? "bg-[#050033] text-white" : "text-[#050033]"}`}>7J</button>
                <button type="button" onClick={() => setRange("30J")} className={`rounded px-2 py-1 ${range === "30J" ? "bg-[#050033] text-white" : "text-[#050033]"}`}>
                  30J
                </button>
                <button type="button" onClick={() => setRange("3M")} className={`rounded px-2 py-1 ${range === "3M" ? "bg-[#050033] text-white" : "text-[#050033]"}`}>3M</button>
                <button type="button" onClick={() => setRange("1A")} className={`rounded px-2 py-1 ${range === "1A" ? "bg-[#050033] text-white" : "text-[#050033]"}`}>1A</button>
              </div>
            </div>


            <div className="h-[185px]">
              <ClientOnlyChart>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#050033" stopOpacity={0.12} />
                        <stop offset="95%" stopColor="#050033" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#EEF0F3" />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} dy={10} />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: '#6B7280' }}
                      tickFormatter={(v) => `${Number(v / 1000).toFixed(0)}k€`}
                    />
                    <Tooltip
                      formatter={(value) => money(Number(value))}
                      labelStyle={{ color: "#050033" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="solde"
                      stroke="#050033"
                      strokeWidth={3}
                      fill="url(#balanceFill)"
                      activeDot={{ r: 5, fill: '#9ACD00', stroke: 'white', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ClientOnlyChart>
            </div>
          </Card>

          <Card className="col-span-5 p-5">
            <h2 className="text-[16px] font-bold text-[#090927]">
              {t("dashboard.quickActions")}
            </h2>

            <div className="mt-3 space-y-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => goQuickAction(action.label)}
                    className="flex h-[46px] w-full items-center justify-between rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-left interactive-button"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#050033] text-white">
                        <Icon size={16} />
                      </div>
                      <span className="text-[13px] font-semibold text-[#090927]">
                        {action.label}
                      </span>
                    </div>
                    <ChevronRight size={16} className="arrow-icon text-[#050033]" />
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <Card className="col-span-7 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-[#090927]">
                {t("dashboard.latestOperations")}
              </h2>
              <Link href="/operations" className="flex items-center gap-1 text-[13px] font-semibold text-[#050033] interactive-link">
                {t("dashboard.seeAll")}
                <ChevronRight size={14} className="arrow-icon" />
              </Link>
            </div>

            <div className="divide-y divide-[#E5E7EB]">
              {operations.map((operation, index) => {
                const Icon = operation.icon;
                return (
                  <button
                    key={`${operation.date}-${operation.time}-${operation.title}-${operation.amount}-${index}`}
                    type="button"
                    onClick={() => setModal({ title: operation.title, message: `${operation.subtitle} - ${signedMoney(operation.amount)} (${operation.date} à ${operation.time})` })}
                    className="grid w-full grid-cols-[40px_1fr_100px_100px] items-center gap-3 py-3 interactive-row"
                  >
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full ${
                        operation.positive
                          ? "bg-[#EEF7D8] text-[#7AA600]"
                          : "bg-[#F3F4F6] text-[#050033]"
                      }`}
                    >
                      <Icon size={18} />
                    </div>

                    <div>
                      <p className="text-[14px] font-semibold text-[#090927]">
                        {operation.title}
                      </p>
                      <p className="mt-0.5 text-[12px] text-[#6B7280]">
                        {operation.subtitle}
                      </p>
                    </div>

                    <p className="text-[12px] text-[#6B7280]">
                      {operation.date} · {operation.time}
                    </p>

                    <p
                      className={`text-right text-[15px] font-bold ${
                        operation.positive
                          ? "text-[#7AA600]"
                          : "text-[#050033]"
                      }`}
                    >
                      {signedMoney(operation.amount)}
                    </p>
                  </button>
                );
              })}
            </div>
          </Card>

          <div className="col-span-5 space-y-4">
            <Card className="p-5">
              <h2 className="text-[16px] font-bold text-[#090927]">
                {t("dashboard.savingsGoal")}
              </h2>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-[14px] font-semibold text-[#090927]">
                  {t("dashboard.vacations")}
                </p>
                <p className="text-[14px] font-bold text-[#7AA600]">
                  1 240,00 €{" "}
                  <span className="font-normal text-[#6B7280]">/ 2 500,00 €</span>
                </p>
              </div>

              <div className="mt-3 h-1.5 rounded-full bg-[#E5E7EB]">
                <div className="h-1.5 w-1/2 rounded-full bg-[#9ACD00]" />
              </div>

              <div className="mt-2 flex items-center justify-between text-[12px] text-[#6B7280]">
                <span>{t("dashboard.deadline")}</span>
                <span>50%</span>
              </div>

              <button type="button" onClick={() => router.push('/epargne')} className="mt-4 h-10 w-full rounded-[8px] border border-[#050033] text-[14px] font-semibold text-[#050033] interactive-button">
                {t("dashboard.manageGoals")}
              </button>
            </Card>

            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[16px] font-bold text-[#090927]">
                  {t("dashboard.notifications")}
                </h2>
                <button type="button" onClick={() => { setNotificationsRead(true); setToast('Notifications marquées comme lues.'); }} className="flex items-center gap-1 text-[13px] font-semibold text-[#050033] interactive-link">
                  {t("dashboard.markAllRead")}
                </button>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EEF7D8] text-[#7AA600]">
                  <ShieldCheck size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[14px] font-semibold text-[#090927]">
                      {t("dashboard.authSuccess")}
                    </p>
                    <span className="text-[11px] text-[#6B7280]">{t("dashboard.authSuccessTime")}</span>
                  </div>

                  <p className="mt-1 text-[13px] leading-[1.4] text-[#6B7280]">
                    {t("dashboard.authSuccessDesc1")}
                    <br />
                    {t("dashboard.authSuccessDesc2")}
                  </p>
                </div>

                <span className={`mt-2 h-2 w-2 rounded-full ${notificationsRead ? 'bg-[#D1D5DB]' : 'bg-[#9ACD00]'}`} />
              </div>

              <button type="button" onClick={() => router.push('/notifications')} className="mt-5 flex items-center justify-center gap-1 w-full text-center text-[13px] font-semibold text-[#050033] interactive-link">
                {t("dashboard.seeAllNotifications")}
                <ChevronRight size={14} className="arrow-icon" />
              </button>
            </Card>
          </div>
        </div>
      </div>
    </DesktopShell>
    <DemoModal open={Boolean(modal)} title={modal?.title ?? ''} message={modal?.message ?? ''} onClose={() => setModal(null)} />
    <DemoToast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </>
  );
}

export default DesktopDashboard;
