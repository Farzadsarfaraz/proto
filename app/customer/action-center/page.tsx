"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CheckSquare,
  Clock,
  FileText,
  Flame,
  Layers,
  MessageSquare,
  MessageSquareWarning,
  Send,
  Upload,
} from "lucide-react";
import { ACTION_COMPONENTS, BRIEFING_DOCS, CONTENT_REVIEW_ITEMS, INFLUENCERS } from "@/lib/mock-data";
import type { ActionComponent, BriefingDoc, ContentReviewItem, Influencer } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/lib/toast";
import { useInfluencerPreview } from "@/lib/influencer-preview";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { cn, formatCompactNumber, formatPercent, formatRelativeTime } from "@/lib/utils";

const icons: Record<ActionComponent["icon"], typeof Flame> = {
  swipe: Flame,
  layers: Layers,
  check: CheckSquare,
  upload: Upload,
};

function ComponentToggleRow({ component, onToggle }: { component: ActionComponent; onToggle: (id: string, v: boolean) => void }) {
  const Icon = icons[component.icon];
  return (
    <div className="flex items-center gap-4 rounded-[var(--radius-md)] border border-border-hairline bg-surface-1 p-4">
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)]",
          component.enabled ? "bg-accent-soft text-accent-strong" : "bg-surface-2 text-text-muted"
        )}
      >
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-[13.5px] font-semibold text-text-primary">{component.name}</p>
          <Badge tone={component.enabled ? "good" : "neutral"}>{component.enabled ? "Enabled" : "Disabled"}</Badge>
        </div>
        <p className="mt-0.5 text-[12.5px] text-text-muted">{component.description}</p>
      </div>
      <Switch checked={component.enabled} onChange={(v) => onToggle(component.id, v)} label={`Toggle ${component.name}`} />
    </div>
  );
}

interface CreatorSet {
  name: string;
  size: number;
  followerRange: string;
  focus: string;
  influencers: Influencer[];
}

function SetDetailModal({
  set,
  onClose,
  onUse,
  onViewInfluencer,
}: {
  set: CreatorSet | null;
  onClose: () => void;
  onUse: (set: CreatorSet) => void;
  onViewInfluencer: (influencer: Influencer) => void;
}) {
  return (
    <Modal open={Boolean(set)} onClose={onClose} title={set?.name ?? ""} description={set ? `${set.followerRange} followers · ${set.focus}` : undefined}>
      {set && (
        <>
          <div className="flex max-h-80 flex-col gap-1.5 overflow-y-auto pr-1">
            {set.influencers.map((inf) => (
              <button
                key={inf.id}
                onClick={() => onViewInfluencer(inf)}
                className="flex items-center gap-3 rounded-[var(--radius-sm)] p-2 text-left hover:bg-surface-hover"
              >
                <Avatar name={inf.name} src={inf.photoUrl} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-text-primary">{inf.name}</p>
                  <p className="text-[11.5px] text-text-muted">
                    {inf.platform} · {formatCompactNumber(inf.followers)} followers
                  </p>
                </div>
                <Badge tone="accent">{formatPercent(inf.engagementRate)} eng.</Badge>
              </button>
            ))}
          </div>
          <Button className="mt-4 w-full" onClick={() => onUse(set)}>
            Use this set for campaign
          </Button>
        </>
      )}
    </Modal>
  );
}

