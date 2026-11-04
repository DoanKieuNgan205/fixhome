"use client"

import { useMemo, useState } from "react"
import {
  Banknote, Calendar, ChevronDown, ChevronLeft, ChevronRight,
  LayoutGrid, Search, SlidersHorizontal,
} from "lucide-react"
import type { Order, OrderStatus } from "@/lib/admin/mock-customer-detail"

const PAGE_SIZE = 6

const STATUS_LABEL: Record<"all" | OrderStatus, string> = {
  all: "Tất cả trạng thái",
  done: "Hoàn thành",
  running: "Đang thực hiện",
  cancelled: "Đã hủy",
}
const STATUS_BADGE: Record<OrderStatus, string> = {
  done: "bg-emerald-50 text-emerald-600",
  running: "bg-blue-50 text-blue-600",
  cancelled: "bg-red-50 text-red-500",
}

const money = (n: number) => `${n.toLocaleString("vi-VN")} đ`

function formatDateTime(iso: string) {
  const [date, time] = iso.split("T")
  const [y, m, d] = date.split("-")
  return `${d}/${m}/${y} · ${time.slice(0, 5)}`
}

function pageList(current: number, total: number): (number | "…")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  const out: (number | "…")[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) out.push("…")
  for (let i = start; i <= end; i++) out.push(i)
  if (end < total - 1) out.push("…")
  out.push(total)
  return out
}

const selectBox =
  "h-9 w-full appearance-none rounded-lg border border-line bg-white pl-8 pr-8 text-xs font-medium text-ink outline-none transition focus:border-cta focus:ring-2 focus:ring-cta/15"

