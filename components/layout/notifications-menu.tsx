"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CircleDollarSign, Flame, MessageSquareWarning, Sparkles } from "lucide-react";
import { NOTIFICATIONS } from "@/lib/mock-data";
import type { AppNotification, NotificationType } from "@/lib/types";
import { cn, formatRelativeTime } from "@/lib/utils";

const typeMeta: Record<NotificationType, { icon: typeof Bell; className: string }> = {
  match: { icon: Flame, className: "bg-accent-soft text-accent-strong" },
  content: { icon: MessageSquareWarning, className: "bg-status-critical/10 text-status-critical" },
  budget: { icon: CircleDollarSign, className: "bg-status-warning/15 text-[#8a5a00]" },
  system: { icon: Sparkles, className: "bg-surface-2 text-text-secondary" },
};

export function NotificationsMenu() {
  const [items, setItems] = useState<AppNotification[]>(NOTIFICATIONS);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unreadCount = items.filter((n) => !n.read).length;

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex size-9 items-center justify-center rounded-full text-text-secondary hover:bg-surface-hover hover:text-text-primary"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <Bell className="size-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-status-critical text-[10px] font-semibold text-white">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 rounded-[var(--radius-md)] border border-border-hairline bg-surface-1 shadow-[var(--shadow-lg)] animate-fade-in sm:w-96">
          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-[13px] font-semibold text-text-primary">Notifications</p>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-[12px] font-medium text-accent hover:underline">
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto border-t border-border-hairline">
            {items.length === 0 && <p className="px-4 py-6 text-center text-[13px] text-text-muted">You&apos;re all caught up.</p>}
            {items.map((n) => {
              const meta = typeMeta[n.type];
              const Icon = meta.icon;
              const content = (
                <div
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-hover",
                    !n.read && "bg-accent-soft/40"
                  )}
                >
                  <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-full", meta.className)}>
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-medium text-text-primary">{n.title}</p>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-text-muted">{n.description}</p>
                    <p className="mt-1 text-[11px] text-text-muted">{formatRelativeTime(new Date(n.at))}</p>
                  </div>
                  {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" />}
                </div>
              );
              return n.href ? (
                <Link key={n.id} href={n.href} onClick={() => { markRead(n.id); setOpen(false); }}>
                  {content}
                </Link>
              ) : (
                <button key={n.id} onClick={() => markRead(n.id)} className="block w-full text-left">
                  {content}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
