"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  CheckSquare,
  Flame,
  Layers,
  Sparkles,
  Upload,
} from "lucide-react";
import { useCampaign } from "@/lib/campaign-context";
import { useToast } from "@/lib/toast";
import { ACTION_COMPONENTS } from "@/lib/mock-data";
import type { ActionComponent, Campaign, Platform } from "@/lib/types";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn, formatCurrency } from "@/lib/utils";

const STEPS = ["Basics", "Platforms & budget", "Action Center", "Review"] as const;
const PLATFORMS: Platform[] = ["Instagram", "TikTok", "YouTube", "Pinterest", "X"];
const OBJECTIVES: Campaign["objective"][] = ["Awareness", "Engagement", "Traffic", "Conversion"];

const icons: Record<ActionComponent["icon"], typeof Flame> = {
  swipe: Flame,
  layers: Layers,
  check: CheckSquare,
  upload: Upload,
};

function todayPlus(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function NewCampaignPage() {
  const router = useRouter();
  const { addCampaign } = useCampaign();
  const { push } = useToast();
  const [step, setStep] = useState(0);

  const [name, setName] = useState("");
  const [objective, setObjective] = useState<Campaign["objective"]>("Awareness");
  const [platforms, setPlatforms] = useState<Platform[]>(["Instagram"]);
  const [budget, setBudget] = useState("25000");
  const [influencerCount, setInfluencerCount] = useState("10");
  const [startDate, setStartDate] = useState(todayPlus(7));
  const [endDate, setEndDate] = useState(todayPlus(60));
  const [reportingDate, setReportingDate] = useState(todayPlus(67));
  const [components, setComponents] = useState(ACTION_COMPONENTS);

  function togglePlatform(p: Platform) {
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  }

  function toggleComponent(id: string, enabled: boolean) {
    setComponents((prev) => prev.map((c) => (c.id === id ? { ...c, enabled } : c)));
  }

  const canProceed = step === 0 ? name.trim().length > 0 : step === 1 ? platforms.length > 0 : true;

  function handleCreate() {
    const campaign: Campaign = {
      id: `cmp-${Date.now()}`,
      name: name.trim(),
      status: "scheduled",
      platforms,
      startDate,
      endDate,
      reportingDate,
      budget: Number(budget) || 0,
      influencerCount: Number(influencerCount) || 0,
      objective,
    };
    addCampaign(campaign);
    push({ tone: "success", title: "Campaign created", description: `${campaign.name} is ready in your dashboards.` });
    router.push("/customer");
  }

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <PageHeader
        eyebrow="Take Action"
        title="New campaign"
        description="Set the basics, then choose which Action Center tools are on."
        info="Eine neue Kampagne anlegen: Name, Ziel, Plattformen, Budget und Zeitraum — plus welche Action-Center-Tools (Tinder, Set Selection, Content Review, Briefings) von Anfang an aktiv sein sollen."
      />

      <div className="mb-7 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold transition-colors",
                i < step ? "bg-accent text-white" : i === step ? "bg-accent-soft text-accent-strong ring-2 ring-accent" : "bg-surface-2 text-text-muted"
              )}
            >
              {i < step ? <Check className="size-3.5" /> : i + 1}
            </div>
            <span className={cn("hidden text-[12.5px] font-medium sm:block", i === step ? "text-text-primary" : "text-text-muted")}>{label}</span>
            {i < STEPS.length - 1 && <div className={cn("h-px flex-1", i < step ? "bg-accent" : "bg-border-hairline")} />}
          </div>
        ))}
      </div>

      <Card>
        <CardContent>
          {step === 0 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-text-primary">Campaign name</label>
                <Input autoFocus placeholder="e.g. Winter Glow Edit" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-text-primary">Primary objective</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {OBJECTIVES.map((o) => (
                    <button
                      key={o}
                      onClick={() => setObjective(o)}
                      className={cn(
                        "rounded-[var(--radius-sm)] border px-3 py-2 text-[13px] font-medium transition-colors",
                        objective === o ? "border-accent bg-accent-soft text-accent-strong" : "border-border-strong text-text-secondary hover:bg-surface-hover"
                      )}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                  <label className="flex items-center gap-1.5 text-[13px] font-medium text-text-primary">
                    <Calendar className="size-3.5" /> Start date
                  </label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="flex items-center gap-1.5 text-[13px] font-medium text-text-primary">
                    <Calendar className="size-3.5" /> End date
                  </label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="flex items-center gap-1.5 text-[13px] font-medium text-text-primary">
                    <Calendar className="size-3.5" /> Reporting date
                  </label>
                  <Input type="date" value={reportingDate} onChange={(e) => setReportingDate(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-text-primary">Platforms</label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p}
                      onClick={() => togglePlatform(p)}
                      className={cn(
                        "rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                        platforms.includes(p) ? "border-accent bg-accent-soft text-accent-strong" : "border-border-strong text-text-secondary hover:bg-surface-hover"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-text-primary">Budget (EUR)</label>
                  <Input type="number" min={0} step={500} value={budget} onChange={(e) => setBudget(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-text-primary">Target influencer count</label>
                  <Input type="number" min={1} value={influencerCount} onChange={(e) => setInfluencerCount(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-3">
              <p className="text-[13px] text-text-secondary">Toggle which actionable components your team can use once this campaign is live.</p>
              {components.map((c) => {
                const Icon = icons[c.icon];
                return (
                  <div key={c.id} className="flex items-center gap-3.5 rounded-[var(--radius-md)] border border-border-hairline p-3.5">
                    <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)]", c.enabled ? "bg-accent-soft text-accent-strong" : "bg-surface-2 text-text-muted")}>
                      <Icon className="size-[18px]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-text-primary">{c.name}</p>
                      <p className="text-[12px] text-text-muted">{c.description}</p>
                    </div>
                    <Switch checked={c.enabled} onChange={(v) => toggleComponent(c.id, v)} label={`Toggle ${c.name}`} />
                  </div>
                );
              })}
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 rounded-[var(--radius-sm)] bg-accent-soft px-3.5 py-2.5 text-[13px] text-accent-strong">
                <Sparkles className="size-4" /> Ready to create — review before you confirm.
              </div>
              <dl className="grid grid-cols-2 gap-y-3.5 text-[13px] sm:grid-cols-3">
                <div>
                  <dt className="text-[11.5px] uppercase tracking-wide text-text-muted">Name</dt>
                  <dd className="font-medium text-text-primary">{name || "—"}</dd>
                </div>
                <div>
                  <dt className="text-[11.5px] uppercase tracking-wide text-text-muted">Objective</dt>
                  <dd className="font-medium text-text-primary">{objective}</dd>
                </div>
                <div>
                  <dt className="text-[11.5px] uppercase tracking-wide text-text-muted">Platforms</dt>
                  <dd className="font-medium text-text-primary">{platforms.join(", ") || "—"}</dd>
                </div>
                <div>
                  <dt className="text-[11.5px] uppercase tracking-wide text-text-muted">Budget</dt>
                  <dd className="font-medium text-text-primary">{formatCurrency(Number(budget) || 0)}</dd>
                </div>
                <div>
                  <dt className="text-[11.5px] uppercase tracking-wide text-text-muted">Influencers</dt>
                  <dd className="font-medium text-text-primary">{influencerCount}</dd>
                </div>
                <div>
                  <dt className="text-[11.5px] uppercase tracking-wide text-text-muted">Reporting date</dt>
                  <dd className="font-medium text-text-primary">{reportingDate}</dd>
                </div>
              </dl>
              <div>
                <dt className="mb-1.5 text-[11.5px] uppercase tracking-wide text-text-muted">Action Center</dt>
                <div className="flex flex-wrap gap-1.5">
                  {components.map((c) => (
                    <span
                      key={c.id}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[12px] font-medium",
                        c.enabled ? "border-accent-soft-border bg-accent-soft text-accent-strong" : "border-border-hairline text-text-muted"
                      )}
                    >
                      {c.name} · {c.enabled ? "on" : "off"}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-5 flex items-center justify-between">
        <Button variant="secondary" onClick={() => (step === 0 ? router.push("/customer") : setStep((s) => s - 1))}>
          <ArrowLeft className="size-4" /> {step === 0 ? "Cancel" : "Back"}
        </Button>
        {step < STEPS.length - 1 ? (
          <Button disabled={!canProceed} onClick={() => setStep((s) => s + 1)}>
            Next <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button onClick={handleCreate}>
            <Sparkles className="size-4" /> Create campaign
          </Button>
        )}
      </div>
    </div>
  );
}
