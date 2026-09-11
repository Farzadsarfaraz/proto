"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useFocusTrap } from "@/lib/use-focus-trap";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, description, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(open, panelRef);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  // Portalled to <body>: every page wraps its content in an `animate-fade-in`
  // element, and `animation-fill-mode: both` leaves a permanent (identity)
  // transform on it after the animation ends. A non-"none" transform makes
  // that ancestor the containing block for `position: fixed` descendants, so
  // without the portal this modal would be positioned relative to the page
  // content instead of the viewport — offset, clipped, and scrolling away.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className="relative w-full max-w-md rounded-[var(--radius-lg)] border border-border-hairline bg-surface-1 p-6 shadow-[var(--shadow-lg)] animate-fade-in outline-none"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-text-muted hover:bg-surface-hover hover:text-text-primary"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>
        <h2 id="modal-title" className="text-[16px] font-semibold text-text-primary">
          {title}
        </h2>
        {description && <p className="mt-1 text-[13px] text-text-secondary">{description}</p>}
        <div className="mt-4">{children}</div>
      </div>
    </div>,
    document.body
  );
}
