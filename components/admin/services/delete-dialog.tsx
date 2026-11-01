"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Info, Trash2, X } from "lucide-react"

export type DeleteTarget = "category" | "device"

type Props = {
  target: DeleteTarget
  name: string
  deviceCount?: number // chỉ dùng khi xóa nhóm
  runningOrders: number
  onCancel: () => void
  onConfirm: () => void
}

export function DeleteDialog({
  target,
  name,
  deviceCount = 0,
  runningOrders,
  onCancel,
  onConfirm,
}: Props) {
  const [typed, setTyped] = useState("")

  const isCategory = target === "category"
  const blocked = runningOrders > 0
  // Xóa nhóm: phải gõ đúng tên. Xóa thiết bị: không cần
  const nameMatched = !isCategory || typed.trim() === name
  const canConfirm = !blocked && nameMatched

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl"
      >
        <div className="flex items-center gap-3 px-5 pt-5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
            <Trash2 className="size-4" />
          </span>
          <h2 id="delete-title" className="flex-1 text-sm font-bold text-ink">
            Xóa {isCategory ? "nhóm danh mục" : "thiết bị"} &ldquo;{name}&rdquo;?
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
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            <p>
              Hành động này <b>không thể hoàn tác</b>.{" "}
              {isCategory
                ? `Nhóm và ${deviceCount} thiết bị bên trong sẽ bị xóa khỏi hệ thống, khách không còn thấy các dịch vụ này.`
                : "Thiết bị sẽ bị xóa khỏi danh mục, khách không còn thấy dịch vụ này."}
            </p>
          </div>

          {blocked && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              <p>
                Đang có <b>{runningOrders} đơn</b> thực hiện liên quan, chưa thể xóa. Hãy chọn{" "}
                <b>Tạm ngưng</b> để khách không đặt thêm, rồi xóa sau khi các đơn hoàn tất.
              </p>
            </div>
          )}

          {isCategory && !blocked && (
            <div>
              <label htmlFor="delete-confirm" className="mb-1.5 block text-xs font-semibold text-body">
                Gõ <b className="text-ink">{name}</b> để xác nhận
              </label>
              <input
                id="delete-confirm"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                autoComplete="off"
                placeholder={name}
                className="h-10 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink outline-none placeholder:text-muted focus:border-red-400 focus:ring-2 focus:ring-red-400/15"
              />
            </div>
          )}
        </div>

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
            disabled={!canConfirm}
            onClick={onConfirm}
            className="h-9 rounded-lg bg-red-500 px-4 text-xs font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Xác nhận xóa
          </button>
        </div>
      </div>
    </div>
  )
}