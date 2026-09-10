import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "accent" | "good" | "warning" | "critical" | "serious";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-surface-2 text-text-secondary border-border-hairline",
  accent: "bg-accent-soft text-accent-strong border-accent-soft-border",
  good: "bg-status-good/10 text-status-good-text border-status-good/20",
  warning: "bg-status-warning/15 text-text-primary border-status-warning/30",
  serious: "bg-status-serious/15 text-text-primary border-status-serious/30",
  critical: "bg-status-critical/10 text-status-critical border-status-critical/25",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[12px] font-medium leading-5",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
