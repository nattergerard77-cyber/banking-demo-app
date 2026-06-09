"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

import { notifications as initialNotifications } from "@/data/notifications";
import type { NotificationFilter, NotificationItem, NotificationPreferences } from "@/types/notification";

const READ_STATE_KEY = "notifications.readState";
const PREFERENCES_KEY = "notifications.preferences";
const LOGIN_NOTIFICATIONS_KEY = "notifications.loginItems";
const TRANSFER_NOTIFICATIONS_KEY = "notifications.transferItems";
const DELETED_IDS_KEY = "notifications.deletedIds";

const defaultPreferences: NotificationPreferences = {
  security: true,
  operations: true,
  documents: true,
  service: false,
};

type NotificationContextValue = {
  notifications: NotificationItem[];
  filteredNotifications: NotificationItem[];
  unreadCount: number;
  totalCount: number;
  securityCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  addLoginNotification: () => void;
  addTransferNotification: (payload: TransferNotificationPayload) => void;
  resetNotifications: () => void;
  preferences: NotificationPreferences;
  setPreference: (key: keyof NotificationPreferences, value: boolean) => void;
  activeFilter: NotificationFilter;
  setActiveFilter: (filter: NotificationFilter) => void;
};

type TransferNotificationPayload = {
  beneficiary: string;
  amount: string;
  reference: string;
};

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? ({ ...fallback, ...JSON.parse(value) } as T) : fallback;
  } catch {
    return fallback;
  }
}

function readArray<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T[]) : [];
  } catch {
    return [];
  }
}

function getLoginNotificationId(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `login-connection-${year}${month}${day}-${hours}${minutes}`;
}

