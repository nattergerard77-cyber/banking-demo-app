"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  ArrowLeftRight,
  Bell,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  Filter,
  LockKeyhole,
  Mail,
  Search,
  ShieldCheck,
  Smartphone,
  Wallet,
  ChevronRight,
} from "lucide-react";

import type { NotificationCategory, NotificationFilter, NotificationItem as BankNotificationItem, NotificationPreferences } from "@/types/notification";
import { useLanguage } from "@/context/LanguageContext";
import { useNotifications } from "@/context/NotificationContext";
import DesktopShell from "./DesktopShell";
import DemoModal from "../shared/DemoModal";
import DemoToast from "../shared/DemoToast";
import DemoSwitch from "../shared/DemoSwitch";

const preferences = [
  {
    key: "security",
    titleKey: "notifications.preferencesList.security.title",
    descriptionKey: "notifications.preferencesList.security.description",
    active: true,
    icon: ShieldCheck,
  },
  {
    key: "operations",
    titleKey: "notifications.preferencesList.operations.title",
    descriptionKey: "notifications.preferencesList.operations.description",
    active: true,
    icon: Wallet,
  },
  {
    key: "documents",
    titleKey: "notifications.preferencesList.documents.title",
    descriptionKey: "notifications.preferencesList.documents.description",
    active: true,
    icon: FileText,
  },
  {
    key: "service",
    titleKey: "notifications.preferencesList.service.title",
    descriptionKey: "notifications.preferencesList.service.description",
    active: false,
    icon: Mail,
  },
];

const filterOptions: NotificationFilter[] = ["all", "unread", "security", "operations", "documents", "service"];

const categoryIcons: Record<NotificationCategory, typeof ShieldCheck> = {
  security: ShieldCheck,
  operations: ArrowLeftRight,
  documents: FileText,
  service: Bell,
};

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

