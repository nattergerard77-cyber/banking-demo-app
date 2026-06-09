"use client";

import { useEffect } from "react";

export function ThemeInitializer() {
  useEffect(() => {
    try {
      const theme = window.localStorage.getItem("theme");
      document.documentElement.classList.toggle("dark", theme === "dark");
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  return null;
}
