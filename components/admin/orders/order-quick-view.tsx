"use client"

// components/admin/orders/order-quick-view.tsx
import Link from "next/link"
import { useEffect } from "react"
import { Clock, MapPin, Phone, Wallet, Wrench, X, Zap } from "lucide-react"
import { STATUS_LABEL, STATUS_TONE, dmy, hm, initials, money, type OrderDetail } from "@/lib/admin/order-types"

function Section({ icon: Icon, title, children }: { icon: typeof Zap; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-white p-4 shadow-sm">
      <h3 className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-muted">
        <Icon className="size-3.5" /> {title}
      </h3>
      {children}
    </section>
  )
}

export function OrderQuickView({ order, onClose }: { order: OrderDetail | null; onClose: () => void }) {
  // đóng bằng phím Esc
  useEffect(() => {
    if (!order) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [order, onClose])

  if (!order) return null
  const t = order.technician

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Chi tiết nhanh đơn hàng">
      <button type="button" aria-label="Đóng" onClick={onClose} className="absolute inset-0 bg-slate-900/30" />
      <aside className="relative flex h-full w-full max-w-[440px] flex-col bg-slate-50 shadow-2xl">
        <header className="flex items-center justify-between border-b border-line bg-white px-5 py-4">
          <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
            <Zap className="size-4 text-cta" /> Chi tiết nhanh đơn hàng
          </h2>
          <button type="button" aria-label="Đóng" onClick={onClose} className="text-muted hover:text-ink"><X className="size-5" /></button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-ink">#{order.code}</h1>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_TONE[order.status]}`}>{STATUS_LABEL[order.status]}</span>
          </div>

          <Section icon={Wrench} title="Khách hàng">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-ink">{order.customer.name}</div>
                <div className="text-xs text-muted">SĐT: {order.customer.phone}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">{order.customer.tier}</span>
                <a href={`tel:${order.customer.phone.replace(/\D/g, "")}`} aria-label="Gọi khách" className="flex size-8 items-center justify-center rounded-lg border border-line text-ink">
                  <Phone className="size-4" />
                </a>
              </div>
            </div>
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-slate-50 p-2.5 text-xs text-ink">
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-red-500" /> {order.customer.address}
            </div>
            <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50 p-3">
              <div className="text-[10px] font-bold uppercase text-amber-700">Mô tả sự cố của khách:</div>
              <p className="mt-1 text-xs italic text-ink">“{order.issue}”</p>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-xs">
              <span className="flex items-center gap-1.5 text-muted"><Clock className="size-3.5" /> Giờ hẹn đã đặt:</span>
              <b className="text-ink">{hm(order.scheduledAt)} – {dmy(order.scheduledAt)}</b>
            </div>
          </Section>

          <Section icon={Wallet} title="Dịch vụ & báo giá chốt">
            <ul className="space-y-2">
              {order.lines.map((l) => (
                <li key={l.name} className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 p-2.5 text-xs">
                  <div>
                    <div className="font-semibold text-ink">
                      {l.name}{" "}
                      {l.badge && <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">{l.badge}</span>}
                    </div>
                    {l.note && <div className="text-[11px] text-muted">{l.note}</div>}
                  </div>
                  <b className="whitespace-nowrap text-ink">{l.amount.toLocaleString("vi-VN")} đ</b>
                </li>
              ))}
            </ul>
            <div className="mt-3 space-y-1 rounded-lg bg-slate-100 p-3 text-xs">
              <div className="flex justify-between text-muted">
                <span>Báo giá ban đầu:</span>
                <s>{order.quoteFrom.toLocaleString("vi-VN")} – {order.quoteTo.toLocaleString("vi-VN")} đ</s>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink">Giá chốt thực tế:</span>
                <b className="text-lg text-cta">{money(order.finalPrice)}</b>
              </div>
            </div>
          </Section>

          <Section icon={Wrench} title="Kỹ thuật viên phụ trách">
            {t ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-lg bg-slate-800 text-sm font-bold text-white">{initials(t.name)}</span>
                  <div className="text-xs">
                    <div className="font-semibold text-ink">{t.name} <span className="text-muted">· #{t.id}</span></div>
                    <div className="text-muted">SĐT: {t.phone}</div>
                    <div className="text-muted"><span className="text-amber-500">★ {t.rating.toFixed(1)}</span> · {t.completedOrders} đơn hoàn thành</div>
                  </div>
                </div>
                <a href={`tel:${t.phone.replace(/\D/g, "")}`} aria-label="Gọi KTV" className="flex size-8 items-center justify-center rounded-lg border border-line text-ink">
                  <Phone className="size-4" />
                </a>
              </div>
            ) : <p className="text-xs text-muted">Đơn chưa được phân công kỹ thuật viên.</p>}
          </Section>

          <div className="flex items-center justify-between rounded-xl border border-line bg-white p-4">
            <span className="text-xs font-semibold text-ink">Tổng tiền phải thu:</span>
            <b className="text-xl text-cta">{money(order.finalPrice)}</b>
          </div>
        </div>

        <footer className="flex items-center justify-between border-t border-line bg-white px-5 py-4">
          <button type="button" onClick={onClose} className="text-sm font-medium text-ink hover:underline">Đóng</button>
          <Link
            href={`/admin/orders/${encodeURIComponent(order.code)}`}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-white hover:opacity-90"
          >
            Mở chi tiết đầy đủ ›
          </Link>
        </footer>
      </aside>
    </div>
  )
}