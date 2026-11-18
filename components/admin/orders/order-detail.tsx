"use client"

// components/admin/orders/order-detail.tsx
import Link from "next/link"
import { useEffect, useState } from "react"
import {
  AlertTriangle, ArrowLeft, Banknote, Camera, Check, ClipboardList, History, MapPin, MessageSquare,
  MoreHorizontal, Phone, ReceiptText, ShieldCheck, UserCheck, Wallet,
} from "lucide-react"
import {
  CASH_LABEL, CASH_TONE, STATUS_LABEL, STATUS_TONE, STEPS, dmy, hm, initials, money,
  type OrderDetail,
} from "@/lib/admin/order-types"

type TabKey = "overview" | "pricing" | "cash" | "history"
const TABS: { key: TabKey; label: string; icon: typeof Wallet }[] = [
  { key: "overview", label: "Tổng quan", icon: ClipboardList },
  { key: "pricing", label: "Dịch vụ & giá", icon: ReceiptText },
  { key: "cash", label: "Thu tiền mặt", icon: Banknote },
  { key: "history", label: "Lịch sử & Kiểm toán", icon: History },
]

function Card({ icon: Icon, title, right, children }: { icon: typeof Wallet; title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
          <span className="flex size-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><Icon className="size-4" /></span>
          {title}
        </h2>
        {right}
      </div>
      {children}
    </section>
  )
}

