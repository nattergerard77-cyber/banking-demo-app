"use client";

import { useEffect } from "react";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { SupabaseTransfer } from "@/types/supabase";

const supabase = createBrowserSupabaseClient();

type TransfersApiResponse =
  | { success: true; transfers: SupabaseTransfer[] }
  | { success: false; error: string; message?: string };

export function useTransfersRealtime(
  onDataChange: (transfers: SupabaseTransfer[]) => void,
  accountId?: string,
  limit = 5,
) {
  useEffect(() => {
    let cancelled = false;

    async function fetchTransfers() {
      try {
        const response = await fetch(`/api/transfers?limit=${limit}`, { cache: "no-store" });
        const result = (await response.json()) as TransfersApiResponse;

        if (!response.ok || !result.success || cancelled) {
          if (!cancelled) onDataChange([]);
          return;
        }

        const filteredTransfers = accountId
          ? result.transfers.filter((transfer) => transfer.accountId === accountId)
          : result.transfers;

        onDataChange(filteredTransfers);
      } catch {
        if (!cancelled) onDataChange([]);
      }
    }

    void fetchTransfers();

    const channel = supabase
      .channel(`transfers_changes_${accountId ?? "all"}_${limit}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transfers",
          filter: accountId ? `account_id=eq.${accountId}` : undefined,
        },
        () => {
          void fetchTransfers();
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [accountId, limit, onDataChange]);
}
