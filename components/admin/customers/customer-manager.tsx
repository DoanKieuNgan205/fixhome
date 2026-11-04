"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  Calendar, ChevronDown, ChevronLeft, ChevronRight, Download, Eye, KeyRound,
  Lock, LockOpen, MapPin, Search, ShieldAlert, ShieldCheck, SlidersHorizontal,
  TriangleAlert, UserPlus, Users, X,
} from "lucide-react"
import {
  areas, customers as initialCustomers,
  type Customer, type CustomerStatus,
} from "@/lib/admin/mock-customers"

type TimeRange = "all" | "today" | "7d" | "30d" | "year"
type Filters = {
  keyword: string
  area: string // "all" hoặc tên quận
  time: TimeRange
  status: "all" | CustomerStatus
}

const EMPTY: Filters = { keyword: "", area: "all", time: "all", status: "all" }

const TIME_LABEL: Record<TimeRange, string> = {
  all: "Tất cả thời gian",
  today: "Hôm nay",
  "7d": "7 ngày qua",
  "30d": "30 ngày qua",
  year: "Năm nay",
}
const STATUS_LABEL: Record<Filters["status"], string> = {
  all: "Tất cả trạng thái",
  active: "Hoạt động",
  inactive: "Chưa kích hoạt",
  locked: "Đã khóa",
}
const STATUS_STYLE: Record<CustomerStatus, string> = {
  active: "bg-emerald-50 text-emerald-600",
  inactive: "bg-blue-50 text-blue-600",
  locked: "bg-red-50 text-red-500",
}
const AVATAR_TONES = [
  "bg-indigo-50 text-indigo-600", "bg-pink-50 text-pink-500", "bg-amber-50 text-amber-600",
  "bg-cyan-50 text-cyan-600", "bg-emerald-50 text-emerald-600",
]

const initials = (name: string) =>
  name.trim().split(/\s+/).slice(-2).map((w) => w[0]).join("").toUpperCase()

const formatDate = (iso: string) => {
  const [y, m, d] = iso.split("-")
  return `${d}/${m}/${y}`
}

function inRange(iso: string, time: TimeRange) {
  if (time === "all") return true
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
  if (time === "today") return iso === today
  if (time === "year") return iso.startsWith(String(now.getFullYear()))
  const days = (now.getTime() - new Date(iso).getTime()) / 86_400_000
  return days >= 0 && days <= (time === "7d" ? 7 : 30)
}

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

function exportCsv(rows: Customer[]) {
  const head = ["Mã KH", "Họ tên", "Số điện thoại", "Email", "Khu vực", "Ngày đăng ký", "Đơn hoàn thành", "Trạng thái"]
  const body = rows.map((c) => [
    c.code, c.name, c.phone, c.email, `${c.district}, ${c.city}`,
    formatDate(c.createdAt), c.completedOrders, STATUS_LABEL[c.status],
  ])
  const csv = [head, ...body]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n")
  // \uFEFF để Excel đọc đúng tiếng Việt
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "khach-hang.csv"
  a.click()
  URL.revokeObjectURL(url)
}

const selectBox =
  "h-10 w-full appearance-none rounded-lg border border-line bg-white pl-3 pr-9 text-sm text-ink outline-none transition focus:border-cta focus:ring-2 focus:ring-cta/15"

