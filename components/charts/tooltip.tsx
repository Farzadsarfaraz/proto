import { formatCompactNumber, formatDate } from "@/lib/utils";

interface CustomTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: { name: string; value: number; color: string }[];
  formatValue?: (v: number) => string;
  labelFormatter?: (label: string | number) => string;
}

export function CustomTooltip({ active, label, payload, formatValue, labelFormatter }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const fmt = formatValue ?? formatCompactNumber;
  const lbl = labelFormatter ?? ((l: string | number) => (typeof l === "string" && l.includes("-") ? formatDate(l) : String(l)));

  return (
    <div className="rounded-[var(--radius-sm)] border border-border-hairline bg-surface-1 px-3 py-2 shadow-[var(--shadow-md)]">
      <div className="mb-1 text-[11px] font-medium text-text-muted">{lbl(label ?? "")}</div>
      <div className="flex flex-col gap-1">
        {payload.map((p) => (
          <div key={p.name} className="flex items-center gap-2 text-[12px]">
            <span className="inline-block size-2 rounded-full" style={{ background: p.color }} />
            <span className="text-text-secondary">{p.name}</span>
            <span className="ml-auto font-semibold tabular-nums text-text-primary">{fmt(p.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
