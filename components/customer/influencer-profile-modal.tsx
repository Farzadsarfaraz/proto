"use client";

import { useEffect, useRef } from "react";
import { Heart, MapPin, Sparkles, ThumbsDown, ThumbsUp, X } from "lucide-react";
import type { Influencer } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFocusTrap } from "@/lib/use-focus-trap";
import { formatCompactNumber, formatPercent } from "@/lib/utils";

interface InfluencerProfileModalProps {
  influencer: Influencer | null;
  onClose: () => void;
  onShortlist?: (influencer: Influencer) => void;
  onPass?: (influencer: Influencer) => void;
}

export function InfluencerProfileModal({ influencer, onClose, onShortlist, onPass }: InfluencerProfileModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(Boolean(influencer), panelRef);

  useEffect(() => {
    if (!influencer) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [influencer, onClose]);

  if (!influencer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="influencer-profile-title"
        tabIndex={-1}
        className="relative flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-[var(--radius-xl)] border border-border-hairline bg-surface-1 shadow-[var(--shadow-lg)] animate-fade-in outline-none"
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/45"
          aria-label="Close profile"
        >
          <X className="size-4" />
        </button>

        <div className="overflow-y-auto">
          <div
            className="flex h-36 items-end p-5"
            style={{
              background: `linear-gradient(135deg, color-mix(in srgb, var(--series-1) 70%, black), color-mix(in srgb, var(--series-7) 55%, black))`,
            }}
          >
            <Avatar name={influencer.name} src={influencer.photoUrl} size={76} className="translate-y-9 ring-4 ring-surface-1" />
          </div>

          <div className="px-5 pb-5 pt-12">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 id="influencer-profile-title" className="text-[19px] font-semibold text-text-primary">
                    {influencer.name}
                  </h2>
                  <Badge>{influencer.platform}</Badge>
                </div>
                <p className="text-[13px] text-text-muted">{influencer.handle}</p>
              </div>
              <Badge tone="accent" className="shrink-0">
                <Sparkles className="size-3" /> {influencer.matchScore}% match
              </Badge>
            </div>

            <p className="mt-3 text-[13.5px] leading-relaxed text-text-secondary">{influencer.bio}</p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {influencer.tags.map((t) => (
                <span key={t} className="rounded-full bg-surface-2 px-2.5 py-1 text-[11.5px] font-medium text-text-secondary">
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-1 text-[12.5px] text-text-muted">
              <MapPin className="size-3.5" /> {influencer.location} · {influencer.niche}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5 border-t border-border-hairline pt-4 sm:grid-cols-4">
              <div>
                <p className="text-[15px] font-semibold text-text-primary">{formatCompactNumber(influencer.followers)}</p>
                <p className="text-[11px] text-text-muted">Followers</p>
              </div>
              <div>
                <p className="text-[15px] font-semibold text-text-primary">{formatPercent(influencer.engagementRate)}</p>
                <p className="text-[11px] text-text-muted">Engagement</p>
              </div>
              <div>
                <p className="text-[15px] font-semibold text-text-primary">{formatCompactNumber(influencer.avgViews)}</p>
                <p className="text-[11px] text-text-muted">Avg. views</p>
              </div>
              <div>
                <p className="text-[15px] font-semibold text-text-primary">{influencer.priceRange}</p>
                <p className="text-[11px] text-text-muted">Est. rate</p>
              </div>
            </div>

            <div className="mt-5 border-t border-border-hairline pt-4">
              <h3 className="mb-2.5 text-[13px] font-semibold text-text-primary">Recent content</h3>
              <div className="grid grid-cols-3 gap-1.5">
                {influencer.photos.map((photo, i) => (
                  <div
                    key={i}
                    className="group relative aspect-square overflow-hidden rounded-[10px]"
                    style={{ background: `hsl(${photo.hue} 62% 82%)` }}
                    title={photo.caption}
                  >
                    <div
                      className="absolute inset-0 opacity-70"
                      style={{ background: `linear-gradient(150deg, hsl(${photo.hue} 62% 88%), hsl(${(photo.hue + 40) % 360} 55% 68%))` }}
                    />
                    <div className="absolute inset-x-0 bottom-0 flex items-center gap-1 bg-gradient-to-t from-black/55 to-transparent px-2 py-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100">
                      <Heart className="size-3 fill-current" />
                      <span className="text-[11px] font-medium tabular-nums">{formatCompactNumber(photo.likes)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {(onShortlist || onPass) && (
          <div className="flex shrink-0 items-center gap-2 border-t border-border-hairline bg-surface-1 p-4">
            {onPass && (
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  onPass(influencer);
                  onClose();
                }}
              >
                <ThumbsDown className="size-4" /> Pass
              </Button>
            )}
            {onShortlist && (
              <Button
                className="flex-1"
                onClick={() => {
                  onShortlist(influencer);
                  onClose();
                }}
              >
                <ThumbsUp className="size-4" /> Shortlist
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
