"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Bell,
  Check,
  ChevronRight,
  CreditCard,
  Edit3,
  Eye,
  FileText,
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
  Smartphone,
  User,
} from "lucide-react";

import DemoModal from "../shared/DemoModal";
import DemoSwitch from "../shared/DemoSwitch";
import DemoToast from "../shared/DemoToast";
import DesktopShell from "./DesktopShell";
import { useLanguage } from "@/context/LanguageContext";

const settingsSections = [
  {
    title: "Profil",
    description: "Informations personnelles et coordonnées",
    icon: User,
  },
  {
    title: "Sécurité",
    description: "Mot de passe, appareils et authentification",
    icon: ShieldCheck,
  },
  {
    title: "Préférences",
    description: "Langue, affichage et notifications",
    icon: Bell,
  },
  {
    title: "Documents",
    description: "Relevés, contrats et justificatifs",
    icon: FileText,
  },
];

const securityItems = [
  {
    title: "Authentification renforcée",
    description: "Protection active via l’accès client sécurisé",
    active: true,
    icon: ShieldCheck,
  },
  {
    title: "Connexion biométrique",
    description: "Déverrouillage mobile par empreinte ou visage",
    active: true,
    icon: Eye,
  },
  {
    title: "Alertes de connexion",
    description: "Recevoir une alerte à chaque nouvel appareil",
    active: true,
    icon: Bell,
  },
  {
    title: "Mode confidentialité",
    description: "Masquer les montants sensibles dans l’interface",
    active: false,
    icon: LockKeyhole,
  },
];

const devices = [
  {
    name: "Chrome sur Windows",
    location: "Luxembourg",
    status: "Actif maintenant",
    icon: MonitorSmartphone,
  },
  {
    name: "iPhone de Frederico",
    location: "Application mobile",
    status: "Dernière activité : hier",
    icon: Smartphone,
  },
];

const languages = [
  { id: "fr", label: "Francais", flag: "🇫🇷" },
  { id: "en", label: "English", flag: "🇬🇧" },
] as const;

function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[18px] border border-[#E5E7EB] bg-white shadow-[0_14px_34px_rgba(5,0,51,0.06)] ${className}`}
    >
      {children}
    </div>
  );
}

function SectionButton({ section, active, onClick, isEn }: { section: (typeof settingsSections)[number]; active: boolean; onClick: () => void; isEn: boolean }) {
  const Icon = section.icon;
  const titleMap: Record<string, string> = { Profil: "Profile", "Sécurité": "Security", "Préférences": "Preferences", Documents: "Documents" };
  const descriptionMap: Record<string, string> = {
    "Informations personnelles et coordonnées": "Personal information and contact details",
    "Mot de passe, appareils et authentification": "Password, devices and authentication",
    "Langue, affichage et notifications": "Language, display and notifications",
    "Relevés, contrats et justificatifs": "Statements, contracts and documents",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-[14px] border p-4 text-left interactive-card ${
        active
          ? "border-[#9ACD00] bg-[#FBFFF1]"
          : "border-[#E5E7EB] bg-white"
      }`}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            active ? "bg-[#050033] text-white" : "bg-[#F3F4F6] text-[#050033]"
          }`}
        >
          <Icon size={18} />
        </span>

        <span className="min-w-0">
          <span className="block text-[14px] font-bold text-[#090927]">
            {isEn ? titleMap[section.title] ?? section.title : section.title}
          </span>
          <span className="mt-1 block text-[12px] text-[#6B7280]">
            {isEn ? descriptionMap[section.description] ?? section.description : section.description}
          </span>
        </span>
      </span>

      <ChevronRight size={17} className="arrow-icon text-[#050033]" />
    </button>
  );
}

