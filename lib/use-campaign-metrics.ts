import { useMemo } from "react";
import { buildSeries, createRng, hashSeed, INFLUENCERS } from "./mock-data";
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
  budget: {
    spent: KpiSnapshot;
    remaining: KpiSnapshot;
    utilization: KpiSnapshot;
    costPerConversion: KpiSnapshot;
    timelineElapsedPct: number;
    paceDeltaPct: number;
    paceStatus: "ahead" | "on_pace" | "behind";
    dailySpend: { date: string; actual: number; planned: number }[];
    byPlatform: { label: string; value: number; color: string }[];
    byInfluencer: { label: string; value: number; color?: string }[];
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

  // Budget pacing: compare % of budget spent against % of the campaign
  // timeline elapsed. A campaign that hasn't started yet reads as 0%
  // elapsed; one that's ended reads as 100%, regardless of "days" window.
  const timelineStartMs = new Date(campaign.startDate).getTime();
  const timelineEndMs = new Date(campaign.endDate).getTime();
  const totalDurationDays = Math.max(1, Math.round((timelineEndMs - timelineStartMs) / 86_400_000));
  const timelineElapsedPct = Math.round(
    Math.max(0, Math.min(100, ((Date.now() - timelineStartMs) / (timelineEndMs - timelineStartMs)) * 100))
  );

  const paceNoise = Number(rng.range(-9, 9).toFixed(1));
  const spentPct = Math.max(
    0,
    Math.min(100, Math.round(timelineElapsedPct + (timelineElapsedPct > 0 ? paceNoise : Math.abs(paceNoise) * 0.3)))
  );
  const spent = Math.round(campaign.budget * (spentPct / 100));
  const remaining = campaign.budget - spent;
  const paceDeltaPct = Number((spentPct - timelineElapsedPct).toFixed(1));
  const paceStatus: "ahead" | "on_pace" | "behind" = paceDeltaPct > 6 ? "ahead" : paceDeltaPct < -6 ? "behind" : "on_pace";

  const idealDailyRate = campaign.budget / totalDurationDays;
  const spendTrend = idealDailyRate * (paceDeltaPct / 100) * 0.6;
  const spendSeriesRaw = buildSeries(`${id}-spend-${days}`, days, idealDailyRate, idealDailyRate * 0.32, spendTrend);
  const dailySpend = spendSeriesRaw.map((p) => ({
    date: p.date,
    actual: p.value,
    planned: Math.round(idealDailyRate),
  }));

  const byPlatformSpend = platformSplit.map((p) => ({
    label: p.label,
    value: Math.round(spent * (p.value / (reach || 1))),
    color: p.color,
  }));

  // Deterministic slice of the influencer roster so the same campaign
  // always lists the same "top spenders", without needing a real spend ledger.
  const spendStart = hashSeed(`${id}-spend-roster`) % 10;
  const spendInfluencers = INFLUENCERS.slice(spendStart, spendStart + Math.min(6, campaign.influencerCount || 6));
  const spendWeights = spendInfluencers.map((_, i) => Math.pow(0.78, i) * (0.85 + rng.next() * 0.3));
  const spendWeightSum = spendWeights.reduce((s, w) => s + w, 0) || 1;
  const byInfluencer = spendInfluencers.map((inf, i) => ({
    label: inf.name,
    value: Math.round(spent * (spendWeights[i] / spendWeightSum) * 0.55),
    color: platformColors[inf.platform],
  }));

  const costPerConversion = conversions > 0 ? Number((spent / conversions).toFixed(2)) : 0;

  return {
    awareness: {
      reach: {
        label: "Total reach",
        value: reach,
        delta: deltaFor(`${id}-reach-d`),
        goodDirection: "up",
        series: reachSeries,
        info: "Wie viele unterschiedliche Personen die Kampagne mindestens einmal gesehen haben.",
      },
      impressions: {
        label: "Impressions",
        value: impressions,
        delta: deltaFor(`${id}-impr-d`),
        goodDirection: "up",
        series: impressionsSeries,
        info: "Wie oft der Content insgesamt angezeigt wurde — eine Person kann mehrfach mitzählen.",
      },
      shareOfVoice: {
        label: "Share of voice",
        value: Number((8 + rng.next() * 14).toFixed(1)),
        unit: "percent",
        delta: deltaFor(`${id}-sov-d`, 10),
        goodDirection: "up",
        info: "Wie viel Prozent der Gespräche zu diesem Thema in deiner Branche auf deine Kampagne entfallen, im Vergleich zu Wettbewerbern.",
      },
      frequency: {
        label: "Avg. frequency",
        value: Number((1.6 + rng.next() * 1.8).toFixed(1)),
        delta: deltaFor(`${id}-freq-d`, 8),
        goodDirection: "down",
        info: "Wie oft im Schnitt jede einzelne Person den Content gesehen hat.",
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
        info: "Wie viel Prozent der Personen, die den Content gesehen haben, auch reagiert haben (Like, Kommentar, Save).",
      },
      likes: {
        label: "Likes",
        value: Math.round(engagements * 0.72),
        delta: deltaFor(`${id}-likes-d`),
        goodDirection: "up",
        info: "Anzahl der Likes über alle Creator-Posts dieser Kampagne zusammen.",
      },
      comments: {
        label: "Comments",
        value: Math.round(engagements * 0.16),
        delta: deltaFor(`${id}-comm-d`),
        goodDirection: "up",
        info: "Anzahl der Kommentare unter den Kampagnen-Posts.",
      },
      saves: {
        label: "Saves",
        value: Math.round(engagements * 0.12),
        delta: deltaFor(`${id}-saves-d`),
        goodDirection: "up",
        info: "Wie oft Nutzer:innen den Content gespeichert haben — ein starkes Signal für echtes Interesse, nicht nur Zufalls-Klicks.",
      },
      series: engagementSeriesCombined,
      byPlatform: platformSplit.map((p) => ({ ...p, value: Math.round(p.value * 0.08) })),
      topCreators: Array.from({ length: 5 }).map((_, i) => ({
        label: `Creator #${i + 1}`,
        value: Number((9 - i * 1.1 + rng.next() * 1.5).toFixed(1)),
      })),
    },
    traffic: {
      clicks: {
        label: "Link clicks",
        value: clicks,
        delta: deltaFor(`${id}-clicks-d`),
        goodDirection: "up",
        series: clicksSeries,
        info: "Wie oft auf den Link im Post oder in der Bio geklickt wurde.",
      },
      sessions: {
        label: "Website sessions",
        value: sessions,
        delta: deltaFor(`${id}-sess-d`),
        goodDirection: "up",
        series: sessionsSeries,
        info: "Wie viele echte Website-Besuche daraus wurden — meist etwas weniger als die Klicks.",
      },
      ctr: {
        label: "Click-through rate",
        value: ctrValue,
        unit: "percent",
        delta: deltaFor(`${id}-ctr-d`, 10),
        goodDirection: "up",
        info: "Wie viel Prozent aller Leute, die den Content gesehen haben, auch auf den Link geklickt haben.",
      },
      bounceRate: {
        label: "Bounce rate",
        value: Number((38 + rng.next() * 18).toFixed(1)),
        unit: "percent",
        delta: deltaFor(`${id}-bounce-d`, 8),
        goodDirection: "down",
        info: "Wie viele Besucher die Seite gleich wieder verlassen haben, ohne sich umzuschauen. Niedriger ist besser.",
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
      conversions: {
        label: "Conversions",
        value: conversions,
        delta: deltaFor(`${id}-conv-d`, 16),
        goodDirection: "up",
        info: "Wie viele Website-Besucher am Ende tatsächlich gekauft (oder die gewünschte Aktion ausgeführt) haben.",
      },
      conversionRate: {
        label: "Conversion rate",
        value: conversionRateValue,
        unit: "percent",
        delta: deltaFor(`${id}-cr-d`, 10),
        goodDirection: "up",
        info: "Wie viel Prozent der Website-Besucher zu einer Conversion (z. B. einem Kauf) geführt haben.",
      },
      revenue: {
        label: "Attributed revenue",
        value: revenue,
        unit: "currency",
        delta: deltaFor(`${id}-rev-d`, 20),
        goodDirection: "up",
        info: "Der Umsatz, der dieser Kampagne zugerechnet wird.",
      },
      roas: {
        label: "ROAS",
        value: roas,
        delta: deltaFor(`${id}-roas-d`, 14),
        goodDirection: "up",
        info: "Return on Ad Spend: wie viel Umsatz pro ausgegebenem Euro reinkam. 3x heißt: 3€ Umsatz pro 1€ Ausgabe.",
      },
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
      views: {
        label: "Views",
        value: views,
        delta: deltaFor(`${id}-views-d`),
        goodDirection: "up",
        series: viewsSeries,
        info: "Views, live von den Plattformen abgerufen — kann noch steigen, bis alle Quellen synchronisiert sind.",
      },
      engagements: {
        label: "Engagements",
        value: engagements,
        delta: deltaFor(`${id}-mon-eng-d`),
        goodDirection: "up",
        series: engagementSeries,
        info: "Alle Interaktionen (Likes, Kommentare, Saves) zusammen, live erfasst.",
      },
      clicks: {
        label: "Clicks",
        value: clicks,
        delta: deltaFor(`${id}-mon-clicks-d`),
        goodDirection: "up",
        series: clicksSeries,
        info: "Wie oft live auf den Kampagnen-Link geklickt wurde.",
      },
      conversions: {
        label: "Conversions",
        value: conversions,
        delta: deltaFor(`${id}-mon-conv-d`, 16),
        goodDirection: "up",
        info: "Wie viele Käufe/Zielaktionen bisher live erfasst wurden — vorläufig, bis alle Plattformen synchronisiert sind.",
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
    budget: {
      spent: {
        label: "Spent to date",
        value: spent,
        unit: "currency",
        delta: deltaFor(`${id}-budget-spent-d`, 12),
        goodDirection: "down",
        info: "Wie viel vom Kampagnenbudget bereits ausgegeben wurde.",
      },
      remaining: {
        label: "Remaining budget",
        value: remaining,
        unit: "currency",
        delta: deltaFor(`${id}-budget-remaining-d`, 10),
        goodDirection: "up",
        info: "Wie viel vom Budget noch übrig ist.",
      },
      utilization: {
        label: "Budget utilization",
        value: spentPct,
        unit: "percent",
        delta: deltaFor(`${id}-budget-util-d`, 8),
        goodDirection: "down",
        info: "Wie viel Prozent des Gesamtbudgets bereits verbraucht sind.",
      },
      costPerConversion: {
        label: "Cost per conversion",
        value: costPerConversion,
        unit: "currency",
        delta: deltaFor(`${id}-cpc-d`, 10),
        goodDirection: "down",
        info: "Wie viel eine einzelne Conversion (z. B. ein Kauf) im Schnitt gekostet hat — Ausgaben geteilt durch Conversions.",
      },
      timelineElapsedPct,
      paceDeltaPct,
      paceStatus,
      dailySpend,
      byPlatform: byPlatformSpend,
      byInfluencer,
    },
  };
}

export function useCampaignMetrics(campaign: Campaign, days: DateRangeDays = 30): CampaignMetrics {
  return useMemo(() => buildCampaignMetrics(campaign, days), [campaign, days]);
}
