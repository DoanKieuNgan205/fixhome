"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  ChevronDown, ChevronLeft, ChevronRight, Eye, Lock, LockOpen,
  MapPin, MoreVertical, RefreshCw, Search,
} from "lucide-react"
import { opTechnicians, type OpStatus, type OpTech } from "@/lib/operator/mock-technicians"
import { initials } from "@/lib/admin/customer-utils"

const PAGE_SIZE = 8

type Tab = "all" | "receiving" | "off" | "blocked"

const AVATAR_TONES = [
  "bg-orange-50 text-orange-600", "bg-indigo-50 text-indigo-600", "bg-pink-50 text-pink-500",
  "bg-cyan-50 text-cyan-600", "bg-emerald-50 text-emerald-600", "bg-amber-50 text-amber-600",
]

const STATUS_BADGE: Record<OpStatus, { text: string; cls: string; note: string }> = {
  active: { text: "Hoạt động", cls: "bg-emerald-50 text-emerald-600", note: "" },
  suspended: { text: "Tạm khóa", cls: "bg-orange-100 text-orange-700", note: "text-orange-600" },
  locked: { text: "Đã khóa", cls: "bg-red-500 text-white", note: "text-red-500" },
}

// Các tab loại trừ nhau: nhận việc / tắt nhận việc / tạm khóa-đã khóa
const inTab = (t: OpTech, tab: Tab) =>
  tab === "all" ||
  (tab === "receiving" && t.status === "active" && t.available) ||
  (tab === "off" && t.status === "active" && !t.available) ||
  (tab === "blocked" && t.status !== "active")

const area = (t: OpTech) => `${t.district}, ${t.city}`

