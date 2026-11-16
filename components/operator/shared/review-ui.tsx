"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { initials } from "@/lib/admin/customer-utils"
import { reviewErrorMessage } from "@/lib/api/operator-technicians-client"

export function Avatar({ name, url, size = "size-9" }: { name: string; url: string | null; size?: string }) {
  return (
    <span
      className={`flex ${size} shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-50 text-xs font-bold text-orange-600`}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className={`${size} object-cover`} />
      ) : (
        initials(name)
      )}
    </span>
  )
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

export function Pager({
  page, totalPages, total, pageSize, onPage,
}: { page: number; totalPages: number; total: number; pageSize: number; onPage: (p: number) => void }) {
  const current = Math.min(page, Math.max(1, totalPages))
  const start = (current - 1) * pageSize
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-field/40 px-5 py-3">
      <span className="text-xs text-muted">
        Hiển thị{" "}
        <b className="text-ink">
          {total === 0 ? 0 : start + 1} - {Math.min(start + pageSize, total)}
        </b>{" "}
        trên <b className="text-ink">{total}</b>
      </span>
      <div className="flex items-center gap-1.5">
        <button
          disabled={current === 1}
          onClick={() => onPage(current - 1)}
          aria-label="Trang trước"
          className="flex size-8 items-center justify-center rounded-md border border-line bg-white text-muted disabled:opacity-40"
        >
          <ChevronLeft className="size-4" />
        </button>
        {pageList(current, Math.max(1, totalPages)).map((n, i) =>
          n === "…" ? (
            <span key={`gap-${i}`} className="px-1 text-xs text-muted">…</span>
          ) : (
            <button
              key={n}
              onClick={() => onPage(n)}
              className={`size-8 rounded-md text-xs font-semibold ${
                n === current ? "bg-cta text-white" : "border border-line bg-white text-body hover:bg-field"
              }`}
            >
              {n}
            </button>
          ),
        )}
        <button
          disabled={current >= totalPages}
          onClick={() => onPage(current + 1)}
          aria-label="Trang sau"
          className="flex size-8 items-center justify-center rounded-md border border-line bg-white text-muted disabled:opacity-40"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  )
}

// Hộp thoại duyệt / từ chối. onConfirm thành công thì nơi gọi đóng hộp thoại.
export function ReviewDialog({
  mode, title, onConfirm, onClose,
}: {
  mode: "approve" | "reject"
  title: string
  onConfirm: (reason?: string) => Promise<void>
  onClose: () => void
}) {
  const [reason, setReason] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const reject = mode === "reject"

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onClose()
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose, busy])

  async function submit() {
    if (reject && !reason.trim()) {
      setError("Vui lòng nhập lý do từ chối")
      return
    }
    setBusy(true)
    setError("")
    try {
      await onConfirm(reason.trim() || undefined)
    } catch (e) {
      setError(reviewErrorMessage(e))
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
      onClick={() => !busy && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between px-5 pt-5">
          <h2 className="text-sm font-bold text-ink">{reject ? "Từ chối" : "Duyệt"}: {title}</h2>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Đóng" className="text-muted hover:text-ink">
            <X className="size-4" />
          </button>
        </div>

        <div className="px-5 py-4">
          {reject ? (
            <>
              <label htmlFor="reject-reason" className="mb-1.5 block text-xs font-semibold text-body">
                Lý do từ chối (bắt buộc)
              </label>
              <textarea
                id="reject-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                maxLength={300}
                autoFocus
                placeholder="Ví dụ: Ảnh CCCD bị mờ, vui lòng chụp lại."
                className="w-full resize-none rounded-lg border border-line p-3 text-sm text-ink outline-none focus:border-cta focus:ring-2 focus:ring-cta/15"
              />
            </>
          ) : (
            <p className="text-sm text-body">Xác nhận duyệt hồ sơ này? Thao tác sẽ được gửi tới hệ thống ngay.</p>
          )}
          {error && <p role="alert" className="mt-3 text-xs font-medium text-red-600">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 bg-field/60 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="h-9 rounded-lg border border-line bg-white px-4 text-xs font-semibold text-ink hover:bg-field disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className={`h-9 rounded-lg px-4 text-xs font-semibold text-white hover:brightness-95 disabled:opacity-50 ${
              reject ? "bg-red-500" : "bg-emerald-600"
            }`}
          >
            {busy ? "Đang xử lý…" : reject ? "Từ chối hồ sơ" : "Duyệt hồ sơ"}
          </button>
        </div>
      </div>
    </div>
  )
}