"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, Compass, Flame, Loader2, Lightbulb, Lock, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const highlights = [
  { icon: BarChart3, text: "Live campaign dashboards, refreshed automatically" },
  { icon: Flame, text: "Swipe-to-shortlist Influencer-Tinder matching" },
  { icon: Lightbulb, text: "AI recommendations from market & trend signals" },
];

export default function LoginPage() {
  const { status, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("lena.brandt@nordlicht-skincare.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") router.replace("/customer");
  }, [status, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 4) {
      setError("Enter your password (demo: any 4+ characters).");
      return;
    }
    setLoading(true);
    try {
      await login(email);
      router.replace("/customer");
    } finally {
      setLoading(false);
    }
  }

  async function handleDemo() {
    setError(null);
    setLoading(true);
    try {
      await login("lena.brandt@nordlicht-skincare.com");
      router.replace("/customer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-1 bg-surface-0">
      {/* Brand panel */}
      <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-[radial-gradient(120%_120%_at_0%_0%,#1c5cab_0%,#0d366b_60%,#0b2450_100%)] p-10 text-white lg:flex xl:p-14">
        <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 size-96 rounded-full bg-[var(--series-7)]/30 blur-3xl" />

        <div className="relative flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-[10px] bg-white/15 backdrop-blur-sm">
            <Compass className="size-5" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight">Octagone</span>
        </div>

        <div className="relative flex flex-col gap-8">
          <div>
            <h1 className="max-w-md text-[32px] font-semibold leading-tight tracking-tight xl:text-[38px]">
              Run influencer campaigns with total clarity.
            </h1>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-white/70">
              One customer portal for monitoring, reporting, creator selection and AI-backed
              recommendations — built for marketing teams who move fast.
            </p>
          </div>
          <div className="flex flex-col gap-3.5">
            {highlights.map((h) => (
              <div key={h.text} className="flex items-center gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <h.icon className="size-4" />
                </div>
                <span className="text-[13.5px] text-white/85">{h.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-2 text-[12.5px] text-white/50">
          <ShieldCheck className="size-4" />
          SOC 2-style access controls · Demo environment
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex size-9 items-center justify-center rounded-[10px] bg-accent text-white">
              <Compass className="size-5" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-text-primary">Octagone</span>
          </div>

          <div className="mb-7">
            <h2 className="text-[22px] font-semibold tracking-tight text-text-primary">Welcome back</h2>
            <p className="mt-1.5 text-[13.5px] text-text-secondary">
              Sign in to your customer portal to view campaign performance.
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
                <span className="text-[12px] text-text-muted">Demo: any password</span>
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
              {loading ? "Signing in…" : "Sign in"}
            </Button>

            <div className="relative my-1 flex items-center gap-3 text-[11px] uppercase tracking-wide text-text-muted">
              <div className="h-px flex-1 bg-border-hairline" />
              or
              <div className="h-px flex-1 bg-border-hairline" />
            </div>

            <Button
              type="button"
              variant="secondary"
              size="lg"
              disabled={loading}
              onClick={handleDemo}
              className={cn("w-full")}
            >
              <Sparkles className="size-4 text-accent" />
              Continue with demo account
            </Button>
          </form>

          <p className="mt-8 text-center text-[12.5px] text-text-muted">
            Trouble signing in? Contact your Octagone account manager.
          </p>
        </div>
      </div>
    </div>
  );
}
