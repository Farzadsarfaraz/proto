"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ClipboardCheck,
  Compass,
  Eye,
  Flame,
  Heart,
  LayoutGrid,
  Lightbulb,
  MousePointerClick,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const dashboards = [
  { href: "/customer/dashboards/monitoring", label: "Monitoring", icon: Activity },
  { href: "/customer/dashboards/final", label: "Final Report", icon: ClipboardCheck },
  { href: "/customer/dashboards/awareness", label: "Awareness", icon: Eye },
  { href: "/customer/dashboards/engagement", label: "Engagement", icon: Heart },
  { href: "/customer/dashboards/traffic", label: "Traffic", icon: MousePointerClick },
  { href: "/customer/dashboards/conversion", label: "Conversion", icon: Target },
];

const tools = [
  { href: "/customer/action-center", label: "Action Center", icon: Sparkles },
  { href: "/customer/influencer-tinder", label: "Influencer-Tinder", icon: Flame },
  { href: "/customer/recommendations", label: "Recommendations", icon: Lightbulb },
];

function NavLink({ href, label, icon: Icon, onNavigate }: { href: string; label: string; icon: typeof Activity; onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/customer" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "group flex items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-2 text-[13.5px] font-medium transition-colors",
        active ? "bg-accent-soft text-accent-strong" : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
      )}
    >
      <Icon className={cn("size-[18px] shrink-0", active ? "text-accent-strong" : "text-text-muted group-hover:text-text-secondary")} />
      {label}
    </Link>
  );
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
      <div>
        <NavLink href="/customer" label="Overview" icon={LayoutGrid} onNavigate={onNavigate} />
      </div>
      <div>
        <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-muted">Customer Dashboards</p>
        <div className="flex flex-col gap-0.5">
          {dashboards.map((d) => (
            <NavLink key={d.href} {...d} onNavigate={onNavigate} />
          ))}
        </div>
      </div>
      <div>
        <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-muted">Take Action</p>
        <div className="flex flex-col gap-0.5">
          {tools.map((t) => (
            <NavLink key={t.href} {...t} onNavigate={onNavigate} />
          ))}
        </div>
      </div>
    </nav>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border-hairline bg-surface-1 lg:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-border-hairline px-5">
        <div className="flex size-8 items-center justify-center rounded-[10px] bg-accent text-white">
          <Compass className="size-[18px]" />
        </div>
        <div className="leading-tight">
          <p className="text-[13.5px] font-semibold text-text-primary">Octagone</p>
          <p className="text-[11px] text-text-muted">Customer Portal</p>
        </div>
      </div>
      <SidebarNav />
    </aside>
  );
}

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-surface-1 shadow-[var(--shadow-lg)] animate-fade-in">
        <div className="flex h-16 items-center justify-between border-b border-border-hairline px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-[10px] bg-accent text-white">
              <Compass className="size-[18px]" />
            </div>
            <p className="text-[13.5px] font-semibold text-text-primary">Octagone</p>
          </div>
          <button onClick={onClose} className="flex size-8 items-center justify-center rounded-full hover:bg-surface-hover">
            <X className="size-4.5" />
          </button>
        </div>
        <SidebarNav onNavigate={onClose} />
      </aside>
    </div>
  );
}
