"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Bell,
  Check,
  ChevronRight,
  CreditCard,
  Edit3,
  Eye,
  Globe2,
  KeyRound,
  Languages,
  LockKeyhole,
  LogOut,
  Mail,
  MonitorSmartphone,
  Moon,
  Phone,
  ShieldCheck,
} from "lucide-react";

import DemoModal from "../shared/DemoModal";
import DemoSwitch from "../shared/DemoSwitch";
import DemoToast from "../shared/DemoToast";
import MobileShell from "./MobileShell";
import { useLogout } from "@/hooks/useLogout";
import { useLanguage } from "@/context/LanguageContext";
import { useCurrentDevice } from "@/hooks/useCurrentDevice";

const securityItems = [
  { title: "Authentification renforcée", active: true, icon: ShieldCheck },
  { title: "Connexion biométrique", active: true, icon: Eye },
  { title: "Alertes de connexion", active: true, icon: Bell },
  { title: "Mode confidentialité", active: false, icon: LockKeyhole },
];

const languages = [
  { id: "fr", label: "Francais", flag: "🇫🇷" },
  { id: "en", label: "English", flag: "🇬🇧" },
] as const;

function MobileCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[18px] border border-[#E5E7EB] bg-white shadow-[0_10px_26px_rgba(5,0,51,0.07)] ${className}`}
    >
      {children}
    </div>
  );
}

