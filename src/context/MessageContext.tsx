"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import type { BankMessage, BankMessageInfo } from "@/types/message";

const STORAGE_KEY = "messages.transferItems";
const READ_KEY = "messages.readState";
const DELETED_IDS_KEY = "messages.deletedIds";

const initialMessages: BankMessage[] = [
  {
    id: "msg-advisor-1",
    title: "Votre conseiller souhaite faire le point avec vous",
    sender: "Service Conseiller",
    preview: "Votre conseiller vous propose un rendez-vous afin d'échanger sur la gestion de votre épargne et vos projets à venir.",
    date: "Aujourd'hui",
    category: "Conseiller",
    unread: true,
    active: true,
    detail: "Votre conseiller vous propose un échange afin d'analyser la répartition de vos comptes, vos objectifs d'épargne et les services adaptés à votre situation.",
    info: [
      ["Client", "Frederico Di Mario"],
      ["Objet", "Point épargne et projets"],
      ["Disponibilités", "Cette semaine"],
      ["Statut", "À planifier"],
    ],
    attachment: "Préparation-rendez-vous.pdf",
    folder: "Boîte de réception",
  },
  {
    id: "msg-doc-annuel",
    title: "Votre relevé annuel est disponible",
    sender: "Service Documents",
    preview: "Votre relevé annuel de situation est désormais disponible dans votre espace documents.",
    date: "Hier",
    category: "Documents",
    unread: true,
    active: false,
    detail: "Votre relevé annuel présente la synthèse de vos comptes, documents associés et mouvements importants, dont le virement entrant italien du 15 juillet 2022.",
    info: [
      ["Document", "Relevé annuel de situation"],
      ["Période", "2022"],
      ["Disponibilité", "Espace documents"],
      ["Statut", "Disponible"],
    ],
    attachment: "Releve-annuel-2022.pdf",
    folder: "Documents",
  },
  {
    id: "msg-epargne-1",
    title: "Solution d'épargne adaptée à votre profil",
    sender: "Service Épargne",
    preview: "Au regard de votre solde disponible, une solution d'épargne progressive peut vous aider à mieux répartir vos liquidités.",
    date: "12 juillet 2022",
    category: "Épargne",
    unread: false,
    active: false,
    detail: "Votre solde global de 300.000,00 € permet d'envisager une répartition progressive entre liquidités disponibles et supports d'épargne adaptés à vos objectifs.",
    info: [
      ["Solde étudié", "300.000,00 €"],
      ["Compte principal", "Compte courant"],
      ["Approche", "Progressive"],
      ["Statut", "À étudier"],
    ],
    attachment: "Proposition-epargne.pdf",
    folder: "Boîte de réception",
  },
  {
    id: "msg-carte-premium",
    title: "Carte Premium : services disponibles",
    sender: "Service Cartes",
    preview: "Vous pouvez bénéficier d'une carte avec plafonds renforcés, assurances voyage et assistance dédiée.",
    date: "08 juillet 2022",
    category: "Carte",
    unread: false,
    active: false,
    detail: "Votre profil permet d'accéder à une carte premium incluant des plafonds renforcés, des garanties voyage et une assistance dédiée.",
    info: [
      ["Offre", "Carte Premium"],
      ["Services", "Assurances et assistance"],
      ["Plafonds", "Renforcés"],
      ["Statut", "Éligible"],
    ],
    attachment: "Carte-premium-services.pdf",
    folder: "Boîte de réception",
  },
  {
    id: "msg-securite-1",
    title: "Sécurisation de votre appareil principal",
    sender: "Service Sécurité",
    preview: "Votre appareil principal a été reconnu comme appareil de confiance pour sécuriser vos connexions.",
    date: "05 juillet 2022",
    category: "Sécurité",
    unread: false,
    active: false,
    detail: "L'iPhone de Frederico est associé à votre espace client et peut être utilisé pour confirmer certaines actions sensibles.",
    info: [
      ["Appareil", "iPhone de Frederico"],
      ["Usage", "Validation de sécurité"],
      ["Dernière activité", "Aujourd'hui à 09:12"],
      ["Statut", "Appareil de confiance"],
    ],
    attachment: "Securite-appareil.pdf",
    folder: "Boîte de réception",
  },
];

function readMessages(): BankMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as BankMessage[]) : [];
  } catch {
    return [];
  }
}

function writeMessages(items: BankMessage[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* noop */
  }
}

