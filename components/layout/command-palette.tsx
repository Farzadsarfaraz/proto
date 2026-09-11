"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Activity,
  Briefcase,
  CalendarDays,
  ClipboardCheck,
  CornerDownLeft,
  Eye,
  FileText,
  Flame,
  Heart,
  LayoutGrid,
  Lightbulb,
  MousePointerClick,
  Plus,
  Search,
  Settings,
  Sparkles,
  Target,
  UserPlus,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useCampaign } from "@/lib/campaign-context";
import { useInfluencerPreview } from "@/lib/influencer-preview";
import { INFLUENCERS, BRIEFING_DOCS } from "@/lib/mock-data";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn, formatCompactNumber } from "@/lib/utils";

const PAGES: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/customer", label: "Overview", icon: LayoutGrid },
  { href: "/customer/campaigns", label: "All Campaigns", icon: Briefcase },
  { href: "/customer/dashboards/monitoring", label: "Monitoring Dashboard", icon: Activity },
  { href: "/customer/dashboards/final", label: "Final Report", icon: ClipboardCheck },
  { href: "/customer/dashboards/awareness", label: "Awareness Dashboard", icon: Eye },
  { href: "/customer/dashboards/engagement", label: "Engagement Dashboard", icon: Heart },
  { href: "/customer/dashboards/traffic", label: "Traffic Dashboard", icon: MousePointerClick },
  { href: "/customer/dashboards/conversion", label: "Conversion Dashboard", icon: Target },
  { href: "/customer/dashboards/budget", label: "Budget Dashboard", icon: Wallet },
  { href: "/customer/action-center", label: "Action Center", icon: Sparkles },
  { href: "/customer/influencer-tinder", label: "Influencer-Tinder", icon: Flame },
  { href: "/customer/calendar", label: "Content Calendar", icon: CalendarDays },
  { href: "/customer/recommendations", label: "Recommendations", icon: Lightbulb },
  { href: "/customer/settings", label: "Settings", icon: Settings },
];

const QUICK_ACTIONS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/customer/campaigns/new", label: "New campaign", icon: Plus },
  { href: "/customer/settings?tab=team", label: "Invite team member", icon: UserPlus },
];

interface ResultItem {
  id: string;
  group: string;
  icon?: LucideIcon;
  avatarName?: string;
  label: string;
  sublabel?: string;
  action: () => void;
}

