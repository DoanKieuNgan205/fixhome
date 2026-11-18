"use client"

// components/admin/orders/order-manager.tsx
import { useEffect, useState, useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Download, RefreshCw, Search, SlidersHorizontal } from "lucide-react"
import { OrderQuickView } from "./order-quick-view"
import {
  AREAS, CASH_LABEL, CASH_TONE, STATUS_LABEL, STATUS_TONE, dmy, hm, initials, money,
  type OrderDetail, type OrderList, type OrderStatus,
} from "@/lib/admin/order-types"

type Query = { q: string; status: string; area: string; from: string; to: string; page: number; pageSize: number }

function pageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const out: (number | "…")[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) out.push("…")
  for (let i = start; i <= end; i++) out.push(i)
  if (end < total - 1) out.push("…")
  out.push(total)
  return out
}

const field =
  "h-10 rounded-lg border border-line bg-white px-3 text-sm text-ink outline-none focus:border-cta focus:ring-2 focus:ring-cta/20"

export function OrderManager({ list, query }: { list: OrderList; query: Query }) {
  const router = useRouter()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()
  const [form, setForm] = useState({ q: query.q, status: query.status, area: query.area, from: query.from, to: query.to })
  const [selected, setSelected] = useState<OrderDetail | null>(null)

  // đồng bộ lại ô nhập khi URL đổi (ví dụ bấm "Đặt lại bộ lọc")
  useEffect(() => {
    setForm({ q: query.q, status: query.status, area: query.area, from: query.from, to: query.to })
  }, [query.q, query.status, query.area, query.from, query.to])

  function push(next: Partial<Query>) {
    const m = { ...query, ...next }
    const sp = new URLSearchParams()
    if (m.q) sp.set("q", m.q)
    if (m.status) sp.set("status", m.status)
    if (m.area) sp.set("area", m.area)
    if (m.from) sp.set("from", m.from)
    if (m.to) sp.set("to", m.to)
    if (m.page > 1) sp.set("page", String(m.page))
    if (m.pageSize !== 10) sp.set("size", String(m.pageSize))
    const qs = sp.toString()
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname))
  }

  const apply = () => push({ ...form, page: 1 })
  const reset = () => push({ q: "", status: "", area: "", from: "", to: "", page: 1 })
  const hasFilter = !!(query.q || query.status || query.area || query.from || query.to)

  const exportHref = (() => {
    const sp = new URLSearchParams()
    if (query.q) sp.set("q", query.q)
    if (query.status) sp.set("status", query.status)
    if (query.area) sp.set("area", query.area)
    if (query.from) sp.set("from", query.from)
    if (query.to) sp.set("to", query.to)
    return `/api/admin/orders/export?${sp.toString()}`
  })()

  const from = list.total === 0 ? 0 : (query.page - 1) * query.pageSize + 1
  const to = Math.min(query.page * query.pageSize, list.total)

  return (
    <div className="space-y-4">
      {/* Đầu trang */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
          <span className="size-1.5 rounded-full bg-red-500" /> {list.todayCount} đơn hôm nay
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button" aria-label="Làm mới" onClick={() => startTransition(() => router.refresh())}
            className="flex size-10 items-center justify-center rounded-lg border border-line bg-white text-muted hover:text-ink"
          >
            <RefreshCw className={`size-4 ${pending ? "animate-spin" : ""}`} />
          </button>
          <a
            href={exportHref}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-white hover:opacity-90"
          >
            <Download className="size-4" /> Xuất Excel
          </a>
        </div>
      </div>

      {/* Bộ lọc */}
      <section className="rounded-xl border border-line bg-white p-4 shadow-sm">
        <form
          className="flex flex-wrap items-center gap-3"
          onSubmit={(e) => { e.preventDefault(); apply() }}
        >
          <label className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              value={form.q} onChange={(e) => setForm({ ...form, q: e.target.value })}
              placeholder="Tìm kiếm theo mã đơn, khách hàng, ..." className={`${field} w-full pl-9`}
            />
          </label>
          <div className="flex items-center gap-1.5">
            <input type="date" aria-label="Từ ngày" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} className={field} />
            <span className="text-muted">–</span>
            <input type="date" aria-label="Đến ngày" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} className={field} />
          </div>
          <select aria-label="Khu vực" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className={field}>
            <option value="">Tất cả khu vực</option>
            {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <select aria-label="Trạng thái" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={field}>
            <option value="">Tất cả trạng thái</option>
            {(Object.keys(STATUS_LABEL) as OrderStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
          <button
            type="button" aria-label="Bộ lọc nâng cao" title="Bộ lọc nâng cao (đang phát triển)"
            className="flex size-10 items-center justify-center rounded-lg border border-line text-muted"
          >
            <SlidersHorizontal className="size-4" />
          </button>
          <button type="submit" className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700">
            Áp dụng
          </button>
        </form>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted">
          <span>Tìm thấy <b className="text-ink">{list.total}</b> kết quả</span>
          {hasFilter && (
            <button type="button" onClick={reset} className="inline-flex items-center gap-1 font-medium text-blue-600 hover:underline">
              <RefreshCw className="size-3" /> Đặt lại bộ lọc
            </button>
          )}
        </div>
      </section>

      {/* Bảng */}
      <section className={`overflow-hidden rounded-xl border border-line bg-white shadow-sm ${pending ? "opacity-60" : ""}`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-muted">
              <tr>
                <th className="px-5 py-3">Mã đơn</th>
                <th className="px-3 py-3">Khách hàng</th>
                <th className="px-3 py-3">Dịch vụ</th>
                <th className="px-3 py-3">KTV phụ trách</th>
                <th className="px-3 py-3">Ngày hẹn</th>
                <th className="px-3 py-3">Trạng thái</th>
                <th className="px-3 py-3 text-right">Tổng tiền</th>
                <th className="px-3 py-3">Thu tiền mặt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {list.items.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-muted">Không tìm thấy đơn hàng phù hợp</td></tr>
              )}
              {list.items.map((o) => (
                <tr
                  key={o.code} onClick={() => setSelected(o)} tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter") setSelected(o) }}
                  className={`cursor-pointer hover:bg-slate-50 ${selected?.code === o.code ? "bg-blue-50/60" : ""}`}
                >
                  <td className="px-5 py-3 font-semibold text-ink">#{o.code}</td>
                  <td className="px-3 py-3">
                    <div className="font-medium text-ink">{o.customer.name}</div>
                    <div className="text-[11px] text-muted">{o.customer.phone}</div>
                  </td>
                  <td className="max-w-[220px] truncate px-3 py-3 text-ink" title={o.service}>{o.service}</td>
                  <td className="px-3 py-3">
                    {o.technician ? (
                      <div className="flex items-center gap-2">
                        <span className="flex size-7 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-600">
                          {initials(o.technician.name)}
                        </span>
                        <div>
                          <div className="text-xs font-medium text-ink">{o.technician.name}</div>
                          <div className="text-[11px] text-muted">{o.technician.availability}</div>
                        </div>
                      </div>
                    ) : <span className="text-xs text-muted">Chưa phân công</span>}
                  </td>
                  <td className="px-3 py-3">
                    <div className="font-medium text-ink">{hm(o.scheduledAt)}</div>
                    <div className="text-[11px] text-muted">{dmy(o.scheduledAt)}</div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_TONE[o.status]}`}>
                      <span className="size-1.5 rounded-full bg-current" /> {STATUS_LABEL[o.status]}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right font-semibold text-ink">{money(o.finalPrice)}</td>
                  <td className="px-3 py-3">
                    <span className={`rounded-md px-2 py-1 text-[11px] font-medium ${CASH_TONE[o.cash]}`}>{CASH_LABEL[o.cash]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Chân bảng */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3 text-xs text-muted">
          <div className="flex items-center gap-3">
            <span>Hiển thị <b className="text-ink">{from} – {to}</b> trên tổng số <b className="text-ink">{list.total}</b> đơn</span>
            <label className="flex items-center gap-2">
              Số dòng / trang:
              <select
                value={query.pageSize} onChange={(e) => push({ pageSize: Number(e.target.value), page: 1 })}
                className="h-8 rounded-md border border-line bg-white px-2 text-xs text-ink"
              >
                {[10, 20, 50].map((n) => <option key={n} value={n}>{n} dòng</option>)}
              </select>
            </label>
          </div>
          <nav className="flex items-center gap-1" aria-label="Phân trang">
            <button
              type="button" aria-label="Trang trước" disabled={query.page <= 1} onClick={() => push({ page: query.page - 1 })}
              className="flex size-8 items-center justify-center rounded-md text-muted enabled:hover:bg-slate-100 disabled:opacity-40"
            ><ChevronLeft className="size-4" /></button>
            {pageList(query.page, list.totalPages).map((n, i) =>
              n === "…" ? <span key={`g${i}`} className="px-1">…</span> : (
                <button
                  key={n} type="button" onClick={() => push({ page: n })}
                  className={`size-8 rounded-md text-xs font-semibold ${n === query.page ? "bg-blue-600 text-white" : "text-ink hover:bg-slate-100"}`}
                >{n}</button>
              ),
            )}
            <button
              type="button" aria-label="Trang sau" disabled={query.page >= list.totalPages} onClick={() => push({ page: query.page + 1 })}
              className="flex size-8 items-center justify-center rounded-md text-muted enabled:hover:bg-slate-100 disabled:opacity-40"
            ><ChevronRight className="size-4" /></button>
          </nav>
        </div>
      </section>

      <OrderQuickView order={selected} onClose={() => setSelected(null)} />
    </div>
  )
}