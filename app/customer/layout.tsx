"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Compass } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { CampaignProvider } from "@/lib/campaign-context";
import { Sidebar, MobileSidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  if (status !== "authenticated") {
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
    <CampaignProvider>
      <div className="flex flex-1 bg-surface-0">
        <Sidebar />
        <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </CampaignProvider>
  );
}
