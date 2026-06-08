"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export function ClientOnlyChart({ children }: { children: React.ReactNode }) {
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!mounted) {
    return (
      <div className="flex h-full min-h-[180px] items-center justify-center rounded-[14px] bg-[#F6F7F9] text-[13px] text-[#6B7280]">
        Chargement du graphique…
      </div>
    );
  }

  return <>{children}</>;
}

export default ClientOnlyChart;
