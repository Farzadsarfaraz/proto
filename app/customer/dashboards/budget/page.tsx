"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, TrendingDown } from "lucide-react";
import { useCampaign } from "@/lib/campaign-context";
import { useCampaignMetrics, type DateRangeDays } from "@/lib/use-campaign-metrics";
import { useSimulatedLoading } from "@/lib/use-simulated-loading";
import { PageHeader } from "@/components/dashboard/page-header";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { StatTile } from "@/components/charts/stat-tile";
import { ChartCard } from "@/components/charts/chart-card";
import { TrendChart } from "@/components/charts/trend-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { CategoryBarChart } from "@/components/charts/bar-chart";
import { formatCurrency } from "@/lib/utils";

const paceMeta = {
  ahead: {
    icon: AlertTriangle,
    tone: "border-status-warning/30 bg-status-warning/10",
    text: "spending faster than the campaign timeline is moving — budget may run out before the reporting date.",
  },
  behind: {
    icon: TrendingDown,
    tone: "border-accent-soft-border bg-accent-soft",
    text: "spending slower than the timeline — there's room to accelerate creator activations.",
  },
  on_pace: {
    icon: CheckCircle2,
    tone: "border-status-good/25 bg-status-good/10",
    text: "on pace — spend is tracking closely with the campaign timeline.",
  },
} as const;

export default function BudgetDashboard() {
  const { campaign } = useCampaign();
  const [days, setDays] = useState<DateRangeDays>(30);
  const metrics = useCampaignMetrics(campaign, days);
  const loading = useSimulatedLoading([campaign.id, days]);
  const b = metrics.budget;
  const meta = paceMeta[b.paceStatus];
  const Icon = meta.icon;

  return (
    <div className="mx-auto max-w-7xl animate-fade-in">
      <PageHeader
        eyebrow="Customer Dashboards"
        title="Budget Dashboard"
        description="Spend pacing, allocation by platform and creator, and where budget is actually going."
        action={<DateRangeFilter value={days} onChange={setDays} />}
      />

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatTile {...b.spent} />
            <StatTile {...b.remaining} />
            <StatTile {...b.utilization} />
            <StatTile {...b.costPerConversion} />
          </div>

          <div className={`mt-6 flex items-start gap-3 rounded-[var(--radius-lg)] border ${meta.tone} px-4 py-3.5`}>
            <Icon className="mt-0.5 size-4 shrink-0 text-text-primary" />
            <p className="text-[13px] leading-relaxed text-text-primary">
              <strong>{b.utilization.value}%</strong> of budget spent vs. <strong>{b.timelineElapsedPct}%</strong> of the
              campaign timeline elapsed — {meta.text}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <ChartCard
              title="Daily spend vs. planned pace"
              description={`Actual daily spend against an even planned rate, last ${days} days`}
              className="lg:col-span-2"
              legend={
                <>
                  <span className="inline-flex items-center gap-1.5 text-[12px] text-text-secondary">
                    <span className="inline-block size-2.5 rounded-full" style={{ background: "var(--series-1)" }} /> Actual
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[12px] text-text-secondary">
                    <span className="inline-block size-2.5 rounded-full" style={{ background: "var(--series-4)" }} /> Planned
                  </span>
                </>
              }
            >
              <TrendChart
                data={b.dailySpend}
                valueFormatter={formatCurrency}
                series={[
                  { key: "actual", label: "Actual spend", color: "var(--series-1)" },
                  { key: "planned", label: "Planned pace", color: "var(--series-4)" },
                ]}
              />
            </ChartCard>
            <ChartCard title="Spend by platform">
              <DonutChart data={b.byPlatform} centerValue={formatCurrency(b.spent.value)} centerLabel="total spent" />
            </ChartCard>
          </div>

          <div className="mt-6">
            <ChartCard title="Top spend by creator" description="Estimated spend allocation across the current roster">
              <CategoryBarChart data={b.byInfluencer} valueFormatter={formatCurrency} height={Math.max(200, b.byInfluencer.length * 40)} />
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
