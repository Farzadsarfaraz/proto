"use client";

import { useState } from "react";
import { useCampaign } from "@/lib/campaign-context";
import { useCampaignMetrics, type DateRangeDays } from "@/lib/use-campaign-metrics";
import { useSimulatedLoading } from "@/lib/use-simulated-loading";
import { PageHeader } from "@/components/dashboard/page-header";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { StatTile } from "@/components/charts/stat-tile";
import { ChartCard, LegendSwatch } from "@/components/charts/chart-card";
import { TrendChart } from "@/components/charts/trend-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { CategoryBarChart } from "@/components/charts/bar-chart";

export default function TrafficDashboard() {
  const { campaign } = useCampaign();
  const [days, setDays] = useState<DateRangeDays>(30);
  const metrics = useCampaignMetrics(campaign, days);
  const loading = useSimulatedLoading([campaign.id, days]);
  const t = metrics.traffic;

  return (
    <div className="mx-auto max-w-7xl animate-fade-in">
      <PageHeader
        eyebrow="Customer Dashboards"
        title="Traffic Dashboard"
        description="How campaign content moved people to your site — clicks, sessions and click-through rate."
        action={<DateRangeFilter value={days} onChange={setDays} />}
      />

      {loading ? (
        <DashboardSkeleton chartCards={1} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatTile {...t.clicks} />
            <StatTile {...t.sessions} />
            <StatTile {...t.ctr} />
            <StatTile {...t.bounceRate} />
          </div>

          <div className="mt-6">
            <ChartCard
              title="Clicks vs. sessions"
              description={`Last ${days} days`}
              legend={
                <>
                  <LegendSwatch color="var(--series-1)" label="Link clicks" />
                  <LegendSwatch color="var(--series-2)" label="Website sessions" />
                </>
              }
            >
              <TrendChart
                data={t.series}
                series={[
                  { key: "clicks", label: "Link clicks", color: "var(--series-1)" },
                  { key: "sessions", label: "Website sessions", color: "var(--series-2)" },
                ]}
              />
            </ChartCard>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard title="Top landing pages">
              <CategoryBarChart data={t.landingPages} color="var(--series-1)" />
            </ChartCard>
            <ChartCard title="Referral source">
              <DonutChart data={t.referral} />
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
