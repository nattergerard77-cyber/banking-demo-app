"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import {
  Ban,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Globe2,
  LockKeyhole,
  MoreVertical,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  Snowflake,
  Wifi,
} from "lucide-react";

import DesktopShell from "./DesktopShell";
import DemoModal from "../shared/DemoModal";
import DemoSwitch from "../shared/DemoSwitch";
import DemoToast from "../shared/DemoToast";

const cardTransactions = [
  {
    merchant: "Paiement carte — Station-service",
    date: "24 mai 2024",
    category: "Carburant",
    amount: "- 64,30 €",
    icon: CreditCard,
  },
  {
    merchant: "Paiement carte — Supermarché",
    date: "23 mai 2024",
    category: "Courses",
    amount: "- 58,73 €",
    icon: ReceiptText,
  },
  {
    merchant: "Retrait DAB — Luxembourg",
    date: "21 mai 2024",
    category: "Retrait",
    amount: "- 120,00 €",
    icon: CreditCard,
  },
  {
    merchant: "Paiement carte — Restaurant",
    date: "19 mai 2024",
    category: "Restaurant",
    amount: "- 86,20 €",
    icon: ReceiptText,
  },
];

function CardBox({
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

function BankCardVisual() {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div>
      {/* Flip container */}
      <button
        type="button"
        aria-label="Retourner la carte bancaire"
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full cursor-pointer bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9ACD00] rounded-[22px] interactive-card"
        style={{ perspective: "1200px" }}
      >
        <div
          style={{
            position: "relative",
            height: "260px",
            transformStyle: "preserve-3d",
            transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* RECTO */}
          <div
            style={{ backfaceVisibility: "hidden", position: "absolute", inset: 0 }}
            className="overflow-hidden rounded-[22px] bg-[#050033] p-6 text-white shadow-[0_22px_50px_rgba(5,0,51,0.22)]"
          >
            <div className="absolute -right-14 -top-16 h-44 w-44 rounded-full bg-white/10" />
            <div className="absolute -bottom-20 right-10 h-48 w-48 rounded-full bg-[#9ACD00]/20" />

            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-[13px] font-medium text-white/70">Raiffeisen</p>
                <p className="mt-1 text-[20px] font-bold">Visa Premium</p>
              </div>
              <Wifi size={26} className="rotate-90 text-[#9ACD00]" />
            </div>

            <div className="relative z-10 mt-12">
              <p className="text-[22px] font-semibold tracking-[0.16em]">
                •••• •••• •••• 2450
              </p>
              <div className="mt-8 flex items-end justify-between">
                <div>
                  <p className="text-[10px] uppercase text-white/50">Titulaire</p>
                  <p className="mt-1 text-[14px] font-semibold">Frederico Di Mario</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-white/50">Expire</p>
                  <p className="mt-1 text-[14px] font-semibold">09/28</p>
                </div>
              </div>
            </div>
          </div>

          {/* VERSO */}
          <div
            style={{
              backfaceVisibility: "hidden",
              position: "absolute",
              inset: 0,
              transform: "rotateY(180deg)",
            }}
            className="overflow-hidden rounded-[22px] bg-[#050033] text-white shadow-[0_22px_50px_rgba(5,0,51,0.22)]"
          >
            <div className="absolute -left-10 -top-10 h-36 w-36 rounded-full bg-white/5" />
            <div className="absolute -bottom-16 right-6 h-40 w-40 rounded-full bg-[#9ACD00]/15" />

            {/* Bande magnétique */}
            <div className="h-12 w-full bg-[#0a0045] mt-7" />

            <div className="relative z-10 px-6 pt-4">
              {/* Zone signature */}
              <div className="flex items-center gap-3">
                <div className="flex-1 rounded-[6px] bg-white/20 px-3 py-2">
                  <p className="text-[10px] uppercase text-white/50 mb-1">Signature</p>
                  <div className="h-[1px] w-full bg-white/20" />
                  <div className="h-[1px] w-full bg-white/10 mt-1" />
                </div>
                {/* CVV */}
                <div className="rounded-[8px] bg-white/10 px-4 py-2 text-center">
                  <p className="text-[10px] uppercase text-white/50">CVV</p>
                  <p className="text-[18px] font-bold tracking-widest text-white">•••</p>
                </div>
              </div>

              {/* Infos bas */}
              <div className="mt-6 flex items-end justify-between">
                <div>
                  <p className="text-[11px] font-bold text-white/70">Raiffeisen</p>
                  <p className="mt-1 text-[10px] text-white/40">Visa Premium</p>
                </div>
                <Wifi size={20} className="rotate-90 text-[#9ACD00]/60" />
              </div>

              <p className="mt-3 text-[10px] leading-[1.4] text-white/30">
                Carte principale
              </p>
            </div>
          </div>
        </div>
      </button>

      <p className="mt-3 text-center text-[12px] text-[#6B7280]">
        Cliquez sur la carte pour voir le verso.
      </p>
    </div>
  );
}

function LimitBar({
  label,
  used,
  total,
  percent,
}: {
  label: string;
  used: string;
  total: string;
  percent: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-[13px]">
        <span className="font-semibold text-[#090927]">{label}</span>
        <span className="text-[#6B7280]">
          {used} / {total}
        </span>
      </div>

      <div className="mt-2 h-2 rounded-full bg-[#E5E7EB]">
        <div
          className="h-2 rounded-full bg-[#9ACD00]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function SettingToggle({
  icon,
  title,
  description,
  active,
  onChange,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  active: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-[14px] border border-[#E5E7EB] bg-white p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6] text-[#050033]">
          {icon}
        </span>

        <div>
          <p className="text-[14px] font-bold text-[#090927]">{title}</p>
          <p className="mt-1 text-[12px] text-[#6B7280]">{description}</p>
        </div>
      </div>

      <DemoSwitch checked={active} onChange={onChange} label={title} />
    </div>
  );
}

export function DesktopCards() {
  const [toast, setToast] = useState("");
  const [paymentOptions, setPaymentOptions] = useState({
    sansContact: true,
    etranger: true,
    internet: true,
  });
  const [activeModal, setActiveModal] = useState<null | "limits" | "freeze" | "oppose" | "all">(null);
  const showToast = (message: string) => setToast(message);

  return (
    <DesktopShell>
      <div className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[26px] font-bold tracking-tight text-[#090927]">
              Mes cartes
            </h1>
            <p className="mt-1 text-[15px] text-[#6B7280]">
              Gérez vos cartes, plafonds et options de paiement.
            </p>
          </div>

          <p className="text-[13px] text-[#6B7280]">
            Dernière connexion : aujourd&apos;hui à 09:15
          </p>
        </div>

        {/* Ligne 1 */}
        <div className="grid grid-cols-12 gap-5">
          <CardBox className="col-span-5 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-bold text-[#090927]">
                Carte principale
              </h2>

              <span className="flex items-center gap-2 rounded-full bg-[#EEF7D8] px-3 py-1.5 text-[12px] font-semibold text-[#050033]">
                <CheckCircle2 size={14} className="text-[#7AA600]" />
                Active
              </span>
            </div>

            <div className="mt-5">
              <BankCardVisual />
            </div>
          </CardBox>

          <CardBox className="col-span-4 p-5 flex flex-col">
            <h2 className="text-[18px] font-bold text-[#090927]">
              Plafonds disponibles
            </h2>

            <div className="mt-5 space-y-5 flex-1">
              <LimitBar
                label="Paiements"
                used="1 240,00 €"
                total="3 000,00 €"
                percent={41}
              />
              <LimitBar
                label="Retraits"
                used="320,00 €"
                total="1 000,00 €"
                percent={32}
              />
              <LimitBar
                label="Internet"
                used="420,00 €"
                total="1 500,00 €"
                percent={28}
              />
            </div>

            <button
              type="button"
              onClick={() => setActiveModal("limits")}
              className="mt-6 flex h-10 w-full items-center justify-center gap-2 rounded-[9px] border border-[#050033] text-[14px] font-semibold text-[#050033] interactive-button"
            >
              Modifier les plafonds
              <ChevronRight size={16} className="arrow-icon" />
            </button>
          </CardBox>

          <CardBox className="col-span-3 p-5">
            <h2 className="text-[18px] font-bold text-[#090927]">
              État de la carte
            </h2>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between rounded-[14px] bg-[#F6F7F9] p-3">
                <span className="flex items-center gap-3 text-[14px] font-semibold text-[#090927]">
                  <ShieldCheck size={18} className="text-[#7AA600]" />
                  Sécurité
                </span>
                <span className="text-[12px] font-bold text-[#7AA600]">
                  OK
                </span>
              </div>

              <div className="flex items-center justify-between rounded-[14px] bg-[#F6F7F9] p-3">
                <span className="flex items-center gap-3 text-[14px] font-semibold text-[#090927]">
                  <CalendarDays size={18} />
                  Expiration
                </span>
                <span className="text-[12px] font-bold text-[#050033]">
                  09/28
                </span>
              </div>

              <div className="flex items-center justify-between rounded-[14px] bg-[#F6F7F9] p-3">
                <span className="flex items-center gap-3 text-[14px] font-semibold text-[#090927]">
                  <CreditCard size={18} />
                  Type
                </span>
                <span className="text-[12px] font-bold text-[#050033]">
                  Premium
                </span>
              </div>
            </div>
          </CardBox>
        </div>

        {/* Ligne 2 */}
        <div className="grid grid-cols-12 gap-5">
          <CardBox className="col-span-7 p-5">
            <div className="mb-5 flex items-center justify-between group">
              <h2 className="text-[18px] font-bold text-[#090927]">
                Dernières opérations carte
              </h2>

              <button
                type="button"
                onClick={() => setActiveModal("all")}
                className="flex items-center gap-1 text-[14px] font-semibold text-[#050033] interactive-link group"
              >
                Voir toutes
                <ChevronRight size={16} className="arrow-icon" />
              </button>
            </div>

            <div className="overflow-hidden rounded-[12px] border border-[#E5E7EB]">
              <div className="grid grid-cols-[1fr_130px_120px_50px] bg-[#F9FAFB] px-4 py-3 text-[12px] font-bold uppercase text-[#6B7280]">
                <span>Commerçant</span>
                <span>Date</span>
                <span className="text-right">Montant</span>
                <span />
              </div>

              {cardTransactions.map((transaction) => {
                const Icon = transaction.icon;

                return (
                  <div
                    key={transaction.merchant}
                    className="grid grid-cols-[1fr_130px_120px_50px] items-center border-t border-[#E5E7EB] px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F4F6] text-[#050033]">
                        <Icon size={18} />
                      </span>

                      <div>
                        <p className="text-[14px] font-bold text-[#090927]">
                          {transaction.merchant}
                        </p>
                        <p className="mt-1 text-[12px] text-[#6B7280]">
                          {transaction.category}
                        </p>
                      </div>
                    </div>

                    <span className="text-[13px] text-[#6B7280]">
                      {transaction.date}
                    </span>

                    <span className="text-right text-[14px] font-bold text-[#050033]">
                      {transaction.amount}
                    </span>

                    <button
                      type="button"
                      aria-label={`Menu actions pour ${transaction.merchant}`}
                      onClick={() => showToast("Menu ouvert.") }
                      className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-[#050033] interactive-button"
                    >
                      <MoreVertical size={17} />
                    </button>
                  </div>
                );
              })}
            </div>
          </CardBox>

          <CardBox className="col-span-5 p-5">
            <h2 className="text-[18px] font-bold text-[#090927]">
              Options de paiement
            </h2>

            <div className="mt-4 space-y-3">
              <SettingToggle
                icon={<Wifi size={19} />}
                title="Paiement sans contact"
                description="Paiements rapides en magasin"
                active={paymentOptions.sansContact}
                onChange={(value) => {
                  setPaymentOptions((current) => ({ ...current, sansContact: value }));
                  showToast(`Sans contact ${value ? "activé" : "désactivé"}`);
                }}
              />
              <SettingToggle
                icon={<Globe2 size={19} />}
                title="Paiement à l’étranger"
                description="Autoriser les paiements hors Luxembourg"
                active={paymentOptions.etranger}
                onChange={(value) => {
                  setPaymentOptions((current) => ({ ...current, etranger: value }));
                  showToast(`Paiement à l'étranger ${value ? "activé" : "désactivé"}`);
                }}
              />
              <SettingToggle
                icon={<Smartphone size={19} />}
                title="Paiement internet"
                description="Achats en ligne sécurisés"
                active={paymentOptions.internet}
                onChange={(value) => {
                  setPaymentOptions((current) => ({ ...current, internet: value }));
                  showToast(`Paiement internet ${value ? "activé" : "désactivé"}`);
                }}
              />
            </div>
          </CardBox>
        </div>

        {/* Ligne 3 */}
        <div className="grid grid-cols-12 gap-5">
          <CardBox className="col-span-12 p-5">
            <h2 className="text-[18px] font-bold text-[#090927]">
              Sécurité carte
            </h2>

            <div className="mt-4 flex gap-5">
              <button
                type="button"
                onClick={() => setActiveModal("freeze")}
                className="flex flex-1 h-[82px] flex-col items-center justify-center rounded-[14px] border border-[#E5E7EB] text-[#050033] interactive-button"
              >
                <Snowflake size={22} />
                <span className="mt-2 text-[13px] font-semibold">
                  Geler la carte
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModal("oppose")}
                className="flex flex-1 h-[82px] flex-col items-center justify-center rounded-[14px] border border-[#E5E7EB] text-[#050033] interactive-button"
              >
                <Ban size={22} />
                <span className="mt-2 text-[13px] font-semibold">
                  Faire opposition
                </span>
              </button>
            </div>

            <p className="mt-4 flex gap-2 text-[12px] leading-[1.45] text-[#6B7280]">
              <LockKeyhole size={15} className="shrink-0 text-[#7AA600]" />
              Gérez les options de votre carte en toute sécurité.
            </p>
          </CardBox>
        </div>
      </div>
      <DemoModal
        open={activeModal === "limits"}
        title="Modifier les plafonds"
        message="Les plafonds de carte sont mis à jour."
        onClose={() => setActiveModal(null)}
        onConfirm={() => {
          setActiveModal(null);
          showToast("Plafonds modifies ");
        }}
      />
      <DemoModal
        open={activeModal === "freeze"}
        title="Geler la carte"
        message="Confirmez le gel temporaire de cette carte."
        onClose={() => setActiveModal(null)}
        onConfirm={() => {
          setActiveModal(null);
          showToast("Carte gelee ");
        }}
      />
      <DemoModal
        open={activeModal === "oppose"}
        title="Faire opposition"
        message="Confirmez la demande d’opposition de cette carte."
        onClose={() => setActiveModal(null)}
        onConfirm={() => {
          setActiveModal(null);
          showToast("Opposition enregistree ");
        }}
      />
      <DemoModal
        open={activeModal === "all"}
        title="Toutes les operations"
        message="La liste complète des opérations carte est affichée."
        onClose={() => setActiveModal(null)}
      />
      <DemoToast open={Boolean(toast)} message={toast} onClose={() => setToast("")} />
    </DesktopShell>
  );
}

export default DesktopCards;