function SetSelectionSection() {
  const sets: CreatorSet[] = [
    { name: "Reach Boosters", size: 6, followerRange: "150k–500k", focus: "Awareness", influencers: INFLUENCERS.slice(0, 6) },
    { name: "Engagement Core", size: 5, followerRange: "40k–150k", focus: "Engagement", influencers: INFLUENCERS.slice(6, 11) },
    { name: "Conversion Specialists", size: 4, followerRange: "18k–80k", focus: "Conversion", influencers: INFLUENCERS.slice(11, 15) },
  ];
  const [viewingSet, setViewingSet] = useState<CreatorSet | null>(null);
  const { open: openInfluencerPreview } = useInfluencerPreview();
  const { push } = useToast();

  function handleUseSet(set: CreatorSet) {
    setViewingSet(null);
    push({ tone: "success", title: `${set.name} added`, description: `${set.size} creators added to your campaign roster.` });
  }

  return (
    <>
      <div id="sets" className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {sets.map((s) => (
          <Card key={s.name}>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-[13.5px] font-semibold text-text-primary">{s.name}</p>
                <Badge tone="accent">{s.size} creators</Badge>
              </div>
              <p className="mt-1 text-[12px] text-text-muted">{s.followerRange} followers · {s.focus}</p>
              <div className="mt-3 flex -space-x-2">
                {s.influencers.map((inf) => (
                  <Avatar key={inf.id} name={inf.name} src={inf.photoUrl} size={30} className="ring-2 ring-surface-1" />
                ))}
              </div>
              <Button size="sm" variant="secondary" className="mt-4 w-full" onClick={() => setViewingSet(s)}>
                Review set
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <SetDetailModal
        set={viewingSet}
        onClose={() => setViewingSet(null)}
        onUse={handleUseSet}
        onViewInfluencer={(inf) => {
          setViewingSet(null);
          openInfluencerPreview(inf);
        }}
      />
    </>
  );
}

function statusMeta(status: ContentReviewItem["status"]) {
  if (status === "approved") return { tone: "good" as const, label: "Approved" };
  if (status === "changes_requested") return { tone: "critical" as const, label: "Changes requested" };
  return { tone: "warning" as const, label: "Pending review" };
}

function CommentThread({ item, onAddComment }: { item: ContentReviewItem; onAddComment: (id: string, text: string) => void }) {
  const [text, setText] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onAddComment(item.id, text.trim());
    setText("");
  }

  return (
    <div className="border-t border-border-hairline bg-surface-2/60 px-4 py-3.5">
      <div className="flex flex-col gap-3">
        {item.comments.map((c) => (
          <div key={c.id} className="flex items-start gap-2.5">
            <Avatar name={c.author} size={26} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-1.5">
                <p className="text-[12.5px] font-medium text-text-primary">{c.author}</p>
                <p className="text-[11px] text-text-muted">{formatRelativeTime(new Date(c.at))}</p>
              </div>
              <p className="text-[12.5px] text-text-secondary">{c.text}</p>
            </div>
          </div>
        ))}
        {item.comments.length === 0 && <p className="text-[12px] text-text-muted">No comments yet.</p>}
      </div>
      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Leave feedback for your team…" className="h-9 text-[12.5px]" />
        <Button type="submit" size="sm" variant="secondary" disabled={!text.trim()}>
          <Send className="size-3.5" />
        </Button>
      </form>
    </div>
  );
}

function ContentReviewSection() {
  const [items, setItems] = useState(CONTENT_REVIEW_ITEMS);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { session } = useAuth();
  const { push } = useToast();

  function updateStatus(id: string, status: ContentReviewItem["status"]) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, status } : it)));
    const item = items.find((it) => it.id === id);
    push({
      tone: status === "approved" ? "success" : "info",
      title: status === "approved" ? "Content approved" : "Changes requested",
      description: item ? `${item.influencer}'s submission was updated.` : undefined,
    });
  }

  function addComment(id: string, text: string) {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? { ...it, comments: [...it.comments, { id: `${id}-c${Date.now()}`, author: session?.name ?? "You", text, at: new Date().toISOString() }] }
          : it
      )
    );
  }

  return (
    <div id="content" className="flex flex-col gap-3">
      {items.map((item) => {
        const meta = statusMeta(item.status);
        const isOpen = expanded === item.id;
        return (
          <div key={item.id} className="overflow-hidden rounded-[var(--radius-md)] border border-border-hairline bg-surface-1">
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="size-14 shrink-0 rounded-[10px]" style={{ background: `hsl(${item.thumbnailHue} 60% 90%)` }} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[13.5px] font-semibold text-text-primary">{item.influencer}</p>
                  <span className="text-[12px] text-text-muted">{item.platform}</span>
                  <Badge tone={meta.tone}>{meta.label}</Badge>
                </div>
                <p className="mt-0.5 truncate text-[12.5px] text-text-secondary">&ldquo;{item.caption}&rdquo;</p>
                <p className="mt-0.5 text-[11px] text-text-muted">
                  {item.campaign} · submitted {formatRelativeTime(new Date(item.submittedAt))}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => setExpanded(isOpen ? null : item.id)}
                  className="flex h-8 items-center gap-1.5 rounded-[var(--radius-sm)] px-2.5 text-[12.5px] font-medium text-text-secondary hover:bg-surface-hover"
                >
                  <MessageSquare className="size-3.5" /> {item.comments.length}
                </button>
                {item.status === "pending" && (
                  <>
                    <Button size="sm" variant="secondary" onClick={() => updateStatus(item.id, "changes_requested")}>
                      <MessageSquareWarning className="size-3.5" /> Request changes
                    </Button>
                    <Button size="sm" onClick={() => updateStatus(item.id, "approved")}>
                      <CheckCircle2 className="size-3.5" /> Approve
                    </Button>
                  </>
                )}
              </div>
            </div>
            {isOpen && <CommentThread item={item} onAddComment={addComment} />}
          </div>
        );
      })}
    </div>
  );
}

