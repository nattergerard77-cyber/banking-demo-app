"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  Edit3,
  Plus,
  Search,
  ShieldCheck,
  Star,
  User,
  Users,
} from "lucide-react";
import { mockBeneficiaries } from "@/data/beneficiaries";

import MobileShell from "./MobileShell";
import DemoModal from "../shared/DemoModal";
import DemoToast from "../shared/DemoToast";

const beneficiaries = mockBeneficiaries.map((beneficiary, index) => ({
  ...beneficiary,
  initials: beneficiary.name.split(" ").map((part) => part[0]).join(""),
  type: "Particulier",
  active: index === 0,
  favorite: index === 0,
}));

const transfers = [
  {
    name: "Luca Romano",
    reason: "Règlement privé",
    date: "24 mai 2024",
    amount: "-120,00 €",
  },
  {
    name: "Sofia Bianchi",
    reason: "Participation familiale",
    date: "22 mai 2024",
    amount: "-75,00 €",
  },
  {
    name: "Marco Conti",
    reason: "Règlement de service",
    date: "18 mai 2024",
    amount: "-450,00 €",
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

export function MobileBeneficiaries() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedName, setSelectedName] = useState(beneficiaries[0].name);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({ "Luca Romano": true });
  const [modal, setModal] = useState<null | "add" | "edit" | "quick" | "all">(null);
  const [toast, setToast] = useState("");
  const filtered = useMemo(
    () => beneficiaries.filter((item) => `${item.name} ${item.iban}`.toLowerCase().includes(search.toLowerCase())),
    [search],
  );
  const selected = filtered.find((item) => item.name === selectedName) ?? filtered[0] ?? beneficiaries[0];

  return (
    <MobileShell>
      <div className="space-y-4">
        <section>
          <h1 className="text-[24px] font-bold tracking-tight text-[#090927]">
            Bénéficiaires
          </h1>
          <p className="mt-1 text-[14px] text-[#6B7280]">
            Gérez vos contacts de virement.
          </p>
        </section>

        <MobileCard className="p-4">
          <div className="flex gap-3">
            <div className="flex h-10 flex-1 items-center gap-3 rounded-[10px] border border-[#E5E7EB] px-3">
              <Search size={17} className="text-[#6B7280]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher..."
                className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#9CA3AF]"
              />
            </div>

            <button
              type="button"
              onClick={() => setModal("add")}
              aria-label="Ajouter un beneficiaire"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#050033] text-white"
            >
              <Plus size={18} />
            </button>
          </div>
        </MobileCard>

        <MobileCard className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[17px] font-bold text-[#090927]">
              Mes bénéficiaires
            </h2>
            <span className="rounded-full bg-[#EEF7D8] px-3 py-1 text-[12px] font-bold text-[#050033]">
              3 actifs
            </span>
          </div>

          <div className="space-y-3">
            {filtered.map((beneficiary) => (
              <button
                key={beneficiary.name}
                type="button"
                onClick={() => setSelectedName(beneficiary.name)}
                className={`flex w-full items-center justify-between rounded-[14px] border p-3 text-left ${
                  beneficiary.name === selected.name
                    ? "border-2 border-[#9ACD00] bg-white"
                    : "border-[#E5E7EB] bg-white"
                }`}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
                      beneficiary.active
                        ? "bg-[#050033] text-white"
                        : "bg-[#F3F4F6] text-[#050033]"
                    }`}
                  >
                    {beneficiary.initials}
                  </span>

                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[14px] font-bold text-[#090927]">
                        {beneficiary.name}
                      </span>
                      <button
                        type="button"
                        aria-label={`Favori ${beneficiary.name}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          setFavorites((current) => ({
                            ...current,
                            [beneficiary.name]: !(current[beneficiary.name] ?? beneficiary.favorite),
                          }));
                        }}
                        className="inline-flex"
                      >
                        <Star
                          size={13}
                          className={
                            (favorites[beneficiary.name] ?? beneficiary.favorite)
                              ? "fill-[#9ACD00] text-[#9ACD00]"
                              : "text-[#9CA3AF]"
                          }
                        />
                      </button>
                    </span>
                    <span className="mt-1 block truncate text-[12px] text-[#6B7280]">
                      {beneficiary.iban}
                    </span>
                  </span>
                </span>

                <ChevronRight size={17} className="text-[#050033]" />
              </button>
            ))}
          </div>
        </MobileCard>

        <MobileCard className="p-4">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#050033] text-[16px] font-bold text-white">
              {selected.initials}
            </span>

            <div className="min-w-0 flex-1">
              <h2 className="text-[19px] font-bold text-[#090927]">
                {selected.name}
              </h2>
              <p className="mt-1 text-[13px] text-[#6B7280]">{selected.type}</p>

              <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#EEF7D8] px-3 py-1 text-[12px] font-semibold text-[#050033]">
                <CheckCircle2 size={14} className="text-[#7AA600]" />
                Vérifié
              </span>
            </div>
          </div>

          <div className="mt-4 rounded-[14px] bg-[#F6F7F9] p-3">
            <p className="text-[12px] text-[#6B7280]">IBAN</p>
            <p className="mt-1 text-[14px] font-bold text-[#090927]">
              {selected.iban}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => router.push("/virements")}
              className="flex h-10 items-center justify-center gap-2 rounded-[10px] bg-[#050033] text-[13px] font-bold text-white"
            >
              <ArrowLeftRight size={15} />
              Virement
            </button>

            <button
              type="button"
              onClick={() => setModal("edit")}
              className="flex h-10 items-center justify-center gap-2 rounded-[10px] border border-[#050033] text-[13px] font-semibold text-[#050033]"
            >
              <Edit3 size={15} />
              Modifier
            </button>
          </div>
        </MobileCard>

        <MobileCard className="p-4">
          <h2 className="text-[17px] font-bold text-[#090927]">
            Virements récents
          </h2>

          <div className="mt-3 divide-y divide-[#E5E7EB]">
            {transfers.map((transfer) => (
              <div
                key={transfer.name + transfer.date}
                className="flex items-center gap-3 py-3"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-[#050033]">
                  <ArrowLeftRight size={18} />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-bold text-[#090927]">
                    {transfer.name}
                  </p>
                  <p className="mt-1 text-[12px] text-[#6B7280]">
                    {transfer.reason}
                  </p>
                  <p className="mt-1 text-[12px] text-[#6B7280]">
                    {transfer.date}
                  </p>
                </div>

                <p className="text-[14px] font-bold text-[#050033]">
                  {transfer.amount}
                </p>
              </div>
            ))}
          </div>
        </MobileCard>

        <MobileCard className="p-4">
          <h2 className="text-[17px] font-bold text-[#090927]">
            Ajouter rapidement
          </h2>

          <div className="mt-3 grid grid-cols-3 gap-3">
            {[
              { icon: User, label: "Particulier" },
              { icon: Building2, label: "Pro" },
              { icon: Users, label: "Groupe" },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setModal("quick")}
                  className="flex h-[78px] flex-col items-center justify-center rounded-[14px] border border-[#E5E7EB] text-[#050033]"
                >
                  <Icon size={20} />
                  <span className="mt-2 text-[12px] font-semibold">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </MobileCard>

        <MobileCard className="p-4">
          <div className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEF7D8] text-[#7AA600]">
              <ShieldCheck size={20} />
            </span>

            <div>
              <h2 className="text-[15px] font-bold text-[#090927]">
                Sécurité bénéficiaire
              </h2>
              <p className="mt-1 text-[13px] leading-[1.4] text-[#6B7280]">
                Les bénéficiaires affichés sont associés à votre espace client.
              </p>
            </div>
          </div>
        </MobileCard>
      </div>
      <DemoModal open={modal === "add"} title="Ajouter un beneficiaire" message="Vérifiez les informations avant validation." onClose={() => setModal(null)} onConfirm={() => { setModal(null); setToast("Beneficiaire ajoute "); }} />
      <DemoModal open={modal === "edit"} title="Modifier le beneficiaire" message="Modification du bénéficiaire sélectionné." onClose={() => setModal(null)} onConfirm={() => { setModal(null); setToast("Beneficiaire modifie "); }} />
      <DemoModal open={modal === "quick"} title="Ajout rapide" message="Assistant d’ajout rapide ouvert." onClose={() => setModal(null)} />
      <DemoModal open={modal === "all"} title="Tous les virements" message="Historique complet des virements ouvert." onClose={() => setModal(null)} />
      <DemoToast open={Boolean(toast)} message={toast} onClose={() => setToast("")} />
    </MobileShell>
  );
}

export default MobileBeneficiaries;
