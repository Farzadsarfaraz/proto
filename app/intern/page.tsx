"use client";

import { Briefcase } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function InternOverview() {
  const { session } = useAuth();
  const firstName = session?.name.split(" ")[0] ?? "there";

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center animate-fade-in">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-accent-soft text-accent-strong">
        <Briefcase className="size-7" />
      </div>
      <h1 className="text-[22px] font-semibold tracking-tight text-text-primary">Welcome, {firstName}</h1>
      <p className="max-w-sm text-[13.5px] text-text-secondary">
        The internal team portal is on its way — cross-campaign tools for managing customers and creators will show up here.
      </p>
    </div>
  );
}
