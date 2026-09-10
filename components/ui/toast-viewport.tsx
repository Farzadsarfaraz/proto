"use client";

import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { useToast } from "@/lib/toast";
import { cn } from "@/lib/utils";

const toneMeta = {
  success: { icon: CheckCircle2, className: "text-status-good" },
  error: { icon: AlertCircle, className: "text-status-critical" },
  info: { icon: Info, className: "text-accent" },
} as const;

export function ToastViewport() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end">
      {toasts.map((toast) => {
        const meta = toneMeta[toast.tone];
        const Icon = meta.icon;
        return (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-[var(--radius-md)] border border-border-hairline bg-surface-1 p-3.5 shadow-[var(--shadow-lg)] animate-fade-in"
          >
            <Icon className={cn("mt-0.5 size-4.5 shrink-0", meta.className)} />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-text-primary">{toast.title}</p>
              {toast.description && <p className="mt-0.5 text-[12.5px] text-text-secondary">{toast.description}</p>}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="flex size-6 shrink-0 items-center justify-center rounded-full text-text-muted hover:bg-surface-hover hover:text-text-primary"
              aria-label="Dismiss notification"
            >
              <X className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
