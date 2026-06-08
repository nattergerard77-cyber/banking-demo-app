"use client";

import { useMemo, useState, type ReactNode } from "react";
import ClientOnlyChart from "../shared/ClientOnlyChart";
import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  CircleDollarSign,
  Download,
  Leaf,
  PiggyBank,
  Plus,
  ShieldCheck,
  Target,
  TrendingUp,
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

import DesktopShell from "./DesktopShell";
import DemoModal from "../shared/DemoModal";
import DemoToast from "../shared/DemoToast";

const chartData = [
  { month: "Janv.", value: 145000 },
  { month: "Févr.", value: 152000 },
  { month: "Mars", value: 160500 },
  { month: "Avr.", value: 169000 },
  { month: "Mai", value: 177500 },
  { month: "Juin", value: 185680 },
];

const products = [
  {
    title: "Compte épargne",
    subtitle: "Épargne disponible à tout moment",
    balance: "185.680,00 €",
    rate: "1,25 %",
    icon: PiggyBank,
    active: true,
  },
  {
    title: "Plan projet",
    subtitle: "Objectif vacances été 2024",
    balance: "2 160,00 €",
    rate: "72 %",
    icon: Target,
    active: false,
  },
  {
    title: "Épargne avenir",
    subtitle: "Projection long terme",
    balance: "4 850,00 €",
    rate: "2,10 %",
    icon: Leaf,
    active: false,
  },
];

