import { ArrowLeft, ArrowRight, Clock, CreditCard, Info, ShieldCheck, Wrench } from "lucide-react"
import {
  INSPECTION_FEE, customerDevices, describeTime, money, services, type Draft,
} from "@/lib/operator/mock-create-order"

type Props = {
  step: number
  draft: Draft
  canContinue: boolean
  onBack: () => void
  onNext: () => void
  onCancel: () => void
}

const NEXT_LABEL: Record<number, string> = {
  1: "Tiếp tục",
  2: "Tiếp tục",
  3: "Tiếp tục",
  5: "Tạo đơn & Gán thợ",
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold tracking-wider text-muted">{label}</dt>
      <dd className="mt-0.5 text-xs font-semibold text-ink">{children}</dd>
    </div>
  )
}

export function OrderSummary({ step, draft, canContinue, onBack, onNext, onCancel }: Props) {
  const service = services.find((s) => s.id === draft.serviceId)
  const device = customerDevices.find((d) => d.id === draft.deviceId)

  return (
    <aside className="space-y-4 xl:sticky xl:top-4">
      <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
            <Info className="size-4 text-cta" /> Tóm tắt yêu cầu
          </h2>
          <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[10px] font-semibold text-cta">
            {step === 5 ? "Đầy đủ thông tin" : `Đang lập đơn (Bước ${step}/6)`}
          </span>
        </div>

        <dl className="mt-4 space-y-3">
          <Row label="DỊCH VỤ CHÍNH">
            {service ? (
              <span className="flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2">
                <Wrench className="size-4 text-cta" />
                <span>
                  {service.name}
                  <span className="block text-[10px] font-normal text-muted">Ngành: {service.group}</span>
                </span>
              </span>
            ) : (
              <span className="font-normal text-muted">Chưa chọn dịch vụ</span>
            )}
          </Row>

          {step >= 2 && step !== 1 && (
            <>
              <Row label="THIẾT BỊ">{device ? `${device.name} (${device.spec})` : "—"}</Row>
              <Row label="TRIỆU CHỨNG">{draft.symptoms.length ? draft.symptoms.join(", ") : "—"}</Row>
              <Row label="BẢO HÀNH">
                {device?.warrantyUntil ? `Còn hạn đến ${device.warrantyUntil}` : "Không có bảo hành hệ thống"}
              </Row>
            </>
          )}

          {step >= 3 && draft.customerName && (
            <>
              <Row label="KHÁCH HÀNG">
                {draft.customerName}
                {draft.customer && (
                  <span className="ml-2 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                    {draft.customer.tier}
                  </span>
                )}
                <span className="block font-normal text-muted">{draft.phone}</span>
              </Row>
              <Row label="ĐỊA CHỈ PHỤC VỤ">{draft.address || "—"}</Row>
              <Row label="THỜI GIAN HẸN">{describeTime(draft)}</Row>
            </>
          )}
        </dl>

        <div className="mt-4 rounded-xl bg-blue-50/70 p-4">
          <div className="text-[11px] font-semibold text-body">Phí kiểm tra tham khảo:</div>
          <div className="mt-1 text-2xl font-bold text-cta">{money(INSPECTION_FEE)}</div>
          <p className="mt-1 flex items-start gap-1.5 text-[11px] text-body">
            <CreditCard className="mt-0.5 size-3 shrink-0" /> Thanh toán trực tiếp cho thợ sau khi kiểm tra xong
          </p>
          <div className="mt-3 space-y-1.5 border-t border-blue-100 pt-3 text-[11px] text-body">
            <p className="flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Clock className="size-3" /> Thời gian KTV có mặt dự kiến</span>
              <b className="text-ink">30 - 45 phút</b>
            </p>
            <p className="flex items-center justify-between">
              <span className="flex items-center gap-1.5"><ShieldCheck className="size-3" /> Bảo hành hoàn tiền</span>
              <b className="text-emerald-600">Tiêu chuẩn HomeFix</b>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={!canContinue}
          className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-cta text-sm font-semibold text-white hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {NEXT_LABEL[step] ?? "Tiếp tục"} <ArrowRight className="size-4" />
        </button>

        <div className="mt-3 flex items-center justify-between gap-2">
          {step > 1 ? (
            <button
              type="button"
              onClick={onBack}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink hover:bg-field"
            >
              <ArrowLeft className="size-3.5" /> Quay lại 
            </button>
          ) : (
            <button type="button" onClick={onCancel} className="text-xs font-semibold text-muted hover:text-ink">
              Hủy yêu cầu
            </button>
          )}
          {step > 1 && (
            <button type="button" onClick={onCancel} className="text-xs font-semibold text-muted hover:text-ink">
              Hủy yêu cầu
            </button>
          )}
          <span className="hidden items-center gap-1 text-[10px] text-muted sm:flex">
            <kbd className="rounded border border-line bg-field px-1.5 py-0.5">Ctrl</kbd>+
            <kbd className="rounded border border-line bg-field px-1.5 py-0.5">Enter</kbd>
          </span>
        </div>
      </section>

      <p className="flex items-start gap-2 rounded-xl border border-line bg-white p-4 text-[11px] leading-relaxed text-body shadow-sm">
        <Info className="mt-0.5 size-3.5 shrink-0 text-cta" />
        <span>
          <b className="text-ink">Chính sách kiểm tra:</b> Phí kiểm tra tại nhà niêm yết {money(INSPECTION_FEE)}. KTV chỉ
          tiến hành sửa sau khi khách chốt báo giá chi tiết.
        </span>
      </p>
    </aside>
  )
}