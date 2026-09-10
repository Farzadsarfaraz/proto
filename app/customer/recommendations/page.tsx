"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Gauge,
  Lightbulb,
  MessageCircle,
  Radar,
  Send,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users2,
} from "lucide-react";
import { RECOMMENDATIONS, SIMILAR_CAMPAIGNS, TRENDS } from "@/lib/mock-data";
import { useCampaign } from "@/lib/campaign-context";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { cn, formatCompactNumber, formatPercent } from "@/lib/utils";

const effortTone = { Low: "good", Medium: "warning", High: "critical" } as const;

function MarketPulseRow() {
  const items = [
    { label: "Avg. category engagement rate", value: "5.1%", icon: Gauge },
    { label: "Avg. category CTR", value: "1.6%", icon: TrendingUp },
    { label: "Creators active in Skincare (EU)", value: "3,200+", icon: Users2 },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-border-hairline bg-surface-1 p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-accent-soft text-accent-strong">
            <it.icon className="size-5" />
          </div>
          <div>
            <p className="text-[16px] font-semibold text-text-primary">{it.value}</p>
            <p className="text-[12px] text-text-muted">{it.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function TrendsList() {
  return (
    <div className="flex flex-col gap-3">
      {TRENDS.map((t) => {
        const isUp = t.momentum >= 0;
        return (
          <div key={t.id} className="flex items-center gap-3 rounded-[var(--radius-md)] border border-border-hairline bg-surface-1 p-3.5">
            <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", isUp ? "bg-status-good/10 text-status-good-text" : "bg-status-critical/10 text-status-critical")}>
              {isUp ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-text-primary">{t.label}</p>
              <p className="text-[11.5px] text-text-muted">{t.category} · volume score {t.volume}</p>
            </div>
            <Badge tone={isUp ? "good" : "critical"}>
              {isUp ? "+" : ""}
              {t.momentum}%
            </Badge>
          </div>
        );
      })}
    </div>
  );
}

function SimilarCampaignsTable() {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-border-hairline">
      <table className="w-full min-w-[560px] text-left text-[13px]">
        <thead>
          <tr className="border-b border-border-hairline bg-surface-2 text-[11.5px] uppercase tracking-wide text-text-muted">
            <th className="px-4 py-2.5 font-medium">Industry (anonymised)</th>
            <th className="px-4 py-2.5 font-medium">Objective</th>
            <th className="px-4 py-2.5 font-medium">Reach</th>
            <th className="px-4 py-2.5 font-medium">Engagement</th>
            <th className="px-4 py-2.5 font-medium">CTR</th>
            <th className="px-4 py-2.5 font-medium">Budget band</th>
          </tr>
        </thead>
        <tbody>
          {SIMILAR_CAMPAIGNS.map((c) => (
            <tr key={c.id} className="border-b border-border-hairline last:border-0">
              <td className="px-4 py-3 font-medium text-text-primary">{c.industry}</td>
              <td className="px-4 py-3 text-text-secondary">{c.objective}</td>
              <td className="px-4 py-3 tabular-nums text-text-secondary">{formatCompactNumber(c.reach)}</td>
              <td className="px-4 py-3 tabular-nums text-text-secondary">{formatPercent(c.engagementRate)}</td>
              <td className="px-4 py-3 tabular-nums text-text-secondary">{formatPercent(c.ctr)}</td>
              <td className="px-4 py-3 text-text-secondary">{c.budgetBand}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RecommendationCards() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {RECOMMENDATIONS.map((r) => (
        <Card key={r.id}>
          <CardContent>
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-accent-soft text-accent-strong">
                <Lightbulb className="size-[18px]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-semibold leading-snug text-text-primary">{r.title}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <Badge tone={effortTone[r.effort]}>{r.effort} effort</Badge>
                  <Badge tone="accent">{r.confidence}% confidence</Badge>
                  {r.platforms.map((p) => (
                    <Badge key={p}>{p}</Badge>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-3 text-[12.5px] leading-relaxed text-text-secondary">{r.rationale}</p>
            <div className="mt-3 flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-status-good/10 px-3 py-1.5 text-[12px] font-medium text-status-good-text">
              <TrendingUp className="size-3.5" /> Expected impact: {r.expectedImpact}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ContactRepresentativeCard({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-accent-soft-border bg-accent-soft p-6 text-center sm:text-left">
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent text-white">
          <MessageCircle className="size-6" />
        </div>
        <div className="flex-1">
          <p className="text-[14.5px] font-semibold text-text-primary">Interested in one of these ideas?</p>
          <p className="mt-0.5 text-[13px] text-text-secondary">
            Talk it through with your Octagone account manager — they can scope timeline, budget and creator fit.
          </p>
        </div>
        <Button onClick={onOpen} className="shrink-0">
          <Send className="size-4" /> Contact representative
        </Button>
      </div>
    </div>
  );
}

export default function RecommendationsPage() {
  const { campaign } = useCampaign();
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");

  function handleSend() {
    setSent(true);
  }

  function handleClose() {
    setOpen(false);
    setTimeout(() => {
      setSent(false);
      setMessage("");
    }, 300);
  }

  return (
    <div className="mx-auto max-w-6xl animate-fade-in">
      <PageHeader
        eyebrow="Take Action"
        title="Customer Recommendation Center"
        description="Social listening, trends and anonymised benchmark campaigns, distilled into AI-backed ideas for your next move."
      />

      <section className="mb-9">
        <h2 className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-text-primary">
          <Radar className="size-4 text-accent" /> Market pulse
        </h2>
        <MarketPulseRow />
      </section>

      <div className="mb-9 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-[15px] font-semibold text-text-primary">Social listening & trends</h2>
          <TrendsList />
        </section>
        <section>
          <h2 className="mb-3 text-[15px] font-semibold text-text-primary">Anonymised similar campaigns</h2>
          <SimilarCampaignsTable />
        </section>
      </div>

      <section className="mb-9">
        <h2 className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-text-primary">
          <Sparkles className="size-4 text-accent" /> AI recommendations for {campaign.name}
        </h2>
        <RecommendationCards />
      </section>

      <section>
        <ContactRepresentativeCard onOpen={() => setOpen(true)} />
      </section>

      <Modal open={open} onClose={handleClose} title="Contact your representative" description={`Regarding ${campaign.name}`}>
        {sent ? (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <CheckCircle2 className="size-8 text-status-good" />
            <p className="text-[14px] font-semibold text-text-primary">Message sent</p>
            <p className="text-[13px] text-text-muted">Your account manager will follow up within one business day.</p>
            <Button variant="secondary" className="mt-3" onClick={handleClose}>
              Close
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <Textarea
              rows={4}
              placeholder="Tell us which idea you'd like to explore, and any timing constraints…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button onClick={handleSend} disabled={message.trim().length === 0}>
              <Send className="size-4" /> Send message
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
