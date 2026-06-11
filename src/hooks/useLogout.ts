"use client";

import { useRouter } from "next/navigation";

export function useLogout() {
  const router = useRouter();

  return async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST", cache: "no-store" });
    } catch (error) {
      console.error("[auth] logout failed", error);
    } finally {
      router.replace("/login");
      router.refresh();
    }
  };
}
