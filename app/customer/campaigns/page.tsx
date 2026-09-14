"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, X } from "lucide-react";
import { useCampaign } from "@/lib/campaign-context";
import { useCampaignMetrics } from "@/lib/use-campaign-metrics";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import type { Campaign, CampaignStatus } from "@/lib/types";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

const statusTone: Record<CampaignStatus, "good" | "accent" | "warning" | "neutral"> = {
  live: "good",
  scheduled: "accent",
  reporting: "warning",
  completed: "neutral",
};

const STATUS_FILTERS: { id: CampaignStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "live", label: "Live" },
  { id: "scheduled", label: "Scheduled" },
  { id: "reporting", label: "Reporting" },
  { id: "completed", label: "Completed" },
];

function CampaignRow({ campaign, active, onSelect }: { campaign: Campaign; active: boolean; onSelect: () => void }) {
  const metrics = useCampaignMetrics(campaign);
  const spentPct = metrics.budget.utilization.value;

  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex w-full flex-col gap-3 rounded-[var(--radius-lg)] border p-4 text-left transition-colors sm:flex-row sm:items-center sm:gap-5",
        active ? "border-accent bg-accent-soft" : "border-border-hairline bg-surface-1 hover:bg-surface-hover"
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[14px] font-semibold text-text-primary">{campaign.name}</p>
          <Badge tone={statusTone[campaign.status]}>{campaign.status}</Badge>
          {active && <Badge tone="accent">Active</Badge>}
        </div>
        <p className="mt-1 text-[12px] text-text-muted">
          {campaign.objective} · {campaign.platforms.join(", ")} · {campaign.influencerCount} creators
        </p>
        <p className="mt-0.5 text-[11.5px] text-text-muted">
          {formatDate(campaign.startDate)} – {formatDate(campaign.endDate)} · reporting {formatDate(campaign.reportingDate)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-6 sm:w-64">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-text-muted">Budget used</span>
            <span className="text-[12px] font-semibold tabular-nums text-text-primary">{spentPct}%</span>
          </div>
          <Progress value={spentPct} className="mt-1.5" />
        </div>
        <div className="text-right">
          <p className="text-[13px] font-semibold text-text-primary">{formatCurrency(campaign.budget)}</p>
          <p className="text-[11px] text-text-muted">budget</p>
        </div>
      </div>
    </button>
  );
}

export default function CampaignsPage() {
  const router = useRouter();
  const { campaigns, campaign: activeCampaign, setCampaignId } = useCampaign();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CampaignStatus | "all">("all");

  const filtered = useMemo(() => {
    return campaigns.filter((c) => {
      if (status !== "all" && c.status !== status) return false;
      if (search.trim() && !c.name.toLowerCase().includes(search.trim().toLowerCase())) return false;
      return true;
    });
  }, [campaigns, search, status]);

  function handleSelect(c: Campaign) {
    setCampaignId(c.id);
    router.push("/customer");
  }

  return (
    <div className="mx-auto max-w-5xl animate-fade-in">
      <PageHeader
        title="All Campaigns"
        description={`${campaigns.length} campaign${campaigns.length === 1 ? "" : "s"} across your account — select one to make it active.`}
        info="Alle deine Kampagnen auf einen Blick, mit Status und Budget-Fortschritt. Klick auf eine Kampagne, um sie zur aktiven zu machen — die Dashboards und Action-Center-Seiten beziehen sich dann auf diese."
        action={
          <Button onClick={() => router.push("/customer/campaigns/new")}>
            <Plus className="size-4" /> New campaign
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
          <Input
            placeholder="Search campaigns…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9 text-[13px]"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setStatus(f.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                status === f.id ? "border-accent bg-accent-soft text-accent-strong" : "border-border-strong text-text-secondary hover:bg-surface-hover"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[var(--radius-xl)] border border-dashed border-border-strong px-6 py-16 text-center">
          <Search className="size-8 text-text-muted" />
          <p className="text-[15px] font-semibold text-text-primary">No campaigns match</p>
          <p className="max-w-[280px] text-[13px] text-text-muted">Try a different search term or status filter.</p>
          <Button
            variant="secondary"
            onClick={() => {
              setSearch("");
              setStatus("all");
            }}
          >
            <X className="size-4" /> Clear filters
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((c) => (
            <CampaignRow key={c.id} campaign={c} active={c.id === activeCampaign.id} onSelect={() => handleSelect(c)} />
          ))}
        </div>
      )}
    </div>
  );
}
