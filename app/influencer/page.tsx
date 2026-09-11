"use client";

import { Flame } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function InfluencerOverview() {
  const { session } = useAuth();
  const firstName = session?.name.split(" ")[0] ?? "there";

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center animate-fade-in">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-accent-soft text-accent-strong">
        <Flame className="size-7" />
      </div>
      <h1 className="text-[22px] font-semibold tracking-tight text-text-primary">Welcome, {firstName}</h1>
      <p className="max-w-sm text-[13.5px] text-text-secondary">
        The Influencer Portal is on its way — your collaborations, content submissions and payouts will show up here.
      </p>
    </div>
  );
}
