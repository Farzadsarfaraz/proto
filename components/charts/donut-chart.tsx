"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCompactNumber } from "@/lib/utils";
import { CustomTooltip } from "./tooltip";
import { LegendSwatch } from "./chart-card";

export interface DonutDatum {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutDatum[];
  height?: number;
  centerLabel?: string;
  centerValue?: string;
}

export function DonutChart({ data, height = 220, centerLabel, centerValue }: DonutChartProps) {
  return (
    <div>
      <div className="relative" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="68%"
              outerRadius="100%"
              paddingAngle={2}
              stroke="var(--surface-1)"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {data.map((d) => (
                <Cell key={d.label} fill={d.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip formatValue={formatCompactNumber} />} />
          </PieChart>
        </ResponsiveContainer>
        {centerValue && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-semibold text-text-primary">{centerValue}</span>
            {centerLabel && <span className="text-[11px] text-text-muted">{centerLabel}</span>}
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {data.map((d) => (
          <LegendSwatch key={d.label} color={d.color} label={d.label} />
        ))}
      </div>
    </div>
  );
}
