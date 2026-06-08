"use client";

import { useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  CircleDollarSign,
  Download,
  PiggyBank,
  Plus,
  ShieldCheck,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";

import MobileShell from "./MobileShell";
import DemoModal from "../shared/DemoModal";
import DemoToast from "../shared/DemoToast";

const products = [
  {
    title: "Compte épargne",
    balance: "185.680,00 €",
    subtitle: "Disponible",
    icon: PiggyBank,
    active: true,
  },
  {
    title: "Plan projet",
    balance: "2 160,00 €",
    subtitle: "Vacances été 2024",
    icon: Target,
    active: false,
  },
  {
    title: "Épargne avenir",
    balance: "4 850,00 €",
    subtitle: "Projection long terme",
    icon: Wallet,
    active: false,
  },
];

const movements = [
  {
    title: "Versement automatique",
    date: "24 mai 2024",
    amount: "+250,00 €",
    positive: true,
    icon: ArrowDown,
  },
  {
    title: "Transfert vers courant",
    date: "18 mai 2024",
    amount: "-120,00 €",
    positive: false,
    icon: ArrowUp,
  },
  {
    title: "Intérêts mensuels",
    date: "01 mai 2024",
    amount: "+12,84 €",
    positive: true,
    icon: CircleDollarSign,
  },
];

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

export function MobileSavings() {
  const [selectedProduct, setSelectedProduct] = useState(products[0].title);
  const [modal, setModal] = useState<null | "goal" | "edit" | "all">(null);
  const [toast, setToast] = useState("");

  return (
    <MobileShell>
      <div className="space-y-4">
        <section>
          <h1 className="text-[24px] font-bold tracking-tight text-[#090927]">
            Épargne
          </h1>
          <p className="mt-1 text-[14px] text-[#6B7280]">
            Suivez vos objectifs et vos versements.
          </p>
        </section>

        <MobileCard className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[14px] font-semibold text-[#6B7280]">
                Total épargne
              </p>

              <p className="mt-4 text-[32px] font-bold tracking-tight text-[#050033]">
                17 320,38 €
              </p>

              <p className="mt-1 text-[14px] text-[#6B7280]">
                Tous produits confondus
              </p>
            </div>

            <span className="mt-2 flex h-[62px] w-[62px] items-center justify-center rounded-full bg-[#EEF7D8] text-[#7AA600]">
              <TrendingUp size={28} />
            </span>
          </div>
        </MobileCard>

        <MobileCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[17px] font-bold text-[#090927]">
                Objectif principal
              </h2>
              <p className="mt-1 text-[13px] text-[#6B7280]">
                Vacances été 2024
              </p>
            </div>

            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EEF7D8] text-[#7AA600]">
              <Target size={21} />
            </span>
          </div>

          <div className="mt-4 flex items-end justify-between">
            <p className="text-[24px] font-bold text-[#050033]">
              2 160,00 €
            </p>
            <p className="text-[14px] text-[#6B7280]">/ 3 000,00 €</p>
          </div>

          <div className="mt-3 h-2 rounded-full bg-[#E5E7EB]">
            <div className="h-2 w-[72%] rounded-full bg-[#9ACD00]" />
          </div>

          <div className="mt-2 flex justify-between text-[12px] text-[#6B7280]">
            <span>Échéance : 31 juillet</span>
            <span>72%</span>
          </div>
        </MobileCard>

        <MobileCard className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[17px] font-bold text-[#090927]">
              Produits d’épargne
            </h2>

            <button
              type="button"
              onClick={() => setModal("goal")}
              className="flex h-8 items-center gap-1 rounded-[8px] bg-[#050033] px-3 text-[12px] font-bold text-white"
            >
              <Plus size={14} />
              Objectif
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {products.map((product) => {
              const Icon = product.icon;

              return (
                <button
                  key={product.title}
                  type="button"
                  onClick={() => setSelectedProduct(product.title)}
                  className={`min-w-[210px] rounded-[14px] border p-4 text-left ${
                    selectedProduct === product.title
                      ? "border-2 border-[#9ACD00] bg-white"
                      : "border-[#E5E7EB] bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-[10px] ${
                        product.active
                          ? "bg-[#050033] text-white"
                          : "bg-[#F3F4F6] text-[#050033]"
                      }`}
                    >
                      <Icon size={20} />
                    </span>

                    <span className="min-w-0">
                      <span className="block truncate text-[14px] font-bold text-[#090927]">
                        {product.title}
                      </span>
                      <span className="mt-1 block text-[12px] text-[#6B7280]">
                        {product.subtitle}
                      </span>
                    </span>
                  </div>

                  <p className="mt-3 text-[20px] font-bold text-[#050033]">
                    {product.balance}
                  </p>
                </button>
              );
            })}
          </div>
        </MobileCard>

        <MobileCard className="p-4">
          <h2 className="text-[17px] font-bold text-[#090927]">
            Versement programmé
          </h2>

          <button type="button" onClick={() => setModal("edit")} className="w-full mt-4 flex items-center justify-between rounded-[14px] bg-[#F6F7F9] p-3 text-left interactive-button">
            <div>
              <p className="text-[13px] text-[#6B7280]">Mensuel</p>
              <p className="mt-1 text-[22px] font-bold text-[#050033]">
                250,00 €
              </p>
              <p className="mt-1 text-[12px] text-[#6B7280]">
                Prochain : 1 juin 2024
              </p>
            </div>

            <ChevronRight size={21} className="arrow-icon text-[#050033]" />
          </button>
        </MobileCard>

        <MobileCard className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[17px] font-bold text-[#090927]">
              Mouvements récents
            </h2>

            <button
              type="button"
              onClick={() => setModal("all")}
              className="text-[14px] font-semibold text-[#7AA600]"
            >
              Voir tout
            </button>
          </div>

          {movements.map((movement) => {
            const Icon = movement.icon;

            return (
              <div
                key={movement.title}
                className="flex items-center gap-3 border-b border-[#E5E7EB] py-3.5 last:border-0"
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
                  <p className="truncate text-[14px] font-bold text-[#090927]">
                    {movement.title}
                  </p>
                  <p className="mt-1 text-[12px] text-[#6B7280]">
                    {movement.date}
                  </p>
                </div>

                <p
                  className={`text-[14px] font-bold ${
                    movement.positive ? "text-[#7AA600]" : "text-[#050033]"
                  }`}
                >
                  {movement.amount}
                </p>
              </div>
            );
          })}
        </MobileCard>

        <MobileCard className="p-4">
          <h2 className="text-[17px] font-bold text-[#090927]">
            Conseil épargne
          </h2>

          <div className="mt-3 flex gap-3 rounded-[14px] bg-[#F6F7F9] p-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEF7D8] text-[#7AA600]">
              <ShieldCheck size={20} />
            </span>

            <div>
              <p className="text-[14px] font-bold text-[#090927]">
                Objectif atteignable
              </p>
              <p className="mt-1 text-[13px] leading-[1.4] text-[#6B7280]">
                Votre objectif devrait être atteint à temps avec le versement
                actuel.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setToast("Recapitulatif telecharge ")}
            className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-[10px] border border-[#050033] text-[14px] font-semibold text-[#050033]"
          >
            Télécharger le récapitulatif
            <Download size={15} />
          </button>
        </MobileCard>
      </div>
      <DemoModal open={modal === "goal"} title="Creer un objectif" message="Création d’un nouvel objectif d’épargne." onClose={() => setModal(null)} onConfirm={() => { setModal(null); setToast("Objectif cree "); }} />
      <DemoModal open={modal === "edit"} title="Modifier le versement" message="Le versement programmé est mis à jour." onClose={() => setModal(null)} onConfirm={() => { setModal(null); setToast("Versement modifie "); }} />
      <DemoModal open={modal === "all"} title="Tous les mouvements" message="Historique complet des mouvements ouvert." onClose={() => setModal(null)} />
      <DemoToast open={Boolean(toast)} message={toast} onClose={() => setToast("")} />
    </MobileShell>
  );
}

export default MobileSavings;
