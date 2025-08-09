"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

export type TimePoint = { date: string; hours: number };

export function DashboardTimeChart({ data }: { data: TimePoint[] }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
          <XAxis dataKey="date" tickMargin={8} className="text-xs" />
          <YAxis tickMargin={8} className="text-xs" />
          <Tooltip formatter={(v: any) => `${v}h`} labelFormatter={(l) => `Date: ${l}`} />
          <Line type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}


