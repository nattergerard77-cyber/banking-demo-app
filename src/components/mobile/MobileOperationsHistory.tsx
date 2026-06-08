"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import MobileShell from "./MobileShell";
import { operationsHistoryData } from "../../data/operations-history";
import { OperationHistory } from "../../types/operation";

export default function MobileOperationsHistory() {
  const [selectedOp, setSelectedOp] = useState<OperationHistory | null>(null);

  const chips = ["Toutes", "Entrées", "Sorties", "Transferts"];

  return (
    <MobileShell>
      <div className="space-y-4">
        {/* 1. HEADER MOBILE */}
        <section>
          <h1 className="text-[24px] font-bold tracking-tight text-[#090927]">
            Opérations
          </h1>
        </section>

        {/* 2. CHIPS / FILTRES HORIZONTAUX */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {chips.map((chip, idx) => (
            <button
              key={chip}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-semibold transition ${
                idx === 0
                  ? "bg-[#050033] text-white"
                  : "bg-white border border-[#E5E7EB] text-[#050033]"
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* 3. LISTE DES OPÉRATIONS */}
        <div className="rounded-[18px] border border-[#E5E7EB] bg-white shadow-[0_10px_26px_rgba(5,0,51,0.07)] p-4">
          <div className="divide-y divide-[#E5E7EB]">
            {operationsHistoryData.map((op) => (
              <div
                key={op.id}
                onClick={() => setSelectedOp(op)}
                className={`flex cursor-pointer items-center gap-3 py-3 last:pb-0 first:pt-0 ${
                  selectedOp?.id === op.id ? "bg-[#FBFFF1] -mx-4 px-4" : ""
                }`}
              >
                <div
                  className={`flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full ${
                    op.positive
                      ? "bg-[#EEF7D8] text-[#7AA600]"
                      : "bg-[#F3F4F6] text-[#050033]"
                  }`}
                >
                  {<op.icon size={20} />}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-[#090927]">
                    {op.label}
                  </p>
                  <p className="mt-0.5 text-[12px] text-[#6B7280]">
                    {op.date}
                  </p>
                </div>

                <div className="text-right">
                  <p
                    className={`text-[14px] font-bold ${
                      op.positive ? "text-[#7AA600]" : "text-[#050033]"
                    }`}
                  >
                    {op.positive ? "+" : ""}
                    {op.amount.toLocaleString("fr-FR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    €
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#6B7280]">
                    {op.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. DÉTAIL MOBILE (Affiché en dessous comme un bloc détaillé) */}
        {selectedOp && (
          <div className="rounded-[18px] border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_26px_rgba(5,0,51,0.07)] mt-4">
            <h2 className="text-[16px] font-bold text-[#090927] border-b border-[#E5E7EB] pb-3 mb-4">
              Détails de l&apos;opération
            </h2>
            
            <div className="flex flex-col items-center mb-6">
               <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#1A1A1A] text-white shadow-sm mb-3">
                  {<selectedOp.icon size={26} />}
                </div>
              <p
                className={`text-[28px] font-bold tracking-tight ${
                  selectedOp.positive ? "text-[#7AA600]" : "text-[#050033]"
                }`}
              >
                {selectedOp.positive ? "+" : ""}
                {selectedOp.amount.toLocaleString("fr-FR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                €
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[13px] text-[#6B7280]">Libellé</span>
                <span className="text-[13px] font-semibold text-[#090927] text-right">
                  {selectedOp.merchant}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[13px] text-[#6B7280]">Date</span>
                <span className="text-[13px] font-semibold text-[#090927]">
                  {selectedOp.date} à {selectedOp.time}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[13px] text-[#6B7280]">Catégorie</span>
                <span className="text-[13px] font-semibold text-[#090927]">
                  {selectedOp.category}
                </span>
              </div>
              {selectedOp.note && (
                <div className="flex justify-between">
                  <span className="text-[13px] text-[#6B7280]">Note</span>
                  <span className="text-[13px] font-semibold text-[#090927] text-right">
                    {selectedOp.note}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[13px] text-[#6B7280]">Statut</span>
                <span className="text-[13px] font-semibold text-[#090927]">
                  {selectedOp.status}
                </span>
              </div>
            </div>

            <button className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-[#050033] text-[14px] font-bold text-white transition interactive-button">
              <Download size={18} />
              Télécharger le reçu
            </button>
          </div>
        )}
      </div>
    </MobileShell>
  );
}
