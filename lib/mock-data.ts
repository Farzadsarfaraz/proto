import type {
  ActionComponent,
  AppNotification,
  AudienceDemographics,
  BriefingDoc,
  Campaign,
  ContentReviewItem,
  Influencer,
  Recommendation,
  ScheduledPost,
  ScheduledPostType,
  SeriesPoint,
  SimilarCampaign,
  TeamMember,
  TrendItem,
} from "./types";
import type { PortalRole } from "./portal";

// Deterministic pseudo-random so the dashboard looks the same on every load
// except where a feature (e.g. live refresh) intentionally mutates it.
// Module-level generation below uses a shared mutable seed (safe: it runs
// once, synchronously, in a fixed order, at module evaluation time on both
// server and client). Anything generated *during render* (e.g. per-campaign
// dashboard series) must use `createRng`/`buildSeries` with an explicit seed
// instead, so SSR and CSR output — and React's dev double-render — match.
let seed = 42;
function rand(): number {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
}
function randRange(min: number, max: number): number {
  return min + rand() * (max - min);
}
function randInt(min: number, max: number): number {
  return Math.floor(randRange(min, max + 1));
}
function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

export function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  return hash || 1;
}

/** Pure, self-contained RNG — same seed always produces the same sequence. */
export function createRng(initialSeed: number) {
  let s = initialSeed % 2147483648 || 1;
  return {
    next(): number {
      s = (s * 1103515245 + 12345) % 2147483648;
      return s / 2147483648;
    },
    range(min: number, max: number): number {
      return min + this.next() * (max - min);
    },
  };
}

export const CURRENT_CUSTOMER = {
  name: "Lena Brandt",
  role: "Marketing Manager",
  company: "Nordlicht Skincare",
  email: "lena.brandt@nordlicht-skincare.com",
  initials: "LB",
};

export const CURRENT_INFLUENCER = {
  name: "Mila Wagner",
  role: "Content Creator",
  company: "@mila.wagner",
  email: "mila.wagner@creator.octagone.io",
  initials: "MW",
};

export const CURRENT_INTERN = {
  name: "Jonas Vogel",
  role: "Campaign Operations",
  company: "Octagone",
  email: "jonas.vogel@octagone.io",
  initials: "JV",
};

export const PORTAL_PROFILES: Record<PortalRole, typeof CURRENT_CUSTOMER> = {
  customer: CURRENT_CUSTOMER,
  influencer: CURRENT_INFLUENCER,
  intern: CURRENT_INTERN,
};

export function buildSeries(
  seedInput: string | number,
  days: number,
  base: number,
  volatility: number,
  trend: number
): SeriesPoint[] {
  const rng = createRng(typeof seedInput === "string" ? hashSeed(seedInput) : seedInput);
  const points: SeriesPoint[] = [];
  let value = base;
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    value = Math.max(0, value + rng.range(-volatility, volatility) + trend);
    points.push({ date: d.toISOString().slice(0, 10), value: Math.round(value) });
  }
  return points;
}

export const CAMPAIGNS: Campaign[] = [
  {
    id: "cmp-aurora",
    name: "Aurora Glow Launch",
    status: "live",
    platforms: ["Instagram", "TikTok"],
    startDate: "2026-08-01",
    endDate: "2026-09-30",
    reportingDate: "2026-10-05",
    budget: 48000,
    influencerCount: 14,
    objective: "Awareness",
  },
  {
    id: "cmp-midnight",
    name: "Midnight Repair Serum",
    status: "live",
    platforms: ["Instagram", "YouTube"],
    startDate: "2026-07-15",
    endDate: "2026-09-20",
    reportingDate: "2026-09-25",
    budget: 62000,
    influencerCount: 9,
    objective: "Conversion",
  },
  {
    id: "cmp-summer",
    name: "Summer Hydration Edit",
    status: "reporting",
    platforms: ["TikTok", "Pinterest"],
    startDate: "2026-05-01",
    endDate: "2026-08-15",
    reportingDate: "2026-09-01",
    budget: 35000,
    influencerCount: 11,
    objective: "Traffic",
  },
  {
    id: "cmp-spring",
    name: "Spring Renewal Kit",
    status: "completed",
    platforms: ["Instagram", "X"],
    startDate: "2026-03-01",
    endDate: "2026-05-01",
    reportingDate: "2026-05-10",
    budget: 28000,
    influencerCount: 7,
    objective: "Engagement",
  },
];

