"use client"

import { useEffect, useMemo, useState } from "react"
import {
  ArrowRight, Bell, Camera, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight,
  Clock, FileText, History, Info, MapPin, RefreshCw, Search, UserRound, X,
} from "lucide-react"
import { Modal, btnGhost, btnPrimary, fieldCls } from "@/components/operator/shared/modal"
import { approvalCases, type ApprovalCase, type ApprovalSkill } from "@/lib/operator/mock-approvals"
import { initials } from "@/lib/admin/customer-utils"

const PAGE_SIZE = 8

type Tab = "all" | "profile" | "skill" | "missing"
type HistoryItem = { at: string; text: string }

const profileWaiting = (c: ApprovalCase) => c.profile.state === "pending" || c.profile.state === "resubmit"
const skillWaiting = (c: ApprovalCase) => c.skills.some((s) => s.state === "pending")
const skillMissing = (c: ApprovalCase) => c.skills.some((s) => s.state === "missing")
const needsAction = (c: ApprovalCase) => profileWaiting(c) || skillWaiting(c) || skillMissing(c)
const hasReview = (c: ApprovalCase) => profileWaiting(c) || skillWaiting(c)

const inTab = (c: ApprovalCase, tab: Tab) =>
  tab === "all" ? needsAction(c)
  : tab === "profile" ? profileWaiting(c)
  : tab === "skill" ? skillWaiting(c)
  : skillMissing(c)

const fmt = (iso: string) => {
  const [d, t] = iso.split("T")
  const [y, m, day] = d.split("-")
  return `${day}/${m}/${y} ${t}`
}

function age(dob: string) {
  const b = new Date(dob)
  const n = new Date()
  let a = n.getFullYear() - b.getFullYear()
  if (n < new Date(n.getFullYear(), b.getMonth(), b.getDate())) a--
  return a
}

const dmy = (iso: string) => iso.split("-").reverse().join("/")

const AVATAR_TONES = [
  "bg-orange-50 text-orange-600", "bg-indigo-50 text-indigo-600", "bg-pink-50 text-pink-500",
  "bg-cyan-50 text-cyan-600", "bg-emerald-50 text-emerald-600", "bg-amber-50 text-amber-600",
]

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
  "h-10 w-full appearance-none rounded-lg border border-line bg-white pl-9 pr-9 text-sm text-ink outline-none transition focus:border-cta focus:ring-2 focus:ring-cta/15"

