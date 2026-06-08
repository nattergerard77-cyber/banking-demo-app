"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Archive,
  Bell,
  Download,
  FileText,
  Inbox,
  LockKeyhole,
  Mail,
  MoreVertical,
  Paperclip,
  PenLine,
  Search,
  Send,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import DesktopShell from "./DesktopShell";
import DemoModal from "../shared/DemoModal";
import DemoToast from "../shared/DemoToast";
import { useMessages } from "@/context/MessageContext";
import type { BankMessage } from "@/types/message";

const folders = [
  { label: "Boîte de réception", count: 5, icon: Inbox, active: true },
  { label: "Messages envoyés", count: 2, icon: Send, active: false },
  { label: "Archivés", count: 8, icon: Archive, active: false },
  { label: "Corbeille", count: 0, icon: Trash2, active: false },
];

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

function MessageRow({
  message,
}: {
  message: BankMessage;
}) {
  return (
    <button
      type="button"
      className={`w-full border-b border-[#E5E7EB] p-4 text-left last:border-b-0 ${
        message.active ? "bg-[#FBFFF1]" : "bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            message.unread
              ? "bg-[#050033] text-white"
              : "bg-[#F3F4F6] text-[#050033]"
          }`}
        >
          <Mail size={18} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-3">
            <span className="truncate text-[14px] font-bold text-[#090927]">
              {message.title}
            </span>
            <span className="shrink-0 text-[12px] text-[#6B7280]">
              {message.date}
            </span>
          </span>

          <span className="mt-1 block text-[12px] font-semibold text-[#050033]">
            {message.sender}
          </span>

          <span className="mt-1 line-clamp-2 text-[12px] leading-[1.35] text-[#6B7280]">
            {message.preview}
          </span>

          <span className="mt-3 flex items-center justify-between">
            <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-[11px] font-semibold text-[#050033]">
              {message.category}
            </span>

            {message.unread && (
              <span className="h-2 w-2 rounded-full bg-[#9ACD00]" />
            )}
          </span>
        </span>
      </div>
    </button>
  );
}

export function DesktopMessages() {
  const { allMessages, unreadCount, markAsRead } = useMessages();
  const [currentFolder, setCurrentFolder] = useState(folders[0].label);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string>(allMessages[0]?.id ?? "");
  const [reply, setReply] = useState("");
  const [toast, setToast] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const filtered = useMemo(
    () => allMessages.filter((m) => `${m.title} ${m.sender}`.toLowerCase().includes(search.toLowerCase())),
    [search, allMessages],
  );
  const selected = filtered.find((m) => m.id === selectedId) ?? filtered[0] ?? allMessages[0];

  return (
    <DesktopShell>
      <div className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[26px] font-bold tracking-tight text-[#090927]">
              Messagerie
            </h1>
            <p className="mt-1 text-[15px] text-[#6B7280]">
              Retrouvez vos messages et documents.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setComposeOpen(true)}
            className="flex h-10 items-center gap-2 rounded-[10px] bg-[#050033] px-4 text-[14px] font-bold text-white"
          >
            <PenLine size={16} />
            Nouveau message
          </button>
        </div>

        <div className="grid grid-cols-12 gap-5">
          <Card className="col-span-3 p-5">
            <h2 className="text-[18px] font-bold text-[#090927]">
              Dossiers
            </h2>

            <div className="mt-4 space-y-2">
              {folders.map((folder) => {
                const Icon = folder.icon;

                return (
                  <button
                    key={folder.label}
                    type="button"
                    onClick={() => {
                      setCurrentFolder(folder.label);
                      setToast(`Dossier ${folder.label} selectionne`);
                    }}
                    className={`flex h-11 w-full items-center justify-between rounded-[12px] px-3 text-left ${
                      folder.label === currentFolder
                        ? "bg-[#050033] text-white"
                        : "bg-white text-[#090927] hover:bg-[#F6F7F9]"
                    }`}
                  >
                    <span className="flex items-center gap-3 text-[14px] font-semibold">
                      <Icon size={17} />
                      {folder.label}
                    </span>

                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          folder.label === currentFolder
                          ? "bg-white/15 text-white"
                          : "bg-[#F3F4F6] text-[#050033]"
                      }`}
                    >
                      {folder.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-[14px] bg-[#EEF7D8] p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck size={20} className="shrink-0 text-[#7AA600]" />
                <div>
                  <p className="text-[14px] font-bold text-[#090927]">
                    Messagerie sécurisée
                  </p>
                  <p className="mt-1 text-[12px] leading-[1.4] text-[#6B7280]">
                    Les échanges affichés sont sécurisés.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="col-span-4 overflow-hidden">
            <div className="border-b border-[#E5E7EB] p-4">
              <div className="flex h-10 items-center gap-3 rounded-[10px] border border-[#E5E7EB] px-3">
                <Search size={17} className="text-[#6B7280]" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Rechercher un message..."
                  className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#9CA3AF]"
                />
              </div>
            </div>

            <div>
              {filtered.map((message) => (
                <div key={message.id} onClick={() => {
                  setSelectedId(message.id);
                  markAsRead(message.id);
                }}>
                  <MessageRow message={{ ...message, active: selected.id === message.id }} />
                </div>
              ))}
            </div>
          </Card>

          <Card className="col-span-5 p-5">
            <div className="flex items-start justify-between gap-4 border-b border-[#E5E7EB] pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#EEF7D8] px-3 py-1 text-[12px] font-bold text-[#050033]">
                    {selected.category}
                  </span>
                  <span className="h-2 w-2 rounded-full bg-[#9ACD00]" />
                </div>

                <h2 className="mt-4 text-[22px] font-bold text-[#090927]">
                  {selected.title}
                </h2>
                <p className="mt-2 text-[13px] text-[#6B7280]">
                  {selected.sender} · {selected.date}
                </p>
              </div>

                <button
                  type="button"
                  aria-label="Menu du message"
                  onClick={() => setToast("Menu message ouvert ")}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[#050033]"
                >
                <MoreVertical size={18} />
              </button>
            </div>

            <div className="py-5">
              <p className="text-[14px] leading-[1.65] text-[#4B5563]">
                Bonjour Frederico,
                <br />
                <br />
                {selected.detail}
              </p>

              <div className="mt-5 rounded-[14px] bg-[#F6F7F9] p-4">
                <div className="grid grid-cols-2 gap-4 text-[13px]">
                  <div>
                    <p className="text-[#6B7280]">{selected.info[0][0]}</p>
                    <p className="mt-1 font-bold text-[#090927]">
                      {selected.info[0][1]}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#6B7280]">{selected.info[1][0]}</p>
                    <p className="mt-1 font-bold text-[#050033]">{selected.info[1][1]}</p>
                  </div>
                  <div>
                    <p className="text-[#6B7280]">{selected.info[2][0]}</p>
                    <p className="mt-1 font-bold text-[#090927]">
                      {selected.info[2][1]}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#6B7280]">{selected.info[3][0]}</p>
                    <p className="mt-1 font-bold text-[#7AA600]">{selected.info[3][1]}</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setToast("PDF telecharge ")}
                className="mt-5 flex h-10 items-center gap-2 rounded-[10px] border border-[#E5E7EB] px-4 text-[14px] font-semibold text-[#050033]"
              >
                <Paperclip size={16} />
                {selected.attachment}
                <Download size={15} />
              </button>
            </div>

            <div className="border-t border-[#E5E7EB] pt-5">
              <label className="mb-2 block text-[13px] font-semibold text-[#090927]">
                Réponse rapide
              </label>

              <div className="flex items-center gap-3">
                <input value={reply} onChange={(event) => setReply(event.target.value)} className="flex h-11 flex-1 items-center rounded-[12px] border border-[#E5E7EB] px-4 text-[14px] text-[#090927]" placeholder="Ecrire une reponse..." />

                <button
                  type="button"
                  aria-label="Envoyer la reponse rapide"
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
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-12 gap-5">
          <Card className="col-span-4 p-5">
            <div className="flex items-center gap-3">
              <Bell size={21} className="text-[#7AA600]" />
              <div>
                <h2 className="text-[16px] font-bold text-[#090927]">
                  Notifications messages
                </h2>
                <p className="mt-1 text-[13px] text-[#6B7280]">
                  {unreadCount} messages non lus
                </p>
              </div>
            </div>
          </Card>

          <Card className="col-span-4 p-5">
            <div className="flex items-center gap-3">
              <FileText size={21} className="text-[#050033]" />
              <div>
                <h2 className="text-[16px] font-bold text-[#090927]">
                  Documents joints
                </h2>
                <p className="mt-1 text-[13px] text-[#6B7280]">
                  1 pièce jointe
                </p>
              </div>
            </div>
          </Card>

          <Card className="col-span-4 p-5">
            <div className="flex items-center gap-3">
              <LockKeyhole size={21} className="text-[#050033]" />
              <div>
                <h2 className="text-[16px] font-bold text-[#090927]">
                  Sécurité
                </h2>
                <p className="mt-1 text-[13px] text-[#6B7280]">
                  Vos échanges sont protégés.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <DemoModal open={composeOpen} title="Nouveau message" message="Rédaction d’un nouveau message." onClose={() => setComposeOpen(false)} onConfirm={() => { setComposeOpen(false); setToast("Nouveau message cree "); }} />
      <DemoToast open={Boolean(toast)} message={toast} onClose={() => setToast("")} />
    </DesktopShell>
  );
}

export default DesktopMessages;
