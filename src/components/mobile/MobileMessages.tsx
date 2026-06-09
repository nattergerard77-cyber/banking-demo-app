"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
  Inbox,
  Mail,
  Paperclip,
  PenLine,
  Search,
  Send,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import MobileShell from "./MobileShell";
import DemoModal from "../shared/DemoModal";
import DemoToast from "../shared/DemoToast";
import { useMessages } from "@/context/MessageContext";

const initialMessages = [
  {
    title: "Votre conseiller souhaite faire le point avec vous",
    sender: "Service Conseiller",
    preview: "Votre conseiller vous propose un rendez-vous afin d’échanger sur la gestion de votre épargne et vos projets à venir.",
    date: "Aujourd’hui",
    unread: true,
    folder: "Boîte de réception",
    category: "Conseiller",
    detail: "Votre conseiller vous propose un échange afin d’analyser la répartition de vos comptes, vos objectifs d’épargne et les services adaptés à votre situation.",
    info: [["Client", "Frederico Di Mario"], ["Objet", "Point épargne"], ["Date", "Aujourd’hui"], ["Statut", "À planifier"]],
    attachment: "Preparation-rendez-vous.pdf",
  },
  {
    title: "Votre relevé annuel est disponible",
    sender: "Service Documents",
    preview: "Votre relevé annuel de situation est désormais disponible dans votre espace documents.",
    date: "Hier",
    unread: true,
    folder: "Documents",
    category: "Documents",
    detail: "Votre relevé annuel présente la synthèse de vos comptes, documents associés et mouvements importants, dont le virement entrant italien du 15 juillet 2022.",
    info: [["Document", "Relevé annuel"], ["Période", "2022"], ["Date", "Hier"], ["Statut", "Disponible"]],
    attachment: "Releve-annuel-2022.pdf",
  },
  {
    title: "Solution d’épargne adaptée à votre profil",
    sender: "Service Épargne",
    preview: "Au regard de votre solde disponible, une solution d’épargne progressive peut vous aider à mieux répartir vos liquidités.",
    date: "12 juillet 2022",
    unread: false,
    folder: "Boîte de réception",
    category: "Épargne",
    detail: "Votre solde global de 300.000,00 € permet d’envisager une répartition progressive entre liquidités disponibles et supports d’épargne adaptés à vos objectifs.",
    info: [["Solde étudié", "300.000,00 €"], ["Compte", "Compte courant"], ["Date", "12 juillet 2022"], ["Statut", "À étudier"]],
    attachment: "Proposition-epargne.pdf",
  },
  {
    title: "Carte Premium : services disponibles",
    sender: "Service Cartes",
    preview: "Vous pouvez bénéficier d’une carte avec plafonds renforcés, assurances voyage et assistance dédiée.",
    date: "08 juillet 2022",
    unread: false,
    folder: "Boîte de réception",
    category: "Carte",
    detail: "Votre profil permet d’accéder à une carte premium incluant des plafonds renforcés, des garanties voyage et une assistance dédiée.",
    info: [["Offre", "Carte Premium"], ["Services", "Assistance"], ["Date", "08 juillet 2022"], ["Statut", "Éligible"]],
    attachment: "Carte-premium-services.pdf",
  },
  {
    title: "Sécurisation de votre appareil principal",
    sender: "Service Sécurité",
    preview: "Votre appareil principal a été reconnu comme appareil de confiance pour sécuriser vos connexions.",
    date: "05 juillet 2022",
    unread: false,
    folder: "Boîte de réception",
    category: "Sécurité",
    detail: "L’iPhone de Frederico est associé à votre espace client et peut être utilisé pour confirmer certaines actions sensibles.",
    info: [["Appareil", "iPhone de Frederico"], ["Usage", "Sécurité"], ["Date", "05 juillet 2022"], ["Statut", "Appareil de confiance"]],
    attachment: "Securite-appareil.pdf",
  },
];

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

