"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Compass, Flame, Loader2, Lock, Mail, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { PORTAL_HOME } from "@/lib/portal";
import type { PortalRole } from "@/lib/portal";
import { PORTAL_PROFILES } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FacebookIcon, GoogleIcon, InstagramIcon, MicrosoftIcon } from "@/components/icons/brand-icons";
import { OAuthMockModal, type OAuthProvider } from "@/components/login/oauth-mock-modal";

const SOCIAL_PROVIDERS: OAuthProvider[] = [
  { id: "google", label: "Google", icon: GoogleIcon, accent: "#1a73e8" },
  { id: "microsoft", label: "Microsoft", icon: MicrosoftIcon, accent: "#0067b8" },
  { id: "facebook", label: "Facebook", icon: FacebookIcon, accent: "#1877f2" },
  { id: "instagram", label: "Instagram", icon: InstagramIcon, accent: "#e1306c" },
];

const DEMO_PASSWORD = "demo-1234";

const PORTAL_OPTIONS: { value: PortalRole; label: string; icon: typeof Users }[] = [
  { value: "customer", label: "Customer", icon: Users },
  { value: "influencer", label: "Influencer", icon: Flame },
];

const DEFAULT_PORTAL: PortalRole = "customer";

export default function LoginPage() {
  const { status, session, login } = useAuth();
  const router = useRouter();
  const [portal, setPortal] = useState<PortalRole>(DEFAULT_PORTAL);
  const [email, setEmail] = useState(PORTAL_PROFILES[DEFAULT_PORTAL].email);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState<OAuthProvider | null>(null);
  const [oauthLoading, setOauthLoading] = useState(false);

  const PortalIcon = PORTAL_OPTIONS.find((p) => p.value === portal)!.icon;

  useEffect(() => {
    if (status === "authenticated" && session) router.replace(PORTAL_HOME[session.portal]);
  }, [status, session, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("That email doesn't look right — double-check it.");
      return;
    }
    if (password.length < 4) {
      setError("Password needs at least 4 characters.");
      return;
    }
    setLoading(true);
    try {
      await login(email, portal);
      router.replace(PORTAL_HOME[portal]);
    } finally {
      setLoading(false);
    }
  }

  function handlePortalChange(next: PortalRole) {
    setPortal(next);
    setEmail(PORTAL_PROFILES[next].email);
    setPassword(DEMO_PASSWORD);
  }

  // No real OAuth here — this is a demo environment, so "continuing with" a
  // provider opens a look-alike sign-in screen for that provider instead of
  // actually redirecting anywhere. Confirming on it signs in as the
  // currently selected portal's demo account.
  async function handleOAuthContinue() {
    if (!activeProvider) return;
    setOauthLoading(true);
    try {
      await login(PORTAL_PROFILES[portal].email, portal);
      router.replace(PORTAL_HOME[portal]);
    } finally {
      setOauthLoading(false);
      setActiveProvider(null);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden bg-surface-0 px-4 py-12">
      {/* Ambient background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: "radial-gradient(var(--gridline) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage: "radial-gradient(ellipse 65% 55% at 50% 38%, black 35%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 65% 55% at 50% 38%, black 35%, transparent 100%)",
          }}
        />
        <div className="absolute -left-32 -top-40 size-[34rem] rounded-full bg-accent/20 blur-[110px]" />
        <div className="absolute -right-40 top-1/4 size-[30rem] rounded-full bg-[var(--series-7)]/20 blur-[110px]" />
        <div className="absolute -bottom-40 left-1/3 size-[26rem] rounded-full bg-[var(--series-2)]/15 blur-[100px]" />
      </div>

      {/* Portal switcher — top-right corner, outside the card */}
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <div className="relative">
          <label htmlFor="portal" className="sr-only">
            Portal
          </label>
          <PortalIcon className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-text-muted" />
          <select
            id="portal"
            value={portal}
            onChange={(e) => handlePortalChange(e.target.value as PortalRole)}
            className="h-9 appearance-none rounded-full border border-border-hairline bg-surface-1/90 py-1.5 pl-8 pr-8 text-[12.5px] font-medium text-text-primary shadow-[var(--shadow-sm)] backdrop-blur-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            {PORTAL_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-text-muted" />
        </div>
      </div>

      <div className="relative w-full max-w-[400px]">
        <div className="mb-7 flex flex-col items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-accent text-white shadow-[var(--shadow-md)]">
            <Compass className="size-6" />
          </div>
          <Badge tone="accent">Demo environment</Badge>
        </div>

        <div className="rounded-[var(--radius-xl)] border border-border-hairline bg-surface-1/90 p-7 shadow-[var(--shadow-lg)] backdrop-blur-xl sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-[23px] font-semibold tracking-tight text-text-primary">Sign in to Octagone</h1>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-text-secondary">
              Pick your portal — we&apos;ll fill in a demo login for you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[13px] font-medium text-text-primary">
                Work email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-[13px] font-medium text-text-primary">
                  Password
                </label>
                <span className="text-[12px] text-text-muted">Any password works here</span>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-[var(--radius-sm)] border border-status-critical/25 bg-status-critical/10 px-3 py-2 text-[13px] text-status-critical">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" disabled={loading} className="mt-1 w-full">
              {loading ? <Loader2 className="size-4 animate-spin" /> : null}
              {loading ? "Taking you there…" : "Sign in"}
            </Button>

            <div className="relative my-1 flex items-center gap-3 text-[11px] uppercase tracking-wide text-text-muted">
              <div className="h-px flex-1 bg-border-hairline" />
              or continue with
              <div className="h-px flex-1 bg-border-hairline" />
            </div>

            <div className="grid grid-cols-4 gap-2">
              {SOCIAL_PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  disabled={loading}
                  onClick={() => setActiveProvider(p)}
                  aria-label={`Continue with ${p.label}`}
                  className="flex h-11 items-center justify-center rounded-[var(--radius-md)] border border-border-strong bg-surface-1 transition-colors hover:bg-surface-hover disabled:pointer-events-none disabled:opacity-50"
                >
                  <p.icon className="size-5" />
                </button>
              ))}
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-[12.5px] text-text-muted">
          Need access? Ask your Octagone contact.
        </p>
      </div>

      <OAuthMockModal
        provider={activeProvider}
        profileName={PORTAL_PROFILES[portal].name}
        profileEmail={PORTAL_PROFILES[portal].email}
        loading={oauthLoading}
        onCancel={() => setActiveProvider(null)}
        onContinue={handleOAuthContinue}
      />
    </div>
  );
}
