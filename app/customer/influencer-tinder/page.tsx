"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Eye, MapPin, RotateCcw, Search, Sparkles, SlidersHorizontal, Star, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { INFLUENCERS, NICHES } from "@/lib/mock-data";
import type { Influencer, Platform } from "@/lib/types";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { InfluencerProfileModal } from "@/components/customer/influencer-profile-modal";
import { cn, formatCompactNumber, formatPercent } from "@/lib/utils";

const PLATFORM_OPTIONS: Platform[] = ["Instagram", "TikTok", "YouTube", "Pinterest"];

const FOLLOWER_BUCKETS = [
  { id: "any", label: "Any size", test: () => true },
  { id: "lt100k", label: "< 100K", test: (f: number) => f < 100_000 },
  { id: "100to300", label: "100K–300K", test: (f: number) => f >= 100_000 && f < 300_000 },
  { id: "300plus", label: "300K+", test: (f: number) => f >= 300_000 },
] as const;
type FollowerBucketId = (typeof FOLLOWER_BUCKETS)[number]["id"];

interface Filters {
  search: string;
  platforms: Platform[];
  niche: string;
  followerBucket: FollowerBucketId;
}

const DEFAULT_FILTERS: Filters = { search: "", platforms: [], niche: "all", followerBucket: "any" };

function matchesFilters(inf: Influencer, f: Filters): boolean {
  if (f.platforms.length > 0 && !f.platforms.includes(inf.platform)) return false;
  if (f.niche !== "all" && inf.niche !== f.niche) return false;
  const bucket = FOLLOWER_BUCKETS.find((b) => b.id === f.followerBucket)!;
  if (!bucket.test(inf.followers)) return false;
  if (f.search.trim()) {
    const q = f.search.trim().toLowerCase();
    if (!inf.name.toLowerCase().includes(q) && !inf.handle.toLowerCase().includes(q) && !inf.niche.toLowerCase().includes(q)) return false;
  }
  return true;
}

