"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { AlertTriangle, Clock, MapPin } from "lucide-react"
import { isUrgent, type QueueOrder } from "@/lib/operator/repair-order-mappers"

const KEY = "dispatch:processing"
const vnd = (n: number) => `${n.toLocaleString("vi-VN")}đ`

function Wait({ at }: { at: string | null }) {
  const [min, setMin] = useState<number | null>(null)
  useEffect(() => {
    if (!at) return
    const tick = () => setMin(Math.max(0, Math.floor((Date.now() - new Date(at).getTime()) / 60000)))
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [at])
  if (min == null) return null
  return (
    <span className="flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-red-600">
      <Clock className="size-3" /> Chờ {min} phút
    </span>
  )
}

function ConfirmDialog({ onYes, onNo }: { onYes: () => void; onNo: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onNo()
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onNo])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4" onClick={onNo}>
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
      >
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-orange-50 text-cta">
          <AlertTriangle className="size-5" />
        </span>
        <h2 className="mt-3 text-sm font-bold text-ink">Xác nhận xử lý đơn này</h2>
        <p className="mt-1 text-xs text-body">
          Bạn có chắc muốn tiếp nhận xử lý và chuyển trạng thái đơn hàng này sang &ldquo;Đang xử lý&rdquo; không?
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button type="button" onClick={onNo} className="h-10 rounded-lg bg-field text-xs font-bold text-ink hover:bg-slate-200">
            NO
          </button>
          <button type="button" onClick={onYes} autoFocus className="h-10 rounded-lg bg-cta text-xs font-bold text-white hover:brightness-95">
            OK
          </button>
        </div>
      </div>
    </div>
  )
}

type Props = {
  orders: QueueOrder[]
  total?: number
  demo?: boolean // dữ liệu mẫu: không điều hướng, không lưu trạng thái
  initialProcessing?: number[]
}

export function DispatchRequestList({ orders, total, demo = false, initialProcessing = [] }: Props) {
  const router = useRouter()
  const [processing, setProcessing] = useState<number[]>(initialProcessing)
  const [confirmId, setConfirmId] = useState<number | null>(null)

  // TODO: backend chưa có API "nhận xử lý đơn", tạm lưu tại trình duyệt này
  useEffect(() => {
    if (demo) return
    try {
      setProcessing(JSON.parse(localStorage.getItem(KEY) ?? "[]"))
    } catch {
      /* bỏ qua */
    }
  }, [demo])

  function claim(id: number) {
    const next = [...new Set([...processing, id])]
    setProcessing(next)
    setConfirmId(null)
    if (demo) return
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
    } catch {
      /* bỏ qua */
    }
    router.push(`/operator/dispatch/${id}`)
  }

  return (
    <section className="space-y-3">
      <h2 className="rounded-lg border border-line bg-white px-4 py-3 text-sm font-semibold text-ink shadow-sm">
        Danh sách yêu cầu tìm thợ{total != null && total > orders.length ? ` (${total})` : ""}
        {demo && <span className="ml-2 rounded bg-amber-50 px-2 py-0.5 text-[11px] text-amber-700">Dữ liệu mẫu</span>}
      </h2>

      {orders.length === 0 && (
        <p className="rounded-lg border border-line bg-white p-6 text-center text-sm text-muted shadow-sm">
          Hiện không có yêu cầu nào đang chờ tìm thợ
        </p>
      )}

      {orders.map((o) => {
        const busy = processing.includes(o.id)
        const place = o.area ?? o.address
        return (
          <article
            key={o.id}
            className="rounded-lg border border-line border-l-4 border-l-red-400 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 font-medium text-red-600">
                  <span className="size-1.5 rounded-full bg-red-500" /> Chưa có thợ nhận
                </span>
                <Wait at={o.createdAt} />
              </div>
              <span className="font-medium text-muted">{o.code}</span>
            </div>

            <div className="mt-2.5 flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-ink">
                  {o.title ?? "Yêu cầu sửa chữa"}
                  {isUrgent(o.priority) && <span className="ml-2 text-xs font-normal text-red-500">(Khách báo gấp)</span>}
                </h3>
                <p className="mt-1.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
                  {place && (
                    <>
                      <MapPin className="size-3" /> {place}
                    </>
                  )}
                  <span>• Khách: <b className="text-ink">{o.customerName ?? "—"}</b></span>
                </p>
                {o.estimate != null && (
                  <p className="mt-1 text-xs text-muted">
                    • Dự kiến: <b className="text-cta">{vnd(o.estimate)}</b>
                  </p>
                )}
              </div>

              <div className="flex shrink-0 gap-2">
                {demo ? (
                  <span className="rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink">Xem chi tiết</span>
                ) : (
                  <Link
                    href={`/operator/dispatch/${o.id}`}
                    className="rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-field"
                  >
                    Xem chi tiết
                  </Link>
                )}
                {busy ? (
                  demo ? (
                    <span className="rounded-md bg-emerald-400 px-3 py-1.5 text-xs font-semibold text-white">Đang xử lý</span>
                  ) : (
                    <Link
                      href={`/operator/dispatch/${o.id}`}
                      className="rounded-md bg-emerald-400 px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-95"
                    >
                      Đang xử lý
                    </Link>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmId(o.id)}
                    className="rounded-md bg-cta px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-95"
                  >
                    Chưa xử lý
                  </button>
                )}
              </div>
            </div>
          </article>
        )
      })}

      {confirmId != null && <ConfirmDialog onYes={() => claim(confirmId)} onNo={() => setConfirmId(null)} />}
    </section>
  )
}