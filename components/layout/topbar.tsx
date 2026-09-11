"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Menu, Plus, Rows3, Search, Settings, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useCampaign } from "@/lib/campaign-context";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { NotificationsMenu } from "@/components/layout/notifications-menu";
import { CommandPalette } from "@/components/layout/command-palette";
import { cn } from "@/lib/utils";

const statusTone = {
  live: "good",
  scheduled: "accent",
  reporting: "warning",
  completed: "neutral",
} as const;

function CampaignSwitcher() {
  const { campaigns, campaign, setCampaignId } = useCampaign();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-border-hairline bg-surface-1 px-3 py-1.5 text-[13px] font-medium text-text-primary hover:bg-surface-hover"
      >
        <span className="max-w-[160px] truncate sm:max-w-[240px]">{campaign.name}</span>
        <Badge tone={statusTone[campaign.status]} className="hidden sm:inline-flex">
          {campaign.status}
        </Badge>
        <ChevronDown className="size-4 text-text-muted" />
      </button>
      {open && (
        <div className="absolute left-0 z-40 mt-2 w-80 rounded-[var(--radius-md)] border border-border-hairline bg-surface-1 p-1.5 shadow-[var(--shadow-lg)] animate-fade-in">
          {campaigns.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setCampaignId(c.id);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-left text-[13px] hover:bg-surface-hover",
                c.id === campaign.id && "bg-accent-soft"
              )}
            >
              <div>
                <p className="font-medium text-text-primary">{c.name}</p>
                <p className="text-[11px] text-text-muted">{c.platforms.join(" · ")}</p>
              </div>
              <Badge tone={statusTone[c.status]}>{c.status}</Badge>
            </button>
          ))}
          <div className="my-1 h-px bg-border-hairline" />
          <Link
            href="/customer/campaigns"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-left text-[13px] font-medium text-text-secondary hover:bg-surface-hover"
          >
            <Rows3 className="size-4" /> View all campaigns
          </Link>
          <Link
            href="/customer/campaigns/new"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-left text-[13px] font-medium text-accent hover:bg-accent-soft"
          >
            <Plus className="size-4" /> New campaign
          </Link>
        </div>
      )}
    </div>
  );
}

function UserMenu() {
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
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 rounded-full p-0.5 hover:bg-surface-hover">
        <Avatar name={session.name} size={34} />
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-64 rounded-[var(--radius-md)] border border-border-hairline bg-surface-1 p-1.5 shadow-[var(--shadow-lg)] animate-fade-in">
          <div className="flex items-center gap-3 px-3 py-2.5">
            <Avatar name={session.name} size={38} />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-text-primary">{session.name}</p>
              <p className="truncate text-[12px] text-text-muted">{session.email}</p>
            </div>
          </div>
          <div className="my-1 h-px bg-border-hairline" />
          <div className="px-3 py-1.5 text-[12px] text-text-muted">{session.company}</div>
          <Link
            href="/customer/settings?tab=profile"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-2 text-left text-[13px] text-text-secondary hover:bg-surface-hover"
          >
            <User className="size-4" /> Account settings
          </Link>
          <Link
            href="/customer/settings?tab=preferences"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-2 text-left text-[13px] text-text-secondary hover:bg-surface-hover"
          >
            <Settings className="size-4" /> Preferences
          </Link>
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
  );
}

function SearchTrigger({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="hidden items-center gap-2 rounded-[var(--radius-sm)] border border-border-hairline bg-surface-1 px-3 py-1.5 text-[13px] text-text-muted transition-colors hover:bg-surface-hover hover:text-text-secondary sm:flex"
    >
      <Search className="size-3.5" />
      <span className="w-32 text-left">Search…</span>
      <kbd className="rounded border border-border-strong bg-surface-2 px-1.5 py-0.5 text-[10.5px] font-medium text-text-muted">
        ⌘K
      </kbd>
    </button>
  );
}

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border-hairline bg-surface-1/85 px-4 backdrop-blur-sm print:hidden sm:px-6">
      <button onClick={onMenuClick} className="flex size-9 items-center justify-center rounded-[var(--radius-sm)] hover:bg-surface-hover lg:hidden">
        <Menu className="size-5" />
      </button>
      <CampaignSwitcher />
      <div className="ml-auto flex items-center gap-2">
        <SearchTrigger onOpen={() => setSearchOpen(true)} />
        <button
          onClick={() => setSearchOpen(true)}
          className="flex size-9 items-center justify-center rounded-full text-text-secondary hover:bg-surface-hover hover:text-text-primary sm:hidden"
          aria-label="Search"
        >
          <Search className="size-[18px]" />
        </button>
        <NotificationsMenu />
        <UserMenu />
      </div>
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} onOpen={() => setSearchOpen(true)} />
    </header>
  );
}
