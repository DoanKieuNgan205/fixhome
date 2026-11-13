"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  ArrowRight, CheckCircle2, MapPin, Paperclip, Phone, Play, ShieldAlert, Star, TriangleAlert, X,
} from "lucide-react"
import { Modal, btnGhost, fieldCls } from "@/components/operator/shared/modal"
import { SOURCE_LABEL, VIOLATION_TYPES, violationCases, type ViolationCase } from "@/lib/operator/mock-violations"
import { initials } from "@/lib/admin/customer-utils"

type Evidence = { id: string; name: string; kind: "image" | "audio"; meta: string }
type Mode = "suspend" | "permanent"

const MAX_FILE = 10 * 1024 * 1024
const money = (n: number) => `${n.toLocaleString("vi-VN")}đ`

function untilDate(days: number) {
  const d = new Date(Date.now() + days * 86_400_000)
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
}

const SEED: Evidence[] = [
  { id: "e1", name: "Phieu_thu_tay_ktv_200k.jpg", kind: "image", meta: "Ảnh hiện trường • 1.4 MB" },
  { id: "e2", name: "Chat_thoa_thuan_gia_ngoai.png", kind: "image", meta: "Ảnh chụp màn hình • 840 KB" },
  { id: "e3", name: "Ghi_am_cuoc_goi_CSKH_khach.mp3", kind: "audio", meta: "Ghi âm • 04:12" },
]