function FilterBar({ filters, onChange, matchCount }: { filters: Filters; onChange: (f: Filters) => void; matchCount: number }) {
  const [open, setOpen] = useState(false);
  const activeCount =
    filters.platforms.length + (filters.niche !== "all" ? 1 : 0) + (filters.followerBucket !== "any" ? 1 : 0) + (filters.search.trim() ? 1 : 0);

  function togglePlatform(p: Platform) {
    onChange({ ...filters, platforms: filters.platforms.includes(p) ? filters.platforms.filter((x) => x !== p) : [...filters.platforms, p] });
  }

  return (
    <div className="mb-6 w-full rounded-[var(--radius-lg)] border border-border-hairline bg-surface-1 p-3.5">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[180px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
          <Input
            placeholder="Search name, handle or niche…"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="h-9 pl-9 text-[13px]"
          />
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "flex h-9 items-center gap-1.5 rounded-[var(--radius-sm)] border px-3 text-[13px] font-medium transition-colors",
            open || activeCount > 0 ? "border-accent bg-accent-soft text-accent-strong" : "border-border-strong text-text-secondary hover:bg-surface-hover"
          )}
        >
          <SlidersHorizontal className="size-3.5" /> Filters
          {activeCount > 0 && <span className="flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-white">{activeCount}</span>}
        </button>
        {activeCount > 0 && (
          <button onClick={() => onChange(DEFAULT_FILTERS)} className="flex h-9 items-center gap-1 rounded-[var(--radius-sm)] px-2.5 text-[12.5px] font-medium text-text-muted hover:bg-surface-hover hover:text-text-primary">
            <X className="size-3.5" /> Clear
          </button>
        )}
        <span className="ml-auto text-[12.5px] text-text-muted">{matchCount} creators match</span>
      </div>

      {open && (
        <div className="mt-3.5 flex flex-col gap-3.5 border-t border-border-hairline pt-3.5">
          <div>
            <p className="mb-1.5 text-[12px] font-medium text-text-secondary">Platform</p>
            <div className="flex flex-wrap gap-1.5">
              {PLATFORM_OPTIONS.map((p) => (
                <button
                  key={p}
                  onClick={() => togglePlatform(p)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-[12.5px] font-medium transition-colors",
                    filters.platforms.includes(p) ? "border-accent bg-accent-soft text-accent-strong" : "border-border-strong text-text-secondary hover:bg-surface-hover"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[12px] font-medium text-text-secondary">Niche</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => onChange({ ...filters, niche: "all" })}
                className={cn(
                  "rounded-full border px-3 py-1 text-[12.5px] font-medium transition-colors",
                  filters.niche === "all" ? "border-accent bg-accent-soft text-accent-strong" : "border-border-strong text-text-secondary hover:bg-surface-hover"
                )}
              >
                All niches
              </button>
              {NICHES.map((n) => (
                <button
                  key={n}
                  onClick={() => onChange({ ...filters, niche: n })}
                  className={cn(
                    "rounded-full border px-3 py-1 text-[12.5px] font-medium transition-colors",
                    filters.niche === n ? "border-accent bg-accent-soft text-accent-strong" : "border-border-strong text-text-secondary hover:bg-surface-hover"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[12px] font-medium text-text-secondary">Followers</p>
            <div className="flex flex-wrap gap-1.5">
              {FOLLOWER_BUCKETS.map((b) => (
                <button
                  key={b.id}
                  onClick={() => onChange({ ...filters, followerBucket: b.id })}
                  className={cn(
                    "rounded-full border px-3 py-1 text-[12.5px] font-medium transition-colors",
                    filters.followerBucket === b.id ? "border-accent bg-accent-soft text-accent-strong" : "border-border-strong text-text-secondary hover:bg-surface-hover"
                  )}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfluencerCard({
  influencer,
  dragX,
  dragging,
  onPointerDown,
  onViewProfile,
}: {
  influencer: Influencer;
  dragX: number;
  dragging: boolean;
  onPointerDown: (e: ReactPointerEvent) => void;
  onViewProfile?: (influencer: Influencer) => void;
}) {
  const rotate = dragX / 18;
  const likeOpacity = Math.min(1, Math.max(0, dragX / 90));
  const passOpacity = Math.min(1, Math.max(0, -dragX / 90));

  return (
    <div
      onPointerDown={onPointerDown}
      className={cn(
        "absolute inset-0 touch-none select-none overflow-hidden rounded-[var(--radius-xl)] border border-border-hairline bg-surface-1 shadow-[var(--shadow-lg)]",
        dragging ? "cursor-grabbing" : "cursor-grab"
      )}
      style={{
        transform: `translateX(${dragX}px) rotate(${rotate}deg)`,
        transition: dragging ? "none" : "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <div
        className="flex h-48 items-end p-5"
        style={{
          background: `linear-gradient(135deg, color-mix(in srgb, var(--series-1) 70%, black), color-mix(in srgb, var(--series-7) 55%, black))`,
        }}
      >
        <Avatar name={influencer.name} src={influencer.photoUrl} size={64} className="ring-4 ring-white/30" />
        {onViewProfile && (
          <button
            onClick={() => onViewProfile(influencer)}
            className="ml-auto flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1.5 text-[12px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/45"
          >
            <Eye className="size-3.5" /> View profile
          </button>
        )}
      </div>

      <div
        className="pointer-events-none absolute left-6 top-6 rounded-lg border-4 border-status-good px-3 py-1 text-lg font-bold uppercase tracking-wide text-status-good"
        style={{ opacity: likeOpacity, transform: `rotate(-12deg) scale(${0.9 + likeOpacity * 0.1})` }}
      >
        Shortlist
      </div>
      <div
        className="pointer-events-none absolute right-6 top-6 rounded-lg border-4 border-status-critical px-3 py-1 text-lg font-bold uppercase tracking-wide text-status-critical"
        style={{ opacity: passOpacity, transform: `rotate(12deg) scale(${0.9 + passOpacity * 0.1})` }}
      >
        Pass
      </div>

      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-[17px] font-semibold text-text-primary">{influencer.name}</h3>
              <Badge>{influencer.platform}</Badge>
            </div>
            <p className="text-[13px] text-text-muted">{influencer.handle}</p>
          </div>
          <Badge tone="accent" className="shrink-0">
            <Sparkles className="size-3" /> {influencer.matchScore}% match
          </Badge>
        </div>

        <p className="text-[13px] leading-relaxed text-text-secondary">{influencer.bio}</p>

        <div className="flex flex-wrap gap-1.5">
          {influencer.tags.map((t) => (
            <span key={t} className="rounded-full bg-surface-2 px-2.5 py-1 text-[11.5px] font-medium text-text-secondary">
              {t}
            </span>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-3 gap-2 border-t border-border-hairline pt-3">
          <div>
            <p className="text-[15px] font-semibold text-text-primary">{formatCompactNumber(influencer.followers)}</p>
            <p className="text-[11px] text-text-muted">Followers</p>
          </div>
          <div>
            <p className="text-[15px] font-semibold text-text-primary">{formatPercent(influencer.engagementRate)}</p>
            <p className="text-[11px] text-text-muted">Engagement</p>
          </div>
          <div>
            <p className="text-[15px] font-semibold text-text-primary">{influencer.priceRange}</p>
            <p className="text-[11px] text-text-muted">Est. rate</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[12px] text-text-muted">
          <MapPin className="size-3.5" /> {influencer.location} · {influencer.niche}
        </div>
      </div>
    </div>
  );
}

const STORAGE_KEY = "octagone.tinder.progress";

type Decision = { influencer: Influencer; direction: "left" | "right" };

interface StoredProgress {
  history: { id: string; direction: "left" | "right" }[];
}

export default function InfluencerTinderPage() {
  const deck = useMemo(() => INFLUENCERS, []);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [history, setHistory] = useState<Decision[]>([]);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [viewingProfile, setViewingProfile] = useState<Influencer | null>(null);
  const startX = useRef(0);
  const exitDirection = useRef<"left" | "right" | null>(null);
  // Skips the persist effect's very first run on mount — that run still
  // holds pre-hydration defaults (setState from the hydration effect below
  // hasn't re-rendered yet), so writing then would clobber the stored
  // progress with empty state before it's ever read back.
  const skipNextPersist = useRef(true);

  // Restore where the customer left off — swiping is a slow, deliberate
  // task, so losing progress on refresh would be a real regression.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored: StoredProgress = JSON.parse(raw);
        const restored = stored.history
          .map((h) => {
            const influencer = deck.find((d) => d.id === h.id);
            return influencer ? { influencer, direction: h.direction } : null;
          })
          .filter((d): d is Decision => Boolean(d));
        setHistory(restored);
      }
    } catch {
      // ignore malformed storage
    }
  }, [deck]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      return;
    }
    const payload: StoredProgress = { history: history.map((h) => ({ id: h.influencer.id, direction: h.direction })) };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [history]);

  const decidedIds = useMemo(() => new Set(history.map((h) => h.influencer.id)), [history]);
  const filteredPool = useMemo(() => deck.filter((inf) => matchesFilters(inf, filters)), [deck, filters]);
  const remaining = useMemo(() => filteredPool.filter((inf) => !decidedIds.has(inf.id)), [filteredPool, decidedIds]);
  const shortlist = useMemo(() => history.filter((h) => h.direction === "right").map((h) => h.influencer), [history]);

  const current = remaining[0];
  const next = remaining[1];
  const viewingCurrentCard = viewingProfile?.id === current?.id;
  const done = remaining.length === 0;
  const noMatches = filteredPool.length === 0;

  function decide(direction: "left" | "right") {
    if (!current) return;
    const decided = current;
    exitDirection.current = direction;
    setDragX(direction === "right" ? 640 : -640);
    setTimeout(() => {
      setHistory((h) => [...h, { influencer: decided, direction }]);
      setDragX(0);
      exitDirection.current = null;
    }, 260);
  }

  function handlePointerDown(e: ReactPointerEvent) {
    setDragging(true);
    startX.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }
  function handlePointerMove(e: ReactPointerEvent) {
    if (!dragging) return;
    setDragX(e.clientX - startX.current);
  }
  function handlePointerUp() {
    if (!dragging) return;
    setDragging(false);
    if (dragX > 120) decide("right");
    else if (dragX < -120) decide("left");
    else setDragX(0);
  }

  function undo() {
    setHistory((h) => h.slice(0, -1));
  }

  // Keyboard control: Left/Right to decide, Enter/Space to open the
  // profile, disabled while a modal is open or the deck is finished.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (done || viewingProfile) return;
      if (e.key === "ArrowRight") decide("right");
      else if (e.key === "ArrowLeft") decide("left");
      else if ((e.key === "Enter" || e.key === " ") && current) {
        e.preventDefault();
        setViewingProfile(current);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, viewingProfile, current]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center animate-fade-in">
      <PageHeader
        eyebrow="Take Action"
        title="Influencer-Tinder"
        description="Swipe right to shortlist a creator, left to pass. AI-ranked by fit with your campaign's audience."
      />

      <FilterBar filters={filters} onChange={setFilters} matchCount={filteredPool.length} />

      <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col items-center">
          <div
            className="relative h-[560px] w-full max-w-sm"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {noMatches ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 rounded-[var(--radius-xl)] border border-dashed border-border-strong text-center px-6">
                <Search className="size-8 text-text-muted" />
                <p className="text-[15px] font-semibold text-text-primary">No creators match these filters</p>
                <p className="max-w-[240px] text-[13px] text-text-muted">Try widening the platform, niche or follower range.</p>
                <Button variant="secondary" onClick={() => setFilters(DEFAULT_FILTERS)}>
                  <X className="size-4" /> Clear filters
                </Button>
              </div>
            ) : done ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 rounded-[var(--radius-xl)] border border-dashed border-border-strong text-center px-6">
                <Sparkles className="size-8 text-accent" />
                <p className="text-[15px] font-semibold text-text-primary">You&apos;re all caught up</p>
                <p className="max-w-[240px] text-[13px] text-text-muted">
                  Shortlisted {shortlist.length} creators. Head to Set Selection to build your campaign roster.
                </p>
                <Button variant="secondary" onClick={() => setHistory([])}>
                  <RotateCcw className="size-4" /> Start over
                </Button>
              </div>
            ) : (
              <>
                {next && <InfluencerCard influencer={next} dragX={0} dragging={false} onPointerDown={() => {}} />}
                {current && (
                  <InfluencerCard
                    influencer={current}
                    dragX={dragX}
                    dragging={dragging}
                    onPointerDown={handlePointerDown}
                    onViewProfile={setViewingProfile}
                  />
                )}
              </>
            )}
          </div>

          {!done && !noMatches && (
            <div className="mt-6 flex items-center gap-4">
              <button
                onClick={() => decide("left")}
                className="flex size-14 items-center justify-center rounded-full border border-border-strong bg-surface-1 text-status-critical shadow-[var(--shadow-sm)] transition-transform hover:scale-105 active:scale-95"
                aria-label="Pass"
              >
                <ThumbsDown className="size-6" />
              </button>
              <button
                onClick={undo}
                disabled={history.length === 0}
                className="flex size-11 items-center justify-center rounded-full border border-border-strong bg-surface-1 text-text-muted shadow-[var(--shadow-sm)] transition-transform hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
                aria-label="Undo"
              >
                <RotateCcw className="size-4.5" />
              </button>
              <button
                onClick={() => decide("right")}
                className="flex size-14 items-center justify-center rounded-full border border-border-strong bg-surface-1 text-status-good shadow-[var(--shadow-sm)] transition-transform hover:scale-105 active:scale-95"
                aria-label="Shortlist"
              >
                <ThumbsUp className="size-6" />
              </button>
            </div>
          )}
          <p className="mt-3 text-[12px] text-text-muted">
            {remaining.length} of {filteredPool.length} creators remaining
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-[var(--radius-lg)] border border-border-hairline bg-surface-1 p-5 shadow-[var(--shadow-sm)]">
            <div className="flex items-center gap-2">
              <Star className="size-4 text-status-warning" />
              <h3 className="text-sm font-semibold text-text-primary">Shortlist ({shortlist.length})</h3>
            </div>
            <div className="mt-3 flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1">
              {shortlist.length === 0 && <p className="text-[12.5px] text-text-muted">Swipe right to add creators here.</p>}
              {shortlist
                .slice()
                .reverse()
                .map((inf) => (
                  <button
                    key={inf.id}
                    onClick={() => setViewingProfile(inf)}
                    className="flex items-center gap-2.5 rounded-[var(--radius-sm)] p-1 text-left hover:bg-surface-hover"
                  >
                    <Avatar name={inf.name} src={inf.photoUrl} size={30} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-medium text-text-primary">{inf.name}</p>
                      <p className="text-[11px] text-text-muted">{inf.platform}</p>
                    </div>
                    <Badge tone="accent">{inf.matchScore}%</Badge>
                  </button>
                ))}
            </div>
            {shortlist.length > 0 && (
              <Button size="sm" className="mt-4 w-full">
                Send shortlist to Set Selection
              </Button>
            )}
          </div>

          <div className="rounded-[var(--radius-lg)] border border-border-hairline bg-surface-2 p-5">
            <h3 className="text-sm font-semibold text-text-primary">How matching works</h3>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-text-muted">
              Match scores combine audience overlap, past campaign performance and content style fit with your
              brand. Passed creators won&apos;t reappear in this deck.
            </p>
          </div>
        </div>
      </div>

      <InfluencerProfileModal
        influencer={viewingProfile}
        onClose={() => setViewingProfile(null)}
        onShortlist={viewingCurrentCard ? () => decide("right") : undefined}
        onPass={viewingCurrentCard ? () => decide("left") : undefined}
      />
    </div>
  );
}
