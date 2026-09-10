"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Laptop, Mail, Moon, Plus, Sun, Trash2, UserPlus } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useTheme, type ThemeChoice } from "@/lib/theme";
import { useToast } from "@/lib/toast";
import { TEAM_MEMBERS } from "@/lib/mock-data";
import type { TeamMember, TeamRole } from "@/lib/types";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "profile", label: "Profile" },
  { id: "team", label: "Team" },
  { id: "preferences", label: "Preferences" },
] as const;
type TabId = (typeof TABS)[number]["id"];

function ProfileTab() {
  const { session, updateSession } = useAuth();
  const { push } = useToast();
  const [name, setName] = useState(session?.name ?? "");
  const [email, setEmail] = useState(session?.email ?? "");
  const [company, setCompany] = useState(session?.company ?? "");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    updateSession({ name, email, company });
    push({ tone: "success", title: "Profile updated", description: "Your changes have been saved." });
  }

  if (!session) return null;

  return (
    <Card>
      <CardContent>
        <div className="flex items-center gap-4">
          <Avatar name={name || session.name} size={56} />
          <div>
            <p className="text-[13.5px] font-semibold text-text-primary">{session.role}</p>
            <p className="text-[12.5px] text-text-muted">{session.company}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-text-primary">Full name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-text-primary">Work email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5 sm:max-w-sm">
            <label className="text-[13px] font-medium text-text-primary">Company</label>
            <Input value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
          <div>
            <Button type="submit" className="mt-1">
              Save changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

const roleTone: Record<TeamRole, "accent" | "neutral"> = { Owner: "accent", Editor: "neutral", Viewer: "neutral" };

function InviteModal({ open, onClose, onInvite }: { open: boolean; onClose: () => void; onInvite: (email: string, role: TeamRole) => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>("Editor");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    onInvite(email.trim(), role);
    setEmail("");
    setRole("Editor");
  }

  return (
    <Modal open={open} onClose={onClose} title="Invite team member" description="They'll get access to this customer portal.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-text-primary">Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
            <Input type="email" required placeholder="teammate@company.com" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-text-primary">Role</label>
          <div className="flex gap-2">
            {(["Editor", "Viewer"] as TeamRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={cn(
                  "flex-1 rounded-[var(--radius-sm)] border px-3 py-2 text-[13px] font-medium transition-colors",
                  role === r ? "border-accent bg-accent-soft text-accent-strong" : "border-border-strong text-text-secondary hover:bg-surface-hover"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <Button type="submit" className="mt-1">
          <UserPlus className="size-4" /> Send invite
        </Button>
      </form>
    </Modal>
  );
}

function TeamTab() {
  const [members, setMembers] = useState<TeamMember[]>(TEAM_MEMBERS);
  const [inviteOpen, setInviteOpen] = useState(false);
  const { push } = useToast();

  function handleInvite(email: string, role: TeamRole) {
    const member: TeamMember = { id: `tm-${Date.now()}`, name: email.split("@")[0], email, role, status: "invited" };
    setMembers((prev) => [...prev, member]);
    setInviteOpen(false);
    push({ tone: "success", title: "Invitation sent", description: `${email} will receive an email to join.` });
  }

  function removeMember(id: string) {
    const member = members.find((m) => m.id === id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
    if (member) push({ tone: "info", title: "Member removed", description: `${member.name} no longer has access.` });
  }

  return (
    <>
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-[13.5px] font-semibold text-text-primary">Team members ({members.length})</p>
            <Button size="sm" onClick={() => setInviteOpen(true)}>
              <Plus className="size-3.5" /> Invite
            </Button>
          </div>
          <div className="mt-4 flex flex-col divide-y divide-border-hairline">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-3 py-3">
                <Avatar name={m.name} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[13px] font-medium text-text-primary">{m.name}</p>
                    {m.status === "invited" && <Badge tone="warning">Invited</Badge>}
                  </div>
                  <p className="truncate text-[12px] text-text-muted">{m.email}</p>
                </div>
                <Badge tone={roleTone[m.role]}>{m.role}</Badge>
                {m.role !== "Owner" && (
                  <button
                    onClick={() => removeMember(m.id)}
                    className="flex size-8 shrink-0 items-center justify-center rounded-full text-text-muted hover:bg-status-critical/10 hover:text-status-critical"
                    aria-label={`Remove ${m.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} onInvite={handleInvite} />
    </>
  );
}

const themeOptions: { id: ThemeChoice; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Laptop },
];

function PreferencesTab() {
  const { theme, setTheme } = useTheme();
  const [notifPrefs, setNotifPrefs] = useState({
    matches: true,
    content: true,
    budget: true,
    weeklyDigest: false,
  });

  function toggle(key: keyof typeof notifPrefs) {
    setNotifPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardContent>
          <p className="text-[13.5px] font-semibold text-text-primary">Appearance</p>
          <p className="mt-0.5 text-[12.5px] text-text-muted">Choose how Octagone looks on this device.</p>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:max-w-md">
            {themeOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-[var(--radius-md)] border px-3 py-3.5 text-[12.5px] font-medium transition-colors",
                  theme === opt.id ? "border-accent bg-accent-soft text-accent-strong" : "border-border-strong text-text-secondary hover:bg-surface-hover"
                )}
              >
                <opt.icon className="size-4.5" />
                {opt.label}
                {theme === opt.id && <Check className="size-3.5" />}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <p className="text-[13.5px] font-semibold text-text-primary">Notifications</p>
          <p className="mt-0.5 text-[12.5px] text-text-muted">Choose what shows up in your notification bell.</p>
          <div className="mt-4 flex flex-col divide-y divide-border-hairline">
            {[
              { key: "matches" as const, label: "New Influencer-Tinder matches", desc: "When AI finds new creators worth reviewing." },
              { key: "content" as const, label: "Content review updates", desc: "Submissions, approvals and requested changes." },
              { key: "budget" as const, label: "Budget alerts", desc: "When a campaign nears or exceeds its budget pace." },
              { key: "weeklyDigest" as const, label: "Weekly performance digest", desc: "A Monday summary across all campaigns." },
            ].map((row) => (
              <div key={row.key} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-[13px] font-medium text-text-primary">{row.label}</p>
                  <p className="text-[12px] text-text-muted">{row.desc}</p>
                </div>
                <Switch checked={notifPrefs[row.key]} onChange={() => toggle(row.key)} label={row.label} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as TabId | null) ?? "profile";
  const [tab, setTab] = useState<TabId>(TABS.some((t) => t.id === initialTab) ? initialTab : "profile");

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <PageHeader title="Settings" description="Manage your profile, team access and portal preferences." />

      <div className="mb-6 flex gap-1 border-b border-border-hairline">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "relative px-3 pb-3 text-[13.5px] font-medium transition-colors",
              tab === t.id ? "text-text-primary" : "text-text-muted hover:text-text-secondary"
            )}
          >
            {t.label}
            {tab === t.id && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent" />}
          </button>
        ))}
      </div>

      {tab === "profile" && <ProfileTab />}
      {tab === "team" && <TeamTab />}
      {tab === "preferences" && <PreferencesTab />}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsContent />
    </Suspense>
  );
}
