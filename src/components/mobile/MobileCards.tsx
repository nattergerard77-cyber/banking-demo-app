"use client";

import { useState, type ReactNode } from "react";
import {
  Ban,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Globe2,
  LockKeyhole,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  Snowflake,
  Wifi,
} from "lucide-react";

import MobileShell from "./MobileShell";
import DemoModal from "../shared/DemoModal";
import DemoSwitch from "../shared/DemoSwitch";
import DemoToast from "../shared/DemoToast";

const transactions = [
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


function CardVisualMobile() {
  const [isFlipped, setIsFlipped] = useState(false);

  function toggleCard() {
    setIsFlipped((current) => !current);
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Retourner la carte bancaire"
        onPointerUp={(event) => {
          event.preventDefault();
          setIsFlipped((current) => !current);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleCard();
          }
        }}
        className="relative block h-[230px] w-full cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-[#9ACD00] interactive-card"
        style={{
          perspective: "1200px",
          WebkitPerspective: "1200px",
          touchAction: "manipulation",
        }}
      >
        <div
          className="absolute inset-0 transition-transform duration-700 ease-in-out"
          style={{
            transformStyle: "preserve-3d",
            WebkitTransformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            WebkitTransform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* RECTO */}
          <div
            className="absolute inset-0 overflow-hidden rounded-[20px] bg-[#050033] p-5 text-white shadow-[0_18px_40px_rgba(5,0,51,0.22)]"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(0deg)",
              WebkitTransform: "rotateY(0deg)",
            }}
          >
            <div className="absolute -right-12 -top-14 h-36 w-36 rounded-full bg-white/10" />
            <div className="absolute -bottom-14 right-8 h-36 w-36 rounded-full bg-[#9ACD00]/20" />

            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-[12px] text-white/70">Raiffeisen</p>
                <p className="mt-1 text-[18px] font-bold">Visa Premium</p>
              </div>

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[#9ACD00]">
                <Wifi size={18} className="rotate-90" />
              </div>
            </div>

            <p className="relative z-10 mt-10 text-[19px] font-semibold tracking-[0.13em]">
              •••• •••• •••• 2450
            </p>

            <div className="relative z-10 mt-5 flex justify-between text-[12px]">
              <div>
                <p className="text-white/50">Titulaire</p>
                <p className="mt-1 font-semibold">Frederico Di Mario</p>
              </div>

              <div>
                <p className="text-white/50">Expire</p>
                <p className="mt-1 font-semibold">09/28</p>
              </div>
            </div>
          </div>

          {/* VERSO */}
          <div
            className="absolute inset-0 overflow-hidden rounded-[20px] bg-[#050033] p-5 text-white shadow-[0_18px_40px_rgba(5,0,51,0.22)]"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              WebkitTransform: "rotateY(180deg)",
            }}
          >
            <div className="absolute -left-10 -bottom-14 h-36 w-36 rounded-full bg-[#9ACD00]/15" />

            <div className="mt-2 h-10 w-full rounded-[4px] bg-black/80" />

            <div className="mt-5">
              <p className="text-[10px] uppercase tracking-wide text-white/50">
                Signature
              </p>

              <div className="mt-2 flex h-9 items-center justify-between rounded-[4px] bg-white/90 px-3 text-[#050033]">
                <span className="text-[12px] italic text-[#6B7280]">
                  Frederico Di Mario
                </span>

                <span className="rounded bg-[#E5E7EB] px-2 py-1 text-[11px] font-bold">
                  CVV •••
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-end justify-between">
              <div>
                <p className="text-[13px] font-bold">Raiffeisen</p>
                <p className="mt-1 text-[10px] text-white/55">
                  Carte principale
                </p>
              </div>

              <p className="max-w-[140px] text-right text-[10px] leading-[1.35] text-white/55">
                Données de carte sécurisées.
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-[12px] text-[#6B7280]">
        Touchez la carte pour voir le verso.
      </p>
      <p className="mt-1 text-center text-[11px] text-[#9CA3AF]">
        Face affichée : {isFlipped ? "verso" : "recto"}
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
    <div className="flex w-full items-center justify-between rounded-[14px] border border-[#E5E7EB] bg-white p-3 interactive-row text-left">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-[#050033]">
          {icon}
        </span>

        <div className="min-w-0">
          <p className="truncate text-[13px] font-bold text-[#090927]">{title}</p>
          <p className="mt-0.5 truncate text-[11px] text-[#6B7280]">{description}</p>
        </div>
      </div>

      <DemoSwitch checked={active} onChange={onChange} label={title} />
    </div>
  );
}

