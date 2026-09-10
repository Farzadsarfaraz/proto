"use client";

import { useState } from "react";
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

export default function AwarenessDashboard() {
  const { campaign } = useCampaign();
  const [days, setDays] = useState<DateRangeDays>(30);
  const metrics = useCampaignMetrics(campaign, days);
  const loading = useSimulatedLoading([campaign.id, days]);
  const a = metrics.awareness;

  return (
    <div className="mx-auto max-w-7xl animate-fade-in">
      <PageHeader
        eyebrow="Customer Dashboards"
        title="Awareness Dashboard"
        description="How many people saw the campaign, how often, and where — reach, impressions and share of voice."
        action={<DateRangeFilter value={days} onChange={setDays} />}
      />

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatTile {...a.reach} />
            <StatTile {...a.impressions} />
            <StatTile {...a.shareOfVoice} />
            <StatTile {...a.frequency} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <ChartCard title="Reach over time" description={`Last ${days} days`} className="lg:col-span-2">
              <TrendChart data={a.reach.series ?? []} series={[{ key: "value", label: "Reach", color: "var(--series-1)" }]} />
            </ChartCard>
            <ChartCard title="Reach by platform">
              <DonutChart data={a.platformSplit} />
            </ChartCard>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard title="Top performing posts" description="By estimated reach">
              <CategoryBarChart data={a.topPosts} color="var(--series-1)" />
            </ChartCard>
            <ChartCard title="Audience sentiment" description="Comment & caption tone analysis">
              <DonutChart data={a.sentiment} />
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