export function ApprovalManager() {
  const [cases, setCases] = useState<ApprovalCase[]>(approvalCases)
  const [tab, setTab] = useState<Tab>("all")
  const [keyword, setKeyword] = useState("")
  const [city, setCity] = useState<"all" | "HN" | "HCM">("all")
  const [sort, setSort] = useState<"old" | "new">("old")
  const [page, setPage] = useState(1)
  const [openId, setOpenId] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [historyOpen, setHistoryOpen] = useState(false)
  const [notice, setNotice] = useState("")

  useEffect(() => {
    if (!notice) return
    const id = setTimeout(() => setNotice(""), 4000)
    return () => clearTimeout(id)
  }, [notice])

  const counts = useMemo(
    () => ({
      all: cases.filter((c) => inTab(c, "all")).length,
      profile: cases.filter((c) => inTab(c, "profile")).length,
      skill: cases.filter((c) => inTab(c, "skill")).length,
      missing: cases.filter((c) => inTab(c, "missing")).length,
    }),
    [cases],
  )

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase()
    return cases
      .filter(
        (c) =>
          inTab(c, tab) &&
          (city === "all" || c.city === city) &&
          (!k || [c.name, c.code, c.phone].some((v) => v.toLowerCase().includes(k))),
      )
      .sort((a, b) => (sort === "old" ? a.submittedAt.localeCompare(b.submittedAt) : b.submittedAt.localeCompare(a.submittedAt)))
  }, [cases, tab, keyword, city, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, totalPages)
  const start = (current - 1) * PAGE_SIZE
  const rows = filtered.slice(start, start + PAGE_SIZE)

  const log = (text: string) =>
    setHistory((h) => [{ at: new Date().toLocaleString("vi-VN"), text }, ...h])

  const update = (id: string, fn: (c: ApprovalCase) => ApprovalCase) =>
    setCases((list) => list.map((c) => (c.id === id ? fn(c) : c)))

  function decideProfile(c: ApprovalCase, ok: boolean, reason: string) {
    // TODO: gọi API duyệt / từ chối hồ sơ cá nhân
    update(c.id, (x) => ({
      ...x,
      profile: ok ? { state: "approved", label: "Đã duyệt" } : { state: "rejected", label: `Từ chối: ${reason}` },
    }))
    log(`${ok ? "Duyệt" : "Từ chối"} hồ sơ cá nhân của ${c.name} (${c.code})${ok ? "" : ` - ${reason}`}`)
  }

  function decideSkill(c: ApprovalCase, s: ApprovalSkill, ok: boolean, reason: string) {
    // TODO: gọi API duyệt / từ chối nghiệp vụ
    update(c.id, (x) => ({
      ...x,
      skills: x.skills.map((k) =>
        k.id === s.id ? { ...k, state: ok ? "approved" : "rejected", note: ok ? undefined : reason } : k,
      ),
    }))
    log(`${ok ? "Duyệt" : "Từ chối"} nghiệp vụ "${s.name}" của ${c.name}${ok ? "" : ` - ${reason}`}`)
  }

  function remind(c: ApprovalCase, what?: string) {
    // TODO: gọi API gửi nhắc nhở qua App KTV
    setNotice(`Đã gửi nhắc nhở bổ sung minh chứng${what ? ` "${what}"` : ""} đến ${c.name} qua App`)
    log(`Nhắc ${c.name} bổ sung minh chứng`)
  }

  const open = cases.find((c) => c.id === openId) ?? null

  const tabs: { key: Tab; label: string; badge: string }[] = [
    { key: "all", label: "Tất cả", badge: "bg-orange-50 text-cta" },
    { key: "profile", label: "Hồ sơ chờ duyệt", badge: "bg-field text-body" },
    { key: "skill", label: "Nghiệp vụ chờ duyệt", badge: "bg-field text-body" },
    { key: "missing", label: "Chưa nộp minh chứng", badge: "bg-field text-body" },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-ink">Duyệt hồ sơ & nghiệp vụ</h1>
        <button
          type="button"
          onClick={() => setHistoryOpen(true)}
          className="flex h-9 items-center gap-2 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink hover:bg-field"
        >
          <History className="size-3.5" /> Lịch sử duyệt gần đây
        </button>
      </div>

      {notice && (
        <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
          {notice}
        </p>
      )}

      <section className="rounded-xl border border-line bg-white p-4 shadow-sm">
        {/* Tab */}
        <div className="flex flex-wrap gap-2" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => { setTab(t.key); setPage(1) }}
              className={`flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold transition ${
                tab === t.key ? "bg-white text-cta ring-1 ring-cta" : "bg-field/60 text-body hover:bg-field"
              }`}
            >
              {t.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${t.badge}`}>{counts[t.key]}</span>
            </button>
          ))}
        </div>

        {/* Bộ lọc */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex h-10 min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-line px-3 focus-within:border-cta focus-within:ring-2 focus-within:ring-cta/15">
            <Search className="size-4 text-muted" />
            <input
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(1) }}
              placeholder="Tìm theo tên KTV, số điện thoại, mã thợ..."
              className="h-full w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
            />
          </div>

          <div className="relative w-56">
            <MapPin className="pointer-events-none absolute left-3 top-3 size-4 text-muted" />
            <select value={city} onChange={(e) => { setCity(e.target.value as typeof city); setPage(1) }} className={selectBox} aria-label="Khu vực">
              <option value="all">Tất cả khu vực (Hà Nội & TP.HCM)</option>
              <option value="HN">Hà Nội</option>
              <option value="HCM">TP.HCM</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3 size-4 text-muted" />
          </div>

          <div className="relative w-52">
            <Clock className="pointer-events-none absolute left-3 top-3 size-4 text-muted" />
            <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className={selectBox} aria-label="Sắp xếp">
              <option value="old">Thời gian gửi: Cũ nhất trước</option>
              <option value="new">Thời gian gửi: Mới nhất trước</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3 size-4 text-muted" />
          </div>

          <button
            type="button"
            onClick={() => { setKeyword(""); setCity("all"); setSort("old"); setPage(1) }}
            aria-label="Đặt lại bộ lọc"
            title="Đặt lại bộ lọc"
            className="flex size-10 items-center justify-center rounded-lg border border-line bg-white text-body hover:bg-field"
          >
            <RefreshCw className="size-4" />
          </button>
        </div>

        {/* Danh sách */}
        <ul className="mt-4 space-y-2.5">
          {rows.length === 0 && (
            <li className="rounded-lg border border-dashed border-line p-8 text-center text-sm text-muted">
              Không có hồ sơ nào cần xử lý
            </li>
          )}
          {rows.map((c, idx) => {
            const review = hasReview(c)
            return (
              <li
                key={c.id}
                className={`flex flex-wrap items-center gap-4 rounded-lg border bg-white px-4 py-3 ${
                  c.profile.state === "pending" ? "border-l-4 border-l-cta border-line" : "border-line"
                }`}
              >
                <div className="flex min-w-[240px] flex-1 items-center gap-3">
                  <span className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${AVATAR_TONES[(start + idx) % AVATAR_TONES.length]}`}>
                    {initials(c.name)}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[13px] font-semibold text-ink">{c.name}</span>
                      <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">{c.code}</span>
                    </div>
                    <div className="text-[11px] text-muted">
                      {c.phone} · {c.district}, {c.city === "HN" ? "HN" : "HCM"}
                      {c.waitLabel && <span className="ml-1.5 font-semibold text-cta">· {c.waitLabel}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex min-w-[240px] flex-[1.6] flex-col gap-1.5 text-[11px]">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="w-14 shrink-0 text-muted">Hồ sơ:</span>
                    <ProfileChip c={c} />
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="w-14 shrink-0 text-muted">Nghiệp vụ:</span>
                    <SkillChips c={c} />
                  </div>
                </div>

                {review ? (
                  <button
                    type="button"
                    onClick={() => setOpenId(c.id)}
                    className="flex h-8 items-center gap-1.5 rounded-lg bg-cta px-3 text-xs font-semibold text-white hover:brightness-95"
                  >
                    Xem & duyệt <ArrowRight className="size-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => remind(c)}
                    className="flex h-8 items-center gap-1.5 rounded-lg border border-orange-200 bg-white px-3 text-xs font-semibold text-cta hover:bg-orange-50"
                  >
                    <Bell className="size-3.5" /> Nhắc KTV
                  </button>
                )}
              </li>
            )
          })}
        </ul>

        {/* Chân */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
          <span>
            Hiển thị <b className="text-ink">{filtered.length === 0 ? 0 : start + 1} - {start + rows.length}</b> / {filtered.length} KTV cần duyệt
          </span>
          <div className="flex items-center gap-1.5">
            <button disabled={current === 1} onClick={() => setPage(current - 1)} className="flex h-8 items-center gap-1 rounded-md border border-line bg-white px-2 disabled:opacity-40">
              <ChevronLeft className="size-3.5" /> Trước
            </button>
            {pageList(current, totalPages).map((n, i) =>
              n === "…" ? (
                <span key={`g-${i}`} className="px-1">…</span>
              ) : (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`size-8 rounded-md font-semibold ${n === current ? "bg-cta text-white" : "border border-line bg-white text-body hover:bg-field"}`}
                >
                  {n}
                </button>
              ),
            )}
            <button disabled={current === totalPages} onClick={() => setPage(current + 1)} className="flex h-8 items-center gap-1 rounded-md border border-line bg-white px-2 disabled:opacity-40">
              Sau <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      </section>

      {open && (
        <ReviewDrawer
          key={open.id}
          c={open}
          onClose={() => setOpenId(null)}
          onProfile={(ok, reason) => decideProfile(open, ok, reason)}
          onSkill={(s, ok, reason) => decideSkill(open, s, ok, reason)}
          onRemind={(s) => remind(open, s.name)}
        />
      )}

      {historyOpen && (
        <Modal
          title="Lịch sử duyệt gần đây"
          onClose={() => setHistoryOpen(false)}
          footer={<button type="button" onClick={() => setHistoryOpen(false)} className={btnGhost}>Đóng</button>}
        >
          {history.length === 0 ? (
            <p className="text-xs text-muted">Chưa có thao tác nào trong phiên làm việc này.</p>
          ) : (
            <ul className="divide-y divide-line">
              {history.map((h, i) => (
                <li key={i} className="py-2.5">
                  <div className="text-xs text-ink">{h.text}</div>
                  <div className="text-[11px] text-muted">{h.at}</div>
                </li>
              ))}
            </ul>
          )}
        </Modal>
      )}
    </div>
  )
}

