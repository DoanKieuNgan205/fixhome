"use client"

import {
  Bar, CartesianGrid, ComposedChart, Line,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts"
import { revenueChart } from "@/lib/admin/mock-dashboard"

const tick = { fontSize: 11, fill: "#74777e" }

export function RevenueChart() {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={revenueChart} margin={{ top: 8, right: 0, left: -10, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#e2e7ff" strokeDasharray="3 3" />
          <XAxis dataKey="day" tickLine={false} axisLine={false} tick={tick} />
          <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={tick} tickFormatter={(v) => `${v}M`} />
          <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={tick} tickFormatter={(v) => `${v} đơn`} />
          <Tooltip />
          <Bar yAxisId="left" dataKey="revenue" name="Doanh thu (triệu đ)" fill="#1e3a5f" barSize={14} radius={[2, 2, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="orders" name="Số đơn" stroke="#ff6b1f" strokeWidth={2} dot={{ r: 3 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}