export function MobileMessages() {
  const { allMessages, unreadCount, markAsRead, deleteMessage } = useMessages();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string>(allMessages[0]?.id ?? "");
  const [folder, setFolder] = useState("Boîte de réception");
  const [composeOpen, setComposeOpen] = useState(false);
  const [reply, setReply] = useState("");
  const [toast, setToast] = useState("");
  const [swipedMessageId, setSwipedMessageId] = useState<string | null>(null);
  const touchStart = useRef<{ x: number; y: number; id: string } | null>(null);
  const filtered = useMemo(() => {
    const byFolder =
      folder === "Non lus"
        ? allMessages.filter((message) => message.unread)
        : allMessages.filter((message) => (message.folder ?? "Boîte de réception") === folder);
    return byFolder.filter((message) =>
      `${message.title} ${message.sender}`.toLowerCase().includes(search.toLowerCase()),
    );
  }, [folder, search, allMessages]);
  const selected = filtered.find((message) => message.id === selectedId) ?? filtered[0] ?? allMessages[0];

  return (
    <MobileShell>
      <div className="space-y-4">
        <section className="flex items-end justify-between">
          <div>
            <h1 className="text-[24px] font-bold tracking-tight text-[#090927]">
              Messagerie
            </h1>
            <p className="mt-1 text-[14px] text-[#6B7280]">
              Messages sécurisés.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setComposeOpen(true)}
            aria-label="Nouveau message"
            className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#050033] text-white"
          >
            <PenLine size={18} />
          </button>
        </section>

        <MobileCard className="p-4">
          <div className="flex h-10 items-center gap-3 rounded-[10px] border border-[#E5E7EB] px-3">
            <Search size={17} className="text-[#6B7280]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher..."
              className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#9CA3AF]"
            />
          </div>
        </MobileCard>

        <MobileCard className="p-4">
          <div className="mb-3 grid grid-cols-3 gap-2">
            {["Boîte de réception", "Documents", "Non lus"].map((folderName) => (
              <button
                key={folderName}
                type="button"
                onClick={() => setFolder(folderName)}
                className={`h-9 rounded-[10px] border text-[12px] font-semibold ${
                  folder === folderName
                    ? "border-[#050033] bg-[#050033] text-white"
                    : "border-[#E5E7EB] text-[#050033]"
                }`}
              >
                {folderName}
              </button>
            ))}
          </div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[17px] font-bold text-[#090927]">
              {folder}
            </h2>

            <span className="rounded-full bg-[#EEF7D8] px-3 py-1 text-[12px] font-bold text-[#050033]">
              {unreadCount} non lus
            </span>
          </div>

          <div className="space-y-3">
            {filtered.map((message) => (
              <div key={message.id} className="flex items-stretch gap-0">
                <button
                  type="button"
                  onClick={() => {
                    if (swipedMessageId) { setSwipedMessageId(null); return; }
                    setSelectedId(message.id);
                    markAsRead(message.id);
                  }}
                  onTouchStart={(e) => {
                    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, id: message.id };
                  }}
                  onTouchMove={(e) => {
                    if (!touchStart.current || touchStart.current.id !== message.id) return;
                    const deltaX = e.touches[0].clientX - touchStart.current.x;
                    const deltaY = e.touches[0].clientY - touchStart.current.y;
                    if (Math.abs(deltaX) > Math.abs(deltaY) * 1.5 && deltaX > 50) {
                      setSwipedMessageId(message.id);
                      touchStart.current = null;
                    }
                  }}
                  onTouchEnd={() => {
                    if (touchStart.current?.id === message.id) {
                      touchStart.current = null;
                    }
                  }}
                  className={`flex w-full items-start gap-3 rounded-[14px] border p-3 text-left transition-all ${
                    selected.id === message.id
                      ? "border-2 border-[#9ACD00] bg-white"
                      : "border-[#E5E7EB] bg-white"
                  } ${swipedMessageId === message.id ? "rounded-r-none" : ""}`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      message.unread
                        ? "bg-[#050033] text-white"
                        : "bg-[#F3F4F6] text-[#050033]"
                    }`}
                  >
                    <Mail size={18} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="truncate text-[14px] font-bold text-[#090927]">
                        {message.title}
                      </span>
                      <span className="shrink-0 text-[11px] text-[#6B7280]">
                        {message.date}
                      </span>
                    </span>

                    <span className="mt-1 block text-[12px] font-semibold text-[#050033]">
                      {message.sender}
                    </span>
                    <span className="mt-1 line-clamp-2 text-[12px] leading-[1.35] text-[#6B7280]">
                      {message.preview}
                    </span>
                  </span>

                  <ChevronRight size={17} className="mt-3 text-[#050033]" />
                </button>

                {swipedMessageId === message.id && (
                  <button
                    type="button"
                    aria-label="Supprimer le message"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMessage(message.id);
                      setSwipedMessageId(null);
                      if (selectedId === message.id) setSelectedId("");
                      setToast("Message supprimé");
                    }}
                    className="flex shrink-0 items-center gap-1.5 rounded-r-[14px] bg-[#DC2626] px-3 text-[12px] font-bold text-white"
                  >
                    <Trash2 size={14} />
                    Supprimer
                  </button>
                )}
              </div>
            ))}
          </div>
        </MobileCard>

        <MobileCard className="p-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#EEF7D8] px-3 py-1 text-[12px] font-bold text-[#050033]">
              {selected.category}
            </span>
            <span className="h-2 w-2 rounded-full bg-[#9ACD00]" />
          </div>

          <h2 className="mt-4 text-[19px] font-bold text-[#090927]">
            {selected.title}
          </h2>
          <p className="mt-1 text-[12px] text-[#6B7280]">
            {selected.sender} · {selected.date}
          </p>

          <p className="mt-4 text-[14px] leading-[1.55] text-[#4B5563]">
            {selected.detail}
          </p>

          <div className="mt-4 rounded-[14px] bg-[#F6F7F9] p-3">
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <div>
                <p className="text-[#6B7280]">{selected.info[0][0]}</p>
                <p className="mt-1 font-bold text-[#090927]">{selected.info[0][1]}</p>
              </div>

              <div>
                <p className="text-[#6B7280]">{selected.info[1][0]}</p>
                <p className="mt-1 font-bold text-[#050033]">{selected.info[1][1]}</p>
              </div>

              <div>
                <p className="text-[#6B7280]">{selected.info[2][0]}</p>
                <p className="mt-1 font-bold text-[#090927]">{selected.info[2][1]}</p>
              </div>

              <div>
                <p className="text-[#6B7280]">{selected.info[3][0]}</p>
                <p className="mt-1 flex items-center gap-1 font-bold text-[#7AA600]">
                  <CheckCircle2 size={13} />
                  {selected.info[3][1]}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setToast("PDF telecharge ")}
            className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-[10px] border border-[#E5E7EB] text-[13px] font-semibold text-[#050033]"
          >
            <Paperclip size={15} />
            {selected.attachment}
            <Download size={15} />
          </button>
        </MobileCard>

        <MobileCard className="p-4">
          <h2 className="text-[17px] font-bold text-[#090927]">
            Réponse rapide
          </h2>

          <div className="mt-3 flex items-center gap-3">
            <input value={reply} onChange={(event) => setReply(event.target.value)} className="flex h-11 flex-1 items-center rounded-[12px] border border-[#E5E7EB] px-4 text-[14px] text-[#090927]" placeholder="Ecrire une reponse..." />

            <button
              type="button"
              aria-label="Envoyer reponse rapide"
              onClick={() => {
                if (!reply.trim()) return;
                setReply("");
                setToast("Reponse envoyee ");
              }}
              className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#050033] text-white"
            >
              <Send size={18} />
            </button>
          </div>
        </MobileCard>

        <MobileCard className="p-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { icon: Inbox, label: "Réception", value: "5" },
              { icon: FileText, label: "Documents", value: "1" },
              { icon: Bell, label: "Non lus", value: "2" },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label}>
                  <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6] text-[#050033]">
                    <Icon size={18} />
                  </span>
                  <p className="mt-2 text-[15px] font-bold text-[#090927]">
                    {item.value}
                  </p>
                  <p className="mt-1 text-[11px] text-[#6B7280]">
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>
        </MobileCard>

        <MobileCard className="p-4">
          <div className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEF7D8] text-[#7AA600]">
              <ShieldCheck size={20} />
            </span>

            <div>
              <h2 className="text-[15px] font-bold text-[#090927]">
                Messagerie sécurisée
              </h2>
              <p className="mt-1 text-[13px] leading-[1.4] text-[#6B7280]">
                Vos échanges sont protégés dans votre espace client.
              </p>
            </div>
          </div>
        </MobileCard>
      </div>
      <DemoModal open={composeOpen} title="Nouveau message" message="Rédaction d’un nouveau message." onClose={() => setComposeOpen(false)} onConfirm={() => { setComposeOpen(false); setToast("Message cree "); }} />
      <DemoToast open={Boolean(toast)} message={toast} onClose={() => setToast("")} />
    </MobileShell>
  );
}

export default MobileMessages;