export const NICHES = [
  "Skincare",
  "Clean Beauty",
  "Lifestyle",
  "Wellness",
  "Fashion",
  "Dermatology",
  "Haircare",
  "Sustainable Living",
];

const FIRST_NAMES = [
  "Mia",
  "Noah",
  "Emma",
  "Leon",
  "Sophia",
  "Finn",
  "Clara",
  "Elias",
  "Ida",
  "Anton",
  "Greta",
  "Jonas",
  "Frieda",
  "Paul",
  "Mila",
  "Theo",
];
const LAST_NAMES = [
  "Wagner",
  "Schulz",
  "Hoffmann",
  "Krüger",
  "Neumann",
  "Fischer",
  "Weiss",
  "Berg",
  "Vogel",
  "Lang",
  "Roth",
  "Keller",
];
const CITIES = ["Berlin", "Hamburg", "Munich", "Vienna", "Zurich", "Cologne", "Amsterdam", "Copenhagen"];
const PLATFORMS: Influencer["platform"][] = ["Instagram", "TikTok", "YouTube", "Pinterest"];

const PHOTO_CAPTIONS = [
  "Morning routine, day 7 glow-up",
  "Unboxing the new drop ✨",
  "GRWM: everyday base routine",
  "Ingredient breakdown — what's actually inside",
  "Behind the scenes at the shoot",
  "Before / after, 4 week check-in",
  "Weekend reset routine",
  "Q&A: your most-asked questions",
];

// A small, fixed hue rotation keeps each influencer's grid visually varied
// but stable across renders (no per-render randomness needed).
function photoHues(seedIndex: number): number[] {
  const base = (seedIndex * 47) % 360;
  return [0, 55, 110, 165, 220, 275].map((offset) => (base + offset) % 360);
}

const AUDIENCE_COUNTRIES = [
  "Germany",
  "Austria",
  "Switzerland",
  "Netherlands",
  "France",
  "United Kingdom",
  "Poland",
  "Denmark",
];

function buildAudience(): AudienceDemographics {
  const femalePct = randInt(35, 82);
  const malePct = randInt(10, 100 - femalePct);
  const otherPct = Math.max(0, 100 - femalePct - malePct);

  const bands = [randInt(4, 14), randInt(22, 38), randInt(24, 34), randInt(12, 22)];
  const bandSum = bands.reduce((s, v) => s + v, 0);
  const lastBand = Math.max(2, 100 - bandSum);

  const countries = [...AUDIENCE_COUNTRIES].sort(() => rand() - 0.5).slice(0, 4);
  const shares = [randInt(38, 58), randInt(14, 24), randInt(8, 16)];
  const shareSum = shares.reduce((s, v) => s + v, 0);
  const lastShare = Math.max(4, 100 - shareSum);

  return {
    genderSplit: [
      { label: "Female", value: femalePct, color: "var(--series-5)" },
      { label: "Male", value: malePct, color: "var(--series-1)" },
      { label: "Other", value: otherPct, color: "var(--series-4)" },
    ].filter((g) => g.value > 0),
    ageBands: [
      { label: "13–17", value: bands[0] },
      { label: "18–24", value: bands[1] },
      { label: "25–34", value: bands[2] },
      { label: "35–44", value: bands[3] },
      { label: "45+", value: lastBand },
    ],
    topCountries: countries.map((label, i) => ({
      label,
      value: i < shares.length ? shares[i] : lastShare,
    })),
  };
}

