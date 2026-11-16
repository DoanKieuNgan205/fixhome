"use client"

import { useState } from "react"
import { AlertTriangle, Calendar, Crown, MapPin, Phone, Search, Zap } from "lucide-react"
import { lookupCustomer, slots, type StepProps } from "@/lib/operator/mock-create-order"

const TONE: Record<string, string> = {
  best: "text-emerald-600",
  normal: "text-muted",
  low: "text-orange-600",
  peak: "text-amber-600",
}

const input =
  "h-10 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink outline-none focus:border-cta focus:ring-2 focus:ring-cta/15"

function Section({ no, title, right, children }: { no: string; title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
          <span className="rounded-md bg-orange-50 px-1.5 py-0.5 text-xs text-cta">{no}</span> {title}
        </h2>
        {right}
      </div>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  )
}

export function StepCustomer({ draft, patch }: StepProps) {
  const [checked, setChecked] = useState(false)
  const [hideDup, setHideDup] = useState(false)
  const c = draft.customer

  function check() {
    const found = lookupCustomer(draft.phone) // TODO: nối API tra cứu khách hàng
    setChecked(true)
    if (!found) return patch({ customer: null })
    const def = found.addresses.find((a) => a.isDefault) ?? found.addresses[0]
    patch({
      customer: found,
      customerName: found.name,
      addressId: def?.id ?? null,
      address: def?.address ?? "",
    })
  }

  return (
    <div className="space-y-4">
      {c?.activeOrder && !hideDup && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="flex items-center gap-2 text-xs font-semibold text-amber-800">
            <AlertTriangle className="size-4" />
            Phát hiện đơn đang xử lý song song với số điện thoại này (<b>{c.activeOrder}</b>)
          </p>
          <div className="flex gap-2">
            <button type="button" className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800">
              Xem đơn
            </button>
            <button
              type="button"
              onClick={() => setHideDup(true)}
              className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Vẫn tiếp tục tạo
            </button>
          </div>
        </div>
      )}

      <Section no="3.1" title="Thông tin khách hàng" right={<span className="text-[11px] text-muted">Tra cứu tự động CRM HomeFix</span>}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="phone" className="mb-1.5 block text-xs font-semibold text-ink">
              Số điện thoại gọi vào <span className="text-red-500">*</span>
            </label>
            <div className="flex h-10 items-center gap-2 rounded-lg border border-cta px-3 ring-2 ring-cta/15">
              <Phone className="size-4 text-muted" />
              <input
                id="phone"
                inputMode="tel"
                value={draft.phone}
                onChange={(e) => { setChecked(false); patch({ phone: e.target.value, customer: null }) }}
                placeholder="0988 123 456"
                className="h-full w-full bg-transparent text-sm text-ink outline-none"
              />
              <button
                type="button"
                onClick={check}
                disabled={draft.phone.replace(/\D/g, "").length < 10}
                className="flex shrink-0 items-center gap-1 rounded-md bg-orange-50 px-2 py-1 text-[11px] font-semibold text-cta disabled:opacity-50"
              >
                <Search className="size-3" /> Kiểm tra
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="cname" className="mb-1.5 block text-xs font-semibold text-ink">
              Họ và tên khách hàng <span className="text-red-500">*</span>
            </label>
            <input id="cname" value={draft.customerName} onChange={(e) => patch({ customerName: e.target.value })} className={input} />
          </div>
        </div>

        {c && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                <Crown className="size-4" /> Khách cũ thân thiết · {c.completedOrders} đơn hoàn tất trước
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700">Hạng {c.tier}</span>
              </p>
              <span className="text-[11px] text-muted">Mã KH: {c.code}</span>
            </div>
            <p className="mt-2 rounded-lg bg-white/70 p-3 text-xs text-body">
              <b className="text-ink">Ghi chú vận hành:</b> {c.opNote}
            </p>
          </div>
        )}
        {checked && !c && (
          <p className="rounded-lg bg-field/70 p-3 text-xs text-body">
            Chưa có hồ sơ khách hàng với số này. Hệ thống sẽ tạo hồ sơ khách hàng tạm khi lưu đơn.
          </p>
        )}
      </Section>

      <Section
        no="3.2"
        title="Địa chỉ thực hiện dịch vụ"
        right={draft.address ? <span className="text-[11px] font-semibold text-emerald-600">● Đã định vị GPS</span> : null}
      >
        <div>
          <label htmlFor="addr" className="mb-1.5 block text-xs font-semibold text-ink">
            Địa chỉ dịch vụ (Tìm kiếm nhanh tự động) <span className="text-red-500">*</span>
          </label>
          <div className="flex h-10 items-center gap-2 rounded-lg border border-line px-3 focus-within:border-cta focus-within:ring-2 focus-within:ring-cta/15">
            <MapPin className="size-4 text-muted" />
            <input
              id="addr"
              value={draft.address}
              onChange={(e) => patch({ address: e.target.value, addressId: null })}
              placeholder="Nhập số nhà, tên đường, phường, quận..."
              className="h-full w-full bg-transparent text-sm text-ink outline-none"
            />
          </div>
        </div>

        {c && (
          <div>
            <div className="mb-1.5 text-[11px] text-muted">Địa chỉ đã lưu trong hồ sơ khách hàng:</div>
            <div className="flex flex-wrap gap-2">
              {c.addresses.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => patch({ addressId: a.id, address: a.address })}
                  aria-pressed={draft.addressId === a.id}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                    draft.addressId === a.id ? "border-cta bg-orange-50 text-cta" : "border-line text-body hover:bg-field"
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label htmlFor="note" className="mb-1.5 block text-xs font-semibold text-ink">
            Tòa nhà / Tầng / Căn hộ & Hướng dẫn KTV tiếp cận
          </label>
          <textarea
            id="note"
            value={draft.addressNote}
            onChange={(e) => patch({ addressNote: e.target.value })}
            rows={2}
            placeholder="Ví dụ: Tháp 14, sảnh chính check-in thẻ cư dân tại quầy lễ tân..."
            className="w-full resize-none rounded-lg border border-line p-3 text-sm text-ink outline-none focus:border-cta focus:ring-2 focus:ring-cta/15"
          />
        </div>
      </Section>

      <Section no="3.3" title="Thời gian hẹn & Khung giờ phục vụ" right={<span className="text-[11px] text-muted">Múi giờ: GMT+7 (Hồ Chí Minh)</span>}>
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-field p-1.5">
          <button
            type="button"
            onClick={() => patch({ timeMode: "asap" })}
            aria-pressed={draft.timeMode === "asap"}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold ${
              draft.timeMode === "asap" ? "bg-cta text-white" : "text-body hover:bg-white"
            }`}
          >
            <Zap className="size-3.5" /> Càng sớm càng tốt (Trong 2 giờ)
          </button>
          <button
            type="button"
            onClick={() => patch({ timeMode: "scheduled", date: draft.date || new Date().toISOString().slice(0, 10) })}
            aria-pressed={draft.timeMode === "scheduled"}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold ${
              draft.timeMode === "scheduled" ? "bg-cta text-white" : "text-body hover:bg-white"
            }`}
          >
            <Calendar className="size-3.5" /> Chọn ngày & giờ cụ thể
          </button>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-field/70 px-3 py-2 text-xs">
          <span className="flex items-center gap-2 text-body">
            <Calendar className="size-3.5" /> Ngày thực hiện:
            {draft.timeMode === "asap" ? (
              <b className="text-ink">Hôm nay</b>
            ) : (
              <input
                type="date"
                value={draft.date}
                onChange={(e) => patch({ date: e.target.value })}
                className="rounded-md border border-line bg-white px-2 py-1 text-xs text-ink outline-none focus:border-cta"
              />
            )}
          </span>
          {draft.timeMode === "asap" && (
            <span className="rounded bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-cta">Ưu tiên xử lý nhanh</span>
          )}
        </div>

        <div>
          <div className="mb-2 text-xs font-semibold text-ink">Chọn khung giờ KTV có mặt:</div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {slots.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => patch({ slotId: s.id })}
                aria-pressed={draft.slotId === s.id}
                className={`rounded-xl border p-3 text-left ${
                  draft.slotId === s.id ? "border-cta bg-orange-50/50 ring-1 ring-cta" : "border-line hover:border-slate-300"
                }`}
              >
                <div className="text-[13px] font-bold text-ink">{s.range}</div>
                <div className={`mt-1 text-[11px] font-semibold ${TONE[s.tone]}`}>{s.label}</div>
                <div className="text-[11px] text-muted">{s.techs} KTV sẵn sàng</div>
              </button>
            ))}
          </div>
        </div>
      </Section>
    </div>
  )
}