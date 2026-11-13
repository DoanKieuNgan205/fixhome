"use client"

import { useEffect } from "react"
import { X } from "lucide-react"

export const btnGhost =
  "h-9 rounded-lg border border-line bg-white px-4 text-xs font-semibold text-ink hover:bg-field"
export const btnPrimary =
  "h-9 rounded-lg bg-cta px-4 text-xs font-semibold text-white hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
export const fieldCls =
  "w-full rounded-lg border border-line bg-white p-3 text-sm text-ink outline-none focus:border-cta focus:ring-2 focus:ring-cta/15"

export function Modal({
  title, onClose, children, footer, wide = false,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
  footer: React.ReactNode
  wide?: boolean
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={`max-h-[90vh] w-full overflow-y-auto rounded-xl bg-white shadow-2xl ${wide ? "max-w-lg" : "max-w-md"}`}
      >
        <div className="flex items-center justify-between px-5 pt-5">
          <h2 className="text-sm font-bold text-ink">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Đóng" className="text-muted hover:text-ink">
            <X className="size-4" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        <div className="flex justify-end gap-2 bg-field/60 px-5 py-3">{footer}</div>
      </div>
    </div>
  )
}