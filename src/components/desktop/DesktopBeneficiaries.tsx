"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Edit3,
  MoreVertical,
  Plus,
  Search,
  ShieldCheck,
  Star,
  User,
  Users,
} from "lucide-react";
import { mockBeneficiaries } from "@/data/beneficiaries";

import DesktopShell from "./DesktopShell";
import DemoModal from "../shared/DemoModal";
import DemoToast from "../shared/DemoToast";

const beneficiaries = mockBeneficiaries.map((beneficiary, index) => ({
  ...beneficiary,
  type: "Particulier",
  initials: beneficiary.name.split(" ").map((part) => part[0]).join(""),
  favorite: index === 0,
  active: index === 0,
}));

const recentTransfers = [
  {
    beneficiary: "Luca Romano",
    reason: "Règlement privé",
    date: "24 mai 2024",
    amount: "- 120,00 €",
    status: "Exécuté",
  },
  {
    beneficiary: "Sofia Bianchi",
    reason: "Participation familiale",
    date: "22 mai 2024",
    amount: "- 75,00 €",
    status: "Exécuté",
  },
  {
    beneficiary: "Marco Conti",
    reason: "Règlement de service",
    date: "18 mai 2024",
    amount: "- 450,00 €",
    status: "Planifié",
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

function BeneficiaryRow({
  beneficiary,
  onSelect,
}: {
  beneficiary: (typeof beneficiaries)[number];
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center justify-between rounded-[14px] border p-3 text-left interactive-card ${
        beneficiary.active
          ? "border-[#9ACD00] bg-[#FBFFF1]"
          : "border-[#E5E7EB] bg-white"
      }`}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${
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
            {beneficiary.favorite && (
              <Star size={14} className="fill-[#9ACD00] text-[#9ACD00]" />
            )}
          </span>
          <span className="mt-1 block truncate text-[12px] text-[#6B7280]">
            {beneficiary.iban}
          </span>
        </span>
      </span>

      <ChevronRight size={17} className="arrow-icon text-[#050033]" />
    </button>
  );
}

export function DesktopBeneficiaries() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedName, setSelectedName] = useState(beneficiaries[0].name);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({ "Luca Romano": true });
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState<null | "add" | "edit" | "quick" | "all">(null);
  const filtered = useMemo(
    () => beneficiaries.filter((item) => `${item.name} ${item.iban}`.toLowerCase().includes(search.toLowerCase())),
    [search],
  );
  const selected = filtered.find((item) => item.name === selectedName) ?? filtered[0] ?? beneficiaries[0];

  return (
    <DesktopShell>
      <div className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[26px] font-bold tracking-tight text-[#090927]">
              Bénéficiaires
            </h1>
            <p className="mt-1 text-[15px] text-[#6B7280]">
              Gérez vos bénéficiaires et vos virements récents.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModal("add")}
            className="flex h-10 items-center gap-2 rounded-[10px] bg-[#050033] px-4 text-[14px] font-bold text-white interactive-button"
          >
            <Plus size={16} />
            Ajouter un bénéficiaire
          </button>
        </div>

        <div className="grid grid-cols-12 gap-5">
          <Card className="col-span-4 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[18px] font-bold text-[#090927]">
                Liste des bénéficiaires
              </h2>

              <span className="rounded-full bg-[#EEF7D8] px-3 py-1 text-[12px] font-bold text-[#050033]">
                {beneficiaries.length} actifs
              </span>
            </div>

            <div className="flex h-10 items-center gap-3 rounded-[10px] border border-[#E5E7EB] bg-white px-3">
              <Search size={17} className="text-[#6B7280]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher un bénéficiaire..."
                className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#9CA3AF]"
              />
            </div>

            <div className="mt-4 space-y-3">
              {filtered.map((beneficiary) => (
                <BeneficiaryRow
                  key={beneficiary.name}
                  onSelect={() => setSelectedName(beneficiary.name)}
                  beneficiary={{ ...beneficiary, active: beneficiary.name === selected.name, favorite: favorites[beneficiary.name] ?? beneficiary.favorite }}
                />
              ))}
            </div>
          </Card>

          <Card className="col-span-5 p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#050033] text-[16px] font-bold text-white">
                  {selected.initials}
                </span>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[20px] font-bold text-[#090927]">{selected.name}</h2>
                    <button
                      type="button"
                      aria-label="Basculer favori"
                      onClick={() =>
                        setFavorites((current) => ({ ...current, [selected.name]: !(current[selected.name] ?? false) }))
                      }
                    >
                      <Star
                        size={16}
                        className={(favorites[selected.name] ?? false) ? "fill-[#9ACD00] text-[#9ACD00]" : "text-[#9CA3AF]"}
                      />
                    </button>
                  </div>
                  <p className="mt-1 text-[13px] text-[#6B7280]">
                    {selected.type}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#EEF7D8] px-3 py-1 text-[12px] font-semibold text-[#050033]">
                    <CheckCircle2 size={14} className="text-[#7AA600]" />
                    Bénéficiaire vérifié
                  </span>
                </div>
              </div>

              <button
                type="button"
                aria-label="Menu actions beneficiaire"
                onClick={() => setToast("Menu beneficiaire ouvert ")}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#050033]"
              >
                <MoreVertical size={18} />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-[14px] bg-[#F6F7F9] p-4">
                <p className="text-[12px] text-[#6B7280]">IBAN</p>
                <p className="mt-2 text-[14px] font-bold leading-[1.4] text-[#090927]">
                  {selected.iban}
                </p>
              </div>

              <div className="rounded-[14px] bg-[#F6F7F9] p-4">
                <p className="text-[12px] text-[#6B7280]">Banque</p>
                <p className="mt-2 text-[14px] font-bold leading-[1.4] text-[#090927]">
                  {selected.bank}
                </p>
              </div>

              <div className="rounded-[14px] bg-[#F6F7F9] p-4">
                <p className="text-[12px] text-[#6B7280]">Ajouté le</p>
                <p className="mt-2 text-[14px] font-bold text-[#090927]">
                  12 avril 2024
                </p>
              </div>

              <div className="rounded-[14px] bg-[#F6F7F9] p-4">
                <p className="text-[12px] text-[#6B7280]">Dernier virement</p>
                <p className="mt-2 text-[14px] font-bold text-[#090927]">
                  24 mai 2024
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => router.push("/virements")}
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-[10px] bg-[#050033] text-[14px] font-bold text-white interactive-button"
              >
                <ArrowLeftRight size={16} />
                Faire un virement
              </button>

              <button
                type="button"
                onClick={() => setModal("edit")}
                className="flex h-10 items-center justify-center gap-2 rounded-[10px] border border-[#050033] px-4 text-[14px] font-semibold text-[#050033] interactive-button"
              >
                <Edit3 size={16} />
                Modifier
              </button>
            </div>
          </Card>

          <Card className="col-span-3 p-5">
            <h2 className="text-[18px] font-bold text-[#090927]">
              Sécurité
            </h2>

            <div className="mt-4 space-y-3">
              <div className="rounded-[14px] bg-[#F6F7F9] p-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={21} className="text-[#7AA600]" />
                  <p className="font-bold text-[#090927]">Contrôle actif</p>
                </div>
                <p className="mt-2 text-[12px] leading-[1.4] text-[#6B7280]">
                  Les bénéficiaires affichés sont associés à votre espace client.
                </p>
              </div>

              <div className="rounded-[14px] bg-[#F6F7F9] p-4">
                <div className="flex items-center gap-3">
                  <Clock3 size={21} className="text-[#050033]" />
                  <p className="font-bold text-[#090927]">Délai d’activation</p>
                </div>
                <p className="mt-2 text-[12px] leading-[1.4] text-[#6B7280]">
                  Un délai d’activation peut s’appliquer selon le bénéficiaire.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-12 gap-5">
          <Card className="col-span-8 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[18px] font-bold text-[#090927]">
                Virements récents vers vos bénéficiaires
              </h2>

              <button
                type="button"
                onClick={() => setModal("all")}
                className="flex items-center gap-1 text-[14px] font-semibold text-[#050033] interactive-link"
              >
                Voir tout
                <ChevronRight size={14} className="arrow-icon" />
              </button>
            </div>

            <div className="overflow-hidden rounded-[12px] border border-[#E5E7EB]">
              <div className="grid grid-cols-[1fr_160px_120px_110px] bg-[#F9FAFB] px-4 py-3 text-[12px] font-bold uppercase text-[#6B7280]">
                <span>Bénéficiaire</span>
                <span>Date</span>
                <span className="text-right">Montant</span>
                <span className="text-right">Statut</span>
              </div>

              {recentTransfers.map((transfer) => (
                <div
                  key={transfer.beneficiary + transfer.date}
                  className="grid grid-cols-[1fr_160px_120px_110px] items-center border-t border-[#E5E7EB] px-4 py-3 interactive-row"
                >
                  <div>
                    <p className="text-[14px] font-bold text-[#090927]">
                      {transfer.beneficiary}
                    </p>
                    <p className="mt-1 text-[12px] text-[#6B7280]">
                      {transfer.reason}
                    </p>
                  </div>

                  <p className="text-[13px] text-[#6B7280]">{transfer.date}</p>

                  <p className="text-right text-[14px] font-bold text-[#050033]">
                    {transfer.amount}
                  </p>

                  <p className="flex items-center justify-end gap-1 text-[12px] font-semibold text-[#7AA600]">
                    <CheckCircle2 size={14} />
                    {transfer.status}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="col-span-4 p-5">
            <h2 className="text-[18px] font-bold text-[#090927]">
              Ajouter rapidement
            </h2>

            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={() => setModal("quick")}
                className="flex h-12 w-full items-center justify-between rounded-[12px] border border-[#E5E7EB] px-4 text-left interactive-button"
              >
                <span className="flex items-center gap-3 text-[14px] font-semibold text-[#090927]">
                  <User size={18} />
                  Particulier
                </span>
                <ChevronRight size={17} className="arrow-icon" />
              </button>

              <button
                type="button"
                onClick={() => setModal("quick")}
                className="flex h-12 w-full items-center justify-between rounded-[12px] border border-[#E5E7EB] px-4 text-left interactive-button"
              >
                <span className="flex items-center gap-3 text-[14px] font-semibold text-[#090927]">
                  <Building2 size={18} />
                  Professionnel
                </span>
                <ChevronRight size={17} className="arrow-icon" />
              </button>

              <button
                type="button"
                onClick={() => setModal("quick")}
                className="flex h-12 w-full items-center justify-between rounded-[12px] border border-[#E5E7EB] px-4 text-left interactive-button"
              >
                <span className="flex items-center gap-3 text-[14px] font-semibold text-[#090927]">
                  <Users size={18} />
                  Groupe familial
                </span>
                <ChevronRight size={17} className="arrow-icon" />
              </button>
            </div>
          </Card>
        </div>
      </div>
      <DemoModal open={modal === "add"} title="Ajouter un beneficiaire" message="Vérifiez les informations avant validation." onClose={() => setModal(null)} onConfirm={() => { setModal(null); setToast("Beneficiaire ajoute "); }} />
      <DemoModal open={modal === "edit"} title="Modifier le beneficiaire" message="Modification du bénéficiaire sélectionné." onClose={() => setModal(null)} onConfirm={() => { setModal(null); setToast("Beneficiaire modifie "); }} />
      <DemoModal open={modal === "quick"} title="Ajout rapide" message="Assistant d’ajout rapide ouvert." onClose={() => setModal(null)} />
      <DemoModal open={modal === "all"} title="Tous les virements" message="Historique complet des virements ouvert." onClose={() => setModal(null)} />
      <DemoToast open={Boolean(toast)} message={toast} onClose={() => setToast("")} />
    </DesktopShell>
  );
}

export default DesktopBeneficiaries;
