export type Platform = "Instagram" | "TikTok" | "YouTube" | "Pinterest" | "X";

export type CampaignStatus = "live" | "scheduled" | "reporting" | "completed";

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  platforms: Platform[];
  startDate: string;
  endDate: string;
  reportingDate: string;
  budget: number;
  influencerCount: number;
  objective: "Awareness" | "Engagement" | "Traffic" | "Conversion";
}

export interface SeriesPoint {
  [key: string]: string | number;
  date: string;
  value: number;
}

export interface KpiSnapshot {
  label: string;
  value: number;
  unit?: "number" | "percent" | "currency";
  delta: number;
  goodDirection: "up" | "down";
  series?: SeriesPoint[];
}

export interface InfluencerPhoto {
  hue: number;
  likes: number;
  caption: string;
}

export interface AudienceDemographics {
  genderSplit: { label: string; value: number; color: string }[];
  ageBands: { label: string; value: number }[];
  topCountries: { label: string; value: number }[];
}

export interface Influencer {
  id: string;
  name: string;
  handle: string;
  photoUrl: string;
  platform: Platform;
  niche: string;
  followers: number;
  engagementRate: number;
  avgViews: number;
  location: string;
  priceRange: string;
  matchScore: number;
  tags: string[];
  bio: string;
  photos: InfluencerPhoto[];
  audience: AudienceDemographics;
}

export interface ReviewComment {
  id: string;
  author: string;
  text: string;
  at: string;
}

export interface ContentReviewItem {
  id: string;
  influencer: string;
  platform: Platform;
  campaign: string;
  submittedAt: string;
  status: "pending" | "approved" | "changes_requested";
  caption: string;
  thumbnailHue: number;
  comments: ReviewComment[];
}

export interface BriefingDoc {
  id: string;
  title: string;
  type: "Influencer Briefing" | "Campaign Manager Briefing" | "Brand Book";
  fileType: "PDF" | "DOCX" | "FIGMA" | "ZIP";
  sizeKb: number;
  updatedAt: string;
  uploadedBy: string;
  status: "current" | "outdated" | "missing";
}

export interface ActionComponent {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon: "swipe" | "layers" | "check" | "upload";
  href: string;
  stat: string;
}

export interface TrendItem {
  id: string;
  label: string;
  category: string;
  momentum: number;
  volume: number;
}

export interface SimilarCampaign {
  id: string;
  industry: string;
  objective: string;
  platforms: Platform[];
  reach: number;
  engagementRate: number;
  ctr: number;
  budgetBand: string;
}

export interface Recommendation {
  id: string;
  title: string;
  rationale: string;
  expectedImpact: string;
  platforms: Platform[];
  effort: "Low" | "Medium" | "High";
  confidence: number;
}

export type NotificationType = "match" | "content" | "budget" | "system";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  at: string;
  read: boolean;
  href?: string;
}

export type ScheduledPostStatus = "scheduled" | "posted" | "live" | "missed";
export type ScheduledPostType = "Reel" | "Story" | "Video" | "Post" | "Pin";

export interface ScheduledPost {
  id: string;
  influencerId: string;
  influencerName: string;
  platform: Platform;
  campaignId: string;
  campaign: string;
  scheduledAt: string;
  type: ScheduledPostType;
  status: ScheduledPostStatus;
  caption: string;
  thumbnailHue: number;
}

export type TeamRole = "Owner" | "Editor" | "Viewer";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: "active" | "invited";
}
