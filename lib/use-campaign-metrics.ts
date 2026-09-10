import { useMemo } from "react";
import { buildSeries, createRng, hashSeed } from "./mock-data";
import type { Campaign, KpiSnapshot } from "./types";

function seriesTotal(series: { value: number }[]) {
  return series.reduce((sum, p) => sum + p.value, 0);
}

function deltaFor(seedKey: string, magnitude = 18): number {
  const rng = createRng(hashSeed(seedKey));
  return Number((rng.range(-magnitude * 0.3, magnitude)).toFixed(1));
}

export interface CampaignMetrics {
  awareness: {
    reach: KpiSnapshot;
    impressions: KpiSnapshot;
    shareOfVoice: KpiSnapshot;
    frequency: KpiSnapshot;
    platformSplit: { label: string; value: number; color: string }[];
    sentiment: { label: string; value: number; color: string }[];
    topPosts: { label: string; value: number }[];
  };
  engagement: {
    engagementRate: KpiSnapshot;
    likes: KpiSnapshot;
    comments: KpiSnapshot;
    saves: KpiSnapshot;
    series: { date: string; engagements: number; rate: number }[];
    byPlatform: { label: string; value: number; color: string }[];
    topCreators: { label: string; value: number }[];
  };
  traffic: {
    clicks: KpiSnapshot;
    sessions: KpiSnapshot;
    ctr: KpiSnapshot;
    bounceRate: KpiSnapshot;
    series: { date: string; clicks: number; sessions: number }[];
    referral: { label: string; value: number; color: string }[];
    landingPages: { label: string; value: number }[];
  };
  conversion: {
    conversions: KpiSnapshot;
    conversionRate: KpiSnapshot;
    revenue: KpiSnapshot;
    roas: KpiSnapshot;
    funnel: { label: string; value: number }[];
    byPlatform: { label: string; value: number; color: string }[];
  };
  monitoring: {
    views: KpiSnapshot;
    engagements: KpiSnapshot;
    clicks: KpiSnapshot;
    conversions: KpiSnapshot;
    viewsSeries: { date: string; value: number }[];
    dataCompleteness: number;
    missingSources: { name: string; status: "synced" | "pending" | "delayed" }[];
  };
}

export const DATE_RANGE_OPTIONS = [7, 30, 90] as const;
export type DateRangeDays = (typeof DATE_RANGE_OPTIONS)[number];

