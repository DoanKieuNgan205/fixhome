"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import {
  ChevronLeft, ChevronRight, Eye, KeyRound, Lock, LockOpen,
  Search, Star, TriangleAlert, Wrench, Download
} from "lucide-react"
import { initials } from "@/lib/admin/customer-utils"
import type { TechnicianRow } from "@/lib/admin/technician-utils"

type Tab = "all" | "active" | "locked"

type Props = {
  list: { items: TechnicianRow[]; total_items: number; total_pages: number }
  stats: { total: number | null; active: number | null; locked: number | null }
  query: { tab: Tab; q: string; page: number; pageSize: number }
}

const AVATAR_TONES = [
  "bg-orange-50 text-orange-600", "bg-indigo-50 text-indigo-600", "bg-pink-50 text-pink-500",
  "bg-cyan-50 text-cyan-600", "bg-emerald-50 text-emerald-600", "bg-amber-50 text-amber-600",
]

const money = (n: number) => `${n.toLocaleString("vi-VN")}đ`
const pct = (n: number | null) => (n == null ? "—" : `${n.toFixed(1)}%`)
const num = (n: number | null) => (n == null ? "—" : n.toLocaleString("vi-VN"))

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

const pill =
  "flex h-10 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-xs text-body"
const pillSelect = "bg-transparent text-xs font-semibold text-ink outline-none disabled:cursor-not-allowed"