function ProfileChip({ c }: { c: ApprovalCase }) {
  const s = c.profile.state
  if (s === "approved")
    return <span className="rounded bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-600">✓ {c.profile.label}</span>
  if (s === "rejected")
    return <span className="rounded bg-red-50 px-2 py-0.5 font-semibold text-red-500">{c.profile.label}</span>
  return <span className="rounded bg-orange-50 px-2 py-0.5 font-semibold text-orange-700">● {c.profile.label}</span>
}

function SkillChips({ c }: { c: ApprovalCase }) {
  if (c.skills.length === 0) return <span className="italic text-muted">Chưa khai báo bổ sung</span>
  const missing = c.skills.some((s) => s.state === "missing")
  return (
    <>
      {c.skills.filter((s) => s.state !== "missing").map((s) => {
        const cls =
          s.state === "approved" ? "bg-emerald-50 text-emerald-600"
          : s.state === "rejected" ? "bg-red-50 text-red-500"
          : "bg-orange-50 text-orange-700"
        const mark = s.state === "approved" ? "✓" : s.state === "rejected" ? "✕" : "●"
        return (
          <span key={s.id} className={`rounded px-2 py-0.5 font-semibold ${cls}`}>
            {mark} {s.short}
          </span>
        )
      })}
      {missing && <span className="rounded bg-slate-100 px-2 py-0.5 font-semibold text-slate-600">⚠ Chưa nộp minh chứng</span>}
    </>
  )
}

