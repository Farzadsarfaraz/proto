"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Compass } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { PORTAL_HOME } from "@/lib/portal";
import { MinimalTopbar } from "@/components/layout/minimal-topbar";

export default function InfluencerLayout({ children }: { children: React.ReactNode }) {
  const { status, session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (status === "authenticated" && session && session.portal !== "influencer") {
      router.replace(PORTAL_HOME[session.portal]);
    }
  }, [status, session, router]);

  if (status !== "authenticated" || session?.portal !== "influencer") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-surface-0">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-accent text-white animate-pulse-dot">
          <Compass className="size-6" />
        </div>
        <p className="text-sm text-text-muted">Loading your portal…</p>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-surface-0">
      <MinimalTopbar portalLabel="Influencer Portal" />
      <main className="flex flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
