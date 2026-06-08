"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  FileText,
  Filter,
  MoreVertical,
  Users,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Link from "next/link";
import ClientOnlyChart from "../shared/ClientOnlyChart";
import DemoModal from "../shared/DemoModal";
import DemoToast from "../shared/DemoToast";

import DesktopShell from "./DesktopShell";

const accounts = [
  {
    name: "Compte courant",
    iban: "LU12 0019 1234 5678 9000",
    balance: "84.320,00 €",
    active: true,
    icon: Wallet,
  },
  {
    name: "Compte épargne",
    iban: "LU34 0019 9876 5432 1000",
    balance: "185.680,00 €",
    active: false,
    icon: Wallet,
  },
  {
    name: "Compte joint",
    iban: "LU78 0019 2468 1357 9000",
    balance: "30.000,00 €",
    active: false,
    icon: Users,
  },
];

const cashflow = [
  { month: "Janv.", Encaissements: 1250, Décaissements: -420 },
  { month: "Févr.", Encaissements: 2250, Décaissements: -1620 },
  { month: "Mars", Encaissements: 2400, Décaissements: -920 },
  { month: "Avr.", Encaissements: 760, Décaissements: -2260 },
  { month: "Mai", Encaissements: 1520, Décaissements: -1380 },
  { month: "Juin", Encaissements: 2620, Décaissements: 0 },
];

const transactions = [
  {
    date: "15 juillet 2022",
    time: "14:37",
    label: "Virement reçu — Compte italien",
    category: "Virement international",
    amount: "+ 18.750,00 €",
    positive: true,
    icon: ArrowDown,
  },
  {
    date: "15 janvier 2022",
    time: "09:18",
    label: "Virement reçu — Compte italien",
    category: "Virement international",
    amount: "+ 18.750,00 €",
    positive: true,
    icon: ArrowDown,
  },
  {
    date: "15 juillet 2021",
    time: "16:05",
    label: "Virement reçu — Compte italien",
    category: "Virement international",
    amount: "+ 18.750,00 €",
    positive: true,
    icon: ArrowDown,
  },
  {
    date: "15 janvier 2021",
    time: "10:42",
    label: "Virement reçu — Compte italien",
    category: "Virement international",
    amount: "+ 18.750,00 €",
    positive: true,
    icon: ArrowDown,
  },
  {
    date: "15 juillet 2020",
    time: "13:26",
    label: "Virement reçu — Compte italien",
    category: "Virement international",
    amount: "+ 18.750,00 €",
    positive: true,
    icon: ArrowDown,
  },
];

function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[18px] border border-[#E5E7EB] bg-white shadow-[0_14px_34px_rgba(5,0,51,0.06)] ${className}`}
    >
      {children}
    </div>
  );
}

function AccountCard({
  account,
  active,
  onSelect,
}: {
  account: (typeof accounts)[number];
  active: boolean;
  onSelect: () => void;
}) {
  const Icon = account.icon;

  return (
    <Card
      className={`relative overflow-hidden p-4 interactive-card ${
        active ? "ring-1 ring-[#050033]" : ""
      }`}
    >
      {active && (
        <div className="absolute left-0 top-0 h-full w-[4px] bg-[#9ACD00]" />
      )}

      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[9px] bg-[#050033] text-white">
            <Icon size={21} />
          </div>

          <div>
            <h3 className="text-[15px] font-bold text-[#090927]">
              {account.name}
            </h3>
            <p className="mt-0.5 text-[12px] text-[#6B7280]">{account.iban}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onSelect}
          className="mt-6 flex h-7 w-7 items-center justify-center rounded-full bg-[#050033] text-white interactive-button"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      <p className="mt-4 text-[23px] font-bold tracking-tight text-[#050033]">
        {account.balance}
      </p>
      <p className="mt-0.5 text-[12px] text-[#6B7280]">Disponible</p>
    </Card>
  );
}

function StatItem({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F4F6] text-[#050033]">
        {icon}
      </div>
      <p className="mt-2 text-[14px] font-bold text-[#050033]">{value}</p>
      <p className="mt-0.5 text-[11px] text-[#6B7280]">{label}</p>
    </div>
  );
}

