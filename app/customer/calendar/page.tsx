"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Radio,
  XCircle,
} from "lucide-react";
import { SCHEDULED_POSTS } from "@/lib/mock-data";
import { useCampaign } from "@/lib/campaign-context";
import type { ScheduledPost, ScheduledPostStatus } from "@/lib/types";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Avatar } from "@/components/ui/avatar";
import { cn, formatDateTime } from "@/lib/utils";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const statusMeta: Record<ScheduledPostStatus, { tone: "accent" | "good" | "warning" | "critical"; icon: typeof Clock; label: string }> = {
  scheduled: { tone: "accent", icon: Clock, label: "Scheduled" },
  live: { tone: "warning", icon: Radio, label: "Live now" },
  posted: { tone: "good", icon: CheckCircle2, label: "Posted" },
  missed: { tone: "critical", icon: XCircle, label: "Missed" },
};

// Local calendar date, not UTC — must match how `formatDateTime` and the
// month grid render dates, or a post's chip and its modal can disagree on
// which day it falls on whenever the viewer isn't in UTC.
function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function monthMatrix(monthAnchor: Date): Date[][] {
  const year = monthAnchor.getFullYear();
  const month = monthAnchor.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  // Monday-first grid: shift so Monday = 0 ... Sunday = 6.
  const leadingOffset = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - leadingOffset);

  const weeks: Date[][] = [];
  for (let w = 0; w < 6; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(gridStart);
      day.setDate(gridStart.getDate() + w * 7 + d);
      week.push(day);
    }
    weeks.push(week);
  }
  return weeks;
}

function PostChip({ post, onClick }: { post: ScheduledPost; onClick: () => void }) {
  const meta = statusMeta[post.status];
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-1.5 truncate rounded-[6px] px-1.5 py-1 text-left text-[11px] font-medium transition-colors hover:brightness-95",
        meta.tone === "good" && "bg-status-good/10 text-status-good-text",
        meta.tone === "warning" && "bg-status-warning/15 text-[#8a5a00]",
        meta.tone === "critical" && "bg-status-critical/10 text-status-critical",
        meta.tone === "accent" && "bg-accent-soft text-accent-strong"
      )}
    >
      <span
        className="size-1.5 shrink-0 rounded-full"
        style={{
          background:
            meta.tone === "good"
              ? "var(--status-good)"
              : meta.tone === "warning"
                ? "var(--status-warning)"
                : meta.tone === "critical"
                  ? "var(--status-critical)"
                  : "var(--accent)",
        }}
      />
      <span className="truncate">{post.influencerName.split(" ")[0]}</span>
      <span className="shrink-0 text-[10px] opacity-75">{post.platform}</span>
    </button>
  );
}

function PostDetailModal({ post, onClose, onMarkPosted }: { post: ScheduledPost | null; onClose: () => void; onMarkPosted: (id: string) => void }) {
  if (!post) return null;
  const meta = statusMeta[post.status];
  const Icon = meta.icon;
  return (
    <Modal open={Boolean(post)} onClose={onClose} title={post.influencerName} description={`${post.platform} · ${post.campaign}`}>
      <div className="flex items-start gap-3">
        <Avatar name={post.influencerName} size={40} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone={meta.tone}>
              <Icon className="size-3" /> {meta.label}
            </Badge>
            <Badge>{post.type}</Badge>
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">&ldquo;{post.caption}&rdquo;</p>
          <p className="mt-2 text-[12px] text-text-muted">{formatDateTime(new Date(post.scheduledAt))}</p>
        </div>
      </div>
      {(post.status === "scheduled" || post.status === "live") && (
        <Button
          className="mt-4 w-full"
          onClick={() => {
            onMarkPosted(post.id);
            onClose();
          }}
        >
          <CheckCircle2 className="size-4" /> Mark as posted
        </Button>
      )}
    </Modal>
  );
}

