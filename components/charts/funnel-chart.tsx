import { formatCompactNumber, formatPercent } from "@/lib/utils";

export interface FunnelStage {
  label: string;
  value: number;
}

// Ordinal sequential ramp (blue), lightest step clears the 2:1 contrast floor.
const STEPS = ["#86b6ef", "#5598e7", "#2a78d6", "#1c5cab", "#0d366b"];

export function FunnelChart({ stages }: { stages: FunnelStage[] }) {
  const max = stages[0]?.value || 1;
  return (
    <div className="flex flex-col gap-2.5">
      {stages.map((stage, i) => {
        const widthPct = Math.max(4, (stage.value / max) * 100);
        const prev = stages[i - 1];
        const conversionFromPrev = prev ? (stage.value / prev.value) * 100 : 100;
        return (
          <div key={stage.label} className="flex items-center gap-3">
            <div className="w-28 shrink-0 text-[13px] text-text-secondary">{stage.label}</div>
            <div className="flex-1">
              <div
                className="h-9 rounded-[6px] transition-[width] duration-500"
                style={{ width: `${widthPct}%`, background: STEPS[Math.min(i, STEPS.length - 1)] }}
              />
            </div>
            {/* Value sits outside the bar so it's never clipped or invisible on a narrow segment. */}
            <div className="w-16 shrink-0 text-right text-[13px] font-semibold tabular-nums text-text-primary">
              {formatCompactNumber(stage.value)}
            </div>
            <div className="w-12 shrink-0 text-right text-[12px] tabular-nums text-text-muted">
              {i === 0 ? "—" : formatPercent(conversionFromPrev, 0)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
