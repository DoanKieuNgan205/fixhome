"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { ChevronDown, ChevronLeft, ChevronRight, Search, TriangleAlert, Lock } from "lucide-react"
import {
  SOURCE_CLS, SOURCE_LABEL, VIOLATION_TYPES, violationCases,
  type FlagTone,
} from "@/lib/operator/mock-violations"
import { initials } from "@/lib/admin/customer-utils"

const PAGE_SIZE = 6

const FLAG_CLS: Record<FlagTone, string> = {
  muted: "text-muted",
  red: "text-red-500",
  amber: "text-amber-600",
}

const AVATAR_TONES = [
  "bg-orange-50 text-orange-600", "bg-indigo-50 text-indigo-600", "bg-pink-50 text-pink-500",
  "bg-cyan-50 text-cyan-600", "bg-emerald-50 text-emerald-600", "bg-amber-50 text-amber-600",
]

export function ViolationList() {
  const [tab, setTab] = useState<"pending" | "done">("pending")
  const [keyword, setKeyword] = useState("")
  const [type, setType] = useState("all")
  const [page, setPage] = useState(1)

  const pendingCount = violationCases.filter((v) => !v.handled).length
  const doneCount = violationCases.length - pendingCount

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase()
    return violationCases.filter(
      (v) =>
        v.handled === (tab === "done") &&
        (type === "all" || v.type === type) &&
        (!k || [v.techName, v.techCode, v.orderCode, v.title].some((s) => s.toLowerCase().includes(k))),
    )
  }, [tab, keyword, type])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, totalPages)
  const start = (current - 1) * PAGE_SIZE
  const rows = filtered.slice(start, start + PAGE_SIZE)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-ink">Tài khoản KTV vi phạm</h1>
          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-500">
            ● {pendingCount} trường hợp cần xử lý
          </span>
        </div>
        <div className="flex rounded-lg border border-line bg-white p-0.5" role="tablist">
          {([["pending", "Chờ xử lý", pendingCount], ["done", "Đã xử lý", doneCount]] as const).map(([k, l, n]) => (
            <button
              key={k}
              role="tab"
              aria-selected={tab === k}
              onClick={() => { setTab(k); setPage(1) }}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold ${tab === k ? "bg-field text-ink" : "text-muted hover:text-ink"}`}
            >
              {l}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${k === "pending" ? "bg-red-50 text-red-500" : "bg-white text-body"}`}>{n}</span>
            </button>
          ))}
        </div>
      </div>

      <section className="rounded-xl border border-line bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 p-4">
          <div className="flex h-10 min-w-[240px] flex-1 items-center gap-2 rounded-lg border border-line bg-field/50 px-3 focus-within:border-cta focus-within:bg-white focus-within:ring-2 focus-within:ring-cta/15">
            <Search className="size-4 text-muted" />
            <input
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(1) }}
              placeholder="Tìm mã KTV, tên thợ, mã đơn..."
              className="h-full w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
            />
          </div>
          <div className="relative w-64">
            <select
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(1) }}
              aria-label="Loại vi phạm"
              className="h-10 w-full appearance-none rounded-lg border border-line bg-white pl-3 pr-9 text-sm text-ink outline-none focus:border-cta focus:ring-2 focus:ring-cta/15"
            >
              <option value="all">Tất cả loại vi phạm</option>
              {VIOLATION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3 size-4 text-muted" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-field/60 text-[11px] font-semibold uppercase text-muted">
              <tr>
                <th className="px-5 py-3">Kỹ thuật viên</th>
                <th className="px-4 py-3">Hành vi vi phạm</th>
                <th className="px-4 py-3">Đơn liên quan</th>
                <th className="px-4 py-3">Nguồn</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.length === 0 && (
                <tr><td colSpan={5} className="h-28 text-center text-sm text-muted">Không có trường hợp nào</td></tr>
              )}
              {rows.map((v, idx) => (
                <tr key={v.id} className="align-top hover:bg-field/40">
                  <td className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <span className={`flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${AVATAR_TONES[(start + idx) % AVATAR_TONES.length]}`}>
                        {initials(v.techName)}
                      </span>
                      <div>
                        <div className="text-[13px] font-semibold text-ink">{v.techName}</div>
                        <div className="text-[11px] text-muted">{v.techCode}</div>
                        <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${v.techState === "active" ? "bg-emerald-50 text-emerald-600" : "bg-orange-100 text-orange-700"}`}>
                          ● {v.techState === "active" ? "Hoạt động" : "Tạm khóa"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="max-w-[320px] px-4 py-4">
                    <div className="text-xs font-semibold leading-relaxed text-ink">{v.title}</div>
                    <div className={`mt-1 flex items-center gap-1 text-[11px] ${FLAG_CLS[v.flagTone]}`}>
                      {v.flagTone === "red" ? <TriangleAlert className="size-3" /> : <Lock className="size-3" />}
                      {v.flag}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-xs font-bold text-cta">{v.orderCode}</div>
                    <div className="text-[11px] text-muted">{v.orderName}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${SOURCE_CLS[v.source]}`}>{SOURCE_LABEL[v.source]}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/operator/technician-violations/${v.id}`}
                      className="inline-flex h-8 items-center rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-500 hover:bg-red-100"
                    >
                      {v.handled ? "Xem lại" : "Xem chi tiết"}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3 text-xs text-muted">
          <span>
            Hiển thị <b className="text-ink">{filtered.length === 0 ? 0 : start + 1} - {start + rows.length}</b> trên tổng số <b className="text-ink">{filtered.length}</b> vụ việc
          </span>
          <div className="flex items-center gap-1.5">
            <button disabled={current === 1} onClick={() => setPage(current - 1)} aria-label="Trang trước" className="flex size-8 items-center justify-center rounded-md border border-line bg-white disabled:opacity-40">
              <ChevronLeft className="size-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button key={n} onClick={() => setPage(n)} className={`size-8 rounded-md font-semibold ${n === current ? "bg-cta text-white" : "border border-line bg-white text-body hover:bg-field"}`}>
                {n}
              </button>
            ))}
            <button disabled={current === totalPages} onClick={() => setPage(current + 1)} aria-label="Trang sau" className="flex size-8 items-center justify-center rounded-md border border-line bg-white disabled:opacity-40">
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}