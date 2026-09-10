"use client";

import { DATE_RANGE_OPTIONS, type DateRangeDays } from "@/lib/use-campaign-metrics";
import { cn } from "@/lib/utils";

interface DateRangeFilterProps {
  value: DateRangeDays;
  onChange: (days: DateRangeDays) => void;
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  return (
    <div className="inline-flex items-center rounded-[var(--radius-sm)] border border-border-hairline bg-surface-1 p-0.5">
      {DATE_RANGE_OPTIONS.map((days) => (
        <button
          key={days}
          onClick={() => onChange(days)}
          className={cn(
            "rounded-[6px] px-3 py-1.5 text-[12.5px] font-medium transition-colors",
            value === days ? "bg-accent text-white" : "text-text-secondary hover:bg-surface-hover"
          )}
        >
          {days}d
        </button>
      ))}
    </div>
  );
}
