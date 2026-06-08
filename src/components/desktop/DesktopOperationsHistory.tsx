"use client";

import { useState } from "react";
import { Download, Search, Settings2, ShieldAlert } from "lucide-react";
import DesktopShell from "./DesktopShell";
import { operationsHistoryData } from "../../data/operations-history";
import { OperationHistory } from "../../types/operation";

export default function DesktopOperationsHistory() {
  const [selectedOp, setSelectedOp] = useState<OperationHistory | null>(
    operationsHistoryData.find((op) => op.id === "it-transfer-2022-07") || null
  );

  return (
    <DesktopShell>
      <div className="space-y-6">
        {/* 1. HEADER DE PAGE */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[26px] font-bold tracking-tight text-[#090927]">
              Historique complet des opérations
            </h1>
            <p className="mt-1 text-[15px] text-[#6B7280]">
              Consultez l’ensemble de vos opérations passées.
            </p>
          </div>
          <p className="mt-2 text-[13px] text-[#6B7280]">
            Dernière mise à jour : Aujourd’hui à 10:24
          </p>
        </div>

        {/* 2. TROIS CARTES DE SYNTHÈSE */}
        <div className="grid grid-cols-3 gap-5">
          <div className="rounded-[18px] border border-[#E5E7EB] bg-white p-5 shadow-[0_14px_34px_rgba(5,0,51,0.06)]">
            <h2 className="text-[14px] font-semibold text-[#090927]">
              Total des entrées
            </h2>
            <p className="mt-2 text-[24px] font-bold tracking-tight text-[#7AA600]">
              +300.000,00 €
            </p>
            <p className="mt-1 text-[13px] text-[#6B7280]">16 opérations</p>
          </div>
          <div className="rounded-[18px] border border-[#E5E7EB] bg-white p-5 shadow-[0_14px_34px_rgba(5,0,51,0.06)]">
            <h2 className="text-[14px] font-semibold text-[#090927]">
              Total des sorties
            </h2>
            <p className="mt-2 text-[24px] font-bold tracking-tight text-[#050033]">
              0,00 €
            </p>
            <p className="mt-1 text-[13px] text-[#6B7280]">0 opération</p>
          </div>
          <div className="rounded-[18px] border border-[#E5E7EB] bg-white p-5 shadow-[0_14px_34px_rgba(5,0,51,0.06)]">
            <h2 className="text-[14px] font-semibold text-[#090927]">
              Solde net
            </h2>
            <p className="mt-2 text-[24px] font-bold tracking-tight text-[#7AA600]">
              +300.000,00 €
            </p>
            <p className="mt-1 text-[13px] text-[#6B7280]">
              Sur la période sélectionnée
            </p>
          </div>
        </div>

        {/* 3. BLOC DE FILTRES */}
        <div className="rounded-[18px] border border-[#E5E7EB] bg-white p-5 shadow-[0_14px_34px_rgba(5,0,51,0.06)] flex items-center justify-between">
          <div className="flex gap-4">
            <select className="h-10 rounded-[10px] border border-[#E5E7EB] bg-transparent px-4 text-[13px] font-semibold text-[#090927] outline-none hover:border-[#D1D5DB] focus:border-[#050033]">
              <option>Tous les comptes</option>
            </select>
            <select className="h-10 rounded-[10px] border border-[#E5E7EB] bg-transparent px-4 text-[13px] font-semibold text-[#090927] outline-none hover:border-[#D1D5DB] focus:border-[#050033]">
              <option>15 janvier 2015 – 15 juillet 2022</option>
            </select>
            <select className="h-10 rounded-[10px] border border-[#E5E7EB] bg-transparent px-4 text-[13px] font-semibold text-[#090927] outline-none hover:border-[#D1D5DB] focus:border-[#050033]">
              <option>Toutes les catégories</option>
            </select>
            <div className="flex h-10 w-[240px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] px-3">
              <Search size={16} className="text-[#6B7280]" />
              <input
                type="text"
                placeholder="Rechercher une opération..."
                className="h-full w-full bg-transparent text-[13px] outline-none placeholder:text-[#9CA3AF]"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex h-10 items-center gap-2 rounded-[10px] bg-[#F6F7F9] px-4 text-[13px] font-semibold text-[#050033] hover:bg-[#EEF0F3] transition interactive-button">
              <Settings2 size={16} />
              Filtres avancés
            </button>
            <button className="flex h-10 items-center gap-2 rounded-[10px] border border-[#050033] px-4 text-[13px] font-semibold text-[#050033] hover:bg-gray-50 transition interactive-button">
              <Download size={16} />
              Exporter
            </button>
          </div>
        </div>

        {/* 4. TABLEAU DES OPÉRATIONS & PANNEAU DE DÉTAIL */}
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-8">
            <div className="rounded-[18px] border border-[#E5E7EB] bg-white shadow-[0_14px_34px_rgba(5,0,51,0.06)] overflow-hidden">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-[#F6F7F9] text-[#6B7280] font-semibold border-b border-[#E5E7EB]">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Date</th>
                    <th className="px-5 py-4 font-semibold">Libellé</th>
                    <th className="px-5 py-4 font-semibold">Catégorie</th>
                    <th className="px-5 py-4 font-semibold text-right">Montant</th>
                    <th className="px-5 py-4 font-semibold text-center">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {operationsHistoryData.map((op) => (
                    <tr
                      key={op.id}
                      onClick={() => setSelectedOp(op)}
                      className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedOp?.id === op.id ? "bg-[#FBFFF1]" : "bg-white"
                      }`}
                    >
                      <td className="px-5 py-4 text-[#6B7280] whitespace-nowrap">
                        {op.date}
                      </td>
                      <td className="px-5 py-4 font-semibold text-[#090927]">
                        {op.label}
                      </td>
                      <td className="px-5 py-4 text-[#6B7280]">
                        <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-[11px] font-semibold text-[#050033]">
                          {op.category}
                        </span>
                      </td>
                      <td
                        className={`px-5 py-4 font-bold text-right whitespace-nowrap ${
                          op.positive ? "text-[#7AA600]" : "text-[#050033]"
                        }`}
                      >
                        {op.positive ? "+" : ""}
                        {op.amount.toLocaleString("fr-FR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        €
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="text-[#6B7280]">{op.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* 6. PAGINATION */}
              <div className="flex items-center justify-between border-t border-[#E5E7EB] bg-white px-5 py-4">
                <p className="text-[13px] text-[#6B7280]">
                  Affichage de 1 à 16 sur 16 opérations
                </p>
                <div className="flex gap-1 text-[13px] font-semibold text-[#050033]">
                  <button className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#050033] text-white interactive-button">
                    1
                  </button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-[8px] hover:bg-[#F3F4F6] interactive-button">
                    2
                  </button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-[8px] hover:bg-[#F3F4F6] interactive-button">
                    3
                  </button>
                  <span className="flex h-8 w-8 items-center justify-center">
                    ...
                  </span>
                  <button className="flex h-8 w-8 items-center justify-center rounded-[8px] hover:bg-[#F3F4F6] interactive-button">
                    7
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-4">
            {selectedOp && (
              <div className="rounded-[18px] border border-[#E5E7EB] bg-white p-6 shadow-[0_14px_34px_rgba(5,0,51,0.06)] sticky top-[80px]">
                <h2 className="text-[18px] font-bold text-[#090927]">
                  Détail de l’opération
                </h2>

                <div className="mt-6 flex flex-col items-center text-center">
                  <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#1A1A1A] text-white shadow-sm">
                    {<selectedOp.icon size={32} />}
                  </div>
                  <p
                    className={`mt-4 text-[32px] font-bold tracking-tight ${
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
                  <p className="mt-1 text-[15px] font-semibold text-[#090927]">
                    {selectedOp.merchant}
                  </p>
                  <span className="mt-3 rounded-full bg-[#EEF7D8] px-3 py-1 text-[12px] font-bold text-[#7AA600]">
                    {selectedOp.category}
                  </span>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="flex justify-between border-b border-[#E5E7EB] pb-4">
                    <span className="text-[13px] text-[#6B7280]">
                      Date et heure
                    </span>
                    <span className="text-[13px] font-semibold text-[#090927]">
                      {selectedOp.date} à {selectedOp.time}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#E5E7EB] pb-4">
                    <span className="text-[13px] text-[#6B7280]">
                      Compte
                    </span>
                    <div className="text-right">
                      <span className="block text-[13px] font-semibold text-[#090927]">
                        {selectedOp.account}
                      </span>
                      <span className="block text-[12px] text-[#6B7280]">
                        {selectedOp.iban}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between border-b border-[#E5E7EB] pb-4">
                    <span className="text-[13px] text-[#6B7280]">Statut</span>
                    <span className="text-[13px] font-semibold text-[#090927]">
                      {selectedOp.status}
                    </span>
                  </div>
                  {selectedOp.note && (
                    <div className="flex justify-between border-b border-[#E5E7EB] pb-4">
                      <span className="text-[13px] text-[#6B7280]">Note</span>
                      <span className="text-[13px] font-semibold text-[#090927]">
                        {selectedOp.note}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-8 space-y-3">
                  <button className="flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-[#050033] text-[14px] font-bold text-white transition hover:bg-[#122242] interactive-button">
                    <Download size={18} />
                    Télécharger le reçu
                  </button>
                  <button className="flex h-11 w-full items-center justify-center gap-2 rounded-[10px] border border-[#E5E7EB] text-[14px] font-semibold text-[#090927] transition hover:bg-[#F6F7F9] interactive-button">
                    <ShieldAlert size={18} className="text-[#6B7280]" />
                    Contester cette opération
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DesktopShell>
  );
}
