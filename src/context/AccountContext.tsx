"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import type { SupabaseAccount } from "@/types/supabase";

interface AccountContextType {
  accounts: SupabaseAccount[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  isAccountBlocked: boolean;
  blockedAccount: SupabaseAccount | undefined;
  getAccountByCode: (code: string) => SupabaseAccount | undefined;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<SupabaseAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/accounts")
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((data) => {
        if (cancelled) return;
        if (data.success) { setAccounts(data.accounts); setError(null); }
        else { setError("Impossible de charger les comptes pour le moment."); }
      })
      .catch(() => { if (!cancelled) setError("Impossible de charger les comptes pour le moment."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/accounts");
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.success) { setAccounts(data.accounts); setError(null); }
      else { setError("Impossible de charger les comptes pour le moment."); }
    } catch {
      setError("Impossible de charger les comptes pour le moment.");
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  const isAccountBlocked = accounts.some((a) => a.is_blocked === true);
  const blockedAccount = accounts.find((a) => a.is_blocked === true);

  const getAccountByCode = useCallback(
    (code: string) => accounts.find((a) => a.code === code),
    [accounts],
  );

  return (
    <AccountContext.Provider
      value={{
        accounts,
        loading,
        error,
        refresh,
        isAccountBlocked,
        blockedAccount,
        getAccountByCode,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error("useAccount must be used within AccountProvider");
  }
  return context;
}
