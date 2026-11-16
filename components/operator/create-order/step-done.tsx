import Link from "next/link"
import { CheckCircle2, Circle, Loader2 } from "lucide-react"
import {
  customerDevices, describeTime, money, INSPECTION_FEE, services, technicians, type Draft,
} from "@/lib/operator/mock-create-order"

// TODO: Bước 6 "Theo dõi" chưa có thiết kế. Đây là màn hình xác nhận tạm, nối trạng thái đơn thật khi có API.
export function StepDone({ draft, orderCode, onNew }: { draft: Draft; orderCode: string; onNew: () => void }) {
  const service = services.find((s) => s.id === draft.serviceId)
  const device = customerDevices.find((d) => d.id === draft.deviceId)
  const tech = technicians.find((t) => t.id === draft.technicianId)
  const auto = draft.assignMode === "auto"

  const timeline = [
    { label: "Đã tạo đơn", note: "Vừa xong", state: "done" as const },
    {
      label: auto ? "Đang phát tín hiệu tới KTV phù hợp" : `Chờ ${tech?.name ?? "KTV"} xác nhận`,
      note: "Mỗi KTV có 60 giây để nhận đơn",
      state: "active" as const,
    },
    { label: "KTV đang di chuyển", note: "", state: "todo" as const },
    { label: "Đang kiểm tra & sửa chữa", note: "", state: "todo" as const },
    { label: "Hoàn tất & thanh toán", note: "", state: "todo" as const },
  ]

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <section className="rounded-xl border border-line bg-white p-6 text-center shadow-sm">
        <CheckCircle2 className="mx-auto size-12 text-emerald-500" />
        <h2 className="mt-3 text-xl font-bold text-ink">Đã tạo đơn thành công</h2>
        <p className="mt-1 text-sm text-body">
          Mã đơn <b className="text-cta">{orderCode}</b> · {auto ? "Tự động phân phối" : `Gán thủ công cho ${tech?.name}`}
        </p>

        <dl className="mt-5 grid gap-3 text-left text-xs sm:grid-cols-2">
          {[
            ["Dịch vụ", service?.name],
            ["Thiết bị", device ? `${device.name} (${device.spec})` : "—"],
            ["Khách hàng", `${draft.customerName} · ${draft.phone}`],
            ["Địa chỉ", draft.address],
            ["Thời gian hẹn", describeTime(draft)],
            ["Phí kiểm tra", money(INSPECTION_FEE)],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg bg-field/60 px-3 py-2.5">
              <dt className="text-[10px] font-semibold tracking-wider text-muted">{k}</dt>
              <dd className="mt-0.5 font-semibold text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-ink">Theo dõi tiến trình</h3>
        <ol className="mt-4 space-y-4">
          {timeline.map((t) => (
            <li key={t.label} className="flex items-start gap-3">
              {t.state === "done" ? (
                <CheckCircle2 className="mt-0.5 size-5 text-emerald-500" />
              ) : t.state === "active" ? (
                <Loader2 className="mt-0.5 size-5 animate-spin text-cta" />
              ) : (
                <Circle className="mt-0.5 size-5 text-slate-300" />
              )}
              <div>
                <div className={`text-sm font-semibold ${t.state === "todo" ? "text-muted" : "text-ink"}`}>{t.label}</div>
                {t.note && <div className="text-[11px] text-muted">{t.note}</div>}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="flex justify-center gap-3">
        <button
          type="button"
          onClick={onNew}
          className="h-10 rounded-lg bg-cta px-5 text-sm font-semibold text-white hover:brightness-95"
        >
          Tạo đơn mới
        </button>
        <Link
          href="/operator"
          className="flex h-10 items-center rounded-lg border border-line bg-white px-5 text-sm font-semibold text-ink hover:bg-field"
        >
          Về tổng quan
        </Link>
      </div>
    </div>
  )
}