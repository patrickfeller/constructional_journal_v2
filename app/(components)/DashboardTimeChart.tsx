"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
  XAxis,
  YAxis,
} from "recharts";

export type TimePoint = { date: string; hours: number };

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 shadow-md text-sm">
      <p className="text-[var(--ink-3)] mb-0.5">{label}</p>
      <p className="font-semibold text-[var(--ink)]">{payload[0].value}h</p>
    </div>
  );
}

export function DashboardTimeChart({ data }: { data: TimePoint[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 8 }}>
          <defs>
            <linearGradient id="accentGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F2A20C" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#F2A20C" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
          <XAxis
            dataKey="date"
            tickMargin={8}
            tick={{ fontSize: 11, fill: "var(--ink-3)" }}
            axisLine={{ stroke: "var(--line)" }}
            tickLine={false}
          />
          <YAxis
            tickMargin={8}
            tick={{ fontSize: 11, fill: "var(--ink-3)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--line)", strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey="hours"
            stroke="#F2A20C"
            strokeWidth={2.5}
            dot={false}
            fill="url(#accentGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
