export type Language = "fr" | "en";

export const languages = [
  {
    id: "fr" as const,
    code: "FR",
    label: "Français",
    flag: "/flags/fr.svg",
  },
  {
    id: "en" as const,
    code: "GB",
    label: "English",
    flag: "/flags/gb.svg",
  },
];

export function getLanguageMeta(language: Language) {
  return languages.find((item) => item.id === language) ?? languages[0];
}

export function readLanguage(): Language {
  if (typeof window === "undefined") return "fr";
  const saved = window.localStorage.getItem("language");
  return saved === "en" ? "en" : "fr";
}

export function writeLanguage(language: Language) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("language", language);
}

export const getStoredLanguage = readLanguage;
export const setStoredLanguage = writeLanguage;
