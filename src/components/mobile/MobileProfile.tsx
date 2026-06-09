"use client";

import type { ReactNode } from "react";
import {
  CalendarDays,
  CreditCard,
  Globe2,
  Mail,
  Phone,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { useLastLogin } from "@/hooks/useLastLogin";
import MobileShell from "./MobileShell";

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

export function MobileProfile() {
  const lastLogin = useLastLogin();

  return (
    <MobileShell>
      <div className="space-y-4">
        <section>
          <h1 className="text-[24px] font-bold tracking-tight text-[#090927]">
            Mon profil
          </h1>
          <p className="mt-1 text-[14px] text-[#6B7280]">
            Informations personnelles
          </p>
        </section>

        <MobileCard className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#050033] text-[20px] font-bold text-white">
              FM
            </div>

            <div>
              <h2 className="text-[20px] font-bold text-[#090927]">
                Frederico Di Mario
              </h2>
              <p className="mt-1 text-[13px] text-[#6B7280]">
                Client Raiffeisen depuis 2015
              </p>
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#EEF7D8] px-2.5 py-1 text-[11px] font-semibold text-[#050033]">
                <ShieldCheck size={13} className="text-[#7AA600]" />
                Profil vérifié
              </span>
            </div>
          </div>
        </MobileCard>

        <MobileCard className="p-4">
          <h2 className="text-[17px] font-bold text-[#090927]">
            Coordonnées
          </h2>

          <div className="mt-3 space-y-3">
            <div className="flex items-center gap-3 rounded-[14px] bg-[#F6F7F9] p-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#050033] text-white">
                <Mail size={18} />
              </span>
              <div>
                <p className="text-[11px] text-[#6B7280]">Email</p>
                <p className="mt-0.5 text-[14px] font-bold text-[#090927]">
                  fredericodimario8@gmail.com
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-[14px] bg-[#F6F7F9] p-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#050033] text-white">
                <Phone size={18} />
              </span>
              <div>
                <p className="text-[11px] text-[#6B7280]">Téléphone</p>
                <p className="mt-0.5 text-[14px] font-bold text-[#090927]">
                  +33 7 74 36 43 82
                </p>
              </div>
            </div>
          </div>
        </MobileCard>

        <MobileCard className="p-4">
          <h2 className="text-[17px] font-bold text-[#090927]">
            Informations
          </h2>

          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between rounded-[12px] bg-[#F6F7F9] p-3">
              <div className="flex items-center gap-2">
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
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="text-[#050033]" />
                <span className="text-[13px] font-semibold text-[#090927]">
                  Statut
                </span>
              </div>
              <span className="text-[13px] font-bold text-[#7AA600]">
                Premium
              </span>
            </div>

            <div className="flex items-center justify-between rounded-[12px] bg-[#F6F7F9] p-3">
              <div className="flex items-center gap-2">
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
              <div className="flex items-center gap-2">
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
        </MobileCard>

        <MobileCard className="p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEF7D8] text-[#7AA600]">
              <ShieldCheck size={20} />
            </span>
            <div>
              <h2 className="text-[15px] font-bold text-[#090927]">
                Sécurité du compte
              </h2>
              <p className="mt-1 text-[12px] text-[#6B7280]">
                Vos informations personnelles sont protégées.
              </p>
            </div>
          </div>
        </MobileCard>
      </div>
    </MobileShell>
  );
}

export default MobileProfile;