const movements = [
  {
    title: "Versement automatique",
    date: "24 mai 2024",
    amount: "+ 250,00 €",
    positive: true,
    icon: ArrowDown,
  },
  {
    title: "Transfert vers compte courant",
    date: "18 mai 2024",
    amount: "- 120,00 €",
    positive: false,
    icon: ArrowUp,
  },
  {
    title: "Intérêts mensuels",
    date: "01 mai 2024",
    amount: "+ 12,84 €",
    positive: true,
    icon: CircleDollarSign,
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


export function DesktopSavings() {
  const [selectedProduct, setSelectedProduct] = useState(products[0].title);
  const [period, setPeriod] = useState<"3M" | "6M" | "1A">("6M");
  const [modal, setModal] = useState<null | "goal" | "edit" | "all">(null);
  const [toast, setToast] = useState("");
  const visibleData = useMemo(() => {
    if (period === "3M") return chartData.slice(-3);
    if (period === "1A") return [...chartData, ...chartData];
    return chartData;
  }, [period]);

  return (
    <DesktopShell>
      <div className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[26px] font-bold tracking-tight text-[#090927]">
              Épargne
            </h1>
            <p className="mt-1 text-[15px] text-[#6B7280]">
              Suivez vos objectifs et organisez votre épargne.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModal("goal")}
            className="flex h-10 items-center gap-2 rounded-[10px] bg-[#050033] px-4 text-[14px] font-bold text-white"
          >
            <Plus size={16} />
            Créer un objectif
          </button>
        </div>

        <div className="grid grid-cols-12 gap-5">
          <Card className="col-span-5 relative overflow-hidden p-5">
            <div className="absolute left-0 top-0 h-full w-[4px] bg-[#9ACD00]" />

            <div className="flex items-start justify-between">
              <div>
                <p className="text-[14px] font-bold text-[#090927]">
                  Total épargne
                </p>
                <p className="mt-5 text-[32px] font-bold text-[#050033]">
                  17 320,38 €
                </p>
                <p className="mt-1 text-[13px] text-[#6B7280]">
                  Tous produits confondus
                </p>
              </div>

              <span className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[#EEF7D8] text-[#7AA600]">
                <PiggyBank size={28} />
              </span>
            </div>

            <div className="mt-5 flex items-center gap-2 rounded-[12px] bg-[#F6F7F9] p-3">
              <TrendingUp size={18} className="text-[#7AA600]" />
              <p className="text-[13px] font-semibold text-[#090927]">
                + 512,84 € ce mois-ci
              </p>
            </div>
          </Card>

          <Card className="col-span-4 p-5">
            <h2 className="text-[18px] font-bold text-[#090927]">
              Objectif principal
            </h2>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-[#090927]">Vacances été 2024</p>
                <p className="mt-1 text-[13px] text-[#6B7280]">
                  Échéance : 31 juillet 2024
                </p>
              </div>

              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EEF7D8] text-[#7AA600]">
                <Target size={22} />
              </span>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <p className="text-[22px] font-bold text-[#050033]">
                2 160,00 €
              </p>
              <p className="text-[14px] font-semibold text-[#6B7280]">
                / 3 000,00 €
              </p>
            </div>

            <div className="mt-3 h-2 rounded-full bg-[#E5E7EB]">
              <div className="h-2 w-[72%] rounded-full bg-[#9ACD00]" />
            </div>

            <div className="mt-2 flex justify-between text-[12px] text-[#6B7280]">
              <span>Progression</span>
              <span>72%</span>
            </div>
          </Card>

          <Card className="col-span-3 p-5">
            <h2 className="text-[18px] font-bold text-[#090927]">
              Versement programmé
            </h2>

            <div className="mt-5 rounded-[14px] bg-[#F6F7F9] p-4">
              <p className="text-[13px] text-[#6B7280]">Mensuel</p>
              <p className="mt-2 text-[24px] font-bold text-[#050033]">
                250,00 €
              </p>
              <p className="mt-2 text-[12px] text-[#6B7280]">
                Prochain versement : 1 juin 2024
              </p>
            </div>

            <button
              type="button"
              onClick={() => setModal("edit")}
              className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-[9px] border border-[#050033] text-[14px] font-semibold text-[#050033]"
            >
              Modifier
              <ChevronRight size={16} />
            </button>
          </Card>
        </div>

        <div className="grid grid-cols-12 gap-5">
          <Card className="col-span-7 p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[18px] font-bold text-[#090927]">
                Progression de l’épargne
              </h2>

              <div className="flex gap-2 text-[13px] font-semibold">
                <button type="button" onClick={() => setPeriod("3M")} className={`rounded px-3 py-1 ${period === "3M" ? "bg-[#050033] text-white" : "text-[#050033]"}`}>3M</button>
                <button type="button" onClick={() => setPeriod("6M")} className={`rounded px-3 py-1 ${period === "6M" ? "bg-[#050033] text-white" : "text-[#050033]"}`}>6M</button>
                <button type="button" onClick={() => setPeriod("1A")} className={`rounded px-3 py-1 ${period === "1A" ? "bg-[#050033] text-white" : "text-[#050033]"}`}>1A</button>
              </div>
            </div>

            <div className="h-[250px]">
              <ClientOnlyChart>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={visibleData}>
                    <defs>
                      <linearGradient
                        id="savingFill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="5%" stopColor="#9ACD00" stopOpacity={0.22} />
                        <stop offset="95%" stopColor="#9ACD00" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#EEF0F3" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `${Number(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#050033"
                      strokeWidth={3}
                      fill="url(#savingFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ClientOnlyChart>
            </div>
          </Card>

          <Card className="col-span-5 p-5">
            <h2 className="text-[18px] font-bold text-[#090927]">
              Produits d’épargne
            </h2>

            <div className="mt-4 space-y-3">
              {products.map((product) => {
                const Icon = product.icon;

                return (
                  <button
                    key={product.title}
                    type="button"
                    onClick={() => setSelectedProduct(product.title)}
                    className={`flex w-full items-center justify-between rounded-[14px] border p-3 text-left ${
                      selectedProduct === product.title
                        ? "border-[#9ACD00] bg-[#FBFFF1]"
                        : "border-[#E5E7EB] bg-white"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#050033] text-white">
                        <Icon size={20} />
                      </span>
                      <span>
                        <span className="block text-[14px] font-bold text-[#090927]">
                          {product.title}
                        </span>
                        <span className="mt-1 block text-[12px] text-[#6B7280]">
                          {product.balance}
                        </span>
                      </span>
                    </span>

                    <ChevronRight size={17} className="text-[#050033]" />
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-12 gap-5">
          <Card className="col-span-7 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[18px] font-bold text-[#090927]">
                Mouvements récents
              </h2>

              <button
                type="button"
                onClick={() => setModal("all")}
                className="text-[14px] font-semibold text-[#050033] underline"
              >
                Voir tout
              </button>
            </div>

            <div className="divide-y divide-[#E5E7EB]">
              {movements.map((movement) => {
                const Icon = movement.icon;

                return (
                  <div
                    key={movement.title}
                    className="flex items-center gap-4 py-3.5"
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        movement.positive
                          ? "bg-[#EEF7D8] text-[#7AA600]"
                          : "bg-[#F3F4F6] text-[#050033]"
                      }`}
                    >
                      <Icon size={20} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[#090927]">
                        {movement.title}
                      </p>
                      <p className="mt-1 text-[13px] text-[#6B7280]">
                        {movement.date}
                      </p>
                    </div>

                    <p
                      className={`text-[15px] font-bold ${
                        movement.positive ? "text-[#7AA600]" : "text-[#050033]"
                      }`}
                    >
                      {movement.amount}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="col-span-5 p-5">
            <h2 className="text-[18px] font-bold text-[#090927]">
              Conseil épargne
            </h2>

            <div className="mt-4 rounded-[16px] bg-[#F6F7F9] p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEF7D8] text-[#7AA600]">
                  <ShieldCheck size={20} />
                </span>

                <div>
                  <p className="text-[14px] font-bold text-[#090927]">
                    Objectif atteignable
                  </p>
                  <p className="mt-2 text-[13px] leading-[1.45] text-[#6B7280]">
                    En conservant votre versement mensuel actuel, votre objectif
                    Vacances été 2024 devrait être atteint à temps.
                  </p>
                </div>
              </div>
            </div>

              <button
                type="button"
                onClick={() => setToast("Recapitulatif telecharge ")}
                className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-[9px] border border-[#050033] text-[14px] font-semibold text-[#050033]"
              >
              Télécharger le récapitulatif
              <Download size={16} />
            </button>
          </Card>
        </div>
      </div>
      <DemoModal open={modal === "goal"} title="Creer un objectif" message="Création d’un nouvel objectif d’épargne." onClose={() => setModal(null)} onConfirm={() => { setModal(null); setToast("Objectif cree "); }} />
      <DemoModal open={modal === "edit"} title="Modifier le versement" message="Le versement programmé est mis à jour." onClose={() => setModal(null)} onConfirm={() => { setModal(null); setToast("Versement modifie "); }} />
      <DemoModal open={modal === "all"} title="Tous les mouvements" message="Affichage complet des mouvements d’épargne." onClose={() => setModal(null)} />
      <DemoToast open={Boolean(toast)} message={toast} onClose={() => setToast("")} />
    </DesktopShell>
  );
}

export default DesktopSavings;