function briefingStatusMeta(status: BriefingDoc["status"]) {
  if (status === "current") return { tone: "good" as const, label: "Up to date", icon: CheckCircle2 };
  if (status === "outdated") return { tone: "warning" as const, label: "Needs update", icon: Clock };
  return { tone: "critical" as const, label: "Missing", icon: AlertTriangle };
}

const KNOWN_FILE_TYPES: BriefingDoc["fileType"][] = ["PDF", "DOCX", "FIGMA", "ZIP"];

function fileTypeFromName(name: string): BriefingDoc["fileType"] {
  const ext = name.split(".").pop()?.toUpperCase() ?? "";
  const match = KNOWN_FILE_TYPES.find((t) => t === ext || (ext === "DOC" && t === "DOCX"));
  return match ?? "PDF";
}

function AddDocumentModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (title: string, type: BriefingDoc["type"], file: File) => void;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<BriefingDoc["type"]>("Influencer Briefing");
  const [file, setFile] = useState<File | null>(null);
  const docTypes: BriefingDoc["type"][] = ["Influencer Briefing", "Campaign Manager Briefing", "Brand Book"];

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !file) return;
    onAdd(title.trim(), type, file);
    setTitle("");
    setFile(null);
  }

  return (
    <Modal open={open} onClose={onClose} title="Upload a new document" description="Add it to the briefing library for this campaign.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-text-primary">Title</label>
          <Input required placeholder="e.g. Aurora Glow — Shot List" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-text-primary">Type</label>
          <div className="flex flex-wrap gap-2">
            {docTypes.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  "rounded-[var(--radius-sm)] border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                  type === t ? "border-accent bg-accent-soft text-accent-strong" : "border-border-strong text-text-secondary hover:bg-surface-hover"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-text-primary">File</label>
          <label
            htmlFor="new-doc-file"
            className="flex h-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-[var(--radius-md)] border border-dashed border-border-strong text-center text-[12.5px] text-text-secondary transition-colors hover:border-accent hover:text-accent"
          >
            <Upload className="size-4.5" />
            <span className="truncate px-4">{file ? file.name : "Click to choose a file"}</span>
          </label>
          <input id="new-doc-file" type="file" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </div>
        <Button type="submit" disabled={!title.trim() || !file} className="mt-1">
          <Upload className="size-4" /> Upload document
        </Button>
      </form>
    </Modal>
  );
}