export function DesktopAccounts() {
  const [selectedAccount, setSelectedAccount] = useState(accounts[0].name);
  const [selectedFilter, setSelectedFilter] = useState("Tous les comptes");
  const [modal, setModal] = useState<{ title: string; message: string } | null>(null);
  const [toast, setToast] = useState("");
  const account = useMemo(
    () => accounts.find((item) => item.name === selectedAccount) ?? accounts[0],
    [selectedAccount],
  );

  return (
    <>
    <DesktopShell>
      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[26px] font-bold tracking-tight text-[#090927]">
              Mes comptes
            </h1>
            <p className="mt-1 text-[14px] text-[#6B7280]">
              Retrouvez l&apos;ensemble de vos comptes et suivez leur activité.
            </p>
          </div>

          <p className="text-[13px] text-[#6B7280]">
            Dernière connexion : aujourd&apos;hui à 09:15
          </p>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {accounts.map((account) => (
            <AccountCard key={account.name} account={account} active={selectedAccount === account.name} onSelect={() => setSelectedAccount(account.name)} />
          ))}
        </div>

        <div className="grid grid-cols-12 gap-4">
          <Card className="col-span-7 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-[#090927]">
                Détails du {account.name.toLowerCase()}
              </h2>

              <button
                type="button"
                onClick={() => setModal({ title: account.name, message: `Détail du compte pour ${account.name} (${account.iban}).` })}
                className="flex h-8 items-center gap-2 rounded-[8px] border border-[#050033] px-3 text-[12px] font-semibold text-[#050033]"
              >
                Voir les détails du compte
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-[240px_1fr] gap-5">
              <div>
                <div className="flex items-center gap-2 text-[13px] font-semibold text-[#090927]">
                  Solde disponible
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#F3F4F6] text-[10px]">
                    ?
                  </span>
                </div>

                <p className="mt-2 text-[26px] font-bold text-[#050033]">
                  {account.balance}
                </p>

                <div className="mt-4 space-y-3 text-[13px]">
                  <div>
                    <p className="text-[#6B7280]">IBAN</p>
                    <p className="mt-0.5 font-semibold text-[#090927]">
                      {account.iban}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#6B7280]">Titulaire du compte</p>
                    <p className="mt-0.5 font-semibold text-[#090927]">
                      Frederico Di Mario
                    </p>
                  </div>
                  <div>
                    <p className="text-[#6B7280]">Type de compte</p>
                    <p className="mt-0.5 font-semibold text-[#090927]">
                      {account.name}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-l border-[#E5E7EB] pl-5">
                <div className="mb-5 flex items-center gap-2 text-[13px] font-semibold text-[#090927]">
                  Statistiques
                  <span className="font-normal text-[#6B7280]">
                    (30 derniers jours)
                  </span>
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#F3F4F6] text-[10px]">
                    ?
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <StatItem
                    icon={<ArrowDown size={20} className="text-[#7AA600]" />}
                    value="1 250,00 €"
                    label="Encaissements"
                  />
                  <StatItem
                    icon={<ArrowUp size={20} />}
                    value="2 140,50 €"
                    label="Décaissements"
                  />
                  <StatItem
                    icon={<ArrowDown size={20} />}
                    value="-890,50 €"
                    label="Solde net"
                  />
                  <StatItem icon={<span className="text-lg">%</span>} value="-22%" label="vs 30 jours" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="col-span-5 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-[#090927]">
                Flux de trésorerie mensuel
              </h2>
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#050033] text-[10px] text-white">
                ?
              </span>
            </div>

            <div className="h-[195px]">
              <ClientOnlyChart>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cashflow}>
                    <CartesianGrid vertical={false} stroke="#EEF0F3" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11 }}
                      tickFormatter={(value) => `${value} €`}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Encaissements" fill="#9ACD00" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Décaissements" fill="#050033" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ClientOnlyChart>
            </div>

            <button
              type="button"
              onClick={() => setModal({ title: 'Analyse détaillée', message: 'Analyse détaillée disponible.' })}
              className="mt-2 flex h-9 w-full items-center justify-center gap-2 rounded-[8px] border border-[#050033] text-[13px] font-semibold text-[#050033]"
            >
              Voir l&apos;analyse détaillée
              <ChevronRight size={14} />
            </button>
          </Card>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <Card className="col-span-7 p-4">
            <h2 className="text-[16px] font-bold text-[#090927]">
              Historique des opérations
            </h2>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {["Tous les comptes", "24/04/2024 → 24/05/2024", "Toutes catégories"].map(
                (filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setSelectedFilter(filter)}
                    className={`flex h-8 items-center gap-1.5 rounded-[7px] border px-3 text-[12px] font-semibold ${selectedFilter === filter ? 'border-[#050033] bg-[#050033] text-white' : 'border-[#E5E7EB] text-[#050033]'}`}
                  >
                    {filter}
                    {filter.includes("2024") ? (
                      <CalendarDays size={13} />
                    ) : (
                      <ChevronDown size={13} />
                    )}
                  </button>
                ),
              )}

              <button
                type="button"
                onClick={() => setModal({ title: 'Filtres', message: 'Filtres avancés disponibles.' })}
                className="ml-auto flex h-8 items-center gap-1.5 rounded-[7px] border border-[#050033] px-3 text-[12px] font-semibold text-[#050033]"
              >
                Filtres
                <Filter size={13} />
              </button>
            </div>

            <div className="mt-4 overflow-hidden rounded-[12px] border border-[#E5E7EB]">
              <div className="grid grid-cols-[100px_1fr_120px_110px_60px] bg-[#F9FAFB] px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-[#6B7280]">
                <span>Date</span>
                <span>Libellé</span>
                <span>Catégorie</span>
                <span className="text-right">Montant</span>
                <span className="text-right">Statut</span>
              </div>

              {transactions.map((transaction, index) => {
                const Icon = transaction.icon;

                return (
                  <div
                    key={`${transaction.date}-${transaction.time}-${transaction.label}-${transaction.amount}-${index}`}
                    className="grid grid-cols-[100px_1fr_120px_110px_60px] items-center border-t border-[#E5E7EB] px-3 py-2.5 text-[13px] interactive-row"
                  >
                    <span className="text-[#6B7280]">{transaction.date} · {transaction.time}</span>

                    <span className="font-semibold text-[#090927]">
                      {transaction.label}
                    </span>

                    <span className="flex items-center gap-1.5 text-[#6B7280]">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F3F4F6] text-[#050033]">
                        <Icon size={13} />
                      </span>
                      {transaction.category}
                    </span>

                    <span
                      className={`text-right font-bold ${
                        transaction.positive ? "text-[#7AA600]" : "text-[#050033]"
                      }`}
                    >
                      {transaction.amount}
                    </span>

                    <span className="flex items-center justify-end gap-2">
                      <CheckCircle2 size={15} className="text-[#7AA600]" />
                      <MoreVertical size={15} className="text-[#050033]" />
                    </span>
                  </div>
                );
              })}
            </div>

              <Link
              href="/operations"
              className="mx-auto mt-3 flex items-center gap-1 text-[13px] font-semibold text-[#050033] interactive-link"
            >
              Voir toutes les opérations
              <ChevronRight size={14} className="arrow-icon" />
            </Link>
          </Card>

          <div className="col-span-5 space-y-4">
            <Card className="p-4">
              <h2 className="text-[16px] font-bold text-[#090927]">
                Résumé du compte
              </h2>
              <p className="mt-0.5 text-[12px] text-[#6B7280]">
                Période : 24 avr. — 24 mai 2024
              </p>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EEF7D8] text-[#7AA600]">
                      <ArrowDown size={16} />
                    </span>
                    <span className="text-[14px] font-semibold text-[#090927]">
                      Total encaissements
                    </span>
                  </div>
                  <span className="text-[14px] font-bold text-[#7AA600]">+ 1 250,00 €</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F4F6] text-[#050033]">
                      <ArrowUp size={16} />
                    </span>
                    <span className="text-[14px] font-semibold text-[#090927]">
                      Total décaissements
                    </span>
                  </div>
                  <span className="text-[14px] font-bold text-[#050033]">- 2 140,50 €</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h2 className="text-[16px] font-bold text-[#090927]">
                Relevés de compte
              </h2>

              <div className="mt-3 divide-y divide-[#E5E7EB]">
                {["Mai 2024", "Avril 2024", "Mars 2024"].map((month) => (
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

                    <span className="flex items-center gap-2 text-[12px] text-[#6B7280]">
                      <Download size={15} />
                      PDF
                    </span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setModal({ title: 'Tous les relevés', message: 'Liste complète des relevés disponible.' })}
                className="mx-auto mt-3 flex items-center gap-2 text-[13px] font-semibold text-[#050033] underline"
              >
                Voir tous les relevés
                <ChevronRight size={14} />
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

export default DesktopAccounts;