export function CustomerManager() {
  const [rowsAll, setRowsAll] = useState<Customer[]>(initialCustomers)
  const [draft, setDraft] = useState<Filters>(EMPTY) // đang nhập
  const [applied, setApplied] = useState<Filters>(EMPTY) // đã bấm "Tìm kiếm"
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const k = applied.keyword.trim().toLowerCase()
    return rowsAll.filter((c) => {
      const okKey =
        !k || [c.name, c.phone, c.email, c.code].some((v) => v.toLowerCase().includes(k))
      const okArea = applied.area === "all" || c.district === applied.area
      const okTime = inRange(c.createdAt, applied.time)
      const okStatus = applied.status === "all" || c.status === applied.status
      return okKey && okArea && okTime && okStatus
    })
  }, [rowsAll, applied])

  const stats = useMemo(() => {
    const now = new Date()
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    return {
      total: rowsAll.length,
      newThisMonth: rowsAll.filter((c) => c.createdAt.startsWith(month)).length,
      active: rowsAll.filter((c) => c.status === "active").length,
      locked: rowsAll.filter((c) => c.status === "locked").length,
    }
  }, [rowsAll])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const current = Math.min(page, totalPages)
  const start = (current - 1) * pageSize
  const rows = filtered.slice(start, start + pageSize)

  function search() {
    setApplied(draft)
    setPage(1)
  }

  function clearAll() {
    setDraft(EMPTY)
    setApplied(EMPTY)
    setPage(1)
  }

  function removeChip(key: keyof Filters) {
    const patch = { [key]: EMPTY[key] } as Partial<Filters>
    setDraft((f) => ({ ...f, ...patch }))
    setApplied((f) => ({ ...f, ...patch }))
    setPage(1)
  }

  function toggleLock(c: Customer) {
    const locking = c.status !== "locked"
    const ok = window.confirm(
      locking ? `Khóa tài khoản "${c.name}"?` : `Mở khóa tài khoản "${c.name}"?`,
    )
    if (!ok) return
    // TODO: gọi API khóa / mở khóa tài khoản
    setRowsAll((list) =>
      list.map((x) =>
        x.id === c.id ? { ...x, status: locking ? "locked" : "active" } : x,
      ),
    )
  }

  function resetPassword(c: Customer) {
    if (!window.confirm(`Gửi yêu cầu đặt lại mật khẩu cho "${c.name}"?`)) return
    // TODO: gọi API đặt lại mật khẩu
    console.log("Reset mật khẩu", c.id)
  }

  const chips: { key: keyof Filters; text: string }[] = []
  if (applied.keyword.trim()) chips.push({ key: "keyword", text: `Từ khóa: "${applied.keyword.trim()}"` })
  if (applied.area !== "all") chips.push({ key: "area", text: `Khu vực: ${applied.area}` })
  if (applied.time !== "all") chips.push({ key: "time", text: `Thời gian: ${TIME_LABEL[applied.time]}` })
  if (applied.status !== "all") chips.push({ key: "status", text: `Trạng thái: ${STATUS_LABEL[applied.status]}` })

  return (
    <div className="space-y-5">
      {/* Tiêu đề */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-ink">Quản lý Khách hàng</h1>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
            {stats.total.toLocaleString("vi-VN")} hồ sơ
          </span>
        </div>
        <button
          type="button"
          onClick={() => exportCsv(filtered)}
          className="flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:bg-field"
        >
          <Download className="size-4" /> Xuất Excel
        </button>
      </div>

      {/* Thống kê */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="TỔNG KHÁCH HÀNG" value={stats.total} icon={Users}
          tone="bg-orange-50 text-cta"
          note={<span className="text-emerald-600">↗ +8.2% <span className="text-muted">(toàn hệ thống)</span></span>}
        />
        <StatCard
          label="KHÁCH MỚI THÁNG NÀY" value={stats.newThisMonth} icon={UserPlus}
          tone="bg-indigo-50 text-indigo-600"
          note={<span className="text-emerald-600">↗ +15.4% <span className="text-muted">so với tháng trước</span></span>}
        />
        <StatCard
          label="ĐANG HOẠT ĐỘNG" value={stats.active} icon={ShieldCheck}
          tone="bg-emerald-50 text-emerald-600"
          note={
            <span className="text-muted">
              ● Chiếm {stats.total ? ((stats.active / stats.total) * 100).toFixed(1) : 0}% tổng tài khoản
            </span>
          }
        />
        <StatCard
          label="ĐÃ KHÓA TÀI KHOẢN" value={stats.locked} icon={ShieldAlert}
          tone="bg-red-50 text-red-500" valueClass="text-red-600"
          note={
            <span className="flex items-center gap-1 text-red-500">
              <TriangleAlert className="size-3" /> Cảnh báo:{" "}
              <span className="text-muted">vi phạm chính sách</span>
            </span>
          }
        />
      </div>

      {/* Bộ lọc */}
      <section className="rounded-xl border border-line bg-white p-4 shadow-sm">
        <form
          onSubmit={(e) => { e.preventDefault(); search() }}
          className="flex flex-wrap items-center gap-3"
        >
          <div className="flex h-10 min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-line px-3 focus-within:border-cta focus-within:ring-2 focus-within:ring-cta/15">
            <Search className="size-4 text-muted" />
            <input
              value={draft.keyword}
              onChange={(e) => setDraft({ ...draft, keyword: e.target.value })}
              placeholder="Tìm theo tên, số điện thoại, email, mã khách..."
              className="h-full w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
            />
          </div>

          <div className="relative w-44">
            <MapPin className="pointer-events-none absolute left-3 top-3 size-4 text-muted" />
            <select
              value={draft.area}
              onChange={(e) => setDraft({ ...draft, area: e.target.value })}
              className={`${selectBox} pl-9`}
              aria-label="Khu vực"
            >
              <option value="all">Tất cả khu vực</option>
              {areas.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3 size-4 text-muted" />
          </div>

          <div className="relative w-48">
            <Calendar className="pointer-events-none absolute left-3 top-3 size-4 text-muted" />
            <select
              value={draft.time}
              onChange={(e) => setDraft({ ...draft, time: e.target.value as TimeRange })}
              className={`${selectBox} pl-9`}
              aria-label="Thời gian đăng ký"
            >
              {Object.entries(TIME_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3 size-4 text-muted" />
          </div>

          <div className="relative w-48">
            <SlidersHorizontal className="pointer-events-none absolute left-3 top-3 size-4 text-muted" />
            <select
              value={draft.status}
              onChange={(e) => setDraft({ ...draft, status: e.target.value as Filters["status"] })}
              className={`${selectBox} pl-9`}
              aria-label="Trạng thái"
            >
              {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3 size-4 text-muted" />
          </div>

          <button
            type="submit"
            className="h-10 rounded-lg bg-cta px-6 text-sm font-semibold text-white transition hover:brightness-95"
          >
            Tìm kiếm
          </button>
        </form>

        {chips.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-muted">ĐANG LỌC:</span>
            {chips.map((c) => (
              <span
                key={c.key}
                className="flex items-center gap-1.5 rounded-md border border-blue-100 bg-blue-50 px-2.5 py-1 font-medium text-blue-700"
              >
                {c.text}
                <button type="button" onClick={() => removeChip(c.key)} aria-label={`Bỏ lọc ${c.text}`}>
                  <X className="size-3" />
                </button>
              </span>
            ))}
            <button type="button" onClick={clearAll} className="font-semibold text-cta hover:underline">
              Xóa bộ lọc
            </button>
          </div>
        )}
      </section>

      {/* Bảng */}
      <section className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left">
            <thead className="bg-field/60 text-[11px] font-semibold uppercase text-muted">
              <tr>
                <th className="px-5 py-3">Khách hàng</th>
                <th className="px-4 py-3">Số điện thoại</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Khu vực</th>
                <th className="px-4 py-3">Ngày đăng ký</th>
                <th className="px-4 py-3">Đơn hoàn thành</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="h-28 text-center text-sm text-muted">
                    Không tìm thấy khách hàng phù hợp
                  </td>
                </tr>
              )}
              {rows.map((c, idx) => {
                const locked = c.status === "locked"
                return (
                  <tr key={c.id} className={locked ? "bg-red-50/40" : "hover:bg-field/40"}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${AVATAR_TONES[(start + idx) % AVATAR_TONES.length]}`}
                        >
                          {initials(c.name)}
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className={`text-[13px] font-semibold ${locked ? "text-muted" : "text-ink"}`}>
                              {c.name}
                            </span>
                            {c.vip && (
                              <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-cta">VIP</span>
                            )}
                            {c.cancelWarning && (
                              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                                Hủy nhiều
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-muted">{c.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-body">{c.phone}</td>
                    <td className="px-4 py-3 text-xs text-body">{c.email}</td>
                    <td className="px-4 py-3 text-xs text-body">
                      {c.district},<br />{c.city}
                    </td>
                    <td className="px-4 py-3 text-xs text-body">{formatDate(c.createdAt)}</td>
                    <td className="px-4 py-3 text-xs text-body">{c.completedOrders} đơn</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLE[c.status]}`}>
                        {STATUS_LABEL[c.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-3 text-muted">
                        <Link
                          href={`/admin/customers/${c.id}`}
                          aria-label={`Xem ${c.name}`}
                          className="hover:text-ink"
                        >
                          <Eye className="size-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => resetPassword(c)}
                          aria-label={`Đặt lại mật khẩu ${c.name}`}
                          className="hover:text-ink"
                        >
                          <KeyRound className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleLock(c)}
                          aria-label={locked ? `Mở khóa ${c.name}` : `Khóa ${c.name}`}
                          className={locked ? "text-emerald-500 hover:text-emerald-600" : "hover:text-red-500"}
                        >
                          {locked ? <LockOpen className="size-4" /> : <Lock className="size-4" />}
                        </button>
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
                {filtered.length === 0 ? 0 : start + 1} - {Math.min(start + pageSize, filtered.length)}
              </b>{" "}
              trong tổng số <b className="text-ink">{filtered.length.toLocaleString("vi-VN")}</b> khách hàng
            </span>
            <label className="flex items-center gap-2">
              Dòng / trang
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
                className="h-8 rounded-md border border-line bg-white px-2 text-xs font-semibold text-ink outline-none"
              >
                {[10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          </div>

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
    </div>
  )
}

function StatCard({
  label, value, icon: Icon, tone, note, valueClass = "text-ink",
}: {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  tone: string
  note: React.ReactNode
  valueClass?: string
}) {
  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-semibold tracking-wider text-muted">{label}</span>
        <span className={`flex size-8 items-center justify-center rounded-lg ${tone}`}>
          <Icon className="size-4" />
        </span>
      </div>
      <div className={`mt-2 text-3xl font-bold ${valueClass}`}>{value.toLocaleString("vi-VN")}</div>
      <div className="mt-1 text-xs font-medium">{note}</div>
    </div>
  )
}