export function CommandPalette({ open, onClose, onOpen }: { open: boolean; onClose: () => void; onOpen: () => void }) {
  const router = useRouter();
  const { campaigns, setCampaignId } = useCampaign();
  const { open: openInfluencerPreview } = useInfluencerPreview();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset search state the moment `open` flips to true — done during render
  // (comparing against the previous value in state) rather than in an effect,
  // since this only needs to run once per open, not resync on every render.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setQuery("");
      setActiveIndex(0);
    }
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpen();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onOpen]);

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => inputRef.current?.focus(), 10);
    return () => clearTimeout(id);
  }, [open]);

  function go(href: string) {
    router.push(href);
    onClose();
  }

  const results = useMemo<Record<string, ResultItem[]>>(() => {
    const q = query.trim().toLowerCase();
    const groups: Record<string, ResultItem[]> = {};

    const pages = q ? PAGES.filter((p) => p.label.toLowerCase().includes(q)) : PAGES.slice(0, 8);
    if (pages.length) {
      groups.Pages = pages.map((p) => ({ id: `page-${p.href}`, group: "Pages", icon: p.icon, label: p.label, action: () => go(p.href) }));
    }

    if (q) {
      const matchedCampaigns = campaigns.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 5);
      if (matchedCampaigns.length) {
        groups.Campaigns = matchedCampaigns.map((c) => ({
          id: `campaign-${c.id}`,
          group: "Campaigns",
          icon: Briefcase,
          label: c.name,
          sublabel: `${c.status} · ${c.platforms.join(", ")}`,
          action: () => {
            setCampaignId(c.id);
            go("/customer");
          },
        }));
      }

      const matchedInfluencers = INFLUENCERS.filter(
        (inf) => inf.name.toLowerCase().includes(q) || inf.handle.toLowerCase().includes(q) || inf.niche.toLowerCase().includes(q)
      ).slice(0, 6);
      if (matchedInfluencers.length) {
        groups.Influencers = matchedInfluencers.map((inf) => ({
          id: `inf-${inf.id}`,
          group: "Influencers",
          avatarName: inf.name,
          label: inf.name,
          sublabel: `${inf.platform} · ${formatCompactNumber(inf.followers)} followers`,
          action: () => {
            onClose();
            openInfluencerPreview(inf);
          },
        }));
      }

      const matchedDocs = BRIEFING_DOCS.filter((d) => d.title.toLowerCase().includes(q)).slice(0, 4);
      if (matchedDocs.length) {
        groups.Documents = matchedDocs.map((d) => ({
          id: `doc-${d.id}`,
          group: "Documents",
          icon: FileText,
          label: d.title,
          sublabel: d.type,
          action: () => go("/customer/action-center#briefing"),
        }));
      }
    }

    const actions = q ? QUICK_ACTIONS.filter((a) => a.label.toLowerCase().includes(q)) : QUICK_ACTIONS;
    if (actions.length) {
      groups["Quick actions"] = actions.map((a) => ({
        id: `action-${a.href}`,
        group: "Quick actions",
        icon: a.icon,
        label: a.label,
        action: () => go(a.href),
      }));
    }

    return groups;
    // `go`, `setCampaignId`, `onClose` and `openInfluencerPreview` are stable-enough
    // closures that don't change what's matched — only `query`/`campaigns` should
    // trigger a refilter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, campaigns]);

  const flat = useMemo(() => Object.values(results).flat(), [results]);

  function onInputKeyDown(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(flat.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      flat[activeIndex]?.action();
    } else if (e.key === "Escape") {
      onClose();
    }
  }

  // Portalled to <body> — this component is mounted inside the sticky
  // (z-30) Topbar, which establishes its own stacking context. A fixed
  // overlay rendered as a normal descendant would have its z-index compared
  // only within that context, so it could end up hidden behind unrelated
  // fixed elements elsewhere on the page (e.g. an open profile modal)
  // regardless of how high its own z-index is set.
  return (
    open &&
    createPortal(
      <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[12vh]">
        <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
        <div
          role="dialog"
          aria-modal="true"
          className="relative flex max-h-[70vh] w-full max-w-lg flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border-hairline bg-surface-1 shadow-[var(--shadow-lg)] animate-fade-in"
        >
          <div className="flex items-center gap-2.5 border-b border-border-hairline px-4">
            <Search className="size-4 shrink-0 text-text-muted" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={onInputKeyDown}
              placeholder="Search campaigns, creators, pages…"
              className="h-12 w-full bg-transparent text-[14px] text-text-primary outline-none placeholder:text-text-muted"
            />
          </div>

          <div className="flex-1 overflow-y-auto p-1.5">
            {flat.length === 0 && <p className="px-4 py-8 text-center text-[13px] text-text-muted">No results for &ldquo;{query}&rdquo;.</p>}
            {Object.entries(results).map(([group, items]) => (
              <div key={group} className="mb-1">
                <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-text-muted">{group}</p>
                {items.map((item) => {
                  const flatIndex = flat.indexOf(item);
                  const active = flatIndex === activeIndex;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onMouseEnter={() => setActiveIndex(flatIndex)}
                      onClick={() => item.action()}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-left",
                        active ? "bg-accent-soft" : "hover:bg-surface-hover"
                      )}
                    >
                      {item.avatarName ? (
                        <Avatar name={item.avatarName} size={28} />
                      ) : Icon ? (
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-surface-2 text-text-secondary">
                          <Icon className="size-[15px]" />
                        </div>
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-text-primary">{item.label}</p>
                        {item.sublabel && <p className="truncate text-[11.5px] text-text-muted">{item.sublabel}</p>}
                      </div>
                      {active && <Badge tone="accent">Enter</Badge>}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-border-hairline px-4 py-2 text-[11.5px] text-text-muted">
            <span className="flex items-center gap-1.5">
              <CornerDownLeft className="size-3" /> to select
            </span>
            <span>Esc to close</span>
          </div>
        </div>
      </div>,
      document.body
    )
  );
}