export const INFLUENCERS: Influencer[] = Array.from({ length: 24 }).map((_, i) => {
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  const followers = randInt(18, 890) * 1000;
  const id = `inf-${i + 1}`;
  return {
    id,
    name: `${first} ${last}`,
    handle: `@${first.toLowerCase()}.${last.toLowerCase()}`,
    // Deterministic illustrated headshot (no real-person photo, no API key needed).
    photoUrl: `https://api.dicebear.com/9.x/notionists/svg?seed=${id}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
    platform: pick(PLATFORMS),
    niche: pick(NICHES),
    followers,
    engagementRate: Number(randRange(1.8, 9.4).toFixed(1)),
    avgViews: Math.round(followers * randRange(0.15, 0.6)),
    location: pick(CITIES),
    priceRange: `€${randInt(3, 18) * 100}–${randInt(19, 40) * 100}`,
    matchScore: randInt(68, 99),
    tags: [pick(NICHES), pick(NICHES), pick(["UGC", "Video", "Story", "Reels", "Tutorials"])].filter(
      (t, idx, arr) => arr.indexOf(t) === idx
    ),
    bio: "Creates authentic, editorial-style content with a highly engaged, conversion-ready community.",
    photos: photoHues(i).map((hue, p) => ({
      hue,
      likes: randInt(200, 24000),
      caption: PHOTO_CAPTIONS[(i + p) % PHOTO_CAPTIONS.length],
    })),
    audience: buildAudience(),
  };
});

const POST_TYPES_BY_PLATFORM: Record<Influencer["platform"] | "X", ScheduledPostType[]> = {
  Instagram: ["Reel", "Story", "Post"],
  TikTok: ["Video"],
  YouTube: ["Video"],
  Pinterest: ["Pin"],
  X: ["Post"],
};

const CAPTION_TEMPLATES = [
  "Morning skin routine feat. the new serum — full glow reveal by day 7 ✨",
  "Unboxing the latest drop + first impressions",
  "GRWM: everyday base routine with today's hero product",
  "Ingredient breakdown — what's actually inside",
  "Weekend reset routine, sponsored by the brand",
  "Q&A: your most-asked questions about the collab",
];

export const SCHEDULED_POSTS: ScheduledPost[] = Array.from({ length: 42 }).map((_, i) => {
  const inf = pick(INFLUENCERS);
  const campaign = pick(CAMPAIGNS);
  const offsetDays = randInt(-21, 35);
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(randInt(8, 20), pick([0, 15, 30, 45]), 0, 0);

  const isPast = d.getTime() < Date.now();
  const status =
    offsetDays < -1
      ? pick<ScheduledPost["status"]>(["posted", "posted", "posted", "missed"])
      : isPast
        ? "live"
        : "scheduled";

  const types = POST_TYPES_BY_PLATFORM[inf.platform] ?? ["Post"];

  return {
    id: `sp-${i + 1}`,
    influencerId: inf.id,
    influencerName: inf.name,
    platform: inf.platform,
    campaignId: campaign.id,
    campaign: campaign.name,
    scheduledAt: d.toISOString(),
    type: pick(types),
    status,
    caption: pick(CAPTION_TEMPLATES),
    thumbnailHue: randInt(0, 360),
  };
});

export const CONTENT_REVIEW_ITEMS: ContentReviewItem[] = Array.from({ length: 8 }).map((_, i) => {
  const inf = pick(INFLUENCERS);
  const status = pick<ContentReviewItem["status"]>(["pending", "pending", "approved", "changes_requested"]);
  const d = new Date();
  d.setHours(d.getHours() - randInt(1, 96));
  const commentCount = status === "changes_requested" ? randInt(1, 2) : 0;
  return {
    id: `cr-${i + 1}`,
    influencer: inf.name,
    platform: inf.platform,
    campaign: pick(CAMPAIGNS).name,
    submittedAt: d.toISOString(),
    status,
    caption: "Morning skin routine feat. the new serum — full glow reveal by day 7 ✨",
    thumbnailHue: randInt(0, 360),
    comments: Array.from({ length: commentCount }).map((_, c) => ({
      id: `cr-${i + 1}-c${c + 1}`,
      author: pick(["Lena Brandt", "Noah Weiss", "Frieda Berg"]),
      text: pick([
        "Can we get the product label more visible in the first 2 seconds?",
        "Love the lighting here — just swap the CTA text to match the brand book.",
        "Please re-shoot without the competitor packaging visible in the background.",
      ]),
      at: new Date(d.getTime() + (c + 1) * 3600_000).toISOString(),
    })),
  };
});

export const TEAM_MEMBERS: TeamMember[] = [
  { id: "tm-1", name: "Lena Brandt", email: "lena.brandt@nordlicht-skincare.com", role: "Owner", status: "active" },
  { id: "tm-2", name: "Noah Weiss", email: "noah.weiss@nordlicht-skincare.com", role: "Editor", status: "active" },
  { id: "tm-3", name: "Frieda Berg", email: "frieda.berg@nordlicht-skincare.com", role: "Editor", status: "active" },
  { id: "tm-4", name: "Anton Keller", email: "anton.keller@nordlicht-skincare.com", role: "Viewer", status: "invited" },
];

export const NOTIFICATIONS: AppNotification[] = [
  {
    id: "ntf-1",
    type: "match",
    title: "12 new Influencer-Tinder matches",
    description: "Fresh AI-matched creators are ready to review for Aurora Glow Launch.",
    at: new Date(Date.now() - 25 * 60_000).toISOString(),
    read: false,
    href: "/customer/influencer-tinder",
  },
  {
    id: "ntf-2",
    type: "content",
    title: "Content changes requested",
    description: "Mila Wagner's submission needs a re-shoot before it can go live.",
    at: new Date(Date.now() - 3 * 3600_000).toISOString(),
    read: false,
    href: "/customer/action-center#content",
  },
  {
    id: "ntf-3",
    type: "budget",
    title: "Midnight Repair Serum is 82% through budget",
    description: "At current pace, budget will be fully spent 6 days before the reporting date.",
    at: new Date(Date.now() - 26 * 3600_000).toISOString(),
    read: true,
    href: "/customer/dashboards/monitoring",
  },
  {
    id: "ntf-4",
    type: "system",
    title: "Final report locked for Spring Renewal Kit",
    description: "The reporting snapshot has been generated and is ready for sign-off.",
    at: new Date(Date.now() - 3 * 24 * 3600_000).toISOString(),
    read: true,
    href: "/customer/dashboards/final",
  },
];

export const BRIEFING_DOCS: BriefingDoc[] = [
  {
    id: "brief-1",
    title: "Aurora Glow — Influencer Briefing",
    type: "Influencer Briefing",
    fileType: "PDF",
    sizeKb: 2340,
    updatedAt: "2026-08-28T10:00:00Z",
    uploadedBy: "Lena Brandt",
    status: "current",
  },
  {
    id: "brief-2",
    title: "Aurora Glow — Campaign Manager Handoff",
    type: "Campaign Manager Briefing",
    fileType: "DOCX",
    sizeKb: 890,
    updatedAt: "2026-08-20T09:00:00Z",
    uploadedBy: "Lena Brandt",
    status: "outdated",
  },
  {
    id: "brief-3",
    title: "Nordlicht Brand Book v4",
    type: "Brand Book",
    fileType: "PDF",
    sizeKb: 15600,
    updatedAt: "2026-06-02T09:00:00Z",
    uploadedBy: "Brand Team",
    status: "current",
  },
  {
    id: "brief-4",
    title: "Midnight Repair — Influencer Briefing",
    type: "Influencer Briefing",
    fileType: "PDF",
    sizeKb: 0,
    updatedAt: "",
    uploadedBy: "",
    status: "missing",
  },
];

export const ACTION_COMPONENTS: ActionComponent[] = [
  {
    id: "act-tinder",
    name: "Influencer-Tinder",
    description: "Swipe through AI-matched creators and build your shortlist in minutes.",
    enabled: true,
    icon: "swipe",
    href: "/customer/influencer-tinder",
    stat: "12 new matches",
  },
  {
    id: "act-set",
    name: "Set Selection",
    description: "Choose curated influencer sets bundled by reach, niche and budget.",
    enabled: true,
    icon: "layers",
    href: "/customer/action-center#sets",
    stat: "3 sets ready",
  },
  {
    id: "act-content",
    name: "Content Review",
    description: "Approve or request changes on creator content before it goes live.",
    enabled: true,
    icon: "check",
    href: "/customer/action-center#content",
    stat: "3 pending",
  },
  {
    id: "act-briefing",
    name: "Briefing Uploads",
    description: "Manage Influencer, Campaign Manager and Brand Book documents.",
    enabled: false,
    icon: "upload",
    href: "/customer/action-center#briefing",
    stat: "1 missing",
  },
];

export const TRENDS: TrendItem[] = [
  { id: "t1", label: "Barrier-repair skincare routines", category: "Skincare", momentum: 34, volume: 82 },
  { id: "t2", label: "\"Get Ready With Me\" dermatology edits", category: "Format", momentum: 21, volume: 67 },
  { id: "t3", label: "Slow beauty / minimal routines", category: "Lifestyle", momentum: 18, volume: 54 },
  { id: "t4", label: "Ingredient-led storytelling (niacinamide, peptides)", category: "Content", momentum: 12, volume: 71 },
  { id: "t5", label: "Skinimalism packaging unboxings", category: "Format", momentum: -6, volume: 39 },
];

export const SIMILAR_CAMPAIGNS: SimilarCampaign[] = [
  {
    id: "sc1",
    industry: "Skincare (DACH)",
    objective: "Awareness",
    platforms: ["Instagram", "TikTok"],
    reach: 2400000,
    engagementRate: 5.8,
    ctr: 1.4,
    budgetBand: "€40k–60k",
  },
  {
    id: "sc2",
    industry: "Clean Beauty (EU)",
    objective: "Conversion",
    platforms: ["Instagram", "YouTube"],
    reach: 1100000,
    engagementRate: 4.1,
    ctr: 2.6,
    budgetBand: "€60k–80k",
  },
  {
    id: "sc3",
    industry: "Wellness (DACH)",
    objective: "Traffic",
    platforms: ["TikTok", "Pinterest"],
    reach: 1800000,
    engagementRate: 6.7,
    ctr: 1.9,
    budgetBand: "€25k–40k",
  },
];

export const RECOMMENDATIONS: Recommendation[] = [
  {
    id: "rec1",
    title: "Launch a dermatologist-led \"barrier repair\" mini-series",
    rationale:
      "Barrier-repair content is trending +34% this month and outperforms generic routine videos by 2.1x engagement in your category.",
    expectedImpact: "+18–24% engagement rate",
    platforms: ["Instagram", "TikTok"],
    effort: "Medium",
    confidence: 88,
  },
  {
    id: "rec2",
    title: "Shift 20% of budget to mid-tier creators (50k–150k)",
    rationale:
      "Anonymised campaigns in your industry show mid-tier creators deliver 1.6x the CTR of macro creators at the same spend.",
    expectedImpact: "+0.6pp CTR",
    platforms: ["Instagram", "YouTube"],
    effort: "Low",
    confidence: 79,
  },
  {
    id: "rec3",
    title: "Test ingredient-storytelling hooks in first 3 seconds",
    rationale:
      "Market pulse shows ingredient-led hooks (niacinamide, peptides) hold 41% more retention through the first 3 seconds.",
    expectedImpact: "+11% completion rate",
    platforms: ["TikTok"],
    effort: "Low",
    confidence: 82,
  },
  {
    id: "rec4",
    title: "Add a Pinterest always-on layer for evergreen reach",
    rationale:
      "Similar wellness campaigns saw a 3.4x longer content half-life on Pinterest versus short-form platforms alone.",
    expectedImpact: "+30% reach longevity",
    platforms: ["Pinterest"],
    effort: "High",
    confidence: 71,
  },
];

export function getCampaignById(id: string): Campaign | undefined {
  return CAMPAIGNS.find((c) => c.id === id);
}
