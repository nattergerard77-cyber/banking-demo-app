"use client";

import type { ReactNode } from "react";
import {
  CalendarDays,
  ChevronRight,
  CreditCard,
  Globe2,
  Mail,
  Phone,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { useLastLogin } from "@/hooks/useLastLogin";
import DesktopShell from "./DesktopShell";

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

export function DesktopProfile() {
  const lastLogin = useLastLogin();

  return (
    <DesktopShell>
      <div className="space-y-5">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-[#090927]">
            Mon profil
          </h1>
          <p className="mt-1 text-[15px] text-[#6B7280]">
            Informations personnelles et coordonnées
          </p>
        </div>

        <div className="grid grid-cols-12 gap-5">
          <Card className="col-span-5 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#050033] text-[20px] font-bold text-white">
                FM
              </div>

              <div>
                <h2 className="text-[22px] font-bold text-[#090927]">
                  Frederico Di Mario
                </h2>
                <p className="mt-1 text-[13px] text-[#6B7280]">
                  Client Raiffeisen depuis 2015
                </p>
                <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#EEF7D8] px-3 py-1 text-[12px] font-semibold text-[#050033]">
                  <ShieldCheck size={14} className="text-[#7AA600]" />
                  Profil vérifié
                </span>
              </div>
            </div>
          </Card>

          <Card className="col-span-4 p-5">
            <h2 className="text-[18px] font-bold text-[#090927]">
              Coordonnées
            </h2>

            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3 rounded-[14px] bg-[#F6F7F9] p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#050033] text-white">
                  <Mail size={18} />
                </span>
                <div>
                  <p className="text-[12px] text-[#6B7280]">Email</p>
                  <p className="mt-0.5 text-[14px] font-bold text-[#090927]">
                    fredericodimario8@gmail.com
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-[14px] bg-[#F6F7F9] p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#050033] text-white">
                  <Phone size={18} />
                </span>
                <div>
                  <p className="text-[12px] text-[#6B7280]">Téléphone</p>
                  <p className="mt-0.5 text-[14px] font-bold text-[#090927]">
                    +33 7 74 36 43 82
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="col-span-3 p-5">
            <h2 className="text-[18px] font-bold text-[#090927]">
              Informations
            </h2>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-[12px] bg-[#F6F7F9] p-3">
                <div className="flex items-center gap-2.5">
                  <Globe2 size={16} className="text-[#050033]" />
                  <span className="text-[13px] font-semibold text-[#090927]">
                    Pays
                  </span>
                </div>
                <span className="text-[13px] font-bold text-[#090927]">
                  France
                </span>
              </div>

              <div className="flex items-center justify-between rounded-[12px] bg-[#F6F7F9] p-3">
                <div className="flex items-center gap-2.5">
                  <CreditCard size={16} className="text-[#050033]" />
                  <span className="text-[13px] font-semibold text-[#090927]">
                    Statut client
                  </span>
                </div>
                <span className="text-[13px] font-bold text-[#7AA600]">
                  Premium
                </span>
              </div>

              <div className="flex items-center justify-between rounded-[12px] bg-[#F6F7F9] p-3">
                <div className="flex items-center gap-2.5">
                  <CalendarDays size={16} className="text-[#050033]" />
                  <span className="text-[13px] font-semibold text-[#090927]">
                    Client depuis
                  </span>
                </div>
                <span className="text-[13px] font-bold text-[#090927]">
                  2015
                </span>
              </div>

              <div className="flex items-center justify-between rounded-[12px] bg-[#F6F7F9] p-3">
                <div className="flex items-center gap-2.5">
                  <Smartphone size={16} className="text-[#050033]" />
                  <span className="text-[13px] font-semibold text-[#090927]">
                    Dernière connexion
                  </span>
                </div>
                <span className="text-[13px] font-bold text-[#090927] text-right max-w-[140px] truncate">
                  {lastLogin || "Chargement..."}
                </span>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EEF7D8] text-[#7AA600]">
                <ShieldCheck size={20} />
              </span>
              <div>
                <h2 className="text-[16px] font-bold text-[#090927]">
                  Sécurité du compte
                </h2>
                <p className="mt-1 text-[13px] text-[#6B7280]">
                  Vos informations personnelles sont protégées.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="flex items-center gap-1 text-[14px] font-semibold text-[#050033] interactive-link"
            >
              Gérer
              <ChevronRight size={16} className="arrow-icon" />
            </button>
          </div>
        </Card>
      </div>
    </DesktopShell>
  );
}

export default DesktopProfile;
