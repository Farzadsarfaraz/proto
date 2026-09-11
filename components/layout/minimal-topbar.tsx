"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Compass, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Avatar } from "@/components/ui/avatar";

export function MinimalTopbar({ portalLabel }: { portalLabel: string }) {
  const { session, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!session) return null;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border-hairline bg-surface-1/85 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-[10px] bg-accent text-white">
          <Compass className="size-[18px]" />
        </div>
        <div className="leading-tight">
          <p className="text-[13.5px] font-semibold text-text-primary">Octagone</p>
          <p className="text-[11px] text-text-muted">{portalLabel}</p>
        </div>
      </div>

      <div className="ml-auto" ref={ref}>
        <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 rounded-full p-0.5 hover:bg-surface-hover">
          <Avatar name={session.name} size={34} />
        </button>
        {open && (
          <div className="absolute right-4 z-40 mt-2 w-64 rounded-[var(--radius-md)] border border-border-hairline bg-surface-1 p-1.5 shadow-[var(--shadow-lg)] animate-fade-in">
            <div className="flex items-center gap-3 px-3 py-2.5">
              <Avatar name={session.name} size={38} />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-text-primary">{session.name}</p>
                <p className="truncate text-[12px] text-text-muted">{session.email}</p>
              </div>
            </div>
            <div className="my-1 h-px bg-border-hairline" />
            <button
              onClick={() => {
                logout();
                router.replace("/login");
              }}
              className="flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-2 text-left text-[13px] font-medium text-status-critical hover:bg-status-critical/10"
            >
              <LogOut className="size-4" /> Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
