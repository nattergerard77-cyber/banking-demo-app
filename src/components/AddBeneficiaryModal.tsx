"use client";

import { useState } from "react";

import { formatIban } from "@/lib/validators";

type BeneficiaryFormValues = {
  name: string;
  iban: string;
  bic: string;
  bank: string;
  email: string;
  phone: string;
};

export default function AddBeneficiaryModal({
  initialValues,
  onClose,
  onSuccess,
}: {
  initialValues?: Partial<BeneficiaryFormValues>;
  onClose: () => void;
  onSuccess: (beneficiaryId: string) => void;
}) {
  const [formData, setFormData] = useState<BeneficiaryFormValues>({
    name: initialValues?.name ?? "",
    iban: initialValues?.iban ?? "",
    bic: initialValues?.bic ?? "",
    bank: initialValues?.bank ?? "",
    email: initialValues?.email ?? "",
    phone: initialValues?.phone ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.name.trim()) throw new Error("Nom du bénéficiaire obligatoire");
      if (!formData.iban.trim() || formData.iban.replace(/\s+/g, "").length < 15) {
        throw new Error("IBAN invalide");
      }
      if (!formData.bank.trim()) throw new Error("Banque obligatoire");
      if (!formData.email.trim()) throw new Error("Email obligatoire");

      const response = await fetch("/api/beneficiaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          iban: formData.iban.trim().toUpperCase(),
          bic: formData.bic.trim().toUpperCase() || undefined,
          bank: formData.bank.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
        }),
      });

      const result = (await response.json()) as {
        success: boolean;
        beneficiary?: { id: string };
        message?: string;
      };

      if (!response.ok || !result.success || !result.beneficiary?.id) {
        throw new Error(result.message || "Erreur lors de l'ajout du bénéficiaire");
      }

      onSuccess(result.beneficiary.id);
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Erreur lors de l'ajout");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-[#090927]">Ajouter un bénéficiaire</h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <input
            type="text"
            placeholder="Nom du bénéficiaire"
            value={formData.name}
            onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
            required
            className="h-11 w-full rounded-lg border border-[#E5E7EB] px-3"
          />

          <input
            type="text"
            placeholder="IBAN"
            value={formData.iban}
            onChange={(event) => setFormData((current) => ({ ...current, iban: event.target.value }))}
            onBlur={() => setFormData((current) => ({ ...current, iban: formatIban(current.iban) }))}
            required
            className="h-11 w-full rounded-lg border border-[#E5E7EB] px-3"
          />

          <input
            type="text"
            placeholder="BIC (optionnel)"
            value={formData.bic}
            onChange={(event) => setFormData((current) => ({ ...current, bic: event.target.value }))}
            className="h-11 w-full rounded-lg border border-[#E5E7EB] px-3"
          />

          <input
            type="text"
            placeholder="Banque"
            value={formData.bank}
            onChange={(event) => setFormData((current) => ({ ...current, bank: event.target.value }))}
            required
            className="h-11 w-full rounded-lg border border-[#E5E7EB] px-3"
          />

          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
            required
            className="h-11 w-full rounded-lg border border-[#E5E7EB] px-3"
          />

          <input
            type="tel"
            placeholder="Téléphone (optionnel)"
            value={formData.phone}
            onChange={(event) => setFormData((current) => ({ ...current, phone: event.target.value }))}
            className="h-11 w-full rounded-lg border border-[#E5E7EB] px-3"
          />

          {error ? <div className="text-sm text-[#DC2626]">{error}</div> : null}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-[#050033] p-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {loading ? "Ajout..." : "Ajouter"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg bg-[#E5E7EB] p-2.5 text-sm font-semibold text-[#090927]"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