export function MobileSettings() {
  const [securityState, setSecurityState] = useState<Record<string, boolean>>(
    Object.fromEntries(securityItems.map((item) => [item.title, item.active])),
  );
  const [darkMode, setDarkMode] = useState(false);
  const [weeklySummary, setWeeklySummary] = useState(true);
  const { language: selectedLanguage, setLanguage: handleLanguageChange, t } = useLanguage();
  const [modal, setModal] = useState<
    null | "profile" | "personal" | "language" | "device" | "password" | "exit"
  >(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const syncTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setDarkMode(isDark);
    };
    syncTheme();
    window.addEventListener("storage", syncTheme);
    window.addEventListener("theme-change", syncTheme as EventListener);
    return () => {
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener("theme-change", syncTheme as EventListener);
    };
  }, []);

  const currentDevice = useCurrentDevice();
  const logout = useLogout();
  const isEn = selectedLanguage === "en";
  const securityTitleMap: Record<string, string> = {
    "Authentification renforcée": "Enhanced authentication",
    "Connexion biométrique": "Biometric login",
    "Alertes de connexion": "Login alerts",
    "Mode confidentialité": "Privacy mode",
  };

  function onLanguageChange(lang: "fr" | "en") {
    handleLanguageChange(lang);
    setModal(null);
    setToast(lang === "en" ? "Language updated." : "Langue modifiee.");
  }

  function handleDarkThemeChange(checked: boolean) {
    setDarkMode(checked);
    document.documentElement.classList.toggle("dark", checked);
    localStorage.setItem("theme", checked ? "dark" : "light");
    window.dispatchEvent(new Event("theme-change"));
  }
  return (
    <MobileShell>
      <div className="space-y-4">
        <section className="flex items-end justify-between">
          <div>
            <h1 className="text-[24px] font-bold tracking-tight text-[#090927]">
              {t("settings.title")}
            </h1>
            <p className="mt-1 text-[14px] text-[#6B7280]">
              {t("settings.subtitle")}
            </p>
          </div>

          <button
            type="button"
            aria-label="Modifier le profil"
            onClick={() => setModal("profile")}
            className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#050033] text-white"
          >
            <Edit3 size={18} />
          </button>
        </section>

        <MobileCard className="p-4">
          <div className="flex items-start gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#050033] text-[20px] font-bold text-white">
              FM
            </span>

            <div className="min-w-0 flex-1">
              <h2 className="text-[20px] font-bold text-[#090927]">
                Frederico Di Mario
              </h2>
              <p className="mt-1 text-[13px] text-[#6B7280]">
                Client Raiffeisen depuis 2015
              </p>

              <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#EEF7D8] px-3 py-1 text-[12px] font-semibold text-[#050033]">
                <ShieldCheck size={14} className="text-[#7AA600]" />
                {isEn ? "Verified profile" : "Profil verifie"}
              </span>
            </div>
          </div>
        </MobileCard>

        <MobileCard className="p-4">
          <h2 className="text-[17px] font-bold text-[#090927]">
            {isEn ? "Personal information" : "Informations personnelles"}
          </h2>

          <div className="mt-3 divide-y divide-[#E5E7EB]">
            {[
              { icon: Mail, label: "Email", value: "fredericodimario8@gmail.com" },
              { icon: Phone, label: "Téléphone", value: "+33 7 74 36 43 82" },
              { icon: Globe2, label: "Pays", value: "Luxembourg" },
              { icon: CreditCard, label: "Statut", value: "Premium" },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  role="button"
                  tabIndex={0}
                  onClick={() => setModal("personal")}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") setModal("personal");
                  }}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-[#050033]">
                      <Icon size={17} />
                    </span>

                    <div className="min-w-0">
                      <p className="text-[12px] text-[#6B7280]">
                        {item.label}
                      </p>
                      <p className="truncate text-[14px] font-bold text-[#090927]">
                        {item.value}
                      </p>
                    </div>
                  </div>

                  <ChevronRight size={17} className="text-[#050033]" />
                </div>
              );
            })}
          </div>
        </MobileCard>

        <MobileCard className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[17px] font-bold text-[#090927]">
              {isEn ? "Security" : "Securite"}
            </h2>

            <span className="rounded-full bg-[#EEF7D8] px-3 py-1 text-[12px] font-bold text-[#050033]">
              3 actives
            </span>
          </div>

          <div className="space-y-3">
            {securityItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="flex items-center justify-between rounded-[14px] border border-[#E5E7EB] p-3"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-[#050033]">
                      <Icon size={17} />
                    </span>
                    <span className="text-[14px] font-bold text-[#090927]">{isEn ? securityTitleMap[item.title] ?? item.title : item.title}</span>
                  </span>

                  <DemoSwitch
                    checked={securityState[item.title]}
                    onChange={(value) =>
                      setSecurityState((current) => ({ ...current, [item.title]: value }))
                    }
                    label={item.title}
                  />
                </div>
              );
            })}
          </div>
        </MobileCard>

        <MobileCard className="p-4">
          <h2 className="text-[17px] font-bold text-[#090927]">
            Préférences
          </h2>

          <div className="mt-3 divide-y divide-[#E5E7EB]">
            {[
              { icon: Languages, label: t("settings.language"), value: selectedLanguage === "fr" ? "Francais" : "English", toggle: false },
              { icon: Moon, label: t("settings.theme"), value: darkMode ? (isEn ? "Enabled" : "Active") : (isEn ? "Disabled" : "Desactive"), toggle: true, active: false },
              { icon: Bell, label: t("settings.notifications"), value: isEn ? "Every Monday morning" : "Lundi matin", toggle: true, active: true },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F4F6] text-[#050033]">
                      <Icon size={17} />
                    </span>
                    <div>
                      <p className="text-[14px] font-bold text-[#090927]">
                        {item.label}
                      </p>
                      <p className="mt-1 text-[12px] text-[#6B7280]">
                        {item.value}
                      </p>
                    </div>
                  </div>

                    {item.toggle ? (
                      <DemoSwitch
                        checked={item.label === t("settings.theme") ? darkMode : weeklySummary}
                        onChange={item.label === t("settings.theme") ? handleDarkThemeChange : setWeeklySummary}
                        label={item.label}
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setModal("language")}
                        className="rounded"
                      >
                        <ChevronRight size={17} className="text-[#050033]" />
                      </button>
                    )}
                </div>
              );
            })}
          </div>
        </MobileCard>

        <MobileCard className="p-4">
          <h2 className="text-[17px] font-bold text-[#090927]">
            {isEn ? "Connected devices" : "Appareils connectes"}
          </h2>

          <div className="mt-3 space-y-3">
            {currentDevice ? (
              <div
                role="button"
                tabIndex={0}
                onClick={() => setModal("device")}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") setModal("device");
                }}
                className="flex items-center justify-between rounded-[14px] border border-[#E5E7EB] p-3"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEF7D8] text-[#7AA600]">
                    <MonitorSmartphone size={17} />
                  </span>

                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-bold text-[#090927]">
                      {currentDevice.browser} sur {currentDevice.os}
                    </span>
                    <span className="mt-1 block truncate text-[12px] text-[#6B7280]">
                      {currentDevice.resolution} ·{isEn ? " Active now" : " Actif maintenant"}
                    </span>
                  </span>
                </span>

                <ChevronRight size={17} className="text-[#050033]" />
              </div>
            ) : (
              <div className="rounded-[14px] border border-[#E5E7EB] p-3 text-center text-[13px] text-[#6B7280]">
                {isEn ? "Detecting device..." : "Detection de l'appareil..."}
              </div>
            )}
          </div>
        </MobileCard>

        <MobileCard className="p-4">
          <div className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEF7D8] text-[#7AA600]">
              <ShieldCheck size={20} />
            </span>

            <div>
              <h2 className="text-[15px] font-bold text-[#090927]">
                Informations système
              </h2>
              <p className="mt-1 text-[13px] leading-[1.4] text-[#6B7280]">
                Ces paramètres s&apos;appliquent à cette interface.
                Toutes les informations sont presentees a titre indicatif.
              </p>
            </div>
          </div>
        </MobileCard>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setModal("password")}
            className="flex h-11 items-center justify-center gap-2 rounded-[12px] border border-[#050033] text-[13px] font-semibold text-[#050033]"
          >
            <KeyRound size={15} />
            Mot de passe
          </button>

          <button
            type="button"
            onClick={() => setModal("exit")}
            className="flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[#050033] text-[13px] font-bold text-white"
          >
            <LogOut size={15} />
            {t("settings.logout")}
          </button>
        </div>
      </div>
      <DemoModal
        open={modal === "profile"}
        title="Modifier le profil"
        message="Modification du profil."
        onClose={() => setModal(null)}
        onConfirm={() => {
          setModal(null);
          setToast("Profil modifie ");
        }}
      />
      <DemoModal
        open={modal === "personal"}
        title="Informations personnelles"
        message="Details consultables sur cette interface."
        onClose={() => setModal(null)}
      />
      {modal === "language" ? (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-[#050033]/40 p-4" onClick={() => setModal(null)}>
          <div role="dialog" aria-modal="true" className="w-full max-w-[520px] rounded-2xl border border-border bg-card p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <h2 className="text-lg font-bold text-navy">{isEn ? "Language" : "Langue"}</h2>
            <p className="mt-2 text-sm text-text-secondary">{isEn ? "Choose your display language." : "Choisissez votre langue d'affichage."}</p>
            <div className="mt-4 space-y-2">
              {languages.map((language) => {
                const isSelected = selectedLanguage === language.id;
                return (
                  <button
                    key={language.id}
                    type="button"
                    aria-pressed={isSelected}
                    aria-label={`Choisir ${language.label}`}
                    onClick={() => onLanguageChange(language.id)}
                    className={`flex w-full items-center justify-between rounded-[12px] border p-3 text-left ${isSelected ? "border-[#9ACD00] bg-[#F7FBEA]" : "border-[#E5E7EB] bg-white"}`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-[18px]">{language.flag}</span>
                      <span>
                        <span className="block text-[14px] font-bold text-[#090927]">{language.label}</span>
                        <span className="mt-1 block text-[12px] text-[#6B7280]">{isSelected ? (isEn ? "Current language" : "Langue actuelle") : language.id === "en" ? "Available language" : (isEn ? "Available language" : "Langue disponible")}</span>
                      </span>
                    </span>
                    {isSelected ? <Check size={16} className="text-[#7AA600]" /> : null}
                  </button>
                );
              })}
            </div>
            <div className="mt-5 flex justify-end">
              <button type="button" onClick={() => setModal(null)} className="h-10 rounded-lg border border-border px-4 text-sm font-semibold text-text-primary">{isEn ? "Close" : "Fermer"}</button>
            </div>
          </div>
        </div>
      ) : null}
      <DemoModal
        open={modal === "device"}
        title="Appareils connectes"
        message="Gestion de l'appareil sélectionné."
        onClose={() => setModal(null)}
        onConfirm={() => {
          setModal(null);
          setToast("Appareil gere ");
        }}
      />
      <DemoModal
        open={modal === "password"}
        title="Changer le mot de passe"
        message="Mise à jour du mot de passe."
        onClose={() => setModal(null)}
        onConfirm={() => {
          setModal(null);
          setToast("Mot de passe modifie ");
        }}
      />
      <DemoModal
        open={modal === "exit"}
        title="Quitter la session"
        message="Confirmez-vous la fermeture de cette session ?"
        confirmLabel="Quitter"
        onClose={() => setModal(null)}
        onConfirm={() => {
          setModal(null);
          logout();
        }}
      />
      <DemoToast open={Boolean(toast)} message={toast} onClose={() => setToast("")} />
    </MobileShell>
  );
}

export default MobileSettings;