export function TechnicianManager({ list, stats, query }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()
  const [keyword, setKeyword] = useState(query.q)

  // Đổi tab / từ khóa / trang / số dòng = đổi URL, server tự lấy dữ liệu mới
  function go(patch: Partial<{ tab: Tab; q: string; page: number; size: number }>) {
    const next = { tab: query.tab, q: query.q, page: query.page, size: query.pageSize, ...patch }
    const sp = new URLSearchParams()
    if (next.tab !== "all") sp.set("tab", next.tab)
    if (next.q) sp.set("q", next.q)
    if (next.page > 1) sp.set("page", String(next.page))
    if (next.size !== 10) sp.set("size", String(next.size))
    const qs = sp.toString()
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }))
  }

  // Debounce ô tìm kiếm 400ms
  useEffect(() => {
    if (keyword.trim() === query.q) return
    const id = setTimeout(() => go({ q: keyword.trim(), page: 1 }), 400)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword])

  const rows = list.items
  const total = list.total_items
  const totalPages = Math.max(1, list.total_pages)
  const current = Math.min(query.page, totalPages)
  const start = (current - 1) * query.pageSize

  function toggleLock(t: TechnicianRow) {
    const locking = t.status !== "locked"
    const ok = window.confirm(
      locking ? `Khóa tài khoản của "${t.name}"?` : `Mở khóa tài khoản của "${t.name}"?`,
    )
    if (!ok) return
    // TODO: chờ backend có API khóa / mở khóa KTV. Khi có: gọi qua proxy() rồi router.refresh()
    window.alert("Chức năng khóa / mở khóa đang chờ backend cung cấp API.")
  }

  function resetPassword(t: TechnicianRow) {
    if (!window.confirm(`Gửi yêu cầu đặt lại mật khẩu cho "${t.name}"?`)) return
    // TODO: chờ backend có API đặt lại mật khẩu KTV
    window.alert("Chức năng đặt lại mật khẩu đang chờ backend cung cấp API.")
  }

  const now = new Date()
  const monthLabel = `Tháng ${now.getMonth() + 1}/${now.getFullYear()}`

  const tabs: { key: Tab; label: string; n: number | null }[] = [
    { key: "all", label: "Tất cả", n: stats.total },
    { key: "active", label: "Hoạt động", n: stats.active },
    { key: "locked", label: "Đã khóa", n: stats.locked },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-ink">Danh sách Kỹ thuật viên (KTV)</h1>
        <a
          href={`/api/admin/technicians/export?${new URLSearchParams({
            ...(query.q ? { q: query.q } : {}),
            ...(query.tab !== "all" ? { status: query.tab } : {}),
          })}`}
          className="flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-semibold text-ink hover:bg-field"
        >
          <Download className="size-4" /> Xuất CSV
        </a>
      </div>

      {/* Thống kê */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="TỔNG KTV" value={stats.total} note={monthLabel}
          right={
            <span className="flex size-8 items-center justify-center rounded-lg bg-orange-50 text-cta">
              <Wrench className="size-4" />
            </span>
          }
        />
        {/* TODO: backend chưa cho lọc theo is_available nên chưa đếm được */}
        <StatCard
          label="SẴN SÀNG NHẬN VIỆC" value={null} valueClass="text-emerald-600"
          note="Sẵn sàng, điều phối ngay"
          right={<span className="size-2.5 rounded-full bg-emerald-500" />}
        />
        <StatCard
          label="ĐÃ KHÓA TÀI KHOẢN" value={stats.locked} valueClass="text-red-600"
          note="Nợ tiền / Vi phạm kỷ luật"
          right={
            <span className="flex size-8 items-center justify-center rounded-lg bg-red-50 text-red-500">
              <Lock className="size-4" />
            </span>
          }
        />
      </div>

      <section className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
        {/* Tab */}
        <div className="flex gap-6 border-b border-line px-5" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={query.tab === t.key}
              onClick={() => go({ tab: t.key, page: 1 })}
              className={`-mb-px flex items-center gap-2 border-b-2 py-3.5 text-sm font-semibold transition ${
                query.tab === t.key ? "border-cta text-cta" : "border-transparent text-body hover:text-ink"
              }`}
            >
              {t.label}
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] ${
                  query.tab === t.key ? "bg-orange-50 text-cta" : "bg-field text-muted"
                }`}
              >
                {t.n ?? "—"}
              </span>
            </button>
          ))}
        </div>

        {/* Bộ lọc */}
        <div className="space-y-3 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-10 min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-line px-3 focus-within:border-cta focus-within:ring-2 focus-within:ring-cta/15">
              <Search className="size-4 text-muted" />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm theo tên, SĐT, mã KTV..."
                className="h-full w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
              />
            </div>

            {/* TODO: bật lại khi backend hỗ trợ param lọc tương ứng (area, specialty, is_available, debt, cancel_rate) */}
            {["Khu vực", "Chuyên môn", "Sẵn sàng", "Công nợ", "Tỷ lệ hủy"].map((label) => (
              <label key={label} className={`${pill} opacity-60`} title="Backend chưa hỗ trợ bộ lọc này">
                {label}:
                <select disabled className={pillSelect}>
                  <option>Tất cả</option>
                </select>
              </label>
            ))}
          </div>
        </div>

        {/* Bảng */}
        <div className={`overflow-x-auto transition-opacity ${pending ? "opacity-60" : ""}`}>
          <table className="w-full min-w-[1100px] text-left">
            <thead className="bg-field/60 text-[11px] font-semibold uppercase text-muted">
              <tr>
                <th className="px-5 py-3">Kỹ thuật viên</th>
                <th className="px-3 py-3">SĐT</th>
                <th className="px-3 py-3">Chuyên môn & khu vực</th>
                <th className="px-3 py-3">Sẵn sàng</th>
                <th className="px-3 py-3">Số đơn tháng</th>
                <th className="px-3 py-3">Tỷ lệ hoàn thành</th>
                <th className="px-3 py-3">Tỷ lệ hủy (KTV / Khách)</th>
                <th className="px-3 py-3">Đánh giá</th>
                <th className="px-3 py-3">Trạng thái & thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="h-28 text-center text-sm text-muted">
                    Không tìm thấy kỹ thuật viên phù hợp
                  </td>
                </tr>
              )}
              {rows.map((t, idx) => {
                const locked = t.status === "locked"
                const hasData = t.ordersThisMonth != null && t.ordersThisMonth > 0
                const area = [t.district, t.city].filter(Boolean).join(", ")
                return (
                  <tr key={t.id} className={locked ? "bg-slate-50/80" : "hover:bg-field/40"}>
                    {/* KTV */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${AVATAR_TONES[(start + idx) % AVATAR_TONES.length]}`}
                        >
                          {t.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={t.avatarUrl} alt="" className="size-9 rounded-full object-cover" />
                          ) : (
                            initials(t.name)
                          )}
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className={`text-[13px] font-semibold ${locked ? "text-muted" : "text-ink"}`}>
                              {t.name}
                            </span>
                            {locked && t.lockReason && (
                              <span className="text-[10px] font-medium text-red-500">({t.lockReason})</span>
                            )}
                          </div>
                          {t.debt != null && t.debt > 0 && (
                            <span className="mt-0.5 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                              Đang nợ tiền ({money(t.debt)})
                            </span>
                          )}
                          <div className="text-[11px] text-muted">{t.code}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3.5 text-xs text-body">{t.phone}</td>

                    <td className="px-3 py-3.5">
                      <div className="text-xs font-medium text-ink">{t.specialty ?? "—"}</div>
                      <div className="max-w-[220px] truncate text-[11px] text-muted" title={area}>{area || "—"}</div>
                    </td>

                    <td className="px-3 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-semibold ${
                          t.available
                            ? "border-blue-100 bg-blue-50 text-blue-600"
                            : "border-line bg-field text-muted"
                        }`}
                      >
                        <span className={`size-1.5 rounded-full ${t.available ? "bg-blue-500" : "bg-slate-300"}`} />
                        {t.available ? "Đang bật" : "Đang tắt"}
                      </span>
                    </td>

                    <td className="px-3 py-3.5 text-xs text-body">
                      {t.ordersThisMonth == null ? "—" : `${t.ordersThisMonth} đơn`}
                    </td>

                    <td className="px-3 py-3.5">
                      <span
                        className={`text-xs font-bold ${
                          !hasData || t.completionRate == null
                            ? "text-muted"
                            : t.completionRate < 90 ? "text-red-500" : "text-emerald-600"
                        }`}
                      >
                        {pct(t.completionRate)}
                      </span>
                    </td>

                    <td className="px-3 py-3.5">
                      {!hasData || t.cancelByTech == null ? (
                        <span className="text-xs text-muted">—</span>
                      ) : (
                        <>
                          {t.cancelByTech >= 10 ? (
                            <span className="inline-flex items-center gap-1 rounded bg-red-50 px-1.5 py-0.5 text-[11px] font-bold text-red-600">
                              <TriangleAlert className="size-3" /> KTV hủy: {pct(t.cancelByTech)}
                            </span>
                          ) : (
                            <div className="text-xs text-body">
                              KTV hủy: <b>{pct(t.cancelByTech)}</b>
                            </div>
                          )}
                          <div className="text-[11px] text-muted">Khách hủy: {pct(t.cancelByCustomer)}</div>
                        </>
                      )}
                    </td>

                    <td className="px-3 py-3.5">
                      {t.rating == null ? (
                        <span className="text-xs text-muted">—</span>
                      ) : (
                        <div className="flex items-center gap-1 text-xs">
                          <Star className="size-3.5 fill-amber-400 text-amber-400" />
                          <b className="text-ink">{t.rating.toFixed(2)}</b>
                          {t.reviews != null && t.reviews > 0 && <span className="text-muted">({num(t.reviews)})</span>}
                        </div>
                      )}
                    </td>

                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            locked ? "bg-red-500 text-white" : "bg-emerald-50 text-emerald-600"
                          }`}
                        >
                          {locked ? "Đã khóa" : "Hoạt động"}
                        </span>
                        <div className="flex items-center gap-2.5 text-muted">
                          <Link href={`/admin/technicians/${t.id}`} aria-label={`Xem ${t.name}`} className="hover:text-ink">
                            <Eye className="size-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => resetPassword(t)}
                            aria-label={`Đặt lại mật khẩu ${t.name}`}
                            className="hover:text-ink"
                          >
                            <KeyRound className="size-4" />
                          </button>
                          {locked ? (
                            <button
                              type="button"
                              onClick={() => toggleLock(t)}
                              className="flex items-center gap-1 rounded-md border border-line bg-white px-2 py-1 text-[11px] font-semibold text-body hover:bg-field"
                            >
                              <LockOpen className="size-3.5" /> Mở khóa
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => toggleLock(t)}
                              aria-label={`Khóa ${t.name}`}
                              className="hover:text-red-500"
                            >
                              <Lock className="size-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Chân bảng */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-field/40 px-5 py-3">
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
            <span>
              Hiển thị{" "}
              <b className="text-ink">
                {total === 0 ? 0 : start + 1} - {Math.min(start + query.pageSize, total)}
              </b>{" "}
              trên <b className="text-ink">{total}</b> kỹ thuật viên
            </span>
            <label className="flex items-center gap-2">
              Số dòng:
              <select
                value={query.pageSize}
                onChange={(e) => go({ size: Number(e.target.value), page: 1 })}
                className="h-8 rounded-md border border-line bg-white px-2 text-xs font-semibold text-ink outline-none"
              >
                {[10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={current === 1}
              onClick={() => go({ page: current - 1 })}
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
                  onClick={() => go({ page: n })}
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
              onClick={() => go({ page: current + 1 })}
              aria-label="Trang sau"
              className="flex size-8 items-center justify-center rounded-md border border-line bg-white text-muted disabled:opacity-40"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

function StatCard({
  label, value, note, right, valueClass = "text-ink",
}: {
  label: string
  value: number | null
  note: string
  right: React.ReactNode
  valueClass?: string
}) {
  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-semibold tracking-wider text-muted">{label}</span>
        {right}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className={`text-3xl font-bold ${valueClass}`}>
          {value == null ? "—" : value.toLocaleString("vi-VN")}
        </span>
        <span className="text-sm font-semibold text-muted">KTV</span>
      </div>
      <div className="mt-1 text-xs text-muted">{note}</div>
    </div>
  )
}