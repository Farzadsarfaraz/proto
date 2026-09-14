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
import { formatPercent } from "@/lib/utils";

export default function EngagementDashboard() {
  const { campaign } = useCampaign();
  const [days, setDays] = useState<DateRangeDays>(30);
  const metrics = useCampaignMetrics(campaign, days);
  const loading = useSimulatedLoading([campaign.id, days]);
  const e = metrics.engagement;

  return (
    <div className="mx-auto max-w-7xl animate-fade-in">
      <PageHeader
        eyebrow="Customer Dashboards"
        title="Engagement Dashboard"
        description="How the audience interacted with the content — likes, comments, saves and engagement rate."
        info="Wie die Zielgruppe auf den Content reagiert hat — Likes, Kommentare, Saves und die Engagement-Rate. Zeigt, ob der Content nicht nur gesehen, sondern auch als relevant empfunden wurde."
        action={<DateRangeFilter value={days} onChange={setDays} />}
      />

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatTile {...e.engagementRate} />
            <StatTile {...e.likes} />
            <StatTile {...e.comments} />
            <StatTile {...e.saves} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <ChartCard title="Engagement rate over time" description={`Engagements / views, last ${days} days`} className="lg:col-span-2">
              <TrendChart
                data={e.series}
                series={[{ key: "rate", label: "Engagement rate", color: "var(--series-3)" }]}
                valueFormatter={(v) => formatPercent(v)}
              />
            </ChartCard>
            <ChartCard title="Engagements by platform">
              <DonutChart data={e.byPlatform} />
            </ChartCard>
          </div>

          <div className="mt-6">
            <ChartCard title="Top creators by engagement rate">
              <CategoryBarChart data={e.topCreators} color="var(--series-3)" valueFormatter={(v) => formatPercent(v)} />
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
