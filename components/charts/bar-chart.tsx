"use client";

import { Bar, BarChart as RBarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCompactNumber } from "@/lib/utils";
import { CustomTooltip } from "./tooltip";

export interface BarDatum {
  label: string;
  value: number;
  color?: string;
}

interface CategoryBarChartProps {
  data: BarDatum[];
  height?: number;
  color?: string;
  layout?: "horizontal" | "vertical";
  valueFormatter?: (v: number) => string;
}

export function CategoryBarChart({ data, height = 260, color = "var(--series-1)", layout = "vertical", valueFormatter }: CategoryBarChartProps) {
  const fmt = valueFormatter ?? formatCompactNumber;
  const isHorizontalBars = layout === "vertical"; // bars grow horizontally, category on Y

  if (isHorizontalBars) {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <RBarChart data={data} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }} barCategoryGap={10}>
          <CartesianGrid horizontal={false} stroke="var(--gridline)" />
          <XAxis type="number" tickFormatter={(v) => fmt(v)} tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="label"
            width={120}
            tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip formatValue={fmt} />} cursor={{ fill: "var(--surface-2)" }} />
          <Bar dataKey="value" name="Value" radius={[0, 4, 4, 0]} maxBarSize={20} isAnimationActive={false}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.color ?? color} />
            ))}
          </Bar>
        </RBarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RBarChart data={data} margin={{ top: 6, right: 8, left: -12, bottom: 0 }} barCategoryGap={16}>
        <CartesianGrid vertical={false} stroke="var(--gridline)" />
        <XAxis dataKey="label" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={{ stroke: "var(--baseline)" }} tickLine={false} />
        <YAxis tickFormatter={(v) => fmt(v)} tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} width={48} />
        <Tooltip content={<CustomTooltip formatValue={fmt} />} cursor={{ fill: "var(--surface-2)" }} />
        <Bar dataKey="value" name="Value" radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color ?? color} />
          ))}
        </Bar>
      </RBarChart>
    </ResponsiveContainer>
  );
}
