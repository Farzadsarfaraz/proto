"use client";

import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCompactNumber, formatDate } from "@/lib/utils";
import { CustomTooltip } from "./tooltip";

export interface TrendSeries {
  key: string;
  label: string;
  color: string;
}

interface TrendChartProps {
  data: Record<string, string | number>[];
  series: TrendSeries[];
  height?: number;
  valueFormatter?: (v: number) => string;
}

export function TrendChart({ data, series, height = 260, valueFormatter }: TrendChartProps) {
  const fmt = valueFormatter ?? formatCompactNumber;
  const single = series.length === 1;

  if (single) {
    const s = series[0];
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 6, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id={`fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.16} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--gridline)" strokeDasharray="0" />
          <XAxis
            dataKey="date"
            tickFormatter={(v) => formatDate(v).replace(/ \d{4}/, "")}
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            axisLine={{ stroke: "var(--baseline)" }}
            tickLine={false}
            minTickGap={32}
          />
          <YAxis
            tickFormatter={(v) => fmt(v)}
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip
            content={<CustomTooltip formatValue={fmt} />}
            cursor={{ stroke: "var(--baseline)", strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color}
            strokeWidth={2}
            fill={`url(#fill-${s.key})`}
            activeDot={{ r: 4, stroke: "var(--surface-1)", strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 6, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--gridline)" />
        <XAxis
          dataKey="date"
          tickFormatter={(v) => formatDate(v).replace(/ \d{4}/, "")}
          tick={{ fill: "var(--text-muted)", fontSize: 11 }}
          axisLine={{ stroke: "var(--baseline)" }}
          tickLine={false}
          minTickGap={32}
        />
        <YAxis
          tickFormatter={(v) => fmt(v)}
          tick={{ fill: "var(--text-muted)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip content={<CustomTooltip formatValue={fmt} />} cursor={{ stroke: "var(--baseline)", strokeWidth: 1 }} />
        {series.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, stroke: "var(--surface-1)", strokeWidth: 2 }}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
