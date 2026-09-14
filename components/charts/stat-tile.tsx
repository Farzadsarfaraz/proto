"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { cn, formatCompactNumber, formatPercent } from "@/lib/utils";
import type { SeriesPoint } from "@/lib/types";
import { InfoTooltip } from "@/components/ui/info-tooltip";

interface StatTileProps {
  label: string;
  value: number;
  unit?: "number" | "percent" | "currency";
  delta?: number;
  goodDirection?: "up" | "down";
  series?: SeriesPoint[];
  info?: string;
  className?: string;
}

function formatValue(value: number, unit: StatTileProps["unit"]) {
  if (unit === "percent") return formatPercent(value);
  if (unit === "currency")
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
      value
    );
  return formatCompactNumber(value);
}

export function StatTile({ label, value, unit = "number", delta, goodDirection = "up", series, info, className }: StatTileProps) {
  const isPositive = (delta ?? 0) >= 0;
  const isGood = goodDirection === "up" ? isPositive : !isPositive;

  return (
    <div className={cn("flex flex-col gap-2.5 rounded-[var(--radius-lg)] border border-border-hairline bg-surface-1 p-5 shadow-[var(--shadow-sm)]", className)}>
      <div className="flex items-start justify-between gap-2">
        <span className="flex items-center gap-1 text-[13px] font-medium text-text-secondary">
          {label}
          {info && <InfoTooltip text={info} />}
        </span>
      </div>
      <div className="flex items-end justify-between gap-3">
        <span className="text-[28px] font-semibold leading-none tracking-tight text-text-primary">
          {formatValue(value, unit)}
        </span>
        {series && series.length > 1 && (
          <div className="h-9 w-20 shrink-0 opacity-90">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={isGood ? "var(--status-good)" : "var(--status-critical)"}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      {typeof delta === "number" && (
        <div className="flex items-center gap-1">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[12px] font-semibold",
              isGood ? "bg-status-good/10 text-status-good-text" : "bg-status-critical/10 text-status-critical"
            )}
          >
            {isPositive ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {formatPercent(Math.abs(delta))}
          </span>
          <span className="text-[12px] text-text-muted">vs previous period</span>
        </div>
      )}
    </div>
  );
}