function ToggleSetting({ item, checked, onChange, isEn }: { item: (typeof securityItems)[number]; checked: boolean; onChange: (value: boolean) => void; isEn: boolean }) {
  const Icon = item.icon;
  const titleMap: Record<string, string> = {
    "Authentification renforcée": "Enhanced authentication",
    "Connexion biométrique": "Biometric login",
    "Alertes de connexion": "Login alerts",
    "Mode confidentialité": "Privacy mode",
  };

  return (
    <div className="flex items-center justify-between rounded-[14px] border border-[#E5E7EB] p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6] text-[#050033]">
          <Icon size={18} />
        </span>

        <div>
          <p className="text-[14px] font-bold text-[#090927]">{isEn ? titleMap[item.title] ?? item.title : item.title}</p>
          <p className="mt-1 text-[12px] text-[#6B7280]">
            {item.description}
          </p>
        </div>
      </div>

      <DemoSwitch checked={checked} onChange={onChange} label={item.title} />
    </div>
  );
}

export function DesktopSettings() {
  const [activeSection, setActiveSection] = useState("Profil");
  const [securityState, setSecurityState] = useState<Record<string, boolean>>(
    Object.fromEntries(securityItems.map((item) => [item.title, item.active])),
  );
  const [darkMode, setDarkMode] = useState(false);
  const [weeklySummary, setWeeklySummary] = useState(true);
  const { language: selectedLanguage, setLanguage: handleLanguageChange, t } = useLanguage();
  const [modal, setModal] = useState<null | "profile" | "password" | "logout" | "language" | "device">(null);
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

  const isEn = selectedLanguage === "en";

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
    <DesktopShell>
      <div className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[26px] font-bold tracking-tight text-[#090927]">
              {t("settings.title")}
            </h1>
            <p className="mt-1 text-[15px] text-[#6B7280]">
              {t("settings.subtitle")}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModal("profile")}
            className="flex h-10 items-center gap-2 rounded-[10px] bg-[#050033] px-4 text-[14px] font-bold text-white interactive-button"
          >
            <Edit3 size={16} />
            {isEn ? "Edit profile" : "Modifier le profil"}
          </button>
        </div>

        <div className="grid grid-cols-12 gap-5">
          <Card className="col-span-4 p-5">
            <h2 className="text-[18px] font-bold text-[#090927]">
              {isEn ? "Categories" : "Categories"}
            </h2>

            <div className="mt-4 space-y-3">
              {settingsSections.map((section) => (
                <SectionButton
                  key={section.title}
                  section={section}
                  active={activeSection === section.title}
                  onClick={() => setActiveSection(section.title)}
                  isEn={isEn}
                />
              ))}
            </div>
          </Card>

          <Card className="col-span-5 p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#050033] text-[20px] font-bold text-white">
                  FM
                </span>

                <div>
                  <h2 className="text-[22px] font-bold text-[#090927]">
                    Frederico Di Mario
                  </h2>
                  <p className="mt-1 text-[13px] text-[#6B7280]">
                    Cliente Raiffeisen depuis 2021
                  </p>
                  <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#EEF7D8] px-3 py-1 text-[12px] font-semibold text-[#050033]">
                    <ShieldCheck size={14} className="text-[#7AA600]" />
                    Profil vérifié
                  </span>
                </div>
              </div>

              <button
                type="button"
                aria-label="Modifier le profil"
                onClick={() => setModal("profile")}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#050033]"
              >
                <Edit3 size={18} />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-[14px] bg-[#F6F7F9] p-4">
                <p className="flex items-center gap-2 text-[12px] text-[#6B7280]">
                  <Mail size={14} />
                  Email
                </p>
                <p className="mt-2 text-[14px] font-bold text-[#090927]">
                  fredericodimario8@gmail.com
                </p>
              </div>

              <div className="rounded-[14px] bg-[#F6F7F9] p-4">
                <p className="flex items-center gap-2 text-[12px] text-[#6B7280]">
                  <Phone size={14} />
                  Téléphone
                </p>
                <p className="mt-2 text-[14px] font-bold text-[#090927]">
                  +352 621 000 245
                </p>
              </div>

              <div className="rounded-[14px] bg-[#F6F7F9] p-4">
                <p className="flex items-center gap-2 text-[12px] text-[#6B7280]">
                  <Globe2 size={14} />
                  Pays
                </p>
                <p className="mt-2 text-[14px] font-bold text-[#090927]">
                  Luxembourg
                </p>
              </div>

              <div className="rounded-[14px] bg-[#F6F7F9] p-4">
                <p className="flex items-center gap-2 text-[12px] text-[#6B7280]">
                  <CreditCard size={14} />
                  Statut client
                </p>
                <p className="mt-2 text-[14px] font-bold text-[#090927]">
                  Premium
                </p>
              </div>
            </div>
          </Card>

          <Card className="col-span-3 p-5">
            <h2 className="text-[18px] font-bold text-[#090927]">
              {isEn ? "Quick access" : "Acces rapide"}
            </h2>

            <div className="mt-4 space-y-3">
                {[
                  { icon: KeyRound, label: isEn ? "Change password" : "Changer le mot de passe" },
                  { icon: LockKeyhole, label: isEn ? "Account security" : "Securite du compte" },
                  { icon: FileText, label: isEn ? "Personal documents" : "Documents personnels" },
                  { icon: LogOut, label: t("settings.logout") },
                ].map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      if (item.label === "Changer le mot de passe" || item.label === "Change password") setModal("password");
                      if (item.label === "Securite du compte" || item.label === "Account security") setActiveSection("Sécurité");
                      if (item.label === "Documents personnels" || item.label === "Personal documents") setActiveSection("Documents");
                      if (item.label === "Deconnexion" || item.label === "Sign out") setModal("logout");
                    }}
                    className="flex h-11 w-full items-center justify-between rounded-[12px] border border-[#E5E7EB] px-3 text-left interactive-button"
                  >
                    <span className="flex items-center gap-3 text-[13px] font-semibold text-[#090927]">
                      <Icon size={17} />
                      {item.label}
                    </span>
                    <ChevronRight size={16} className="arrow-icon text-[#050033]" />
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-12 gap-5">
          <Card className="col-span-7 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[18px] font-bold text-[#090927]">
                {isEn ? "Security and privacy" : "Securite et confidentialite"}
              </h2>

              <span className="rounded-full bg-[#EEF7D8] px-3 py-1 text-[12px] font-bold text-[#050033]">
                3 actives
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {securityItems.map((item) => (
                <ToggleSetting
                  key={item.title}
                  item={item}
                  checked={securityState[item.title]}
                  onChange={(value) =>
                    setSecurityState((current) => ({ ...current, [item.title]: value }))
                  }
                  isEn={isEn}
                />
              ))}
            </div>
          </Card>

          <Card className="col-span-5 p-5">
            <h2 className="text-[18px] font-bold text-[#090927]">
              {isEn ? "Display preferences" : "Preferences d'affichage"}
            </h2>

            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={() => setModal("language")}
                className="flex w-full items-center justify-between rounded-[14px] border border-[#E5E7EB] p-4 text-left interactive-button"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6] text-[#050033]">
                    <Languages size={18} />
                  </span>
                  <span>
                    <span className="block text-[14px] font-bold text-[#090927]">
                      {t("settings.language")}
                    </span>
                     <span className="mt-1 block text-[12px] text-[#6B7280]">
                       {selectedLanguage === "fr" ? "Francais" : "English"}
                     </span>
                  </span>
                </span>

                <ChevronRight size={17} className="text-[#050033]" />
              </button>

              <div className="flex items-center justify-between rounded-[14px] border border-[#E5E7EB] p-4">
                <span className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6] text-[#050033]">
                    <Moon size={18} />
                  </span>
                  <span>
                    <span className="block text-[14px] font-bold text-[#090927]">
                       {t("settings.theme")}
                    </span>
                     <span className="mt-1 block text-[12px] text-[#6B7280]">
                       {darkMode ? (isEn ? "Enabled" : "Active") : (isEn ? "Disabled" : "Desactive")}
                     </span>
                  </span>
                </span>

                <DemoSwitch
                  checked={darkMode}
                  onChange={handleDarkThemeChange}
                  label="Activer le theme sombre"
                />
              </div>

              <div className="flex items-center justify-between rounded-[14px] border border-[#E5E7EB] p-4">
                <span className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6] text-[#050033]">
                    <Bell size={18} />
                  </span>
                  <span>
                    <span className="block text-[14px] font-bold text-[#090927]">
                       {t("settings.notifications")}
                    </span>
                    <span className="mt-1 block text-[12px] text-[#6B7280]">
                       {isEn ? "Every Monday morning" : "Chaque lundi matin"}
                    </span>
                  </span>
                </span>

                <DemoSwitch
                  checked={weeklySummary}
                  onChange={setWeeklySummary}
                  label="Activer le resume hebdomadaire"
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-12 gap-5">
          <Card className="col-span-7 p-5">
            <h2 className="text-[18px] font-bold text-[#090927]">
              {isEn ? "Connected devices" : "Appareils connectes"}
            </h2>

            <div className="mt-4 space-y-3">
              {devices.map((device) => {
                const Icon = device.icon;

                return (
                  <div
                    key={device.name}
                    className="flex items-center justify-between rounded-[14px] border border-[#E5E7EB] p-4 interactive-row"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6] text-[#050033]">
                        <Icon size={18} />
                      </span>

                      <div>
                        <p className="text-[14px] font-bold text-[#090927]">
                          {device.name}
                        </p>
                        <p className="mt-1 text-[12px] text-[#6B7280]">
                          {device.location} · {device.status}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setModal("device")}
                      className="flex items-center gap-1 text-[13px] font-semibold text-[#050033] interactive-link"
                    >
                      Gérer
                      <ChevronRight size={13} className="arrow-icon" />
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="col-span-5 p-5">
            <h2 className="text-[18px] font-bold text-[#090927]">
              {isEn ? "System information" : "Informations systeme"}
            </h2>

            <div className="mt-4 rounded-[16px] bg-[#F6F7F9] p-4">
              <div className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEF7D8] text-[#7AA600]">
                  <ShieldCheck size={20} />
                </span>

                <div>
                  <p className="text-[14px] font-bold text-[#090927]">
                    Informations système
                  </p>
                  <p className="mt-2 text-[13px] leading-[1.45] text-[#6B7280]">
                    Ces paramètres s&apos;appliquent à cette interface.
                    Toutes les informations sont presentees a titre indicatif.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setToast("Export de donnees prepare ")}
              className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-[10px] border border-[#050033] text-[14px] font-semibold text-[#050033] interactive-button"
            >
              {isEn ? "Download my data" : "Telecharger mes donnees"}
              <FileText size={16} />
            </button>
          </Card>
        </div>
      </div>
      <DemoModal
        open={modal === "profile"}
        title="Modifier le profil"
        message="Modification du profil."
        onClose={() => setModal(null)}
        onConfirm={() => {
          setModal(null);
          setToast("Profil mis a jour ");
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
        title="Gerer cet appareil"
        message="Actions de sécurité disponibles pour cet appareil."
        onClose={() => setModal(null)}
        onConfirm={() => {
          setModal(null);
          setToast("Appareil gere ");
        }}
      />
      <DemoModal
        open={modal === "logout"}
        title="Confirmer la deconnexion"
        message="Voulez-vous fermer cette session ?"
        confirmLabel="Se deconnecter"
        onClose={() => setModal(null)}
        onConfirm={() => {
          setModal(null);
          setToast("Session fermee.");
        }}
      />
      <DemoToast open={Boolean(toast)} message={toast} onClose={() => setToast("")} />
    </DesktopShell>
  );
}

export default DesktopSettings;