// ======================= Ngăn thẩm định bên phải =======================
function ReviewDrawer({
  c, onClose, onProfile, onSkill, onRemind,
}: {
  c: ApprovalCase
  onClose: () => void
  onProfile: (ok: boolean, reason: string) => void
  onSkill: (s: ApprovalSkill, ok: boolean, reason: string) => void
  onRemind: (s: ApprovalSkill) => void
}) {
  const [checks, setChecks] = useState([false, false, false])
  const [rejecting, setRejecting] = useState<string | null>(null) // "profile" hoặc id nghiệp vụ
  const [reason, setReason] = useState("")

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  const allChecked = checks.every(Boolean)
  const profileOpen = c.profile.state === "pending" || c.profile.state === "resubmit"
  const openSkills = c.skills.filter((s) => s.state === "pending" || s.state === "missing").length
  const openProfile = profileOpen ? 1 : 0
  const waitingParts = openProfile + openSkills

  const checkLabels = [
    "Thông tin khớp CCCD gắn chip",
    "Ảnh chân dung khớp giấy tờ",
    "Giấy tờ hợp lệ và nguyên vẹn",
  ]

  function confirmReject(ok: false, run: (reason: string) => void) {
    if (!reason.trim()) return
    run(reason.trim())
    setRejecting(null)
    setReason("")
  }

  const rejectBox = (run: (reason: string) => void) => (
    <div className="mt-3 rounded-lg border border-red-100 bg-red-50/50 p-3">
      <label htmlFor="rej" className="mb-1.5 block text-xs font-semibold text-body">
        Lý do từ chối <span className="text-red-500">*</span>
      </label>
      <textarea id="rej" value={reason} onChange={(e) => setReason(e.target.value)} rows={2} maxLength={300} autoFocus className={`${fieldCls} resize-none`} />
      <div className="mt-2 flex justify-end gap-2">
        <button type="button" onClick={() => { setRejecting(null); setReason("") }} className={btnGhost}>Hủy</button>
        <button
          type="button"
          disabled={!reason.trim()}
          onClick={() => confirmReject(false, run)}
          className="h-9 rounded-lg bg-red-500 px-4 text-xs font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Xác nhận từ chối
        </button>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50" onClick={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Thẩm định hồ sơ ${c.name}`}
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-[640px] flex-col bg-white shadow-2xl"
      >
        {/* Đầu */}
        <div className="flex items-start justify-between gap-3 border-b border-line px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-ink">
              Thẩm định hồ sơ & nghiệp vụ: {c.name} <span className="text-xs font-semibold text-muted">{c.code}</span>
            </h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px]">
              <span className={`rounded-full px-2 py-0.5 font-semibold ${waitingParts > 0 ? "bg-orange-50 text-orange-700" : "bg-emerald-50 text-emerald-600"}`}>
                {waitingParts > 0 ? `● Cần thẩm định ${waitingParts} phần` : "✓ Đã xử lý xong"}
              </span>
              <span className="text-muted">Thời gian gửi: {fmt(c.submittedAt)}</span>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng" className="rounded-md border border-line p-1.5 text-muted hover:text-ink">
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto bg-field/40 p-6">
          {/* 1. Hồ sơ cá nhân */}
          <section className="rounded-xl border border-line bg-white p-5">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
                <span className="flex size-5 items-center justify-center rounded bg-orange-100 text-[11px] text-cta">1</span>
                HỒ SƠ CÁ NHÂN
              </h3>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                  c.profile.state === "approved" ? "bg-emerald-50 text-emerald-600"
                  : c.profile.state === "rejected" ? "bg-red-50 text-red-500"
                  : "bg-amber-100 text-amber-700"
                }`}
              >
                {c.profile.state === "approved" ? "✓ Đã duyệt" : c.profile.state === "rejected" ? "Đã từ chối" : "Chờ xác thực CCCD"}
              </span>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-[210px_1fr]">
              <div className="space-y-2.5 rounded-lg bg-field/60 p-3">
                <div className="text-[10px] font-semibold tracking-wider text-muted">THÔNG TIN KTV KHAI BÁO</div>
                <Detail label="Họ tên" value={c.name} />
                <Detail label="Ngày sinh" value={`${dmy(c.person.dob)} (${age(c.person.dob)} tuổi)`} />
                <Detail label="Số CCCD gắn chip" value={<span className="rounded border border-line bg-white px-2 py-1 font-mono text-xs">{c.person.idNumber}</span>} />
                <Detail label="Số điện thoại" value={c.phone} />
                <Detail label="Quê quán" value={c.person.hometown} />
                <Detail label="Địa chỉ thường trú" value={c.person.address} />
              </div>

              <div>
                <div className="text-[10px] font-semibold tracking-wider text-muted">MINH CHỨNG GIẤY TỜ TẢI LÊN</div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {[
                    { label: "CCCD mặt trước", icon: FileText },
                    { label: "CCCD mặt sau", icon: FileText },
                    { label: "Ảnh chân dung cầm CCCD", icon: Camera },
                  ].map(({ label, icon: Icon }) => (
                    <div
                      key={label}
                      title="Chưa có API ảnh giấy tờ"
                      className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 bg-field/60 p-1 text-center"
                    >
                      <Icon className="size-5 text-muted" />
                      <span className="text-[10px] leading-tight text-muted">{label}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-1.5 text-[10px] text-muted">Ảnh minh họa, chờ backend cung cấp tệp giấy tờ.</p>

                <div className="mt-3 rounded-lg bg-blue-50/60 p-3">
                  <div className="text-[10px] font-semibold tracking-wider text-muted">
                    THẨM ĐỊNH ĐIỀU KIỆN BẮT BUỘC ({checks.filter(Boolean).length}/3)
                  </div>
                  <div className="mt-2 space-y-2">
                    {checkLabels.map((l, i) => (
                      <label key={l} className="flex items-center gap-2 text-xs text-ink">
                        <input
                          type="checkbox"
                          checked={checks[i] || !profileOpen}
                          disabled={!profileOpen}
                          onChange={() => setChecks((cs) => cs.map((v, j) => (j === i ? !v : v)))}
                          className="size-4 accent-blue-600"
                        />
                        {l}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {profileOpen && (
              <>
                {rejecting === "profile" ? (
                  rejectBox((r) => onProfile(false, r))
                ) : (
                  <div className="mt-4 flex justify-end gap-2 border-t border-line pt-4">
                    <button
                      type="button"
                      onClick={() => { setRejecting("profile"); setReason("") }}
                      className="flex h-9 items-center gap-1.5 rounded-lg border border-line bg-field/60 px-3 text-xs font-semibold text-body hover:bg-field"
                    >
                      <X className="size-3.5" /> Từ chối hồ sơ
                    </button>
                    <button
                      type="button"
                      disabled={!allChecked}
                      title={allChecked ? undefined : "Cần tick đủ 3 điều kiện thẩm định"}
                      onClick={() => onProfile(true, "")}
                      className={`${btnPrimary} flex items-center gap-1.5`}
                    >
                      <CheckCircle2 className="size-3.5" /> Duyệt hồ sơ
                    </button>
                  </div>
                )}
              </>
            )}
            {c.profile.state === "rejected" && (
              <p className="mt-3 rounded-md bg-red-50 p-2.5 text-[11px] text-red-600">{c.profile.label}</p>
            )}
          </section>

          {/* 2. Nghiệp vụ */}
          <section className="rounded-xl border border-line bg-white p-5">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
                <span className="flex size-5 items-center justify-center rounded bg-blue-100 text-[11px] text-blue-600">2</span>
                NGHIỆP VỤ ĐĂNG KÝ
              </h3>
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-600">
                {openSkills} nghiệp vụ cần xét
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {c.skills.length === 0 && (
                <p className="rounded-lg border border-dashed border-line p-4 text-xs italic text-muted">KTV chưa khai báo nghiệp vụ nào.</p>
              )}
              {c.skills.map((s) => (
                <div key={s.id} className="rounded-lg border border-line bg-blue-50/30 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-[13px] font-bold text-ink">{s.name}</div>
                    <SkillBadge state={s.state} />
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted">Mã chuyên môn: {s.code} • Loại: {s.kind}</div>

                  {s.cert && (
                    <div className="mt-3 rounded-md border border-line bg-white p-3 text-xs">
                      <div className="text-ink">Chứng chỉ: <b>{s.cert.title}</b></div>
                      <div className="mt-1 text-ink">Kinh nghiệm: <b>{s.cert.experience}</b></div>
                    </div>
                  )}
                  {s.state === "missing" && (
                    <p className="mt-3 flex items-start gap-2 rounded-md bg-white p-3 text-[11px] text-muted">
                      <Info className="mt-0.5 size-3.5 shrink-0" /> {s.note}
                    </p>
                  )}
                  {s.state === "rejected" && s.note && (
                    <p className="mt-3 rounded-md bg-red-50 p-2.5 text-[11px] text-red-600">Lý do: {s.note}</p>
                  )}

                  {s.state === "pending" && (
                    rejecting === s.id ? (
                      rejectBox((r) => onSkill(s, false, r))
                    ) : (
                      <div className="mt-3 flex justify-end gap-2">
                        <button type="button" onClick={() => { setRejecting(s.id); setReason("") }} className="h-8 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-body hover:bg-field">
                          Từ chối
                        </button>
                        <button type="button" onClick={() => onSkill(s, true, "")} className={`${btnPrimary} h-8 flex items-center gap-1.5`}>
                          <CheckCircle2 className="size-3.5" /> Duyệt nghiệp vụ
                        </button>
                      </div>
                    )
                  )}
                  {s.state === "missing" && (
                    <div className="mt-3 flex justify-end gap-2">
                      <button type="button" onClick={() => onRemind(s)} className="flex h-8 items-center gap-1.5 rounded-lg border border-orange-200 bg-white px-3 text-xs font-semibold text-cta hover:bg-orange-50">
                        <Bell className="size-3.5" /> Nhắc KTV bổ sung qua App
                      </button>
                      <button type="button" disabled className="h-8 cursor-not-allowed rounded-lg bg-slate-100 px-3 text-xs font-semibold text-muted">
                        Duyệt
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line bg-white px-6 py-3">
          <p className="flex items-center gap-1.5 text-xs text-body">
            {waitingParts > 0 ? (
              <>
                <Clock className="size-3.5 text-cta" />
                Còn <b>{openProfile} hồ sơ</b> & <b>{openSkills} nghiệp vụ</b> chưa hoàn tất thẩm định.
              </>
            ) : (
              <>
                <CheckCircle2 className="size-3.5 text-emerald-600" /> Đã hoàn tất thẩm định.
              </>
            )}
          </p>
          <button type="button" onClick={onClose} className="h-9 rounded-lg bg-blue-50 px-5 text-xs font-semibold text-blue-600 hover:bg-blue-100">
            Đóng
          </button>
        </div>
      </aside>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] text-muted">{label}</div>
      <div className="mt-0.5 text-xs font-semibold text-ink">{value}</div>
    </div>
  )
}

function SkillBadge({ state }: { state: ApprovalSkill["state"] }) {
  const m = {
    pending: ["Chờ duyệt", "bg-amber-100 text-amber-700"],
    approved: ["Đã duyệt", "bg-emerald-50 text-emerald-600"],
    missing: ["Chưa nộp minh chứng", "bg-slate-100 text-slate-600"],
    rejected: ["Đã từ chối", "bg-red-50 text-red-500"],
  } as const
  return <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${m[state][1]}`}>{m[state][0]}</span>
}