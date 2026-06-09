"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "lastLoginAt";

function formatLastLogin(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const time = date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isToday) {
    return `aujourd'hui à ${time}`;
  }

  return `${date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })} à ${time}`;
}

export function useLastLogin(): string {
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const now = new Date().toISOString();
    const stored = localStorage.getItem(STORAGE_KEY);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLabel(formatLastLogin(stored || now));
    localStorage.setItem(STORAGE_KEY, now);
  }, []);

  return label;
}
