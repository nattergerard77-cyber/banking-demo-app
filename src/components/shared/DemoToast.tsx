"use client";

import { useEffect } from "react";

type DemoToastProps = {
  message: string;
  open: boolean;
  onClose: () => void;
};

export default function DemoToast({ message, open, onClose }: DemoToastProps) {
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(onClose, 2600);
    return () => window.clearTimeout(timer);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed bottom-20 right-4 z-[1250] max-w-[90vw] rounded-xl border border-border bg-card px-4 py-3 shadow-xl lg:bottom-6">
      <div className="flex items-start gap-3">
        <p className="text-sm font-medium text-text-primary">{message}</p>
        <button
          type="button"
          aria-label="Fermer le message"
          onClick={onClose}
          className="text-xs font-bold text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
        >
          X
        </button>
      </div>
    </div>
  );
}