function DayListModal({
  date,
  posts,
  onClose,
  onSelectPost,
}: {
  date: Date | null;
  posts: ScheduledPost[];
  onClose: () => void;
  onSelectPost: (post: ScheduledPost) => void;
}) {
  if (!date) return null;
  return (
    <Modal
      open={Boolean(date)}
      onClose={onClose}
      title={date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
      description={`${posts.length} post${posts.length === 1 ? "" : "s"} scheduled`}
    >
      <div className="flex max-h-80 flex-col gap-1.5 overflow-y-auto pr-1">
        {posts.map((post) => {
          const meta = statusMeta[post.status];
          return (
            <button
              key={post.id}
              onClick={() => onSelectPost(post)}
              className="flex items-center gap-3 rounded-[var(--radius-sm)] p-2 text-left hover:bg-surface-hover"
            >
              <Avatar name={post.influencerName} size={32} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-text-primary">{post.influencerName}</p>
                <p className="text-[11px] text-text-muted">
                  {post.platform} · {post.type} · {formatDateTime(new Date(post.scheduledAt))}
                </p>
              </div>
              <Badge tone={meta.tone}>{meta.label}</Badge>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}

export default function ContentCalendarPage() {
  const { campaign, campaigns } = useCampaign();
  const [monthAnchor, setMonthAnchor] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [scopeAll, setScopeAll] = useState(false);
  const [posts, setPosts] = useState(SCHEDULED_POSTS);
  const [viewingPost, setViewingPost] = useState<ScheduledPost | null>(null);
  const [viewingDay, setViewingDay] = useState<Date | null>(null);

  const scopedPosts = useMemo(
    () => (scopeAll ? posts : posts.filter((p) => p.campaignId === campaign.id)),
    [posts, scopeAll, campaign.id]
  );

  const postsByDay = useMemo(() => {
    const map = new Map<string, ScheduledPost[]>();
    for (const p of scopedPosts) {
      const key = toDateKey(new Date(p.scheduledAt));
      const list = map.get(key) ?? [];
      list.push(p);
      map.set(key, list);
    }
    for (const list of map.values()) list.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
    return map;
  }, [scopedPosts]);

  const weeks = useMemo(() => monthMatrix(monthAnchor), [monthAnchor]);
  const monthLabel = monthAnchor.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const today = toDateKey(new Date());

  function shiftMonth(delta: number) {
    setMonthAnchor((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + delta);
      return next;
    });
  }

  function markPosted(id: string) {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status: "posted" } : p)));
  }

  return (
    <div className="mx-auto max-w-6xl animate-fade-in">
      <PageHeader
        eyebrow="Take Action"
        title="Content Calendar"
        description="Every scheduled, live and posted piece of creator content, in one view."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setScopeAll((v) => !v)}
              className={cn(
                "flex h-9 items-center gap-1.5 rounded-[var(--radius-sm)] border px-3 text-[12.5px] font-medium transition-colors",
                scopeAll ? "border-accent bg-accent-soft text-accent-strong" : "border-border-strong text-text-secondary hover:bg-surface-hover"
              )}
            >
              <CalendarDays className="size-3.5" /> {scopeAll ? `All ${campaigns.length} campaigns` : "This campaign"}
            </button>
          </div>
        }
      />

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => shiftMonth(-1)}
            className="flex size-8 items-center justify-center rounded-[var(--radius-sm)] border border-border-strong text-text-secondary hover:bg-surface-hover"
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={() => shiftMonth(1)}
            className="flex size-8 items-center justify-center rounded-[var(--radius-sm)] border border-border-strong text-text-secondary hover:bg-surface-hover"
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </button>
          <h2 className="ml-2 text-[15px] font-semibold text-text-primary">{monthLabel}</h2>
        </div>
        <button
          onClick={() => {
            const d = new Date();
            d.setDate(1);
            setMonthAnchor(d);
          }}
          className="text-[12.5px] font-medium text-accent hover:underline"
        >
          Today
        </button>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border-hairline bg-surface-1">
        <div className="grid grid-cols-7 border-b border-border-hairline bg-surface-2 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
          {WEEKDAYS.map((w) => (
            <div key={w} className="px-2 py-2 text-center">
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {weeks.flat().map((day, i) => {
            const key = toDateKey(day);
            const inMonth = day.getMonth() === monthAnchor.getMonth();
            const dayPosts = postsByDay.get(key) ?? [];
            const isToday = key === today;
            return (
              <div
                key={i}
                className={cn(
                  "flex min-h-[104px] flex-col gap-1 border-b border-r border-border-hairline p-1.5 last:border-r-0 [&:nth-child(7n)]:border-r-0",
                  !inMonth && "bg-surface-2/50"
                )}
              >
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium",
                    isToday ? "bg-accent text-white" : inMonth ? "text-text-secondary" : "text-text-muted"
                  )}
                >
                  {day.getDate()}
                </span>
                <div className="flex flex-1 flex-col gap-1">
                  {dayPosts.slice(0, 3).map((post) => (
                    <PostChip key={post.id} post={post} onClick={() => setViewingPost(post)} />
                  ))}
                  {dayPosts.length > 3 && (
                    <button
                      onClick={() => setViewingDay(day)}
                      className="px-1.5 text-left text-[10.5px] font-medium text-text-muted hover:text-accent"
                    >
                      +{dayPosts.length - 3} more
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <PostDetailModal post={viewingPost} onClose={() => setViewingPost(null)} onMarkPosted={markPosted} />
      <DayListModal
        date={viewingDay}
        posts={viewingDay ? postsByDay.get(toDateKey(viewingDay)) ?? [] : []}
        onClose={() => setViewingDay(null)}
        onSelectPost={(post) => {
          setViewingDay(null);
          setViewingPost(post);
        }}
      />
    </div>
  );
}
