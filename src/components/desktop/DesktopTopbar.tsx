"use client";

import Image from 'next/image';
import { Search, ChevronDown, Bell, Check, User, ShieldCheck, FileText, Settings, LogOut, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getLanguageMeta, languages } from '@/utils/i18n';
import { useLanguage } from '@/context/LanguageContext';
import { useNotifications } from '@/context/NotificationContext';

export default function DesktopTopbar() {
  const [search, setSearch] = useState('');
  const { language, setLanguage, t } = useLanguage();
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const router = useRouter();
  const { unreadCount } = useNotifications();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const currentLanguage = getLanguageMeta(language);
  const isEn = language === 'en';

  const navigateTo = (path: string) => {
    setIsProfileMenuOpen(false);
    router.push(path);
  };

  const menuItems = [
    {
      id: "profile",
      icon: User,
      title: t("profile.myProfile") || "Mon profil",
      subtitle: t("profile.myProfileSubtitle") || "Informations personnelles et coordonnées",
      action: () => navigateTo('/profil')
    },
    {
      id: "security",
      icon: ShieldCheck,
      title: t("profile.security") || "Sécurité du compte",
      subtitle: t("profile.securitySubtitle") || "Mot de passe, appareils et accès",
      action: () => navigateTo('/parametres')
    },
    {
      id: "documents",
      icon: FileText,
      title: t("profile.documents") || "Documents personnels",
      subtitle: t("profile.documentsSubtitle") || "Relevés, contrats et justificatifs",
      action: () => navigateTo('/parametres')
    },
    {
      id: "preferences",
      icon: Settings,
      title: t("profile.preferences") || "Préférences",
      subtitle: t("profile.preferencesSubtitle") || "Langue, affichage et notifications",
      action: () => navigateTo('/parametres')
    },
    {
      id: "logout",
      icon: LogOut,
      title: t("profile.logout") || "Déconnexion",
      subtitle: t("profile.logoutSubtitle") || "Fermer la session en cours",
      action: () => {
        setIsProfileMenuOpen(false);
        setIsLogoutConfirmOpen(true);
      }
    }
  ];

  return (
    <>
    <header className="h-[76px] bg-card border-b border-border px-8 items-center justify-between hidden lg:flex">
      <div className="flex-1 max-w-xl relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
        <input 
          type="text" 
          placeholder={t("topbar.searchPlaceholder")}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full bg-gray-50 border border-border rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-navy transition-all text-text-primary"
        />
      </div>

      <div className="flex items-center gap-6 ml-4">
        {/* Language selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsLanguageMenuOpen((value) => !value)}
            aria-label={isEn ? "Choose language" : "Choisir la langue"}
            className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-[#07002F] transition hover:bg-[#F3F4F6] dark:text-white dark:hover:bg-white/10"
          >
            <span className="font-semibold">{currentLanguage.code}</span>
            <Image src={currentLanguage.flag} alt={currentLanguage.code} width={20} height={20} className="w-5 h-5 rounded-sm object-cover" unoptimized />
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </button>

          {isLanguageMenuOpen && (
            <>
              <div className="fixed inset-0 z-[40]" onClick={() => setIsLanguageMenuOpen(false)} />
              <div className="absolute right-0 top-full z-50 mt-3 w-[240px] rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-white/10 dark:bg-[#111827]">
                {languages.map((option) => {
                  const isActive = language === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => {
                        setLanguage(option.id);
                        setIsLanguageMenuOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition ${
                        isActive
                          ? "border border-[#9ACD00] bg-[#F3FBE4] text-[#07002F] dark:bg-[#253313] dark:text-white"
                          : "border border-transparent text-[#07002F] hover:bg-slate-50 dark:text-white dark:hover:bg-white/10"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="min-w-[28px] text-sm font-bold">{option.code}</span>
                        <Image src={option.flag} alt={option.code} width={20} height={20} className="w-5 h-5 rounded-sm object-cover" unoptimized />
                        <span className="font-semibold">{option.label}</span>
                      </span>

                      {isActive && <Check className="h-4 w-4 text-[#7FB000]" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Notifications */}
        <Link href="/notifications" aria-label={isEn ? "Open notifications" : "Ouvrir les notifications"} className="relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy rounded-full interactive-link">
          <Bell size={24} className="text-text-secondary hover:text-navy transition-colors" />
          {mounted && unreadCount > 0 ? (
            <div className="absolute -top-1 -right-1 bg-success text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
              {unreadCount}
            </div>
          ) : null}
        </Link>

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            type="button" 
            onClick={() => setIsProfileMenuOpen((value) => !value)}
            aria-label={isEn ? "Open profile menu" : "Ouvrir le menu profil"}
            aria-expanded={isProfileMenuOpen}
            className="flex items-center gap-3 pl-4 border-l border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy rounded-md"
          >
            <div className="text-right">
              <div className="text-sm font-bold text-navy">Frederico Di Mario</div>
              <div className="text-xs text-text-secondary">{t("topbar.clientSince") || "Client depuis 2015"}</div>
            </div>
            <div className="h-10 w-10 rounded-full bg-navy text-white flex items-center justify-center font-bold">
              FM
            </div>
            <ChevronDown size={16} className="text-text-muted" />
          </button>

          {isProfileMenuOpen && (
            <>
              <div className="fixed inset-0 z-[80]" onClick={() => setIsProfileMenuOpen(false)} />
              <div
                role="menu"
                className="absolute right-0 top-full z-[90] mt-3 w-[320px] rounded-[22px] border border-[#E5E7EB] bg-white p-3 shadow-2xl"
              >
                {/* Profile header inside menu */}
                <div className="flex items-center gap-3 p-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#050033] text-lg font-bold text-white">
                    FM
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-[16px] font-bold text-[#07002F] truncate">
                      Frederico Di Mario
                    </h2>
                    <p className="mt-0.5 text-[13px] text-[#6B7280] truncate">
                      fredericodimario8@gmail.com
                    </p>
                    <p className="mt-0.5 text-[12px] text-[#8A94A6]">
                      {t("topbar.clientSince") || "Client depuis 2015"}
                    </p>
                  </div>
                </div>

                <div className="my-2 h-px bg-[#E5E7EB] mx-2" />

                {/* Profile actions */}
                <div className="flex flex-col gap-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={item.action}
                        className="flex w-full items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#F3F4F6] text-[#050033]">
                            <Icon size={18} />
                          </div>
                          <div>
                            <h3 className="text-[14px] font-bold text-[#050033]">
                              {item.title}
                            </h3>
                            <p className="mt-0.5 text-[12px] text-[#6B7280]">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-[#6B7280]" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>

    {/* ───────────── LOGOUT CONFIRMATION ───────────── */}
    {isLogoutConfirmOpen && (
      <div 
        role="dialog" 
        aria-modal="true" 
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      >
        <div className="w-full max-w-sm rounded-[24px] bg-white p-6 shadow-xl">
          <h2 className="text-xl font-bold text-[#050033]">
            {t("profile.logoutConfirmTitle") || "Déconnexion"}
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-[#6B7280]">
            {t("profile.logoutConfirmText") || "Confirmez-vous la fermeture de cette session ?"}
          </p>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => setIsLogoutConfirmOpen(false)}
              className="flex-1 h-[44px] rounded-[10px] border border-[#E5E7EB] bg-white text-[14px] font-semibold text-[#050033] hover:bg-gray-50 transition-colors"
            >
              {t("common.cancel") || (isEn ? "Cancel" : "Annuler")}
            </button>
            <button
              type="button"
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                router.push('/login');
              }}
              className="flex-1 h-[44px] rounded-[10px] bg-[#050033] text-[14px] font-semibold text-white hover:opacity-90 transition-opacity"
            >
              {t("common.logout") || (isEn ? "Sign out" : "Se déconnecter")}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