export function ViolationHandle({ v, author = "Trần Minh Đức" }: { v: ViolationCase; author?: string }) {
  const [type, setType] = useState(v.type)
  const orderOptions = useMemo(
    () => Array.from(new Set([v.orderCode, ...violationCases.map((x) => x.orderCode)])).slice(0, 6),
    [v],
  )
  const [order, setOrder] = useState(v.orderCode)
  const [desc, setDesc] = useState(v.detail)
  const [files, setFiles] = useState<Evidence[]>(SEED)
  const [fileError, setFileError] = useState("")

  const [mode, setMode] = useState<Mode>("suspend")
  const [days, setDays] = useState(30)
  const [reason, setReason] = useState("")
  const [note, setNote] = useState("")
  const [notify, setNotify] = useState(true)
  const [errors, setErrors] = useState<{ type?: string; order?: string; desc?: string; reason?: string }>({})

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [done, setDone] = useState<null | { mode: Mode; until: string }>(null)

  const orderLabel = (code: string) => {
    const c = violationCases.find((x) => x.orderCode === code)
    return c ? `${code} - ${c.orderName}` : code
  }

  function addFiles(list: FileList | null) {
    if (!list) return
    setFileError("")
    const next: Evidence[] = []
    for (const f of Array.from(list)) {
      if (!f.type.startsWith("image/") && !f.type.startsWith("audio/")) {
        setFileError("Chỉ nhận ảnh hoặc tệp ghi âm")
        continue
      }
      if (f.size > MAX_FILE) {
        setFileError(`"${f.name}" quá lớn, tối đa 10MB`)
        continue
      }
      next.push({
        id: `n${Date.now()}${next.length}`,
        name: f.name,
        kind: f.type.startsWith("audio/") ? "audio" : "image",
        meta: `${f.type.startsWith("audio/") ? "Ghi âm" : "Ảnh"} • ${(f.size / 1048576).toFixed(1)} MB`,
      })
    }
    // TODO: tải tệp thật lên (dùng lib/api/media.ts khi backend nhận minh chứng)
    setFiles((l) => [...l, ...next])
  }

  function next() {
    const e: typeof errors = {}
    if (!type) e.type = "Vui lòng chọn loại vi phạm"
    if (!order) e.order = "Vui lòng chọn đơn hàng liên quan"
    if (desc.trim().length < 10) e.desc = "Mô tả cần ít nhất 10 ký tự"
    if (!reason.trim()) e.reason = "Vui lòng nhập lý do xử lý chính thức"
    setErrors(e)
    if (Object.keys(e).length === 0) setConfirmOpen(true)
  }

  const images = files.filter((f) => f.kind === "image")
  const audios = files.filter((f) => f.kind === "audio")

  if (done) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-line bg-white p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto size-10 text-emerald-500" />
        <h1 className="mt-3 text-lg font-bold text-ink">Đã lập biên bản xử lý</h1>
        <p className="mt-2 text-sm text-body">
          {done.mode === "permanent"
            ? `Tài khoản ${v.techName} (${v.techCode}) đã bị khóa vĩnh viễn.`
            : `Tài khoản ${v.techName} (${v.techCode}) bị tạm khóa đến ${done.until}.`}
          {notify && " Thông báo và văn bản xử lý sẽ được gửi qua App HomeFix Partner."}
        </p>
        <Link href="/operator/technician-violations" className="mt-5 inline-block h-9 rounded-lg bg-cta px-5 py-2 text-xs font-semibold text-white hover:brightness-95">
          Về danh sách vi phạm
        </Link>
      </div>
    )
  }

  const lbl = "mb-1.5 block text-[11px] font-semibold text-body"

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <nav className="flex items-center gap-1.5 text-muted" aria-label="Breadcrumb">
          <Link href="/operator/technician-violations" className="hover:text-ink">Tài khoản KTV vi phạm</Link>
          <span>&gt;</span><span>Xử lý</span><span>&gt;</span>
          <span className="font-semibold text-ink">{v.techName}</span>
        </nav>
        <span className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-semibold text-red-500">● Hồ sơ kỷ luật cấp 2</span>
      </div>

      {/* Thẻ KTV */}
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="flex size-12 items-center justify-center rounded-full bg-orange-50 text-sm font-bold text-orange-600">{initials(v.techName)}</span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base font-bold text-ink">{v.techName}</span>
              <span className="rounded bg-field px-2 py-0.5 text-[11px] font-semibold text-body">{v.techCode}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${v.techState === "active" ? "bg-emerald-50 text-emerald-600" : "bg-orange-100 text-orange-700"}`}>
                ● {v.techState === "active" ? "Hoạt động" : "Tạm khóa"}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-muted">
              <span className="flex items-center gap-1"><Phone className="size-3" /> {v.phone}</span>
              <span className="flex items-center gap-1"><MapPin className="size-3" /> {v.area}</span>
              <span className="flex items-center gap-1"><Star className="size-3 fill-amber-400 text-amber-400" /> {v.rating} ({v.orders} đơn)</span>
            </div>
          </div>
        </div>
        <Link href="/operator/technicians" className="text-xs font-semibold text-cta hover:underline">Xem hồ sơ KTV</Link>
      </section>

      {/* 1. Hành vi vi phạm */}
      <Section n="1" title="Hành vi vi phạm" tone="bg-orange-100 text-cta" right="THÔNG TIN NGHIỆP VỤ">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="v-type" className={lbl}>Loại vi phạm <span className="text-red-500">*</span></label>
            <select id="v-type" value={type} onChange={(e) => setType(e.target.value)} className={`${fieldCls} h-10 py-0 ${errors.type ? "border-red-400" : ""}`}>
              {VIOLATION_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            {errors.type && <p className="mt-1 text-[11px] text-red-500">{errors.type}</p>}
          </div>
          <div>
            <label htmlFor="v-order" className={lbl}>Đơn hàng liên quan <span className="text-red-500">*</span></label>
            <select id="v-order" value={order} onChange={(e) => setOrder(e.target.value)} className={`${fieldCls} h-10 py-0 ${errors.order ? "border-red-400" : ""}`}>
              {orderOptions.map((o) => <option key={o} value={o}>{orderLabel(o)}</option>)}
            </select>
            {errors.order && <p className="mt-1 text-[11px] text-red-500">{errors.order}</p>}
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <label htmlFor="v-desc" className={lbl}>Mô tả chi tiết vi phạm <span className="text-red-500">*</span></label>
            <span className="text-[11px] text-muted">{desc.length} / 500 ký tự</span>
          </div>
          <textarea id="v-desc" value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} maxLength={500} className={`${fieldCls} resize-none ${errors.desc ? "border-red-400" : ""}`} />
          {errors.desc && <p className="mt-1 text-[11px] text-red-500">{errors.desc}</p>}
        </div>
      </Section>

      {/* 2. Minh chứng */}
      <Section n="2" title="Minh chứng vi phạm" tone="bg-blue-100 text-blue-600" right={<span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-600">✓ Đã xác thực ({files.length} file)</span>}>
        <div className="grid gap-3 sm:grid-cols-2">
          {images.map((f) => (
            <div key={f.id} className="flex items-start justify-between gap-2 rounded-lg border border-line bg-field/50 p-3">
              <div className="min-w-0">
                <div className="truncate text-xs font-semibold text-ink">{f.name}</div>
                <div className="text-[11px] text-muted">{f.meta}</div>
                <div className="mt-1 text-[10px] font-semibold text-emerald-600">✓ Hợp lệ</div>
              </div>
              <button type="button" onClick={() => setFiles((l) => l.filter((x) => x.id !== f.id))} aria-label={`Xóa ${f.name}`} className="text-muted hover:text-red-500">
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
        {audios.map((f) => (
          <div key={f.id} className="mt-3 flex items-center gap-3 rounded-lg border border-line bg-field/50 p-3">
            <button type="button" disabled title="Chưa có tệp âm thanh thật" className="flex size-9 shrink-0 cursor-not-allowed items-center justify-center rounded-full bg-cta text-white opacity-80">
              <Play className="size-4" />
            </button>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold text-ink">{f.name}</div>
              <div className="mt-1.5 h-1 rounded-full bg-slate-200"><div className="h-1 w-1/3 rounded-full bg-cta" /></div>
              <div className="mt-1 text-[10px] text-muted">{f.meta}</div>
            </div>
            <button type="button" onClick={() => setFiles((l) => l.filter((x) => x.id !== f.id))} aria-label={`Xóa ${f.name}`} className="text-muted hover:text-red-500">
              <X className="size-4" />
            </button>
          </div>
        ))}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] text-muted">Minh chứng ghi âm / hình ảnh phục vụ giải trình chất lượng KTV.</p>
          <label className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink hover:bg-field">
            <Paperclip className="size-3.5" /> Thêm minh chứng
            <input type="file" multiple accept="image/*,audio/*" className="sr-only" onChange={(e) => { addFiles(e.target.files); e.target.value = "" }} />
          </label>
        </div>
        {fileError && <p role="alert" className="mt-2 text-[11px] text-red-500">{fileError}</p>}
      </Section>

      {/* 3. Hình thức xử lý */}
      <Section n="3" title="Hình thức xử lý & Kỷ luật" tone="bg-red-100 text-red-500" right={<span className="text-[11px] font-semibold text-red-500">Quyết định có hiệu lực ngay</span>}>
        <div className="grid gap-3 md:grid-cols-2">
          <label className={`cursor-pointer rounded-xl border-2 p-4 ${mode === "suspend" ? "border-cta bg-orange-50/50" : "border-line"}`}>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-bold text-ink">
                <input type="radio" name="mode" checked={mode === "suspend"} onChange={() => setMode("suspend")} className="accent-orange-500" />
                Tạm khóa tài khoản
              </span>
              <span className="rounded bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-cta">Khuyến dùng</span>
            </div>
            <p className="mt-1.5 text-[11px] text-muted">Tự động mở khóa khi hết hạn kỷ luật. Không nhận đơn mới trong thời gian này.</p>
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="text-muted">Thời hạn:</span>
              <select value={days} onChange={(e) => setDays(Number(e.target.value))} disabled={mode !== "suspend"} className="h-8 flex-1 rounded-md border border-line bg-white px-2 text-xs font-semibold text-ink outline-none disabled:opacity-60" aria-label="Thời hạn tạm khóa">
                {[7, 15, 30, 60].map((d) => <option key={d} value={d}>{d} ngày (đến {untilDate(d)})</option>)}
              </select>
            </div>
          </label>

          <label className={`cursor-pointer rounded-xl border-2 p-4 ${mode === "permanent" ? "border-red-400 bg-red-50/40" : "border-line"}`}>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-bold text-ink">
                <input type="radio" name="mode" checked={mode === "permanent"} onChange={() => setMode("permanent")} className="accent-red-500" />
                Khóa tài khoản vĩnh viễn
              </span>
              <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">Nghiêm trọng</span>
            </div>
            <p className="mt-1.5 text-[11px] text-muted">Chấm dứt hợp tác, thu hồi tài khoản. Chỉ Quản trị viên (Admin) mới có quyền mở lại.</p>
            <p className="mt-3 flex items-start gap-1.5 text-[11px] text-red-500">
              <TriangleAlert className="mt-0.5 size-3.5 shrink-0" /> Chuyển toàn bộ công nợ còn lại sang bộ phận đối soát.
            </p>
          </label>
        </div>

        <div className="mt-4">
          <label htmlFor="v-reason" className={lbl}>Lý do xử lý chính thức <span className="text-red-500">*</span></label>
          <input id="v-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ví dụ: Vi phạm nghiêm trọng quy chế báo giá & thu tiền ngoài hệ thống" className={`${fieldCls} h-10 py-0 ${errors.reason ? "border-red-400" : ""}`} />
          {errors.reason && <p className="mt-1 text-[11px] text-red-500">{errors.reason}</p>}
        </div>
        <div className="mt-4">
          <label htmlFor="v-note" className={lbl}>Ghi chú quyết định xử lý</label>
          <textarea id="v-note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={500} className={`${fieldCls} resize-none`} />
        </div>
        <label className="mt-3 flex items-center gap-2 text-xs text-ink">
          <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="size-4 accent-orange-500" />
          Gửi thông báo & văn bản xử lý cho KTV qua App HomeFix Partner
        </label>
      </Section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white px-5 py-3 shadow-sm">
        <span className="flex items-center gap-2 text-xs text-body">
          <ShieldAlert className="size-4 text-muted" /> Người lập biên bản: <b className="text-ink">{author}</b>
        </span>
        <div className="flex items-center gap-2">
          <Link href="/operator/technician-violations" className={`${btnGhost} flex items-center`}>Hủy</Link>
          <button type="button" onClick={next} className="flex h-9 items-center gap-1.5 rounded-lg bg-cta px-5 text-xs font-semibold text-white hover:brightness-95">
            Tiếp tục <ArrowRight className="size-3.5" />
          </button>
        </div>
      </div>

      {confirmOpen && (
        <LockConfirm
          v={v}
          mode={mode}
          days={days}
          reason={reason.trim()}
          evidenceText={`${images.length} ảnh biên nhận, ${audios.length} file ghi âm`}
          onClose={() => setConfirmOpen(false)}
          onConfirm={(running) => {
            // TODO: gọi API lập biên bản kỷ luật + khóa tài khoản
            console.log("Xử lý vi phạm", { id: v.id, mode, days, type, order, desc, reason, note, notify, running, files: files.length })
            setConfirmOpen(false)
            setDone({ mode, until: untilDate(days) })
          }}
        />
      )}
    </div>
  )
}

function Section({
  n, title, tone, right, children,
}: { n: string; title: string; tone: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
          <span className={`flex size-5 items-center justify-center rounded text-[11px] ${tone}`}>{n}</span>
          {title}
        </h2>
        {typeof right === "string" ? <span className="text-[11px] text-muted">{right}</span> : right}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

// Bỏ dấu, viết hoa để so sánh chữ xác nhận ("khóa" cũng được chấp nhận)
const norm = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d").trim().toUpperCase()

function LockConfirm({
  v, mode, days, reason, evidenceText, onClose, onConfirm,
}: {
  v: ViolationCase
  mode: Mode
  days: number
  reason: string
  evidenceText: string
  onClose: () => void
  onConfirm: (running: "finish" | "reassign" | null) => void
}) {
  const permanent = mode === "permanent"
  const [typed, setTyped] = useState("")
  const [running, setRunning] = useState<"finish" | "reassign">("finish")
  const hasRunning = v.runningOrders.length > 0
  const ok = !permanent || norm(typed) === "KHOA"

  return (
    <Modal
      wide
      title={permanent ? `Khóa tài khoản ${v.techName}?` : `Tạm khóa ${days} ngày: ${v.techName}?`}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className={btnGhost}>Hủy / Quay lại</button>
          <button
            type="button"
            disabled={!ok}
            onClick={() => onConfirm(hasRunning ? running : null)}
            className="h-9 rounded-lg bg-red-600 px-4 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {permanent ? "Xác nhận khóa tài khoản" : "Xác nhận tạm khóa"}
          </button>
        </>
      }
    >
      <p className="text-[11px] text-muted">Mã nhân sự: {v.techCode}</p>

      <p className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
        <ShieldAlert className="mt-0.5 size-4 shrink-0" />
        <span>
          {permanent ? (
            <><b>KTV sẽ bị khóa tài khoản vĩnh viễn và ngắt kết nối ngay lập tức.</b> Chỉ quản trị viên cấp cao mới có quyền mở khóa lại.</>
          ) : (
            <><b>KTV sẽ bị ngắt kết nối ngay lập tức</b> và tự động mở lại sau {days} ngày (đến {untilDate(days)}).</>
          )}
        </span>
      </p>

      {hasRunning && (
        <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50/60 p-3 text-xs">
          <p className="font-semibold text-orange-800">
            KTV đang nhận {v.runningOrders.length} đơn đang thực hiện ({v.runningOrders.join(", ")})
          </p>
          <label className="mt-2 flex items-center gap-2 text-ink">
            <input type="radio" name="run" checked={running === "finish"} onChange={() => setRunning("finish")} className="accent-orange-500" />
            Cho phép hoàn tất {v.runningOrders.length} đơn hiện tại rồi khóa
          </label>
          <label className="mt-1.5 flex items-center gap-2 text-ink">
            <input type="radio" name="run" checked={running === "reassign"} onChange={() => setRunning("reassign")} className="accent-orange-500" />
            Gán lại KTV khác cho {v.runningOrders.length} đơn này ngay lập tức
          </label>
        </div>
      )}

      {v.heldCash > 0 && (
        <p className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-orange-200 bg-orange-50/60 p-3 text-xs text-orange-800">
          <span>KTV đang giữ <b>{money(v.heldCash)}</b> tiền mặt</span>
          <span className="text-[11px] font-semibold text-cta">Treo ca / Xem công nợ</span>
        </p>
      )}

      <dl className="mt-3 space-y-1.5 rounded-lg bg-blue-50/60 p-3 text-xs">
        <div className="flex justify-between gap-3"><dt className="text-muted">Lý do khóa:</dt><dd className="text-right font-semibold text-ink">{reason}</dd></div>
        <div className="flex justify-between gap-3"><dt className="text-muted">Số minh chứng đính kèm:</dt><dd className="text-right font-semibold text-ink">{evidenceText}</dd></div>
      </dl>

      {permanent && (
        <div className="mt-3">
          <div className="flex items-center justify-between">
            <label htmlFor="confirm-khoa" className="text-xs font-semibold text-body">
              Nhập &ldquo;KHOA&rdquo; để xác nhận thao tác khóa tài khoản <span className="text-red-500">*</span>
            </label>
            <span className="text-[10px] text-muted">Bắt buộc</span>
          </div>
          <div className="relative mt-1.5">
            <input
              id="confirm-khoa"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              placeholder="KHOA"
              className={`${fieldCls} h-10 py-0 pr-9 uppercase ${ok ? "border-emerald-400" : ""}`}
            />
            {ok && <CheckCircle2 className="absolute right-3 top-3 size-4 text-emerald-500" />}
          </div>
        </div>
      )}
    </Modal>
  )
}