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
import { FunnelChart } from "@/components/charts/funnel-chart";
import { DonutChart } from "@/components/charts/donut-chart";

export default function ConversionDashboard() {
  const { campaign } = useCampaign();
  const [days, setDays] = useState<DateRangeDays>(30);
  const metrics = useCampaignMetrics(campaign, days);
  const loading = useSimulatedLoading([campaign.id, days]);
  const c = metrics.conversion;

  return (
    <div className="mx-auto max-w-7xl animate-fade-in">
      <PageHeader
        eyebrow="Customer Dashboards"
        title="Conversion Dashboard"
        description="From impression to purchase — the full funnel, conversion rate and attributed revenue."
        info="Der letzte Schritt im Trichter: wie viele Website-Besucher tatsächlich gekauft haben, und wie viel Umsatz und Rendite (ROAS) die Kampagne gebracht hat."
        action={<DateRangeFilter value={days} onChange={setDays} />}
      />

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatTile {...c.conversions} />
            <StatTile {...c.conversionRate} />
            <StatTile {...c.revenue} />
            <StatTile {...c.roas} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <ChartCard title="Conversion funnel" description={`Impressions to purchase, last ${days} days`} className="lg:col-span-2">
              <FunnelChart stages={c.funnel} />
            </ChartCard>
            <ChartCard title="Conversions by platform">
              <DonutChart data={c.byPlatform} />
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
