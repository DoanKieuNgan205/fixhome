"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  ChevronDown, ChevronLeft, ChevronRight, Download, Eye, KeyRound, Lock,
  Search, ShieldAlert, ShieldCheck, SlidersHorizontal, Users, X,
} from "lucide-react"
import type { ApiCustomer, Paginated } from "@/lib/api/types"
import {
  STATUS_BADGE, STATUS_LABEL, STATUS_PARAM, formatDate, initials, toUiStatus,
  type UiStatus,
} from "@/lib/admin/customer-utils"

type Query = { q: string; status: UiStatus | "all"; page: number; size: number }

type Props = {
  data: Paginated<ApiCustomer>
  stats: { total: number | null; active: number | null; locked: number | null }
  filters: { q: string; status?: UiStatus }
}

const AVATAR_TONES = [
  "bg-indigo-50 text-indigo-600", "bg-pink-50 text-pink-500", "bg-amber-50 text-amber-600",
  "bg-cyan-50 text-cyan-600", "bg-emerald-50 text-emerald-600",
]

const STATUS_OPTIONS: Record<"all" | UiStatus, string> = {
  all: "Tất cả trạng thái",
  ...STATUS_LABEL,
}

const fmt = (n: number | null) => (n === null ? "—" : n.toLocaleString("vi-VN"))

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

