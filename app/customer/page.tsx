"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ClipboardCheck,
  Eye,
  Flame,
  Heart,
  Lightbulb,
  MousePointerClick,
  Sparkles,
  Target,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useCampaign } from "@/lib/campaign-context";
import { useCampaignMetrics } from "@/lib/use-campaign-metrics";
import { ACTION_COMPONENTS, CONTENT_REVIEW_ITEMS } from "@/lib/mock-data";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatTile } from "@/components/charts/stat-tile";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatRelativeTime } from "@/lib/utils";

const dashboardLinks = [
  { href: "/customer/dashboards/monitoring", label: "Monitoring", icon: Activity, desc: "Live KPI tracking" },
  { href: "/customer/dashboards/awareness", label: "Awareness", icon: Eye, desc: "Reach & impressions" },
  { href: "/customer/dashboards/engagement", label: "Engagement", icon: Heart, desc: "Likes, comments, saves" },
  { href: "/customer/dashboards/traffic", label: "Traffic", icon: MousePointerClick, desc: "Clicks & sessions" },
  { href: "/customer/dashboards/conversion", label: "Conversion", icon: Target, desc: "Revenue & ROAS" },
  { href: "/customer/dashboards/final", label: "Final Report", icon: ClipboardCheck, desc: "Locked snapshot" },
];

export default function CustomerOverview() {
  const { session } = useAuth();
  const { campaign } = useCampaign();
  const metrics = useCampaignMetrics(campaign);
  const pending = CONTENT_REVIEW_ITEMS.filter((c) => c.status === "pending").slice(0, 3);
  const firstName = session?.name.split(" ")[0] ?? "there";

  return (
    <div className="mx-auto max-w-7xl animate-fade-in">
      <PageHeader
        eyebrow={campaign.name}
        title={`Welcome back, ${firstName}`}
        description={`Here's how ${campaign.name} is performing across ${campaign.platforms.join(" and ")}, reporting on ${formatDate(campaign.reportingDate)}.`}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile {...metrics.monitoring.views} />
        <StatTile {...metrics.engagement.engagementRate} />
        <StatTile {...metrics.traffic.clicks} />
        <StatTile {...metrics.conversion.revenue} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-[15px] font-semibold text-text-primary">Customer Dashboards</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {dashboardLinks.map((d) => (
              <Link
                key={d.href}
                href={d.href}
                className="group flex items-center gap-3.5 rounded-[var(--radius-lg)] border border-border-hairline bg-surface-1 p-4 shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-accent-soft text-accent-strong">
                  <d.icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-semibold text-text-primary">{d.label}</p>
                  <p className="text-[12px] text-text-muted">{d.desc}</p>
                </div>
                <ArrowRight className="size-4 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
              </Link>
            ))}
          </div>

          <h2 className="mb-3 mt-8 text-[15px] font-semibold text-text-primary">Action Center</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ACTION_COMPONENTS.map((a) => (
              <Card key={a.id} className={!a.enabled ? "opacity-60" : undefined}>
                <CardContent className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-accent-soft text-accent-strong">
                    <Sparkles className="size-[18px]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-[13.5px] font-semibold text-text-primary">{a.name}</p>
                      <Badge tone={a.enabled ? "good" : "neutral"}>{a.enabled ? "Enabled" : "Disabled"}</Badge>
                    </div>
                    <p className="mt-0.5 text-[12px] text-text-muted">{a.stat}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardContent>
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-[var(--radius-sm)] bg-[color-mix(in_srgb,var(--series-2)_15%,transparent)] text-[var(--series-2)]">
                  <Flame className="size-[18px]" />
                </div>
                <div>
                  <p className="text-[13.5px] font-semibold text-text-primary">Influencer-Tinder</p>
                  <p className="text-[12px] text-text-muted">12 fresh AI matches waiting</p>
                </div>
              </div>
              <Link
                href="/customer/influencer-tinder"
                className="mt-4 flex h-9 items-center justify-center gap-1.5 rounded-[var(--radius-sm)] bg-accent text-[13px] font-medium text-white transition-colors hover:bg-accent-strong"
              >
                Start swiping <ArrowRight className="size-3.5" />
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-[var(--radius-sm)] bg-[color-mix(in_srgb,var(--series-4)_18%,transparent)] text-[#8a5a00]">
                  <Lightbulb className="size-[18px]" />
                </div>
                <div>
                  <p className="text-[13.5px] font-semibold text-text-primary">Recommendations</p>
                  <p className="text-[12px] text-text-muted">4 new AI campaign ideas</p>
                </div>
              </div>
              <Link
                href="/customer/recommendations"
                className="mt-4 flex h-9 items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border border-border-strong text-[13px] font-medium text-text-primary transition-colors hover:bg-surface-hover"
              >
                View ideas <ArrowRight className="size-3.5" />
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-[13.5px] font-semibold text-text-primary">Pending content review</p>
              <div className="mt-3 flex flex-col gap-3">
                {pending.map((c) => (
                  <div key={c.id} className="flex items-center gap-3">
                    <div
                      className="size-9 shrink-0 rounded-[8px]"
                      style={{ background: `hsl(${c.thumbnailHue} 55% 88%)` }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-medium text-text-primary">{c.influencer}</p>
                      <p className="text-[11px] text-text-muted">{formatRelativeTime(new Date(c.submittedAt))}</p>
                    </div>
                    <Badge tone="warning">Pending</Badge>
                  </div>
                ))}
              </div>
              <Link
                href="/customer/action-center#content"
                className="mt-4 flex items-center justify-center gap-1.5 text-[12.5px] font-medium text-accent hover:underline"
              >
                Review all content <ArrowRight className="size-3.5" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