function readReadState(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const stored = window.localStorage.getItem(READ_KEY);
    return stored ? (JSON.parse(stored) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

function writeReadState(state: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(READ_KEY, JSON.stringify(state));
  } catch {
    /* noop */
  }
}

function readDeletedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(DELETED_IDS_KEY);
    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch {
    return [];
  }
}

function writeDeletedIds(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(ids));
  } catch {
    /* noop */
  }
}

export type AddTransferMessagePayload = {
  beneficiary: string;
  amount: string;
  reference: string;
  accountName: string;
  executionDate: string;
  validationDate: string;
  validationTime: string;
};

type MessageContextValue = {
  allMessages: BankMessage[];
  unreadCount: number;
  unreadMessagesCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteMessage: (id: string) => void;
  addTransferMessage: (payload: AddTransferMessagePayload) => void;
};

const MessageContext = createContext<MessageContextValue | undefined>(undefined);

export function MessageProvider({ children }: { children: ReactNode }) {
  const [dynamicMessages, setDynamicMessages] = useState<BankMessage[]>(() => {
    if (typeof window === "undefined") return [];
    return readMessages().filter((m) => m.id.startsWith("transfer-message-"));
  });
  const [readState, setReadState] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    return readReadState();
  });
  const [deletedIds, setDeletedIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    return readDeletedIds();
  });

  const allMessages = useMemo(() => {
    const merged = [...dynamicMessages, ...initialMessages];
    return merged
      .filter((m) => !deletedIds.includes(m.id))
      .map((m) => ({
        ...m,
        unread: readState[m.id] === undefined ? m.unread : !readState[m.id],
      }));
  }, [dynamicMessages, readState, deletedIds]);

  const unreadCount = useMemo(() => allMessages.filter((m) => m.unread).length, [allMessages]);

  const markAsRead = useCallback(
    (id: string) => {
      setReadState((prev) => {
        const next = { ...prev, [id]: true };
        writeReadState(next);
        return next;
      });
    },
    [],
  );

  const markAllAsRead = useCallback(() => {
    setReadState((prev) => {
      const next: Record<string, boolean> = {};
      for (const m of allMessages) {
        next[m.id] = true;
      }
      writeReadState(next);
      return next;
    });
  }, [allMessages]);

  const deleteMessage = useCallback((id: string) => {
    setDeletedIds((prev) => {
      const next = [...prev, id];
      writeDeletedIds(next);
      return next;
    });
  }, []);

  const addTransferMessage = useCallback((payload: AddTransferMessagePayload) => {
    const messageId = `transfer-message-${payload.reference}`;

    setDynamicMessages((prev) => {
      if (prev.some((m) => m.id === messageId)) return prev;

      const info: BankMessageInfo = [
        ["Client", "Frederico Di Mario"],
        ["Bénéficiaire", payload.beneficiary],
        ["Montant", payload.amount],
        ["Référence", payload.reference],
      ];

      const now = new Date();
      const todayLabel = "Aujourd'hui";

      const newMessage: BankMessage = {
        id: messageId,
        title: "Confirmation de virement",
        sender: "Service Opérations",
        preview: `Votre virement vers ${payload.beneficiary} d'un montant de ${payload.amount} a été enregistré avec la référence ${payload.reference}.`,
        date: todayLabel,
        category: "Opérations",
        unread: true,
        active: false,
        detail: `Bonjour Frederico,\n\nNous vous confirmons l'enregistrement de votre virement vers ${payload.beneficiary}.\n\nMontant : ${payload.amount}\nCompte débité : ${payload.accountName}\nDate d'exécution : ${payload.executionDate}\nRéférence : ${payload.reference}\n\nVous pouvez télécharger le bordereau PDF depuis votre espace client.`,
        info,
        attachment: `Bordereau-virement-${payload.reference}.pdf`,
        folder: "Boîte de réception",
      };

      const next = [newMessage, ...prev];
      writeMessages(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ allMessages, unreadCount, unreadMessagesCount: unreadCount, markAsRead, markAllAsRead, deleteMessage, addTransferMessage }),
    [allMessages, unreadCount, markAsRead, markAllAsRead, deleteMessage, addTransferMessage],
  );

  return <MessageContext.Provider value={value}>{children}</MessageContext.Provider>;
}

export function useMessages() {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessages must be used within a MessageProvider");
  }
  return context;
}
