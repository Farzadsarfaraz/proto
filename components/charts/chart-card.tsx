import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  legend?: ReactNode;
}

export function ChartCard({ title, description, action, children, className, legend }: ChartCardProps) {
  return (
    <div className={cn("rounded-[var(--radius-lg)] border border-border-hairline bg-surface-1 p-5 shadow-[var(--shadow-sm)]", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
          {description && <p className="mt-0.5 text-[13px] text-text-muted">{description}</p>}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
      {legend && <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">{legend}</div>}
    </div>
  );
}

export function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-text-secondary">
      <span className="inline-block size-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