export function buildCampaignMetrics(campaign: Campaign, days: DateRangeDays = 30): CampaignMetrics {
  const id = campaign.id;
  // Scale totals so a 7-day view isn't misread as a slice of the same 30-day
  // total — each range reflects that window's own volume, not a subset sum.
  const scale = (campaign.influencerCount / 10) * (days / 30);

  const reachSeries = buildSeries(`${id}-reach-${days}`, days, 40000 * scale, 6000 * scale, 1200 * scale);
  const impressionsSeries = buildSeries(`${id}-impr-${days}`, days, 90000 * scale, 12000 * scale, 2600 * scale);
  const engagementSeries = buildSeries(`${id}-eng-${days}`, days, 3200 * scale, 900 * scale, 90 * scale);
  const clicksSeries = buildSeries(`${id}-clicks-${days}`, days, 1400 * scale, 400 * scale, 55 * scale);
  const sessionsSeries = buildSeries(`${id}-sessions-${days}`, days, 1100 * scale, 320 * scale, 40 * scale);
  const viewsSeries = buildSeries(`${id}-views-${days}`, days, 52000 * scale, 8000 * scale, 1600 * scale);

  const reach = seriesTotal(reachSeries);
  const impressions = seriesTotal(impressionsSeries);
  const engagements = seriesTotal(engagementSeries);
  const clicks = seriesTotal(clicksSeries);
  const sessions = seriesTotal(sessionsSeries);
  const views = seriesTotal(viewsSeries);

  const rng = createRng(hashSeed(`${id}-static`));
  const engagementRateValue = Number((3.5 + rng.next() * 4).toFixed(1));
  const ctrValue = Number((0.9 + rng.next() * 1.8).toFixed(2));
  const conversionRateValue = Number((1.2 + rng.next() * 2.6).toFixed(2));
  const conversions = Math.round(clicks * (conversionRateValue / 100));
  const revenue = Math.round(conversions * (58 + rng.next() * 40));
  const roas = Number((revenue / campaign.budget).toFixed(2));

  const platformColors: Record<string, string> = {
    Instagram: "var(--series-1)",
    TikTok: "var(--series-2)",
    YouTube: "var(--series-3)",
    Pinterest: "var(--series-4)",
    X: "var(--series-7)",
  };

  const platformSplit = campaign.platforms.map((p, i) => ({
    label: p,
    value: Math.round(reach * (i === 0 ? 0.58 : 0.42 / (campaign.platforms.length - 1 || 1))),
    color: platformColors[p],
  }));

  const engagementSeriesCombined = viewsSeries.map((v, i) => ({
    date: v.date,
    engagements: engagementSeries[i]?.value ?? 0,
    rate: Number((((engagementSeries[i]?.value ?? 0) / (v.value || 1)) * 100).toFixed(2)),
  }));

  const trafficSeriesCombined = clicksSeries.map((c, i) => ({
    date: c.date,
    clicks: c.value,
    sessions: sessionsSeries[i]?.value ?? 0,
  }));

  const dataCompleteness = Math.round(62 + rng.next() * 30);

  return {
    awareness: {
      reach: { label: "Total reach", value: reach, delta: deltaFor(`${id}-reach-d`), goodDirection: "up", series: reachSeries },
      impressions: {
        label: "Impressions",
        value: impressions,
        delta: deltaFor(`${id}-impr-d`),
        goodDirection: "up",
        series: impressionsSeries,
      },
      shareOfVoice: {
        label: "Share of voice",
        value: Number((8 + rng.next() * 14).toFixed(1)),
        unit: "percent",
        delta: deltaFor(`${id}-sov-d`, 10),
        goodDirection: "up",
      },
      frequency: {
        label: "Avg. frequency",
        value: Number((1.6 + rng.next() * 1.8).toFixed(1)),
        delta: deltaFor(`${id}-freq-d`, 8),
        goodDirection: "down",
      },
      platformSplit,
      sentiment: [
        { label: "Positive", value: Math.round(60 + rng.next() * 20), color: "var(--status-good)" },
        { label: "Neutral", value: Math.round(20 + rng.next() * 10), color: "var(--text-muted)" },
        { label: "Negative", value: Math.round(4 + rng.next() * 6), color: "var(--status-critical)" },
      ],
      topPosts: Array.from({ length: 5 }).map((_, i) => ({
        label: `Creator post #${i + 1}`,
        value: Math.round(reach * (0.09 - i * 0.012)),
      })),
    },
    engagement: {
      engagementRate: {
        label: "Engagement rate",
        value: engagementRateValue,
        unit: "percent",
        delta: deltaFor(`${id}-er-d`, 12),
        goodDirection: "up",
      },
      likes: { label: "Likes", value: Math.round(engagements * 0.72), delta: deltaFor(`${id}-likes-d`), goodDirection: "up" },
      comments: {
        label: "Comments",
        value: Math.round(engagements * 0.16),
        delta: deltaFor(`${id}-comm-d`),
        goodDirection: "up",
      },
      saves: { label: "Saves", value: Math.round(engagements * 0.12), delta: deltaFor(`${id}-saves-d`), goodDirection: "up" },
      series: engagementSeriesCombined,
      byPlatform: platformSplit.map((p) => ({ ...p, value: Math.round(p.value * 0.08) })),
      topCreators: Array.from({ length: 5 }).map((_, i) => ({
        label: `Creator #${i + 1}`,
        value: Number((9 - i * 1.1 + rng.next() * 1.5).toFixed(1)),
      })),
    },
    traffic: {
      clicks: { label: "Link clicks", value: clicks, delta: deltaFor(`${id}-clicks-d`), goodDirection: "up", series: clicksSeries },
      sessions: {
        label: "Website sessions",
        value: sessions,
        delta: deltaFor(`${id}-sess-d`),
        goodDirection: "up",
        series: sessionsSeries,
      },
      ctr: { label: "Click-through rate", value: ctrValue, unit: "percent", delta: deltaFor(`${id}-ctr-d`, 10), goodDirection: "up" },
      bounceRate: {
        label: "Bounce rate",
        value: Number((38 + rng.next() * 18).toFixed(1)),
        unit: "percent",
        delta: deltaFor(`${id}-bounce-d`, 8),
        goodDirection: "down",
      },
      series: trafficSeriesCombined,
      referral: platformSplit.map((p) => ({ ...p, value: Math.round(p.value * 0.03) })),
      landingPages: [
        { label: "/new-arrivals", value: Math.round(sessions * 0.34) },
        { label: "/product/serum", value: Math.round(sessions * 0.27) },
        { label: "/campaign-hub", value: Math.round(sessions * 0.19) },
        { label: "/bundles", value: Math.round(sessions * 0.12) },
        { label: "/about", value: Math.round(sessions * 0.08) },
      ],
    },
    conversion: {
      conversions: { label: "Conversions", value: conversions, delta: deltaFor(`${id}-conv-d`, 16), goodDirection: "up" },
      conversionRate: {
        label: "Conversion rate",
        value: conversionRateValue,
        unit: "percent",
        delta: deltaFor(`${id}-cr-d`, 10),
        goodDirection: "up",
      },
      revenue: { label: "Attributed revenue", value: revenue, unit: "currency", delta: deltaFor(`${id}-rev-d`, 20), goodDirection: "up" },
      roas: { label: "ROAS", value: roas, delta: deltaFor(`${id}-roas-d`, 14), goodDirection: "up" },
      funnel: (() => {
        // Each funnel stage must be a subset of the one before it, so derive
        // downstream stages as fractions of clicks rather than reusing the
        // independently-generated `sessions` total (which can exceed clicks).
        const funnelSessions = Math.round(clicks * 0.84);
        const addToCart = Math.round(funnelSessions * 0.31);
        return [
          { label: "Impressions", value: impressions },
          { label: "Clicks", value: clicks },
          { label: "Sessions", value: funnelSessions },
          { label: "Add to cart", value: addToCart },
          { label: "Conversions", value: conversions },
        ];
      })(),
      byPlatform: platformSplit.map((p) => ({ ...p, value: Math.round(conversions * (p.value / reach)) })),
    },
    monitoring: {
      views: { label: "Views", value: views, delta: deltaFor(`${id}-views-d`), goodDirection: "up", series: viewsSeries },
      engagements: {
        label: "Engagements",
        value: engagements,
        delta: deltaFor(`${id}-mon-eng-d`),
        goodDirection: "up",
        series: engagementSeries,
      },
      clicks: { label: "Clicks", value: clicks, delta: deltaFor(`${id}-mon-clicks-d`), goodDirection: "up", series: clicksSeries },
      conversions: {
        label: "Conversions",
        value: conversions,
        delta: deltaFor(`${id}-mon-conv-d`, 16),
        goodDirection: "up",
      },
      viewsSeries,
      dataCompleteness,
      missingSources: [
        { name: "Instagram Insights API", status: dataCompleteness > 85 ? "synced" : "pending" },
        { name: "TikTok Creator Marketplace", status: "synced" },
        { name: "YouTube Analytics", status: dataCompleteness > 92 ? "synced" : "delayed" },
        { name: "Shopify conversion pixel", status: dataCompleteness > 75 ? "synced" : "pending" },
      ],
    },
  };
}

export function useCampaignMetrics(campaign: Campaign, days: DateRangeDays = 30): CampaignMetrics {
  return useMemo(() => buildCampaignMetrics(campaign, days), [campaign, days]);
}