export function CustomerOrdersTab({ orders }: { orders: Order[] }) {
  const [keyword, setKeyword] = useState("")
  const [status, setStatus] = useState<"all" | OrderStatus>("all")
  const [year, setYear] = useState("all")
  const [category, setCategory] = useState("all")
  const [page, setPage] = useState(1)

  // Danh sách năm và loại dịch vụ lấy từ chính dữ liệu đơn
  const years = useMemo(
    () => Array.from(new Set(orders.map((o) => o.dateTime.slice(0, 4)))).sort().reverse(),
    [orders],
  )
  const categories = useMemo(
    () => Array.from(new Set(orders.map((o) => o.category))).sort(),
    [orders],
  )

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase()
    return orders
      .filter((o) => {
        const okKey =
          !k ||
          [o.code, o.service, o.device, o.techName, o.techCode].some((v) => v.toLowerCase().includes(k))
        return (
          okKey &&
          (status === "all" || o.status === status) &&
          (year === "all" || o.dateTime.startsWith(year)) &&
          (category === "all" || o.category === category)
        )
      })
      .sort((a, b) => b.dateTime.localeCompare(a.dateTime))
  }, [orders, keyword, status, year, category])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, totalPages)
  const start = (current - 1) * PAGE_SIZE
  const rows = filtered.slice(start, start + PAGE_SIZE)

  const reset = () => setPage(1)

  return (
    <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 border-l-4 border-cta pl-2 text-sm font-bold text-ink">
          Lịch sử đơn dịch vụ HomeFix
          <span className="rounded-full bg-field px-2 py-0.5 text-[11px] font-medium text-body">
            {orders.length} đơn
          </span>
        </h2>
        <span className="flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-[11px] font-semibold text-cta">
          <Banknote className="size-3.5" /> 100% Thu tiền mặt vật lý
        </span>
      </div>

      {/* Tìm kiếm và bộ lọc */}
      <div className="mt-4 space-y-3">
        <div className="flex h-10 items-center gap-2 rounded-lg border border-line px-3 focus-within:border-cta focus-within:ring-2 focus-within:ring-cta/15">
          <Search className="size-4 text-muted" />
          <input
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); reset() }}
            placeholder="Tìm theo mã đơn #HF, dịch vụ, KTV..."
            className="h-full w-full bg-transparent text-xs text-ink outline-none placeholder:text-muted"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative w-44">
            <SlidersHorizontal className="pointer-events-none absolute left-2.5 top-2.5 size-3.5 text-muted" />
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value as typeof status); reset() }}
              className={selectBox}
              aria-label="Trạng thái"
            >
              {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 size-3.5 text-muted" />
          </div>

          <div className="relative w-36">
            <Calendar className="pointer-events-none absolute left-2.5 top-2.5 size-3.5 text-muted" />
            <select
              value={year}
              onChange={(e) => { setYear(e.target.value); reset() }}
              className={selectBox}
              aria-label="Thời gian"
            >
              <option value="all">Thời gian</option>
              {years.map((y) => <option key={y} value={y}>Năm {y}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 size-3.5 text-muted" />
          </div>

          <div className="relative w-40">
            <LayoutGrid className="pointer-events-none absolute left-2.5 top-2.5 size-3.5 text-muted" />
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); reset() }}
              className={selectBox}
              aria-label="Loại dịch vụ"
            >
              <option value="all">Loại dịch vụ</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 size-3.5 text-muted" />
          </div>
        </div>
      </div>

      {/* Bảng */}
      <div className="mt-4 overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-[860px] text-left">
          <thead className="bg-field/60 text-[11px] font-semibold uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Mã đơn</th>
              <th className="px-4 py-3">Thời gian & địa điểm</th>
              <th className="px-4 py-3">Dịch vụ & thiết bị</th>
              <th className="px-4 py-3">KTV phụ trách</th>
              <th className="px-4 py-3 text-right">Giá trị</th>
              <th className="px-4 py-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="h-28 text-center text-xs text-muted">
                  Không có đơn hàng phù hợp
                </td>
              </tr>
            )}
            {rows.map((o) => (
              <tr key={o.code} className="align-top hover:bg-field/40">
                <td className="px-4 py-4 text-xs font-bold text-cta">{o.code}</td>
                <td className="px-4 py-4">
                  <div className="text-xs font-medium text-ink">{formatDateTime(o.dateTime)}</div>
                  <div className="mt-0.5 text-[11px] text-muted">{o.place}</div>
                </td>
                <td className="max-w-[280px] px-4 py-4">
                  <div className="text-xs font-semibold text-ink">
                    {o.service}
                    {o.status === "cancelled" && (
                      <span className="ml-1 font-normal text-muted">(Hủy an toàn)</span>
                    )}
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted">
                    {o.status === "cancelled" && o.note ? o.note : o.device}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-xs font-medium text-ink">{o.techName}</div>
                  <div className="mt-0.5 text-[11px] text-muted">{o.techCode}</div>
                </td>
                <td className="px-4 py-4 text-right text-xs font-semibold text-ink">
                  {o.status === "cancelled" ? "—" : money(o.amount)}
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_BADGE[o.status]}`}>
                    {STATUS_LABEL[o.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-muted">
          Hiển thị{" "}
          <b className="text-ink">
            {filtered.length === 0 ? 0 : start + 1} - {Math.min(start + PAGE_SIZE, filtered.length)}
          </b>{" "}
          trên tổng số <b className="text-ink">{filtered.length}</b> đơn hàng
        </span>

        <div className="flex items-center gap-1.5">
          <button
            disabled={current === 1}
            onClick={() => setPage(current - 1)}
            aria-label="Trang trước"
            className="flex size-8 items-center justify-center rounded-md border border-line bg-white text-muted disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
          </button>
          {pageList(current, totalPages).map((n, i) =>
            n === "…" ? (
              <span key={`gap-${i}`} className="px-1 text-xs text-muted">…</span>
            ) : (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`size-8 rounded-md text-xs font-semibold ${
                  n === current ? "bg-cta text-white" : "border border-line bg-white text-body hover:bg-field"
                }`}
              >
                {n}
              </button>
            ),
          )}
          <button
            disabled={current === totalPages}
            onClick={() => setPage(current + 1)}
            aria-label="Trang sau"
            className="flex size-8 items-center justify-center rounded-md border border-line bg-white text-muted disabled:opacity-40"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </section>
  )
}