export function CustomerManager({ data, stats, filters }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const [keyword, setKeyword] = useState(filters.q)
  const [status, setStatus] = useState<UiStatus | "all">(filters.status ?? "all")
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState("")

  const query: Query = {
    q: filters.q,
    status: filters.status ?? "all",
    page: data.page,
    size: data.page_size,
  }

  // Mọi thay đổi bộ lọc / trang đều đẩy lên URL, server sẽ gọi lại API
  function go(patch: Partial<Query>) {
    const n = { ...query, ...patch }
    const p = new URLSearchParams()
    if (n.q) p.set("q", n.q)
    if (n.status !== "all") p.set("status", n.status)
    if (n.page > 1) p.set("page", String(n.page))
    if (n.size !== 20) p.set("size", String(n.size))
    const qs = p.toString()
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname))
  }

  function search() {
    go({ q: keyword.trim(), status, page: 1 })
  }

  function clearAll() {
    setKeyword("")
    setStatus("all")
    go({ q: "", status: "all", page: 1 })
  }

  async function exportCsv() {
    setExporting(true)
    setExportError("")
    try {
      const p = new URLSearchParams()
      if (filters.q) p.set("q", filters.q)
      if (filters.status) p.set("status", STATUS_PARAM[filters.status])

      const res = await fetch(`/api/admin/customers/export?${p}`)
      if (res.status === 401) {
        window.location.href = "/login"
        return
      }
      if (!res.ok) throw new Error("EXPORT")

      const url = URL.createObjectURL(await res.blob())
      const a = document.createElement("a")
      a.href = url
      a.download = `khach-hang-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setExportError("Không xuất được file, vui lòng thử lại")
    } finally {
      setExporting(false)
    }
  }

  const start = (data.page - 1) * data.page_size
  const from = data.total_items === 0 ? 0 : start + 1
  const to = start + data.items.length

  const chips: { text: string; clear: () => void }[] = []
  if (filters.q) {
    chips.push({
      text: `Từ khóa: "${filters.q}"`,
      clear: () => { setKeyword(""); go({ q: "", page: 1 }) },
    })
  }
  if (filters.status) {
    chips.push({
      text: `Trạng thái: ${STATUS_LABEL[filters.status]}`,
      clear: () => { setStatus("all"); go({ status: "all", page: 1 }) },
    })
  }

  const activePct =
    stats.total && stats.active !== null ? ((stats.active / stats.total) * 100).toFixed(1) : null

  return (
    <div className="space-y-5">
      {/* Tiêu đề */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-ink">Quản lý Khách hàng</h1>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
            {fmt(stats.total ?? data.total_items)} hồ sơ
          </span>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          disabled={exporting}
          className="flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:bg-field disabled:opacity-60"
        >
          <Download className="size-4" /> {exporting ? "Đang xuất..." : "Xuất Excel"}
        </button>
      </div>
      {exportError && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {exportError}
        </p>
      )}

      {/* Thống kê (đếm từ API danh sách) */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="TỔNG KHÁCH HÀNG" value={fmt(stats.total)} icon={Users} tone="bg-orange-50 text-cta" />
        <StatCard
          label="ĐANG HOẠT ĐỘNG"
          value={fmt(stats.active)}
          icon={ShieldCheck}
          tone="bg-emerald-50 text-emerald-600"
          note={activePct ? `● Chiếm ${activePct}% tổng tài khoản` : undefined}
        />
        <StatCard
          label="ĐÃ KHÓA TÀI KHOẢN"
          value={fmt(stats.locked)}
          icon={ShieldAlert}
          tone="bg-red-50 text-red-500"
          valueClass="text-red-600"
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
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo tên, số điện thoại, email..."
              className="h-full w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
            />
          </div>

          <div className="relative w-52">
            <SlidersHorizontal className="pointer-events-none absolute left-3 top-3 size-4 text-muted" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as UiStatus | "all")}
              aria-label="Trạng thái"
              className="h-10 w-full appearance-none rounded-lg border border-line bg-white pl-9 pr-9 text-sm text-ink outline-none transition focus:border-cta focus:ring-2 focus:ring-cta/15"
            >
              {Object.entries(STATUS_OPTIONS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
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
                key={c.text}
                className="flex items-center gap-1.5 rounded-md border border-blue-100 bg-blue-50 px-2.5 py-1 font-medium text-blue-700"
              >
                {c.text}
                <button type="button" onClick={c.clear} aria-label={`Bỏ lọc ${c.text}`}>
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
      <section
        className={`overflow-hidden rounded-xl border border-line bg-white shadow-sm transition-opacity ${
          isPending ? "opacity-60" : ""
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead className="bg-field/60 text-[11px] font-semibold uppercase text-muted">
              <tr>
                <th className="px-5 py-3">Khách hàng</th>
                <th className="px-4 py-3">Số điện thoại</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Ngày đăng ký</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.items.length === 0 && (
                <tr>
                  <td colSpan={6} className="h-28 text-center text-sm text-muted">
                    Không tìm thấy khách hàng phù hợp
                  </td>
                </tr>
              )}
              {data.items.map((c, idx) => {
                const st = toUiStatus(c.status)
                const locked = st === "locked"
                return (
                  <tr key={c.id} className={locked ? "bg-red-50/40" : "hover:bg-field/40"}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${AVATAR_TONES[idx % AVATAR_TONES.length]}`}
                        >
                          {initials(c.full_name)}
                        </span>
                        <div className="min-w-0">
                          <div className={`text-[13px] font-semibold ${locked ? "text-muted" : "text-ink"}`}>
                            {c.full_name}
                          </div>
                          <div className="text-[11px] text-muted">#{c.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-body">{c.phone || "—"}</td>
                    <td className="px-4 py-3 text-xs text-body">{c.email || "—"}</td>
                    <td className="px-4 py-3 text-xs text-body">{formatDate(c.created_at)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_BADGE[st]}`}>
                        {STATUS_LABEL[st]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-3 text-muted">
                        <Link href={`/admin/customers/${c.id}`} aria-label={`Xem ${c.full_name}`} className="hover:text-ink">
                          <Eye className="size-4" />
                        </Link>
                        {/* Backend chưa có API đặt lại mật khẩu / khóa tài khoản */}
                        <span title="Chưa có API" className="cursor-not-allowed opacity-40">
                          <KeyRound className="size-4" />
                        </span>
                        <span title="Chưa có API" className="cursor-not-allowed opacity-40">
                          <Lock className="size-4" />
                        </span>
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
              Hiển thị <b className="text-ink">{from} - {to}</b> trong tổng số{" "}
              <b className="text-ink">{data.total_items.toLocaleString("vi-VN")}</b> khách hàng
            </span>
            <label className="flex items-center gap-2">
              Dòng / trang
              <select
                value={data.page_size}
                onChange={(e) => go({ size: Number(e.target.value), page: 1 })}
                className="h-8 rounded-md border border-line bg-white px-2 text-xs font-semibold text-ink outline-none"
              >
                {[10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={data.page <= 1}
              onClick={() => go({ page: data.page - 1 })}
              aria-label="Trang trước"
              className="flex size-8 items-center justify-center rounded-md border border-line bg-white text-muted disabled:opacity-40"
            >
              <ChevronLeft className="size-4" />
            </button>
            {pageList(data.page, Math.max(1, data.total_pages)).map((n, i) =>
              n === "…" ? (
                <span key={`gap-${i}`} className="px-1 text-xs text-muted">…</span>
              ) : (
                <button
                  key={n}
                  onClick={() => go({ page: n })}
                  className={`size-8 rounded-md text-xs font-semibold ${
                    n === data.page ? "bg-cta text-white" : "border border-line bg-white text-body hover:bg-field"
                  }`}
                >
                  {n}
                </button>
              ),
            )}
            <button
              disabled={data.page >= data.total_pages}
              onClick={() => go({ page: data.page + 1 })}
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
  value: string
  icon: React.ComponentType<{ className?: string }>
  tone: string
  note?: string
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
      <div className={`mt-2 text-3xl font-bold ${valueClass}`}>{value}</div>
      {note && <div className="mt-1 text-xs font-medium text-muted">{note}</div>}
    </div>
  )
}