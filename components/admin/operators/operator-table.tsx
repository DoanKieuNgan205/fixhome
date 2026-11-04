"use client"

import { Users, LoaderCircle } from "lucide-react"
import type { Operator } from "@/lib/admin/operators"
import type { OperatorAction } from "./operator-types"
import { OperatorStatusBadge } from "./operator-status-badge"
import { OperatorActionsMenu } from "./operator-actions-menu"

const avatarColors = ["bg-orange-100 text-orange-800", "bg-indigo-100 text-indigo-900", "bg-blue-100 text-blue-900", "bg-sky-100 text-sky-900"]

type Props = {
  rows: Operator[]
  onAction: (action: OperatorAction) => void
  onClearFilters: () => void
  isLoading: boolean
  error?: string
  onRetry: () => void
}

export function OperatorTable({ rows, onAction, onClearFilters, isLoading, error, onRetry }: Props) {
  return (
    <div className="overflow-x-auto" aria-busy={isLoading}>
      <table className="w-full min-w-[990px] text-left text-xs">
        <thead className="bg-indigo-50/70 text-[10px] uppercase tracking-wide text-slate-500">
          <tr>
            {["Nhân viên", "Số điện thoại", "Email", "Trạng thái online", "Đơn đã xử lý hôm nay", "Trạng thái tài khoản", "Thao tác"].map((heading) => <th
              scope="col"
              key={heading}
              className={`px-4 py-3 font-semibold ${heading === "Thao tác" ? "text-right" : ""}`}>
              {heading}
            </th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-line/50">
          {isLoading && (
            <tr>
              <td colSpan={7} className="px-4 py-14 text-center text-slate-500">
                <div role="status" className="flex items-center justify-center gap-2">
                  <LoaderCircle className="size-4 animate-spin" />
                  Đang tải danh sách nhân viên…
                </div>
              </td>
            </tr>
          )}
          {error && (
            <tr>
              <td colSpan={7} className="px-4 py-14 text-center">
                <p role="alert" className="text-red-600">{error}</p>
                <button onClick={onRetry} className="mt-3 text-cta hover:underline">Thử lại</button>
              </td>
            </tr>
          )}
          {rows.map((o, index) => <tr key={o.id} className={`transition hover:bg-slate-50 ${o.status.toLowerCase() === "suspended" ? "bg-slate-50/60 text-slate-400" : "text-ink"}`}>
            <td className="px-4 py-3">
              <div className="flex min-w-40 items-center gap-3">
                <span className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs ${avatarColors[index % avatarColors.length]}`}>
                  {o.name.split(" ").slice(-2).map((part) => part[0]).join("")}
                </span>
                <div>
                  <div className="max-w-40 font-medium">
                    {o.name}
                  </div>
                  <div className="mt-0.5 text-[10px] tracking-wide text-slate-500">{o.employeeCode || "—"}</div>
                  <div className="mt-0.5 text-[10px] text-slate-400">{o.roleName}</div>
                </div>
              </div>
            </td>
            <td className="whitespace-nowrap px-4 py-3 tabular-nums">
              {o.phone.replace(/(\d{4})(\d{3})(\d{3})/, "$1.$2.$3")}
            </td>
            <td className="px-4 py-3 text-[11px] text-slate-500">
              {o.email}
            </td>
            <td className="px-4 py-3">
              <span className="text-slate-400" title="Chưa có dữ liệu">—</span>
            </td>
            <td className="px-4 py-3 text-center text-slate-400" title="Chưa có dữ liệu">—</td>
            <td className="px-4 py-3">
              <OperatorStatusBadge status={o.status} />
            </td>
            <td className="px-4 py-3">
              <div className="flex justify-end">
                <OperatorActionsMenu operator={o} onAction={onAction} />
              </div>
            </td>
          </tr>)}
          {!isLoading && !error && !rows.length && <tr>
            <td colSpan={7} className="px-4 py-14 text-center">
              <Users className="mx-auto mb-3 size-8 text-slate-300" />
              <p className="font-semibold text-ink">Không tìm thấy nhân viên</p>
              <p className="mt-1 text-slate-500">Thử thay đổi từ khóa hoặc trạng thái tài khoản.</p>
              <button onClick={onClearFilters} className="mt-3 text-cta hover:underline">Xóa bộ lọc</button>
            </td>
          </tr>}
        </tbody>
      </table>
    </div>
  )
}