function BriefingUploadsSection() {
  const [docs, setDocs] = useState(BRIEFING_DOCS);
  const [addOpen, setAddOpen] = useState(false);
  const { session } = useAuth();
  const { push } = useToast();

  function handleReplace(docId: string, file: File) {
    const doc = docs.find((d) => d.id === docId);
    setDocs((prev) =>
      prev.map((d) =>
        d.id === docId
          ? {
              ...d,
              status: "current",
              fileType: fileTypeFromName(file.name),
              sizeKb: Math.max(1, Math.round(file.size / 1024)),
              updatedAt: new Date().toISOString(),
              uploadedBy: session?.name ?? "You",
            }
          : d
      )
    );
    push({ tone: "success", title: "Document uploaded", description: doc ? `${doc.title} is now up to date.` : undefined });
  }

  function handleAddDoc(title: string, type: BriefingDoc["type"], file: File) {
    const doc: BriefingDoc = {
      id: `brief-${Date.now()}`,
      title,
      type,
      fileType: fileTypeFromName(file.name),
      sizeKb: Math.max(1, Math.round(file.size / 1024)),
      updatedAt: new Date().toISOString(),
      uploadedBy: session?.name ?? "You",
      status: "current",
    };
    setDocs((prev) => [...prev, doc]);
    setAddOpen(false);
    push({ tone: "success", title: "Document added", description: `${title} was added to the briefing library.` });
  }

  return (
    <>
      <div id="briefing" className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {docs.map((doc) => {
          const meta = briefingStatusMeta(doc.status);
          const Icon = meta.icon;
          const inputId = `file-${doc.id}`;
          return (
            <div key={doc.id} className="flex items-center gap-3.5 rounded-[var(--radius-md)] border border-border-hairline bg-surface-1 p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-surface-2 text-text-secondary">
                <FileText className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-text-primary">{doc.title}</p>
                <p className="text-[11.5px] text-text-muted">
                  {doc.type}
                  {doc.status !== "missing" && ` · ${doc.fileType} · ${(doc.sizeKb / 1024).toFixed(1)} MB`}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Icon className={cn("size-4", meta.tone === "good" ? "text-status-good" : meta.tone === "warning" ? "text-status-warning" : "text-status-critical")} />
                <Badge tone={meta.tone}>{meta.label}</Badge>
                <input
                  id={inputId}
                  type="file"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleReplace(doc.id, file);
                    e.target.value = "";
                  }}
                />
                <label
                  htmlFor={inputId}
                  className="flex h-7 cursor-pointer items-center gap-1 rounded-[var(--radius-sm)] border border-border-strong px-2 text-[11.5px] font-medium text-text-secondary hover:bg-surface-hover"
                >
                  <Upload className="size-3" /> {doc.status === "missing" ? "Upload" : "Replace"}
                </label>
              </div>
            </div>
          );
        })}
      </div>
      <button
        onClick={() => setAddOpen(true)}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed border-border-strong p-4 text-[13px] font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent"
      >
        <Upload className="size-4" /> Upload a new document
      </button>
      <AddDocumentModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAddDoc} />
    </>
  );
}

export default function ActionCenterPage() {
  const [components, setComponents] = useState(ACTION_COMPONENTS);
  const { push } = useToast();

  function handleToggle(id: string, value: boolean) {
    setComponents((prev) => prev.map((c) => (c.id === id ? { ...c, enabled: value } : c)));
    const component = components.find((c) => c.id === id);
    if (component) push({ tone: "info", title: `${component.name} ${value ? "enabled" : "disabled"}` });
  }

  return (
    <div className="mx-auto max-w-6xl animate-fade-in">
      <PageHeader
        eyebrow="Take Action"
        title="Customer Action Center"
        description="Every actionable component your team can use for this campaign — enable or disable each one from campaign creation."
        info="Alles, was du selbst tun kannst: Influencer auswählen (Tinder oder fertige Sets), eingereichten Content freigeben oder Änderungen anfordern, und Briefing-Dokumente hochladen."
      />

      <section className="mb-9">
        <h2 className="mb-3 text-[15px] font-semibold text-text-primary">Campaign configuration</h2>
        <div className="grid grid-cols-1 gap-3">
          {components.map((c) => (
            <ComponentToggleRow key={c.id} component={c} onToggle={handleToggle} />
          ))}
        </div>
      </section>

      <section className="mb-9">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-text-primary">Influencer-Tinder</h2>
          <Link href="/customer/influencer-tinder" className="flex items-center gap-1 text-[12.5px] font-medium text-accent hover:underline">
            Open full view <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center sm:flex-row sm:text-left">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
              <Flame className="size-6" />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-text-primary">12 new AI-matched creators ready to review</p>
              <p className="mt-0.5 text-[12.5px] text-text-muted">Swipe right to shortlist, left to pass — build your set in minutes.</p>
            </div>
            <Link href="/customer/influencer-tinder">
              <Button>Start swiping</Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="mb-9">
        <h2 className="mb-3 text-[15px] font-semibold text-text-primary">Set selection</h2>
        <SetSelectionSection />
      </section>

      <section className="mb-9">
        <h2 className="mb-3 text-[15px] font-semibold text-text-primary">Content review</h2>
        <ContentReviewSection />
      </section>

      <section>
        <h2 className="mb-3 text-[15px] font-semibold text-text-primary">Briefing uploads</h2>
        <p className="mb-3 text-[12.5px] text-text-muted">Influencer Briefing, Campaign Manager Briefing and Brand Book — kept in one place.</p>
        <BriefingUploadsSection />
      </section>
    </div>
  );
}