export function MobileCards() {
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState<null | "limits" | "freeze" | "oppose" | "all">(null);
  const [paymentOptions, setPaymentOptions] = useState({ sansContact: true, etranger: true, internet: true });

  return (
    <MobileShell>
      <div className="space-y-4">
        <section>
          <h1 className="text-[24px] font-bold tracking-tight text-[#090927]">
            Mes cartes
          </h1>
          <p className="mt-1 text-[14px] text-[#6B7280]">
            Gérez vos cartes, plafonds et options.
          </p>
        </section>

        {/* 1. Carte Principale */}
        <MobileCard className="p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[17px] font-bold text-[#090927]">
              Carte principale
            </h2>

            <span className="flex items-center gap-1.5 rounded-full bg-[#EEF7D8] px-2.5 py-1 text-[11px] font-semibold text-[#050033]">
              <CheckCircle2 size={13} className="text-[#7AA600]" />
              Active
            </span>
          </div>

          <div className="mt-4">
            <CardVisualMobile />
          </div>
        </MobileCard>

        {/* 2. Plafonds disponibles */}
        <MobileCard className="p-4">
          <h2 className="text-[17px] font-bold text-[#090927]">
            Plafonds disponibles
          </h2>

          <div className="mt-4 space-y-4">
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
            onClick={() => setModal("limits")}
            className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-[9px] border border-[#050033] text-[13px] font-semibold text-[#050033] interactive-button"
          >
            Modifier les plafonds
            <ChevronRight size={15} className="arrow-icon" />
          </button>
        </MobileCard>

        {/* 3. État de la carte (Extrait) */}
        <MobileCard className="p-4">
          <h2 className="text-[17px] font-bold text-[#090927] mb-4">
            État de la carte
          </h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-[12px] bg-[#F6F7F9] p-3">
              <span className="flex items-center gap-2 text-[13px] font-semibold text-[#090927]">
                <ShieldCheck size={16} className="text-[#7AA600]" />
                Sécurité
              </span>
              <span className="text-[12px] font-bold text-[#7AA600]">
                OK
              </span>
            </div>

            <div className="flex items-center justify-between rounded-[12px] bg-[#F6F7F9] p-3">
              <span className="flex items-center gap-2 text-[13px] font-semibold text-[#090927]">
                <CalendarDays size={16} />
                Expiration
              </span>
              <span className="text-[12px] font-bold text-[#050033]">
                09/28
              </span>
            </div>

            <div className="flex items-center justify-between rounded-[12px] bg-[#F6F7F9] p-3">
              <span className="flex items-center gap-2 text-[13px] font-semibold text-[#090927]">
                <CreditCard size={16} />
                Type
              </span>
              <span className="text-[12px] font-bold text-[#050033]">
                Premium
              </span>
            </div>
          </div>
        </MobileCard>

        {/* 4. Options de paiement */}
        <MobileCard className="p-4">
          <h2 className="text-[17px] font-bold text-[#090927]">
            Options de paiement
          </h2>

          <div className="mt-4 space-y-2">
            <SettingToggle
              icon={<Wifi size={17} />}
              title="Paiement sans contact"
              description="Paiements en magasin"
              active={paymentOptions.sansContact}
              onChange={(value) => {
                setPaymentOptions((current) => ({ ...current, sansContact: value }));
                setToast(`Sans contact ${value ? "active" : "desactive"}`);
              }}
            />
            <SettingToggle
              icon={<Globe2 size={17} />}
              title="Paiement à l’étranger"
              description="Autoriser hors Luxembourg"
              active={paymentOptions.etranger}
              onChange={(value) => {
                setPaymentOptions((current) => ({ ...current, etranger: value }));
                setToast(`Paiement etranger ${value ? "active" : "desactive"}`);
              }}
            />
            <SettingToggle
              icon={<Smartphone size={17} />}
              title="Paiement internet"
              description="Achats en ligne"
              active={paymentOptions.internet}
              onChange={(value) => {
                setPaymentOptions((current) => ({ ...current, internet: value }));
                setToast(`Paiement internet ${value ? "active" : "desactive"}`);
              }}
            />
          </div>
        </MobileCard>
        
        {/* 5. Dernières opérations */}
        <MobileCard className="p-4">
          <div className="mb-4 flex items-center justify-between group">
            <h2 className="text-[17px] font-bold text-[#090927]">
              Dernières opérations
            </h2>
            <button type="button" onClick={() => setModal("all")} className="flex items-center gap-1 text-[13px] font-semibold text-[#050033] interactive-link group">
              Voir toutes
              <ChevronRight size={14} className="arrow-icon" />
            </button>
          </div>

          <div className="divide-y divide-[#E5E7EB]">
            {transactions.map((transaction) => {
              const Icon = transaction.icon;
              return (
                <div
                  key={transaction.merchant + transaction.date}
                  className="flex items-center gap-3 py-3"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-[#050033]">
                    <Icon size={18} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-bold text-[#090927]">
                      {transaction.merchant}
                    </p>
                    <p className="mt-0.5 text-[12px] text-[#6B7280]">
                      {transaction.category}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[14px] font-bold text-[#050033]">
                      {transaction.amount}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#6B7280]">
                      {transaction.date}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </MobileCard>

        {/* 6. Sécurité carte */}
        <MobileCard className="p-4">
          <h2 className="text-[17px] font-bold text-[#090927]">
            Sécurité carte
          </h2>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setModal("freeze")}
              className="flex h-[72px] flex-col items-center justify-center rounded-[12px] border border-[#E5E7EB] text-[#050033] interactive-button"
            >
              <Snowflake size={20} />
              <span className="mt-1.5 text-[12px] font-semibold">
                Geler la carte
              </span>
            </button>

            <button
              type="button"
              onClick={() => setModal("oppose")}
              className="flex h-[72px] flex-col items-center justify-center rounded-[12px] border border-[#E5E7EB] text-[#050033] interactive-button"
            >
              <Ban size={20} />
              <span className="mt-1.5 text-[12px] font-semibold">
                Faire opposition
              </span>
            </button>
          </div>

          <p className="mt-4 flex gap-2 text-[11px] leading-[1.4] text-[#6B7280]">
            <LockKeyhole size={14} className="shrink-0 text-[#7AA600]" />
            Gérez les options de votre carte en toute sécurité.
          </p>
        </MobileCard>
      </div>
      <DemoModal open={modal === "limits"} title="Modifier les plafonds" message="Modification des plafonds confirmée." onClose={() => setModal(null)} onConfirm={() => { setModal(null); setToast("Plafonds modifies "); }} />
      <DemoModal open={modal === "freeze"} title="Geler la carte" message="Confirmez le gel de la carte." onClose={() => setModal(null)} onConfirm={() => { setModal(null); setToast("Carte gelee "); }} />
      <DemoModal open={modal === "oppose"} title="Faire opposition" message="Confirmez l'opposition de la carte." onClose={() => setModal(null)} onConfirm={() => { setModal(null); setToast("Opposition enregistree "); }} />
      <DemoModal open={modal === "all"} title="Operations carte" message="Liste complète ouverte." onClose={() => setModal(null)} />
      <DemoToast open={Boolean(toast)} message={toast} onClose={() => setToast("")} />
    </MobileShell>
  );
}

export default MobileCards;