function Stepper({ step, times, cancelled }: { step: number; times: string[]; cancelled: boolean }) {
  return (
    <ol className="grid gap-2 rounded-xl border border-line bg-white p-3 shadow-sm sm:grid-cols-4 lg:grid-cols-7">
      {STEPS.map((label, i) => {
        const n = i + 1
        const done = n < step || (n === step && step === 7 && !cancelled)
        const current = n === step && !done
        return (
          <li
            key={label}
            className={`rounded-lg border p-2.5 text-xs ${
              current ? "border-red-200 bg-red-50" : done ? "border-emerald-100 bg-emerald-50/50" : "border-line bg-slate-50 opacity-70"
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-bold uppercase text-muted">
              Bước {n}
              {done && <span className="flex size-4 items-center justify-center rounded-full bg-emerald-500 text-white"><Check className="size-3" /></span>}
              {current && <span className="size-2 rounded-full bg-red-500" />}
            </div>
            <div className="mt-1 font-semibold text-ink">{label}</div>
            <div className="mt-0.5 text-[10px] text-muted">{times[i] || (current ? "Hiện tại" : "Chờ thực hiện")}</div>
          </li>
        )
      })}
    </ol>
  )
}

export function OrderDetailView({ order }: { order: OrderDetail }) {
  const [tab, setTab] = useState<TabKey>("overview")
  const [notice, setNotice] = useState<string | null>(null)
  const t = order.technician
  const cancelled = order.status === "cancelled"

  // thông báo tự tắt sau 4 giây
  useEffect(() => {
    if (!notice) return
    const id = setTimeout(() => setNotice(null), 4000)
    return () => clearTimeout(id)
  }, [notice])

  // TODO: chờ backend có API gán lại KTV / điều chỉnh giá
  const pending = (what: string) => setNotice(`Chức năng "${what}" đang chờ backend cung cấp API.`)

  return (
    <div className="space-y-5">
      <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink">
        <ArrowLeft className="size-3.5" /> Quay lại danh sách đơn hàng
      </Link>

      {notice && <div role="status" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">{notice}</div>}

      {/* Đầu trang */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-ink">#{order.code}</h1>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_TONE[order.status]}`}>{STATUS_LABEL[order.status]}</span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => pending("Gán lại KTV")} className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink hover:bg-slate-50">
            <UserCheck className="size-4" /> Gán lại KTV
          </button>
          <button type="button" onClick={() => pending("Điều chỉnh giá")} className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink hover:bg-slate-50">
            <ReceiptText className="size-4" /> Điều chỉnh giá
          </button>
          <button type="button" aria-label="Thêm" className="flex size-9 items-center justify-center rounded-lg border border-line bg-white text-muted">
            <MoreHorizontal className="size-4" />
          </button>
        </div>
      </div>

      <Stepper step={order.step} times={order.stepTimes} cancelled={cancelled} />

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          {/* Tab */}
          <div className="flex flex-wrap gap-2" role="tablist">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => setTab(key)}
                className={`inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-xs font-semibold ${
                  tab === key ? "bg-ink text-white" : "border border-line bg-white text-ink hover:bg-slate-50"
                }`}
              >
                <Icon className="size-3.5" /> {label}
              </button>
            ))}
          </div>

          {tab === "overview" && (
            <>
              <Card icon={ClipboardList} title="Thông tin khách hàng & Hiện trường">
                <div className="grid gap-4 rounded-lg bg-slate-50 p-4 text-xs sm:grid-cols-2">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-muted">Họ tên & liên hệ</div>
                    <div className="mt-1 font-semibold text-ink">{order.customer.name}</div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-cta"><Phone className="size-3" /> {order.customer.phone}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-muted">Khung giờ hẹn mong muốn</div>
                    <div className="mt-1 font-semibold text-ink">{hm(order.scheduledAt)} – {dmy(order.scheduledAt)}</div>
                    <div className="mt-0.5 text-[11px] text-emerald-600">KTV đã có mặt đúng hẹn</div>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="text-[10px] font-bold uppercase text-muted">Địa chỉ căn hộ</div>
                    <div className="mt-1 flex items-start gap-1.5 text-ink"><MapPin className="mt-0.5 size-3.5 shrink-0 text-red-500" /> {order.customer.address}</div>
                  </div>
                  <div className="rounded-lg border border-line bg-white p-3 sm:col-span-2">
                    <div className="text-[10px] font-bold uppercase text-amber-700">Mô tả sự cố của khách:</div>
                    <p className="mt-1 italic text-ink">“{order.issue}”</p>
                  </div>
                </div>
              </Card>

              <Card
                icon={UserCheck} title="Kỹ thuật viên thực hiện"
                right={t && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">{t.availability}</span>}
              >
                {t ? (
                  <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex size-14 items-center justify-center rounded-xl bg-slate-800 text-base font-bold text-white">{initials(t.name)}</span>
                      <div className="text-xs">
                        <div className="text-sm font-semibold text-ink">{t.name} <span className="font-normal text-muted">#{t.id}</span></div>
                        <div className="text-muted"><span className="text-amber-500">★ {t.rating.toFixed(1)} / 5.0</span> · {t.completedOrders} đơn hoàn thành</div>
                        <div className="text-cta">{t.phone}</div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 text-xs">
                      <span className="text-right text-muted">{t.hub}</span>
                      <a href={`tel:${t.phone.replace(/\D/g, "")}`} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-ink px-4 font-semibold text-white"><Phone className="size-3.5" /> Gọi KTV ngay</a>
                      <button type="button" onClick={() => pending("Nhắn tin KTV")} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 font-semibold text-ink"><MessageSquare className="size-3.5" /> Nhắn tin KTV</button>
                    </div>
                  </div>
                ) : <p className="text-sm text-muted">Đơn chưa được phân công kỹ thuật viên.</p>}
              </Card>

              <Card icon={Camera} title="Ảnh hiện trường & Nghiệm thu kỹ thuật" right={<span className="text-[11px] text-muted">{order.photos.filter((p) => p.kind !== "empty").length}/{order.photos.length} ảnh đã tải lên</span>}>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {order.photos.map((p, i) => (
                    <figure key={i} className="text-center">
                      <div className={`flex h-24 items-center justify-center rounded-lg border text-xs ${
                        p.kind === "empty" ? "border-dashed border-line bg-slate-50 text-muted" : "border-line bg-slate-200 text-slate-600"
                      }`}>
                        {p.kind === "empty" ? <span>{p.label}<br /><small>Chờ KTV hoàn thiện</small></span> : <span className="rounded bg-black/50 px-2 py-0.5 text-[10px] text-white">{p.label}</span>}
                      </div>
                      <figcaption className="mt-1.5 text-[11px] text-muted">{p.caption}</figcaption>
                    </figure>
                  ))}
                </div>
              </Card>
            </>
          )}

          {tab === "pricing" && (
            <Card icon={ReceiptText} title="Dịch vụ & báo giá chốt">
              <table className="w-full text-sm">
                <thead className="text-left text-[11px] uppercase text-muted">
                  <tr><th className="py-2">Hạng mục</th><th className="py-2">Ghi chú</th><th className="py-2 text-right">Thành tiền</th></tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {order.lines.map((l) => (
                    <tr key={l.name}>
                      <td className="py-2.5 font-medium text-ink">{l.name} {l.badge && <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">{l.badge}</span>}</td>
                      <td className="py-2.5 text-xs text-muted">{l.note ?? "—"}</td>
                      <td className="py-2.5 text-right font-semibold text-ink">{l.amount.toLocaleString("vi-VN")} đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 space-y-1 rounded-lg bg-slate-50 p-4 text-sm">
                <div className="flex justify-between text-muted"><span>Báo giá ban đầu</span><s>{order.quoteFrom.toLocaleString("vi-VN")} – {order.quoteTo.toLocaleString("vi-VN")} đ</s></div>
                <div className="flex justify-between"><span className="font-semibold text-ink">Giá chốt thực tế</span><b className="text-cta">{money(order.finalPrice)}</b></div>
              </div>
            </Card>
          )}

          {tab === "cash" && (
            <Card icon={Banknote} title="Thu tiền mặt" right={<span className={`rounded-md px-2 py-1 text-[11px] font-medium ${CASH_TONE[order.cash]}`}>{CASH_LABEL[order.cash]}</span>}>
              {order.reconcile ? (
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between"><dt className="text-muted">1. Tiền thu khách (100% tiền mặt)</dt><dd className="font-semibold text-ink">{order.reconcile.collected.toLocaleString("vi-VN")} đ</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">2. Hoa hồng KTV (80% công dịch vụ)</dt><dd className="font-semibold text-emerald-600">− {order.reconcile.techShare.toLocaleString("vi-VN")} đ</dd></div>
                  <div className="flex justify-between rounded-lg bg-orange-50 p-3"><dt className="font-semibold text-orange-700">KTV phải nộp két công ty</dt><dd className="font-bold text-orange-700">{order.reconcile.handOver.toLocaleString("vi-VN")} đ</dd></div>
                  <p className="text-xs text-muted">Nộp đủ tại quầy trước {order.reconcile.deadline} tại {order.reconcile.hubName}.</p>
                </dl>
              ) : <p className="text-sm text-muted">Chưa có số liệu đối soát — đơn chưa chốt giá.</p>}
            </Card>
          )}

          {tab === "history" && (
            <Card icon={History} title="Lịch sử & Kiểm toán">
              <ol className="relative space-y-4 border-l border-line pl-5">
                {order.history.map((h, i) => (
                  <li key={i} className="relative text-sm">
                    <span className="absolute -left-[26px] top-1 size-2.5 rounded-full bg-blue-500 ring-4 ring-white" />
                    <div className="font-medium text-ink">{h.title}</div>
                    <div className="text-xs text-muted">{h.at} · {h.by}</div>
                  </li>
                ))}
              </ol>
            </Card>
          )}
        </div>

        {/* Cột phải */}
        <aside className="space-y-5">
          <div className="rounded-xl bg-slate-900 p-5 text-white shadow-sm">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-slate-300">
              Tổng tiền phải thu
              <span className="rounded bg-orange-500 px-2 py-0.5 text-white">{order.cash === "unpaid" ? "KTV chưa thu" : CASH_LABEL[order.cash]}</span>
            </div>
            <div className="mt-3 text-3xl font-bold">{money(order.finalPrice)}</div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-300"><Wallet className="size-3.5" /> 100% tiền mặt tại nhà</div>
          </div>

          <section className="rounded-xl border border-line bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-[11px] font-bold uppercase text-muted">Liên hệ trực tiếp theo ca</h3>
            <div className="space-y-2 text-xs">
              {t && (
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5">
                  <div><div className="font-semibold text-ink">KTV: {t.name}</div><div className="text-muted">{t.phone}</div></div>
                  <a href={`tel:${t.phone.replace(/\D/g, "")}`} className="rounded-md bg-ink px-3 py-1.5 font-semibold text-white">Gọi KTV</a>
                </div>
              )}
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5">
                <div><div className="font-semibold text-ink">Khách: {order.customer.name}</div><div className="text-muted">{order.customer.phone}</div></div>
                <a href={`tel:${order.customer.phone.replace(/\D/g, "")}`} className="rounded-md border border-line bg-white px-3 py-1.5 font-semibold text-ink">Gọi khách</a>
              </div>
            </div>
          </section>

          {order.reconcile && (
            <section className="rounded-xl border border-line bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[11px] font-bold uppercase text-muted">Đối soát nộp két dự kiến</h3>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">Quy chuẩn</span>
              </div>
              <dl className="space-y-1.5 text-xs">
                <div className="flex justify-between"><dt className="text-muted">1. Tiền thu khách</dt><dd className="font-semibold text-ink">{order.reconcile.collected.toLocaleString("vi-VN")} đ</dd></div>
                <div className="flex justify-between"><dt className="text-muted">2. Hoa hồng KTV</dt><dd className="font-semibold text-emerald-600">− {order.reconcile.techShare.toLocaleString("vi-VN")} đ</dd></div>
              </dl>
              <div className="mt-3 rounded-lg bg-orange-50 p-3 text-xs">
                <div className="flex justify-between font-bold text-orange-700"><span>KTV PHẢI NỘP KÉT CÔNG TY</span><span>{order.reconcile.handOver.toLocaleString("vi-VN")} đ</span></div>
                <div className="mt-1 text-[11px] text-orange-700/80">Nộp đủ tại quầy {order.reconcile.hubName}</div>
              </div>
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 p-2.5 text-[11px] text-amber-800">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" /> Hạn nộp két quy định: trước <b>{order.reconcile.deadline}</b>. KTV không được giữ tiền mặt qua đêm.
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted"><ShieldCheck className="size-3.5" /> Dữ liệu phục vụ đối soát & kiểm toán</div>
            </section>
          )}
        </aside>
      </div>
    </div>
  )
}