function getCurrentTime(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function getTransferNotificationId(reference: string) {
  return `transfer-${reference}`;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>("all");
  const [storageReady, setStorageReady] = useState(false);
  const [deletedIds, setDeletedIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    return readArray<string>(DELETED_IDS_KEY);
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const readState = readJson<Record<string, boolean>>(READ_STATE_KEY, {});
      const storedPreferences = readJson<NotificationPreferences>(PREFERENCES_KEY, defaultPreferences);
      const storedLoginNotifications = readArray<NotificationItem>(LOGIN_NOTIFICATIONS_KEY);
      const storedTransferNotifications = readArray<NotificationItem>(TRANSFER_NOTIFICATIONS_KEY);

      setNotifications([...storedTransferNotifications, ...storedLoginNotifications, ...initialNotifications].map((item) => ({ ...item, read: readState[item.id] ?? item.read })));
      setPreferences(storedPreferences);
      setStorageReady(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!storageReady || typeof window === "undefined") return;
    const readState = Object.fromEntries(notifications.map((item) => [item.id, item.read]));
    window.localStorage.setItem(READ_STATE_KEY, JSON.stringify(readState));
  }, [notifications, storageReady]);

  useEffect(() => {
    if (!storageReady || typeof window === "undefined") return;
    window.localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(deletedIds));
  }, [deletedIds, storageReady]);

  useEffect(() => {
    if (!storageReady || typeof window === "undefined") return;
    const loginNotifications = notifications.filter((item) => item.id.startsWith("login-connection-"));
    window.localStorage.setItem(LOGIN_NOTIFICATIONS_KEY, JSON.stringify(loginNotifications));
  }, [notifications, storageReady]);

  useEffect(() => {
    if (!storageReady || typeof window === "undefined") return;
    const transferNotifications = notifications.filter((item) => item.id.startsWith("transfer-"));
    window.localStorage.setItem(TRANSFER_NOTIFICATIONS_KEY, JSON.stringify(transferNotifications));
  }, [notifications, storageReady]);

  useEffect(() => {
    if (!storageReady || typeof window === "undefined") return;
    window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  }, [preferences, storageReady]);

  const visibleNotifications = useMemo(
    () => notifications.filter((item) => !deletedIds.includes(item.id)),
    [notifications, deletedIds],
  );

  const unreadCount = useMemo(() => visibleNotifications.filter((item) => !item.read).length, [visibleNotifications]);
  const totalCount = visibleNotifications.length;
  const securityCount = useMemo(() => visibleNotifications.filter((item) => item.category === "security").length, [visibleNotifications]);

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "all") return visibleNotifications;
    if (activeFilter === "unread") return visibleNotifications.filter((item) => !item.read);
    return visibleNotifications.filter((item) => item.category === activeFilter);
  }, [activeFilter, visibleNotifications]);

  const markAsRead = (id: string) => {
    setNotifications((current) => current.map((item) => item.id === id ? { ...item, read: true } : item));
  };

  const markAllAsRead = () => {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
  };

  const deleteNotification = (id: string) => {
    setDeletedIds((prev) => [...prev, id]);
  };

  const addLoginNotification = () => {
    const now = new Date();
    const loginNotification: NotificationItem = {
      id: getLoginNotificationId(now),
      titleKey: "notifications.items.newLogin.title",
      descriptionKey: "notifications.items.newLogin.description",
      detailKey: "notifications.items.newLogin.detail",
      dateLabelKey: "notifications.dates.today",
      time: getCurrentTime(now),
      category: "security",
      read: false,
    };

    setNotifications((current) => {
      if (current.some((item) => item.id === loginNotification.id)) return current;

      const next = [loginNotification, ...current];

      if (typeof window !== "undefined") {
        const loginNotifications = next.filter((item) => item.id.startsWith("login-connection-"));
        const readState = Object.fromEntries(next.map((item) => [item.id, item.read]));
        window.localStorage.setItem(LOGIN_NOTIFICATIONS_KEY, JSON.stringify(loginNotifications));
        window.localStorage.setItem(READ_STATE_KEY, JSON.stringify(readState));
      }

      return next;
    });
  };

  const addTransferNotification = ({ beneficiary, amount, reference }: TransferNotificationPayload) => {
    const now = new Date();
    const transferNotification: NotificationItem = {
      id: getTransferNotificationId(reference),
      titleKey: "notifications.items.transferCompleted.title",
      descriptionKey: "notifications.items.transferCompleted.description",
      detailKey: "notifications.items.transferCompleted.detail",
      dateLabelKey: "notifications.dates.today",
      time: getCurrentTime(now),
      category: "operations",
      read: false,
      amount: `${amount} - ${beneficiary}`,
      reference,
      beneficiary,
    };

    setNotifications((current) => {
      if (current.some((item) => item.id === transferNotification.id)) return current;

      const next = [transferNotification, ...current];

      if (typeof window !== "undefined") {
        const transferNotifications = next.filter((item) => item.id.startsWith("transfer-"));
        const readState = Object.fromEntries(next.map((item) => [item.id, item.read]));
        window.localStorage.setItem(TRANSFER_NOTIFICATIONS_KEY, JSON.stringify(transferNotifications));
        window.localStorage.setItem(READ_STATE_KEY, JSON.stringify(readState));
      }

      return next;
    });
  };

  const resetNotifications = () => {
    setNotifications(initialNotifications);
    setDeletedIds([]);
    setPreferences(defaultPreferences);
    setActiveFilter("all");
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(LOGIN_NOTIFICATIONS_KEY);
      window.localStorage.removeItem(TRANSFER_NOTIFICATIONS_KEY);
      window.localStorage.removeItem(DELETED_IDS_KEY);
    }
  };

  const setPreference = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences((current) => ({ ...current, [key]: value }));
  };

  const value: NotificationContextValue = {
    notifications: visibleNotifications,
    filteredNotifications,
    unreadCount,
    totalCount,
    securityCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addLoginNotification,
    addTransferNotification,
    resetNotifications,
    preferences,
    setPreference,
    activeFilter,
    setActiveFilter,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