function pageList(current: number, total: number): (number | "…")[] {
  if (total <= 6) return Array.from({ length: total }, (_, i) => i + 1)
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
  "h-10 w-full appearance-none rounded-lg border border-line bg-white pl-3 pr-9 text-sm text-ink outline-none transition focus:border-cta focus:ring-2 focus:ring-cta/15"

export function TechnicianList() {
  const [rows, setRows] = useState<OpTech[]>(opTechnicians)
  const [tab, setTab] = useState<Tab>("all")
  const [keyword, setKeyword] = useState("")
  const [areaFilter, setAreaFilter] = useState("all")
  const [skillFilter, setSkillFilter] = useState("all")
  const [page, setPage] = useState(1)

  const counts = useMemo(
    () => ({
      all: rows.length,
      receiving: rows.filter((t) => inTab(t, "receiving")).length,
      off: rows.filter((t) => inTab(t, "off")).length,
      blocked: rows.filter((t) => inTab(t, "blocked")).length,
    }),
    [rows],
  )

  const areas = useMemo(() => Array.from(new Set(rows.map(area))).sort((a, b) => a.localeCompare(b, "vi")), [rows])
  const skills = useMemo(
    () => Array.from(new Set(rows.flatMap((t) => t.skills))).sort((a, b) => a.localeCompare(b, "vi")),
    [rows],
  )

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase()
    return rows.filter(
      (t) =>
        inTab(t, tab) &&
        (areaFilter === "all" || area(t) === areaFilter) &&
        (skillFilter === "all" || t.skills.includes(skillFilter)) &&
        (!k || [t.name, t.code, ...t.skills].some((v) => v.toLowerCase().includes(k))),
    )
  }, [rows, tab, keyword, areaFilter, skillFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, totalPages)
  const start = (current - 1) * PAGE_SIZE
  const pageRows = filtered.slice(start, start + PAGE_SIZE)

  function resetFilters() {
    setKeyword("")
    setAreaFilter("all")
    setSkillFilter("all")
    setPage(1)
  }

  function toggleLock(t: OpTech) {
    const locking = t.status === "active"
    const ok = window.confirm(
      locking ? `Tạm khóa tài khoản của "${t.name}"?` : `Mở khóa tài khoản của "${t.name}"?`,
    )
    if (!ok) return
    // TODO: gọi API tạm khóa / mở khóa tài khoản KTV
    setRows((list) =>
      list.map((x) =>
        x.id === t.id
          ? locking
            ? { ...x, status: "suspended", available: false, statusNote: "Tạm khóa bởi vận hành" }
            : { ...x, status: "active", statusNote: undefined }
          : x,
      ),
    )
  }

  const tabs: { key: Tab; label: string; badge: string }[] = [
    { key: "all", label: "Tất cả", badge: "bg-field text-body" },
    { key: "receiving", label: "Đang nhận việc", badge: "bg-emerald-50 text-emerald-600" },
    { key: "off", label: "Đang tắt nhận việc", badge: "bg-blue-50 text-blue-600" },
    { key: "blocked", label: "Tạm khóa / Đã khóa", badge: "bg-red-50 text-red-500" },
  ]

  return (
    <div>
      <h1 className="sr-only">Danh sách KTV</h1>

      <section className="rounded-xl border border-line bg-white shadow-sm">
        {/* Tab */}
        <div className="flex flex-wrap gap-x-6 border-b border-line px-5" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => { setTab(t.key); setPage(1) }}
              className={`-mb-px flex items-center gap-2 border-b-2 py-3.5 text-sm font-semibold transition ${
                tab === t.key ? "border-cta text-cta" : "border-transparent text-body hover:text-ink"
              }`}
            >
              {t.label}
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${t.badge}`}>
                {counts[t.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Bộ lọc */}
        <div className="flex flex-wrap items-center gap-3 p-4">
          <div className="flex h-10 min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-line bg-field/50 px-3 focus-within:border-cta focus-within:bg-white focus-within:ring-2 focus-within:ring-cta/15">
            <Search className="size-4 text-muted" />
            <input
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(1) }}
              placeholder="Tìm theo tên, SĐT, mã KTV..."
              className="h-full w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
            />
          </div>

          <div className="relative w-48">
            <select
              value={areaFilter}
              onChange={(e) => { setAreaFilter(e.target.value); setPage(1) }}
              className={selectBox}
              aria-label="Khu vực"
            >
              <option value="all">Tất cả khu vực</option>
              {areas.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3 size-4 text-muted" />
          </div>

          <div className="relative w-48">
            <select
              value={skillFilter}
              onChange={(e) => { setSkillFilter(e.target.value); setPage(1) }}
              className={selectBox}
              aria-label="Nghiệp vụ"
            >
              <option value="all">Tất cả nghiệp vụ</option>
              {skills.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3 size-4 text-muted" />
          </div>

          <button
            type="button"
            onClick={resetFilters}
            aria-label="Đặt lại bộ lọc"
            title="Đặt lại bộ lọc"
            className="flex size-10 items-center justify-center rounded-lg border border-line bg-white text-body hover:bg-field"
          >
            <RefreshCw className="size-4" />
          </button>
        </div>

        {/* Bảng */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead className="bg-field/60 text-[11px] font-semibold uppercase text-muted">
              <tr>
                <th className="px-5 py-3">Kỹ thuật viên</th>
                <th className="px-4 py-3">Nghiệp vụ & khu vực</th>
                <th className="px-4 py-3">Nhận việc</th>
                <th className="px-4 py-3">Đánh giá</th>
                <th className="px-4 py-3">Tài khoản</th>
                <th className="w-10 px-3 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="h-28 text-center text-sm text-muted">
                    Không tìm thấy kỹ thuật viên phù hợp
                  </td>
                </tr>
              )}
              {pageRows.map((t, idx) => {
                const b = STATUS_BADGE[t.status]
                const bg =
                  t.status === "locked" ? "bg-red-50/40"
                  : t.status === "suspended" ? "bg-orange-50/40"
                  : "hover:bg-field/40"
                return (
                  <tr key={t.id} className={bg}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${AVATAR_TONES[(start + idx) % AVATAR_TONES.length]}`}
                        >
                          {initials(t.name)}
                        </span>
                        <div>
                          <Link href={`/operator/technicians/${t.id}`} className="text-[13px] font-semibold text-ink hover:text-cta">
                            {t.name}
                          </Link>
                          <div className="text-[11px] text-muted">{t.code}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1.5">
                        {t.skills.map((s) => (
                          <span key={s} className="rounded border border-blue-100 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                            {s}
                          </span>
                        ))}
                      </div>
                      <div className="mt-1.5 flex items-center gap-1 text-[11px] text-muted">
                        <MapPin className="size-3" /> {area(t)}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          t.available ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <span className={`size-1.5 rounded-full ${t.available ? "bg-emerald-500" : "bg-slate-400"}`} />
                        {t.available ? "Đang bật" : "Đang tắt"}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-sm font-bold text-ink">
                      <span className="text-amber-400">★</span> {t.rating.toFixed(2)}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${b.cls}`}>
                        {b.text}
                      </span>
                      {t.statusNote && (
                        <div className={`mt-1 text-[10px] font-medium ${b.note}`}>{t.statusNote}</div>
                      )}
                    </td>

                    <td className="px-3 py-3.5">
                      <RowMenu tech={t} onToggleLock={() => toggleLock(t)} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Chân bảng */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3">
          <span className="text-xs text-muted">
            Hiển thị <b className="text-ink">{pageRows.length}</b> trên tổng số{" "}
            <b className="text-ink">{filtered.length}</b> kỹ thuật viên
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
    </div>
  )
}

// Menu "⋮" dùng vị trí fixed để không bị bảng cuộn ngang cắt mất
function RowMenu({ tech, onToggleLock }: { tech: OpTech; onToggleLock: () => void }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    const onDown = (e: MouseEvent) => {
      const el = e.target as Node
      if (!menuRef.current?.contains(el) && !btnRef.current?.contains(el)) close()
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close()
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    window.addEventListener("scroll", close, true)
    window.addEventListener("resize", close)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
      window.removeEventListener("scroll", close, true)
      window.removeEventListener("resize", close)
    }
  }, [open])

  function toggle() {
    if (open) return setOpen(false)
    const r = btnRef.current?.getBoundingClientRect()
    if (r) setPos({ top: r.bottom + 4, right: window.innerWidth - r.right })
    setOpen(true)
  }

  const item = "flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-ink hover:bg-field"

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Thao tác với ${tech.name}`}
        className="flex size-8 items-center justify-center rounded-md text-muted hover:bg-field hover:text-ink"
      >
        <MoreVertical className="size-4" />
      </button>

      {open && pos && (
        <div
          ref={menuRef}
          role="menu"
          style={{ top: pos.top, right: pos.right }}
          className="fixed z-50 w-44 overflow-hidden rounded-lg border border-line bg-white py-1 shadow-lg"
        >
          <Link href={`/operator/technicians/${tech.id}`} role="menuitem" className={item}>
            <Eye className="size-3.5" /> Xem hồ sơ
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => { setOpen(false); onToggleLock() }}
            className={`${item} ${tech.status === "active" ? "text-red-500" : "text-emerald-600"}`}
          >
            {tech.status === "active" ? <Lock className="size-3.5" /> : <LockOpen className="size-3.5" />}
            {tech.status === "active" ? "Tạm khóa" : "Mở khóa"}
          </button>
        </div>
      )}
    </>
  )
}