"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeftRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  Eye,
  FileText,
  Filter,
  LockKeyhole,
  Search,
  ShieldCheck,
  Smartphone,
  Trash2,
  Wallet,
} from "lucide-react";

import type { NotificationCategory, NotificationFilter, NotificationPreferences } from "@/types/notification";
import { useLanguage } from "@/context/LanguageContext";
import { useNotifications } from "@/context/NotificationContext";
import DemoModal from "../shared/DemoModal";
import DemoSwitch from "../shared/DemoSwitch";
import DemoToast from "../shared/DemoToast";
import MobileShell from "./MobileShell";

const initialPreferences = [
  { key: "security", titleKey: "notifications.categories.security", icon: ShieldCheck },
  { key: "operations", titleKey: "notifications.categories.operations", icon: Wallet },
  { key: "documents", titleKey: "notifications.categories.documents", icon: FileText },
  { key: "service", titleKey: "notifications.categories.service", icon: Bell },
];

const filterOptions: NotificationFilter[] = ["all", "unread", "security", "operations", "documents", "service"];

const categoryIcons: Record<NotificationCategory, typeof ShieldCheck> = {
  security: ShieldCheck,
  operations: ArrowLeftRight,
  documents: FileText,
  service: Bell,
};

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

export function MobileNotifications() {
  const { t } = useLanguage();
  const {
    notifications,
    filteredNotifications,
    unreadCount,
    totalCount,
    securityCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    preferences,
    setPreference,
    activeFilter,
    setActiveFilter,
  } = useNotifications();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(notifications[0]?.id ?? "");
  const [modal, setModal] = useState<null | "filter" | "manage">(null);
  const [toast, setToast] = useState("");
  const [swipedNotificationId, setSwipedNotificationId] = useState<string | null>(null);
  const touchStart = useRef<{ x: number; y: number; id: string } | null>(null);

  const filtered = useMemo(
    () =>
      filteredNotifications.filter((item) =>
        `${t(item.titleKey)} ${t(item.descriptionKey)} ${t(`notifications.categories.${item.category}`)}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [filteredNotifications, search, t],
  );

  const selected =
    filtered.find((item) => item.id === selectedId) ?? filtered[0] ?? notifications[0];
  const SelectedIcon = categoryIcons[selected.category];

  return (
    <MobileShell>
      <div className="space-y-4">
        <section>
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-[24px] font-bold tracking-tight text-[#090927]">
              {t("notifications.title")}
            </h1>
            <button
              type="button"
              onClick={() => {
                markAllAsRead();
                setToast(t("notifications.markedAllRead"));
              }}
              disabled={unreadCount === 0}
              className="flex shrink-0 items-center gap-1.5 rounded-[10px] bg-[#050033] px-3 py-2 text-[12px] font-bold text-white disabled:opacity-40"
            >
              <CheckCircle2 size={14} />
              {t("notifications.markAllRead")}
            </button>
          </div>
          <p className="mt-1 text-[14px] text-[#6B7280]">
            {t("notifications.subtitle")}
          </p>
        </section>

        <div className="grid grid-cols-3 gap-3">
          <MobileCard className="p-3 text-center">
            <Bell size={19} className="mx-auto text-[#7AA600]" />
            <p className="mt-2 text-[20px] font-bold text-[#050033]">{totalCount}</p>
            <p className="text-[11px] text-[#6B7280]">{t("notifications.total")}</p>
          </MobileCard>

          <MobileCard className="p-3 text-center">
            <Eye size={19} className="mx-auto text-[#050033]" />
            <p className="mt-2 text-[20px] font-bold text-[#050033]">{unreadCount}</p>
            <p className="text-[11px] text-[#6B7280]">{t("notifications.unread")}</p>
          </MobileCard>

          <MobileCard className="p-3 text-center">
            <ShieldCheck size={19} className="mx-auto text-[#7AA600]" />
            <p className="mt-2 text-[20px] font-bold text-[#050033]">{securityCount}</p>
            <p className="text-[11px] text-[#6B7280]">{t("notifications.security")}</p>
          </MobileCard>
        </div>

        <MobileCard className="p-4">
          <div className="flex gap-3">
            <div className="flex h-10 flex-1 items-center gap-3 rounded-[10px] border border-[#E5E7EB] px-3">
              <Search size={17} className="text-[#6B7280]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("notifications.searchPlaceholderShort")}
                className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#9CA3AF]"
              />
            </div>

            <button
              type="button"
              aria-label={t("notifications.openFilters")}
              onClick={() => setModal("filter")}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-[#050033] text-[#050033] interactive-button"
            >
              <Filter size={17} />
            </button>
          </div>
        </MobileCard>

        <MobileCard className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[17px] font-bold text-[#090927]">
              {t("notifications.recentAlerts")}
            </h2>

            <span className="rounded-full bg-[#EEF7D8] px-3 py-1 text-[12px] font-bold text-[#050033]">
              {unreadCount} {t("notifications.unread")}
            </span>
          </div>

          <div className="space-y-3">
            {filtered.map((notification) => {
              const Icon = categoryIcons[notification.category];

              return (
                <div key={notification.id} className="flex items-stretch gap-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (swipedNotificationId) { setSwipedNotificationId(null); return; }
                      setSelectedId(notification.id);
                      markAsRead(notification.id);
                    }}
                    onTouchStart={(e) => {
                      touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, id: notification.id };
                    }}
                    onTouchMove={(e) => {
                      if (!touchStart.current || touchStart.current.id !== notification.id) return;
                      const deltaX = e.touches[0].clientX - touchStart.current.x;
                      const deltaY = e.touches[0].clientY - touchStart.current.y;
                      if (Math.abs(deltaX) > Math.abs(deltaY) * 1.5 && deltaX > 50) {
                        setSwipedNotificationId(notification.id);
                        touchStart.current = null;
                      }
                    }}
                    onTouchEnd={() => {
                      if (touchStart.current?.id === notification.id) {
                        touchStart.current = null;
                      }
                    }}
                    className={`flex w-full items-start gap-3 rounded-[14px] border p-3 text-left transition-all ${
                      selected.id === notification.id
                        ? "border-2 border-[#9ACD00] bg-white"
                        : "border-[#E5E7EB] bg-white"
                    } ${swipedNotificationId === notification.id ? "rounded-r-none" : ""}`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        !notification.read
                          ? "bg-[#050033] text-white"
                          : "bg-[#F3F4F6] text-[#050033]"
                      }`}
                    >
                      <Icon size={18} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className="truncate text-[14px] font-bold text-[#090927]">
                          {t(notification.titleKey)}
                        </span>
                        <span className="shrink-0 text-[11px] text-[#6B7280]">
                          {t(notification.dateLabelKey)}{notification.time ? ` ${t("notifications.at")} ${notification.time}` : ""}
                        </span>
                      </span>

                      <span className="mt-1 block text-[12px] leading-[1.35] text-[#6B7280]">
                        {t(notification.descriptionKey)}
                      </span>

                      <span className="mt-2 inline-flex rounded-full bg-[#F3F4F6] px-3 py-1 text-[11px] font-semibold text-[#050033]">
                        {t(`notifications.categories.${notification.category}`)}
                      </span>
                    </span>

                    <ChevronRight size={17} className="mt-3 text-[#050033]" />
                  </button>

                  {swipedNotificationId === notification.id && (
                    <button
                      type="button"
                      aria-label="Supprimer la notification"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                        setSwipedNotificationId(null);
                        if (selectedId === notification.id) setSelectedId("");
                        setToast(t("notifications.deleted"));
                      }}
                      className="flex shrink-0 items-center gap-1.5 rounded-r-[14px] bg-[#DC2626] px-3 text-[12px] font-bold text-white"
                    >
                      <Trash2 size={14} />
                      Supprimer
                    </button>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 ? (
              <p className="text-[13px] leading-[1.4] text-[#6B7280]">
                {t("notifications.empty")}
              </p>
            ) : null}
          </div>
        </MobileCard>

        <MobileCard className="p-4">
          <h2 className="text-[17px] font-bold text-[#090927]">
            {t("notifications.selected")}
          </h2>

          <div className="mt-4 rounded-[14px] bg-[#F6F7F9] p-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#050033] text-white">
                <SelectedIcon size={19} />
              </span>

              <div>
                <p className="text-[14px] font-bold text-[#090927]">
                  {t(selected.titleKey)}
                </p>
                <p className="mt-1 text-[12px] text-[#6B7280]">{t(selected.dateLabelKey)}{selected.time ? ` ${t("notifications.at")} ${selected.time}` : ""}</p>
              </div>
            </div>

            <p className="mt-3 text-[13px] leading-[1.4] text-[#6B7280]">
              {t(selected.detailKey)}
            </p>
            {selected.amount ? <p className="mt-3 text-[13px] font-bold text-[#050033]">{selected.amount}</p> : null}
            {selected.reference ? <p className="mt-1 text-[12px] text-[#6B7280]">{t("common.reference")} : {selected.reference}</p> : null}
          </div>
        </MobileCard>

        <MobileCard className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[17px] font-bold text-[#090927]">
              {t("notifications.preferencesShort")}
            </h2>

            <button
              type="button"
              onClick={() => setModal("manage")}
              className="text-[14px] font-semibold text-[#7AA600]"
            >
              {t("notifications.manage")}
            </button>
          </div>

          <div className="space-y-3">
            {initialPreferences.map((preference) => {
              const Icon = preference.icon;

              return (
                <div
                  key={preference.titleKey}
                  className="flex items-center justify-between rounded-[14px] border border-[#E5E7EB] p-3"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F4F6] text-[#050033]">
                      <Icon size={17} />
                    </span>
                    <span className="text-[14px] font-bold text-[#090927]">
                      {t(preference.titleKey)}
                    </span>
                  </span>

                  <DemoSwitch
                    checked={preferences[preference.key as keyof NotificationPreferences]}
                    onChange={(value) => {
                      setPreference(preference.key as keyof NotificationPreferences, value);
                      setToast(t("notifications.preferenceUpdated"));
                    }}
                    label={`${t("common.enable")} ${t(preference.titleKey)}`}
                  />
                </div>
              );
            })}
          </div>
        </MobileCard>

        <MobileCard className="p-4">
          <div className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEF7D8] text-[#7AA600]">
              <LockKeyhole size={20} />
            </span>

            <div>
              <h2 className="text-[15px] font-bold text-[#090927]">
                {t("notifications.devices")}
              </h2>
              <p className="mt-1 text-[13px] leading-[1.4] text-[#6B7280]">
                {t("notifications.trustedDevice")}
              </p>

              <div className="mt-3 flex items-center gap-2 text-[13px] font-semibold text-[#050033]">
                <Smartphone size={16} />
                {t("notifications.fredericoIphone")}
              </div>
            </div>
          </div>
        </MobileCard>


      </div>
      {modal === "filter" ? (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-[#050033]/40 p-4" onClick={() => setModal(null)}>
          <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <h2 className="text-lg font-bold text-navy">{t("notifications.filters.title")}</h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {filterOptions.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => {
                    setActiveFilter(filter);
                    setModal(null);
                  }}
                  className={`h-10 rounded-lg border px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy ${activeFilter === filter ? "border-[#9ACD00] bg-[#EEF7D8] text-[#050033]" : "border-border text-text-primary"}`}
                >
                  {t(`notifications.filters.${filter}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
      <DemoModal
        open={modal === "manage"}
        title={t("notifications.managePreferences")}
        message={t("notifications.managePreferencesMessage")}
        onClose={() => setModal(null)}
        onConfirm={() => {
          setModal(null);
          setToast(t("notifications.toasts.preferencesUpdated"));
        }}
      />
      <DemoToast open={Boolean(toast)} message={toast} onClose={() => setToast("")} />
    </MobileShell>
  );
}

export default MobileNotifications;
