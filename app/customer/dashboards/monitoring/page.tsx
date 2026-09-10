"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Clock, RefreshCw } from "lucide-react";
import { useCampaign } from "@/lib/campaign-context";
import { useCampaignMetrics, type DateRangeDays } from "@/lib/use-campaign-metrics";
import { useSimulatedLoading } from "@/lib/use-simulated-loading";
import { PageHeader } from "@/components/dashboard/page-header";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { StatTile } from "@/components/charts/stat-tile";
import { ChartCard } from "@/components/charts/chart-card";
import { TrendChart } from "@/components/charts/trend-chart";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn, formatRelativeTime } from "@/lib/utils";

const REFRESH_MS = 12000;

const sourceIcon = {
  synced: { icon: CheckCircle2, tone: "text-status-good" },
  pending: { icon: Clock, tone: "text-status-warning" },
  delayed: { icon: AlertCircle, tone: "text-status-serious" },
} as const;

export default function MonitoringDashboard() {
  const { campaign } = useCampaign();
  const [days, setDays] = useState<DateRangeDays>(30);
  const metrics = useCampaignMetrics(campaign, days);
  const loading = useSimulatedLoading([campaign.id, days]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [tick, setTick] = useState(0);
  const [live, setLive] = useState(true);

  useEffect(() => {
    // Client-only initial timestamp — Date.now() at render time would
    // differ between server and client and break hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLastUpdated(new Date());
  }, [campaign.id]);

  useEffect(() => {
    if (!live) return;
    const interval = setInterval(() => {
      setTick((t) => t + 1);
      setLastUpdated(new Date());
    }, REFRESH_MS);
    return () => clearInterval(interval);
  }, [live, campaign.id]);

  // Small deterministic-looking jitter layered on top of the base numbers to
  // simulate a live feed, without mutating the underlying mock dataset.
  const jitter = useMemo(() => {
    const factor = 1 + ((tick * 37) % 13) / 4000;
    return factor;
  }, [tick]);

  const live_views = Math.round(metrics.monitoring.views.value * jitter);
  const live_engagements = Math.round(metrics.monitoring.engagements.value * jitter);
  const live_clicks = Math.round(metrics.monitoring.clicks.value * jitter);

  const completeness = metrics.monitoring.dataCompleteness;
  const missingEstimate = 100 - completeness;

  return (
    <div className="mx-auto max-w-7xl animate-fade-in">
      <PageHeader
        eyebrow="Customer Dashboards"
        title="Monitoring Dashboard"
        description="Auto-refreshing KPIs pulled directly from connected platforms, with a live estimate of how much reporting data is still missing."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <DateRangeFilter value={days} onChange={setDays} />
            <div className="flex items-center gap-1.5 text-[12.5px] text-text-muted">
              <span
                className={cn(
                  "size-2 rounded-full",
                  live ? "bg-status-good animate-pulse-dot" : "bg-border-strong"
                )}
              />
              {lastUpdated ? `Updated ${formatRelativeTime(lastUpdated)}` : "Loading…"}
            </div>
            <button
              onClick={() => setLive((l) => !l)}
              className="flex h-9 items-center gap-1.5 rounded-[var(--radius-sm)] border border-border-strong px-3 text-[13px] font-medium text-text-primary hover:bg-surface-hover"
            >
              <RefreshCw className={cn("size-3.5", live && "animate-spin [animation-duration:2s]")} />
              {live ? "Live" : "Paused"}
            </button>
          </div>
        }
      />

      {loading ? (
        <DashboardSkeleton chartCards={1} />
      ) : (

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatTile label="Views" value={live_views} delta={metrics.monitoring.views.delta} series={metrics.monitoring.views.series} />
            <StatTile
              label="Engagements"
              value={live_engagements}
              delta={metrics.monitoring.engagements.delta}
              series={metrics.monitoring.engagements.series}
            />
            <StatTile label="Clicks" value={live_clicks} delta={metrics.monitoring.clicks.delta} series={metrics.monitoring.clicks.series} />
            <StatTile
              label="Conversions"
              value={metrics.monitoring.conversions.value}
              delta={metrics.monitoring.conversions.delta}
            />
          </div>

          <ChartCard title="Views over time" description={`Auto-pulled hourly, last ${days} days`}>
            <TrendChart data={metrics.monitoring.viewsSeries} series={[{ key: "value", label: "Views", color: "var(--series-1)" }]} />
          </ChartCard>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-[var(--radius-lg)] border border-border-hairline bg-surface-1 p-5 shadow-[var(--shadow-sm)]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-primary">Data completeness</h3>
              <span className="text-[13px] font-semibold tabular-nums text-text-primary">{completeness}%</span>
            </div>
            <Progress value={completeness} className="mt-3" />
            <p className="mt-2.5 text-[12.5px] leading-relaxed text-text-muted">
              An estimated <span className="font-semibold text-text-primary">{missingEstimate}%</span> of today&apos;s
              activity hasn&apos;t synced yet — figures may still increase before the reporting date.
            </p>

            <div className="mt-4 flex flex-col gap-2.5">
              {metrics.monitoring.missingSources.map((s) => {
                const { icon: Icon, tone } = sourceIcon[s.status];
                return (
                  <div key={s.name} className="flex items-center gap-2.5">
                    <Icon className={cn("size-4 shrink-0", tone)} />
                    <span className="flex-1 text-[12.5px] text-text-secondary">{s.name}</span>
                    <Badge tone={s.status === "synced" ? "good" : s.status === "pending" ? "warning" : "serious"}>
                      {s.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-border-hairline bg-accent-soft p-5">
            <h3 className="text-sm font-semibold text-accent-strong">About this dashboard</h3>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-text-secondary">
              Monitoring pulls whatever KPIs each platform currently exposes. Numbers here are directional and will
              be superseded by the locked <strong>Final Dashboard</strong> snapshot on {" "}
              <span className="font-medium text-text-primary">reporting day</span>.
            </p>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