function NotificationItem({
  notification,
  onSelect,
  selected,
  t,
}: {
  notification: BankNotificationItem;
  onSelect: () => void;
  selected: boolean;
  t: (key: string) => string;
}) {
  const Icon = categoryIcons[notification.category];
  const dateLabel = t(notification.dateLabelKey);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full border-b border-[#E5E7EB] p-4 text-left last:border-b-0 interactive-row ${
        selected ? "bg-[#FBFFF1]" : "bg-white"
      }`}
    >
      <div className="flex items-start gap-4">
        <span
          className={`mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
            !notification.read
              ? "bg-[#050033] text-white"
              : "bg-[#F3F4F6] text-[#050033]"
          }`}
        >
          <Icon size={20} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-3">
            <span className="truncate text-[15px] font-bold text-[#090927]">
              {t(notification.titleKey)}
            </span>
            <span className="shrink-0 text-[12px] text-[#6B7280]">
              {dateLabel}{notification.time ? ` ${t("notifications.at")} ${notification.time}` : ""}
            </span>
          </span>

          <span className="mt-1 block text-[13px] leading-[1.45] text-[#6B7280]">
            {t(notification.descriptionKey)}
          </span>

          <span className="mt-3 flex items-center justify-between">
            <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-[11px] font-semibold text-[#050033]">
              {t(`notifications.categories.${notification.category}`)}
            </span>

            {!notification.read && (
              <span className="h-2 w-2 rounded-full bg-[#9ACD00]" />
            )}
          </span>
        </span>
      </div>
    </button>
  );
}

function PreferenceRow({
  preference,
  checked,
  onToggle,
  t,
}: {
  preference: (typeof preferences)[number];
  checked: boolean;
  onToggle: () => void;
  t: (key: string) => string;
}) {
  const Icon = preference.icon;
  const title = t(preference.titleKey);

  return (
    <div className="flex items-center justify-between rounded-[14px] border border-[#E5E7EB] p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6] text-[#050033]">
          <Icon size={19} />
        </span>

        <div>
          <p className="text-[14px] font-bold text-[#090927]">
            {title}
          </p>
          <p className="mt-1 text-[12px] text-[#6B7280]">
            {t(preference.descriptionKey)}
          </p>
        </div>
      </div>

      <DemoSwitch checked={checked} onChange={onToggle} label={title} />
    </div>
  );
}

export function DesktopNotifications() {
  const { t } = useLanguage();
  const {
    notifications,
    filteredNotifications,
    unreadCount,
    totalCount,
    securityCount,
    markAsRead,
    markAllAsRead,
    preferences: notificationPreferences,
    setPreference,
    activeFilter,
    setActiveFilter,
  } = useNotifications();
  const [selected, setSelected] = useState(notifications[0].id);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ title: string; message: string } | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [toast, setToast] = useState("");
  const filtered = useMemo(
    () => filteredNotifications.filter((item) => `${t(item.titleKey)} ${t(item.descriptionKey)} ${t(`notifications.categories.${item.category}`)}`.toLowerCase().includes(search.toLowerCase())),
    [filteredNotifications, search, t],
  );
  const active = filtered.find((item) => item.id === selected) ?? filtered[0] ?? notifications[0];
  const ActiveIcon = categoryIcons[active.category];
  const activePrefsCount = Object.values(notificationPreferences).filter(Boolean).length;

  return (
    <>
    <DesktopShell>
      <div className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[26px] font-bold tracking-tight text-[#090927]">
              {t("notifications.title")}
            </h1>
            <p className="mt-1 text-[15px] text-[#6B7280]">
              {t("notifications.subtitle")}
            </p>
          </div>

          <button
            type="button"
            onClick={() => { markAllAsRead(); setToast(t("notifications.markedAllRead")); }}
            className="flex h-10 items-center gap-2 rounded-[10px] bg-[#050033] px-4 text-[14px] font-bold text-white interactive-button"
          >
            <CheckCircle2 size={16} />
            {t("notifications.markAllRead")}
          </button>
        </div>

        <div className="grid grid-cols-12 gap-5">
          <Card className="col-span-3 p-5">
            <h2 className="text-[18px] font-bold text-[#090927]">Résumé</h2>

            <div className="mt-4 space-y-3">
              <div className="rounded-[14px] bg-[#EEF7D8] p-4">
                <div className="flex items-center gap-3">
                  <Bell size={21} className="text-[#7AA600]" />
                  <div>
                    <p className="text-[22px] font-bold text-[#050033]">{totalCount}</p>
                    <p className="text-[12px] text-[#6B7280]">
                      {t("notifications.total")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[14px] bg-[#F6F7F9] p-4">
                <div className="flex items-center gap-3">
                  <Eye size={21} className="text-[#050033]" />
                  <div>
                     <p className="text-[22px] font-bold text-[#050033]">{unreadCount}</p>
                    <p className="text-[12px] text-[#6B7280]">{t("notifications.unread")}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[14px] bg-[#F6F7F9] p-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={21} className="text-[#7AA600]" />
                  <div>
                    <p className="text-[22px] font-bold text-[#050033]">{securityCount}</p>
                    <p className="text-[12px] text-[#6B7280]">{t("notifications.security")}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="col-span-6 overflow-hidden">
            <div className="border-b border-[#E5E7EB] p-4">
              <div className="flex gap-3">
                <div className="flex h-10 flex-1 items-center gap-3 rounded-[10px] border border-[#E5E7EB] px-3">
                  <Search size={17} className="text-[#6B7280]" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={t("notifications.searchPlaceholder")}
                    className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#9CA3AF]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                  className="flex h-10 items-center gap-2 rounded-[10px] border border-[#050033] px-4 text-[13px] font-semibold text-[#050033]"
                >
                  <Filter size={16} />
                  {t("notifications.filters.title")}
                </button>
              </div>
            </div>

            <div>
              {filtered.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  selected={active.id === notification.id}
                  t={t}
                  onSelect={() => {
                    setSelected(notification.id);
                    markAsRead(notification.id);
                  }}
                />
              ))}
              {filtered.length === 0 ? (
                <div className="p-4 text-[13px] text-[#6B7280]">
                  {t("notifications.empty")}
                </div>
              ) : null}
            </div>
          </Card>

          <Card className="col-span-3 p-5">
            <h2 className="text-[18px] font-bold text-[#090927]">
              {t("notifications.selected")}
            </h2>

            <div className="mt-5 rounded-[14px] bg-[#F6F7F9] p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#050033] text-white">
                  <ActiveIcon size={20} />
                </span>

                <div>
                  <p className="text-[14px] font-bold text-[#090927]">
                    {t(active.titleKey)}
                  </p>
                  <p className="mt-1 text-[12px] text-[#6B7280]">
                    {t(active.dateLabelKey)}{active.time ? ` ${t("notifications.at")} ${active.time}` : ""}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-[13px] leading-[1.45] text-[#6B7280]">
                {t(active.detailKey)}
              </p>
              {active.amount ? <p className="mt-3 text-[13px] font-bold text-[#050033]">{active.amount}</p> : null}
              {active.reference ? <p className="mt-1 text-[12px] text-[#6B7280]">{t("common.reference")} : {active.reference}</p> : null}
            </div>

            <button
              type="button"
              onClick={() => setModal({ title: t("notifications.history"), message: t("notifications.historyMessage") })}
              className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-[10px] border border-[#050033] text-[14px] font-semibold text-[#050033] interactive-button"
            >
              <Clock3 size={16} />
              {t("notifications.history")}
            </button>
          </Card>
        </div>

        <div className="grid grid-cols-12 gap-5">
          <Card className="col-span-8 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[18px] font-bold text-[#090927]">
                {t("notifications.preferences")}
              </h2>

              <span className="rounded-full bg-[#EEF7D8] px-3 py-1 text-[12px] font-bold text-[#050033]">
                {activePrefsCount} {t("notifications.active")}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {preferences.map((preference) => (
                <PreferenceRow
                  key={preference.titleKey}
                  preference={preference}
                  checked={notificationPreferences[preference.key as keyof NotificationPreferences]}
                  t={t}
                  onToggle={() => {
                    const key = preference.key as keyof NotificationPreferences;
                    setPreference(key, !notificationPreferences[key]);
                    setToast(t("notifications.preferenceUpdated"));
                  }}
                />
              ))}
            </div>
          </Card>

          <Card className="col-span-4 p-5">
            <h2 className="text-[18px] font-bold text-[#090927]">
              {t("notifications.devices")}
            </h2>

            <div className="mt-4 space-y-3">
              <div className="rounded-[14px] bg-[#F6F7F9] p-4">
                <div className="flex items-center gap-3">
                  <Smartphone size={20} className="text-[#050033]" />
                  <div>
                    <p className="text-[14px] font-bold text-[#090927]">
                      {t("notifications.fredericoIphone")}
                    </p>
                    <p className="mt-1 text-[12px] text-[#6B7280]">
                       {t("notifications.deviceLastActivity")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[14px] bg-[#F6F7F9] p-4">
                <div className="flex items-center gap-3">
                  <LockKeyhole size={20} className="text-[#7AA600]" />
                  <div>
                    <p className="text-[14px] font-bold text-[#090927]">
                      {t("notifications.windowsBrowser")}
                    </p>
                    <p className="mt-1 text-[12px] text-[#6B7280]">
                       {t("notifications.trustedDevice")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-4 text-[12px] leading-[1.45] text-[#6B7280]">
              {t("notifications.deviceDescription")}
            </p>
            <button type="button" onClick={() => setToast(t("notifications.toasts.deviceManagement"))} className="mt-3 flex items-center gap-1 text-[13px] font-semibold text-[#050033] interactive-link">{t("notifications.manage")} <ChevronRight size={13} className="arrow-icon" /></button>
          </Card>
        </div>
      </div>
    </DesktopShell>
    {filtersOpen ? (
      <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-[#050033]/40 p-4" onClick={() => setFiltersOpen(false)}>
        <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
          <h2 className="text-lg font-bold text-navy">{t("notifications.filters.title")}</h2>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {filterOptions.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => {
                  setActiveFilter(filter);
                  setFiltersOpen(false);
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
    <DemoModal open={Boolean(modal)} title={modal?.title ?? ''} message={modal?.message ?? ''} onClose={() => setModal(null)} />
    <DemoToast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </>
  );
}

export default DesktopNotifications;
