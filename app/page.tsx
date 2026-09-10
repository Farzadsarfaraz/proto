"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Compass } from "lucide-react";

export default function RootGate() {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") router.replace("/customer");
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-surface-0">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-accent text-white animate-pulse-dot">
        <Compass className="size-6" />
      </div>
      <p className="text-sm text-text-muted">Loading Octagone…</p>
    </div>
  );
}
