"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Ban, CheckCircle2, Info, RefreshCw, X } from "lucide-react"

export type PauseTarget = "category" | "device"

const REASONS = [
  "Quá tải nhân lực KTV",
  "Thiếu vật tư / linh kiện",
  "Bảo trì / nâng cấp dịch vụ",
  "Điều chỉnh chính sách giá",
  "Lý do khác",
]

type Props = {
  target: PauseTarget
  name: string
  runningOrders: number
  affectedCount: number
  onCancel: () => void
  onConfirm: (data: { reason: string; note: string }) => void
}

export function PauseDialog({
  target,
  name,
  runningOrders,
  affectedCount,
  onCancel,
  onConfirm,
}: Props) {
  const [reason, setReason] = useState(REASONS[0])
  const [note, setNote] = useState("")
  const [error, setError] = useState("")

  const isCategory = target === "category"

  // Đóng bằng phím Esc, khóa cuộn trang phía sau
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel()
    }
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [onCancel])

  function submit() {
    if (reason === "Lý do khác" && !note.trim()) {
      setError("Vui lòng nhập ghi chú khi chọn \"Lý do khác\"")
      return
    }
    onConfirm({ reason, note: note.trim() })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pause-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl"
      >
        {/* Tiêu đề */}
        <div className="flex items-center gap-3 px-5 pt-5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
            <AlertTriangle className="size-4" />
          </span>
          <h2 id="pause-title" className="flex-1 text-sm font-bold text-ink">
            Tạm ngưng {isCategory ? "nhóm danh mục" : "dịch vụ"} &ldquo;{name}&rdquo;?
          </h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Đóng"
            className="text-muted hover:text-ink"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 pb-5 pt-4">
          {/* Hệ quả */}
          <ul className="space-y-2 rounded-lg bg-blue-50/70 p-3 text-xs text-body">
            <li className="flex items-center gap-2">
              <Ban className="size-3.5 shrink-0 text-red-500" />
              {isCategory
                ? "Khách không thể đặt các dịch vụ thuộc nhóm này trên ứng dụng"
                : "Khách không thể đặt dịch vụ này nữa trên ứng dụng"}
            </li>
            <li className="flex items-center gap-2">
              <RefreshCw className="size-3.5 shrink-0 text-orange-500" />
              <span>
                Đơn đang thực hiện (<b className="text-ink">{runningOrders} đơn</b>) giữ nguyên
                giá cũ và tiến độ xử lý
              </span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
              Có thể bật lại bất cứ lúc nào từ danh mục quản lý
            </li>
          </ul>

          {/* Lý do */}
          <div>
            <label htmlFor="pause-reason" className="mb-1.5 block text-xs font-semibold text-body">
              Lý do tạm ngưng <span className="text-red-500">*</span>
            </label>
            <select
              id="pause-reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                setError("")
              }}
              className="h-10 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink outline-none focus:border-cta focus:ring-2 focus:ring-cta/15"
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Ghi chú */}
          <div>
            <label htmlFor="pause-note" className="mb-1.5 block text-xs font-semibold text-body">
              Ghi chú bổ sung <span className="font-normal text-muted">(tùy chọn)</span>
            </label>
            <textarea
              id="pause-note"
              value={note}
              onChange={(e) => {
                setNote(e.target.value)
                setError("")
              }}
              rows={3}
              placeholder="Nhập ghi chú thêm cho đội ngũ vận hành..."
              className={`w-full resize-none rounded-lg border bg-white px-3 py-2 text-sm text-ink outline-none placeholder:text-muted focus:border-cta focus:ring-2 focus:ring-cta/15 ${
                error ? "border-red-400" : "border-line"
              }`}
            />
            {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
          </div>

          {/* Lưu ý */}
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            <p>
              <b>Lưu ý:</b> {affectedCount} dịch vụ liên quan hoặc KTV đang trong ca sẽ nhận thông
              báo cập nhật danh mục.
            </p>
          </div>
        </div>

        {/* Nút */}
        <div className="flex justify-end gap-2 bg-field/60 px-5 py-3">
          <button
            type="button"
            onClick={onCancel}
            className="h-9 rounded-lg border border-line bg-white px-4 text-xs font-semibold text-ink transition hover:bg-field"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={submit}
            className="h-9 rounded-lg bg-red-500 px-4 text-xs font-semibold text-white transition hover:bg-red-600"
          >
            Xác nhận tạm ngưng
          </button>
        </div>
      </div>
    </div>
  )
}