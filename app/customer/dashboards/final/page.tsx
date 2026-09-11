"use client";

import { Download, Lock, Printer } from "lucide-react";
import { useCampaign } from "@/lib/campaign-context";
import { useCampaignMetrics } from "@/lib/use-campaign-metrics";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatTile } from "@/components/charts/stat-tile";
import { ChartCard } from "@/components/charts/chart-card";
import { DonutChart } from "@/components/charts/donut-chart";
import { Button } from "@/components/ui/button";
import { formatCompactNumber, formatCurrency, formatDate, formatPercent } from "@/lib/utils";

export default function FinalDashboard() {
  const { campaign } = useCampaign();
  const metrics = useCampaignMetrics(campaign);
  const isLocked = campaign.status === "completed" || campaign.status === "reporting";

  function handleExport() {
    const lines = [
      `Final Report — ${campaign.name}`,
      `Reporting date: ${formatDate(campaign.reportingDate)}`,
      "",
      `Reach: ${formatCompactNumber(metrics.awareness.reach.value)}`,
      `Impressions: ${formatCompactNumber(metrics.awareness.impressions.value)}`,
      `Engagement rate: ${formatPercent(metrics.engagement.engagementRate.value)}`,
      `Link clicks: ${formatCompactNumber(metrics.traffic.clicks.value)}`,
      `Conversions: ${formatCompactNumber(metrics.conversion.conversions.value)}`,
      `Attributed revenue: ${formatCurrency(metrics.conversion.revenue.value)}`,
      `ROAS: ${metrics.conversion.roas.value}x`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${campaign.name.replace(/\s+/g, "-").toLowerCase()}-final-report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-7xl animate-fade-in">
      <PageHeader
        eyebrow="Customer Dashboards"
        title="Final Dashboard"
        description="Data pulled and locked on the campaign's set reporting date — the figures of record for stakeholder sign-off."
        action={
          <div className="flex items-center gap-2 print:hidden">
            <Button variant="secondary" onClick={handleExport}>
              <Download className="size-4" /> Export data (.txt)
            </Button>
            <Button onClick={() => window.print()}>
              <Printer className="size-4" /> Print / Save as PDF
            </Button>
          </div>
        }
      />

      <div className="mb-6 hidden items-center justify-between border-b border-border-hairline pb-4 print:flex">
        <div>
          <p className="text-[15px] font-semibold text-text-primary">Octagone</p>
          <p className="text-[12px] text-text-muted">Final campaign report</p>
        </div>
        <p className="text-[12px] text-text-muted">Generated {formatDate(new Date())}</p>
      </div>

      <div
        className={
          isLocked
            ? "mb-6 flex items-center gap-3 rounded-[var(--radius-lg)] border border-status-good/25 bg-status-good/10 px-4 py-3"
            : "mb-6 flex items-center gap-3 rounded-[var(--radius-lg)] border border-status-warning/30 bg-status-warning/10 px-4 py-3"
        }
      >
        <Lock className="size-4 shrink-0 text-text-primary" />
        <p className="text-[13px] text-text-primary">
          {isLocked ? (
            <>
              Locked on <strong>{formatDate(campaign.reportingDate)}</strong> — this snapshot will not change.
            </>
          ) : (
            <>
              Scheduled to lock on <strong>{formatDate(campaign.reportingDate)}</strong> — figures below are a
              preview and may still move.
            </>
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile {...metrics.awareness.reach} />
        <StatTile {...metrics.engagement.engagementRate} />
        <StatTile {...metrics.traffic.clicks} />
        <StatTile {...metrics.conversion.revenue} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ChartCard title="Reach by platform" className="lg:col-span-1">
          <DonutChart
            data={metrics.awareness.platformSplit}
            centerValue={formatCompactNumber(metrics.awareness.reach.value)}
            centerLabel="total reach"
          />
        </ChartCard>

        <div className="rounded-[var(--radius-lg)] border border-border-hairline bg-surface-1 p-5 shadow-[var(--shadow-sm)] lg:col-span-2">
          <h3 className="text-sm font-semibold text-text-primary">Campaign summary</h3>
          <dl className="mt-4 grid grid-cols-2 gap-y-4 sm:grid-cols-3">
            {[
              ["Objective", campaign.objective],
              ["Platforms", campaign.platforms.join(", ")],
              ["Influencers", `${campaign.influencerCount} creators`],
              ["Budget", formatCurrency(campaign.budget)],
              ["Conversions", formatCompactNumber(metrics.conversion.conversions.value)],
              ["ROAS", `${metrics.conversion.roas.value}x`],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-[11.5px] uppercase tracking-wide text-text-muted">{label}</dt>
                <dd className="mt-0.5 text-[14px] font-medium text-text-primary">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 border-t border-border-hairline pt-4 text-[13px] leading-relaxed text-text-secondary">
            {campaign.name} delivered {formatCompactNumber(metrics.awareness.reach.value)} reach and{" "}
            {formatCompactNumber(metrics.conversion.conversions.value)} conversions at a {metrics.conversion.roas.value}x
            return, against a {formatCurrency(campaign.budget)} budget across {campaign.platforms.join(" and ")}.
          </p>
        </div>
      </div>
    </div>
  );
}
