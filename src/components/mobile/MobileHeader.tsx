"use client";

import AppLogo from '../shared/AppLogo';
import { Bell, ChevronDown, Check, User, ShieldCheck, FileText, Settings, LogOut, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { getLanguageMeta, languages } from '@/utils/i18n';
import { useNotifications } from '@/context/NotificationContext';

export default function MobileHeader() {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { unreadCount } = useNotifications();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const currentLanguage = getLanguageMeta(language);
  const isEn = language === 'en';

  const navigateTo = (path: string) => {
    setShowProfileModal(false);
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
        setShowProfileModal(false);
        setIsLogoutConfirmOpen(true);
      }
    }
  ];

  return (
    <>
    <header className="h-[74px] bg-white border-b border-[#E5E7EB] px-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center">
        <div className="scale-90 origin-left">
          <AppLogo />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Language selector */}
        <button
          type="button"
          onClick={() => setIsLanguageModalOpen(true)}
          aria-label={isEn ? "Language" : "Langue"}
          className="flex items-center gap-1.5 rounded-full px-2 py-1 text-[12px] font-bold text-[#07002F] hover:bg-gray-100 transition-colors"
        >
          <span>{currentLanguage.code}</span>
          <img
            src={currentLanguage.flag}
            alt={currentLanguage.code}
            className="h-4 w-6 rounded-[3px] object-cover"
          />
          <ChevronDown size={14} />
        </button>

        {/* Notifications */}
        <Link href="/notifications" aria-label={isEn ? "Open notifications" : "Ouvrir les notifications"} className="relative interactive-link">
          <Bell size={22} className="text-[#050033]" />
          {mounted && unreadCount > 0 ? <div className="absolute -top-0.5 right-0 bg-[#9ACD00] h-2.5 w-2.5 rounded-full border-2 border-white"></div> : null}
        </Link>

        {/* Profile */}
        <button
          type="button"
          aria-label={isEn ? "Open profile" : "Ouvrir le menu profil"}
          onClick={() => setShowProfileModal(true)}
          className="h-9 w-9 rounded-full bg-[#050033] text-white flex items-center justify-center font-bold text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
        >
          FM
        </button>
      </div>
    </header>

    {/* ───────────── PROFILE BOTTOM SHEET ───────────── */}
    {showProfileModal && (
      <div className="fixed inset-0 z-[80]">
        <button
          type="button"
          aria-label={isEn ? "Close profile menu" : "Fermer le menu profil"}
          className="absolute inset-0 bg-black/30 w-full cursor-default"
          onClick={() => setShowProfileModal(false)}
        />

        <div className="absolute bottom-0 left-0 right-0 rounded-t-[30px] bg-white px-6 pb-8 pt-4 shadow-2xl max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="mobile-profile-sheet-title">
          <div className="mx-auto mb-5 h-1.5 w-16 rounded-full bg-[#D1D5DB]" />

          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#050033] text-xl font-bold text-white shrink-0">
              FM
            </div>

            <div className="min-w-0">
              <h2 id="mobile-profile-sheet-title" className="text-[22px] font-bold text-[#07002F] truncate">
                Frederico Di Mario
              </h2>
              <p className="mt-1 text-[14px] text-[#6B7280] truncate">
                fredericodimario8@gmail.com
              </p>
              <p className="mt-1 text-[14px] text-[#8A94A6]">
                {t("topbar.clientSince") || "Client depuis 2015"}
              </p>
            </div>
          </div>

          <div className="my-5 h-px bg-[#E5E7EB]" />

          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.action}
                  className="flex w-full items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#F3F4F6] text-[#050033]">
                      <Icon size={18} />
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold text-[#050033]">
                        {item.title}
                      </h3>
                      <p className="mt-0.5 text-[12px] text-[#6B7280]">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-[#6B7280]" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    )}

    {/* ───────────── LOGOUT CONFIRMATION ───────────── */}
    {isLogoutConfirmOpen && (
      <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-sm rounded-[24px] bg-white p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="mobile-logout-title">
          <h2 id="mobile-logout-title" className="text-xl font-bold text-[#050033]">
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
              onClick={() => router.push('/login')}
              className="flex-1 h-[44px] rounded-[10px] bg-[#050033] text-[14px] font-semibold text-white hover:opacity-90 transition-opacity"
            >
              {t("common.logout") || (isEn ? "Sign out" : "Se déconnecter")}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ───────────── LANGUAGE MODAL ───────────── */}
    {isLanguageModalOpen && (
      <div className="fixed inset-0 z-[100] flex flex-col justify-end bg-black/50 p-4">
        <button 
          type="button" 
          aria-label={isEn ? "Close language menu" : "Fermer le menu langue"}
          className="absolute inset-0 w-full h-full cursor-default" 
          onClick={() => setIsLanguageModalOpen(false)} 
        />
        <div className="relative w-full rounded-[24px] bg-white p-6 shadow-xl">
          <h2 className="text-lg font-bold text-navy">{isEn ? 'Language' : 'Langue'}</h2>
          <p className="mt-2 text-sm text-text-secondary">
            {isEn ? 'Choose your display language.' : 'Choisissez votre langue d\u0027affichage.'}
          </p>

          <div className="mt-6 space-y-3">
            {languages.map((lang) => {
              const isSelected = language === lang.id;
              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => {
                    setLanguage(lang.id);
                    setIsLanguageModalOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-[14px] border p-4 text-left transition-colors ${isSelected ? "border-[#9ACD00] bg-[#EEF7D8]" : "border-[#E5E7EB] bg-white hover:bg-gray-50"}`}
                >
                  <div className="flex items-center gap-3">
                    <img src={lang.flag} alt={lang.code} className="h-6 w-8 rounded object-cover shadow-sm" />
                    <div>
                      <span className="block text-[14px] font-bold text-[#090927]">{lang.label}</span>
                      <span className="mt-1 block text-[12px] text-[#6B7280]">
                        {isSelected
                          ? (isEn ? "Current language" : "Langue actuelle")
                          : (isEn ? "Available language" : "Langue disponible")}
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check size={20} className="text-[#7AA600]" />}
                </button>
              );
            })}
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => setIsLanguageModalOpen(false)}
              className="h-10 w-full rounded-lg border border-border px-4 text-sm font-semibold text-text-primary hover:bg-gray-50 transition-colors"
            >
              {isEn ? 'Close' : 'Fermer'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
