"use client"

import { Info, Repeat } from "lucide-react"
import {
  customerDevices, describeTime, services, technicians, type CallResult, type StepProps,
} from "@/lib/operator/mock-create-order"

const REASONS = [
  "Khách yêu cầu KTV cũ từng phục vụ",
  "KTV có chuyên môn đặc thù",
  "Khách VIP chỉ định thợ",
  "Khác (ghi chú trong đơn)",
]

const CALL_RESULTS: { key: Exclude<CallResult, "">; label: string }[] = [
  { key: "agree", label: "Đồng ý" },
  { key: "decline", label: "Từ chối" },
  { key: "no_answer", label: "Không nghe máy" },
  { key: "callback", label: "Hẹn gọi lại" },
]

export function StepAssign({ draft, patch, onChangeTech }: StepProps & { onChangeTech: () => void }) {
  const service = services.find((s) => s.id === draft.serviceId)
  const device = customerDevices.find((d) => d.id === draft.deviceId)
  const chosen = technicians.find((t) => t.id === draft.technicianId) ?? technicians[0]
  const top3 = [...technicians].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 3)

  const auto = draft.assignMode === "auto"

  return (
    <div className="space-y-4">
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-white p-4 shadow-sm">
        <div>
          <div className="text-[10px] font-semibold tracking-wider text-orange-600">CHUYÊN MÔN {service?.group.toUpperCase()}</div>
          <div className="mt-1 text-sm font-bold text-ink">{service?.name}: {device?.name}</div>
          <div className="text-[11px] text-muted">{draft.symptoms.join(", ") || "Chưa chọn triệu chứng"}</div>
        </div>
        <div className="text-xs">
          <b className="text-ink">{draft.customerName}</b>
          <div className="text-muted">{draft.phone}</div>
        </div>
        <div className="rounded-lg bg-orange-50 px-3 py-2 text-xs">
          <div className="font-semibold text-orange-700">Hẹn: {describeTime(draft)}</div>
          <div className="text-[11px] text-orange-600">Yêu cầu thợ mang theo đồng hồ gas và thang nhôm</div>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-ink">Phương thức gán thợ & Điều phối tiếp nhận</h2>
            <p className="mt-0.5 text-xs text-muted">Chọn cơ chế điều phối phù hợp với tiến độ và mong muốn của khách hàng</p>
          </div>
          <span className="rounded bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
            {technicians.length} KTV sẵn sàng trong bán kính 4km
          </span>
        </div>

        {/* Tự động */}
        <label
          className={`mt-4 block cursor-pointer rounded-xl border p-4 ${
            auto ? "border-cta bg-orange-50/40 ring-1 ring-cta" : "border-line"
          }`}
        >
          <div className="flex items-start gap-3">
            <input
              type="radio"
              name="assign"
              checked={auto}
              onChange={() => patch({ assignMode: "auto" })}
              className="mt-1 size-4 accent-orange-500"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-ink">
                Tự động phân phối theo bán kính & hiệu suất
                <span className="rounded bg-orange-500 px-2 py-0.5 text-[10px] text-white">KHUYÊN NGHỊ</span>
              </div>
              <p className="mt-1 text-xs text-body">
                Hệ thống sẽ gửi thông báo nhận việc lần lượt cho các KTV phù hợp nhất. Mỗi KTV có 60 giây xác nhận nhận đơn trên ứng dụng.
              </p>

              {auto && (
                <>
                  <div className="mt-4 text-[10px] font-semibold tracking-wider text-muted">HÀNG ĐỢI KTV TIẾP NHẬN DỰ KIẾN</div>
                  <ol className="mt-2 space-y-2">
                    {top3.map((t, i) => (
                      <li key={t.id} className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 shadow-sm">
                        <span className="flex items-center gap-3 text-xs">
                          <span className="flex size-6 items-center justify-center rounded-full bg-orange-500 text-[11px] font-bold text-white">{i + 1}</span>
                          <span>
                            <b className="text-ink">{t.name}</b> <span className="text-muted">{t.code}</span>
                            <span className="block text-[11px] text-muted">{t.tier} · Cách {t.distanceKm.toLocaleString("vi-VN")} km</span>
                          </span>
                        </span>
                        <span className="text-right text-xs">
                          <b className="text-ink">ETA: {t.etaMin} phút</b>
                          <span className="block text-[11px] text-amber-600">★ {t.rating}</span>
                        </span>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-3 flex items-start gap-2 rounded-lg bg-orange-50 p-3 text-[11px] text-orange-800">
                    <Info className="mt-0.5 size-3.5 shrink-0" />
                    Nếu sau 3 lượt phát tín hiệu không có KTV nào nhận, đơn hàng sẽ tự động chuyển vào Hàng đợi ngoại lệ để điều phối viên can thiệp thủ công.
                  </p>
                </>
              )}
            </div>
          </div>
        </label>

        {/* Thủ công */}
        <label
          className={`mt-4 block cursor-pointer rounded-xl border p-4 ${
            !auto ? "border-cta bg-orange-50/40 ring-1 ring-cta" : "border-line bg-blue-50/30"
          }`}
        >
          <div className="flex items-start gap-3">
            <input
              type="radio"
              name="assign"
              checked={!auto}
              onChange={() => patch({ assignMode: "manual" })}
              className="mt-1 size-4 accent-orange-500"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-ink">
                Chọn thủ công (Gán chỉ định đích danh)
                <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] text-blue-700">Tùy biến điều phối</span>
              </div>
              <p className="mt-1 text-xs text-body">
                Chỉ định trực tiếp một KTV cụ thể. Phù hợp khi khách có yêu cầu riêng hoặc thiết bị đặc thù.
              </p>

              {!auto && (
                <div className="mt-4 space-y-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between gap-3 rounded-lg bg-white p-3 shadow-sm">
                    <div className="text-xs">
                      <b className="text-ink">{chosen.name}</b> <span className="text-muted">{chosen.code}</span>
                      <span className="ml-2 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">{chosen.tier}</span>
                      <div className="text-[11px] text-muted">
                        Khoảng cách: {chosen.distanceKm.toLocaleString("vi-VN")} km ({chosen.etaMin} phút di chuyển) · Đang nhận việc
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={onChangeTech}
                      className="flex shrink-0 items-center gap-1 text-xs font-semibold text-cta hover:underline"
                    >
                      <Repeat className="size-3.5" /> Đổi KTV khác
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label htmlFor="reason" className="mb-1.5 block text-xs font-semibold text-ink">
                        Lý do gán thủ công <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="reason"
                        value={draft.manualReason}
                        onChange={(e) => patch({ manualReason: e.target.value })}
                        className="h-10 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink outline-none focus:border-cta"
                      >
                        <option value="">Chọn lý do...</option>
                        {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <div className="mb-1.5 text-xs font-semibold text-ink">
                        Kết quả trao đổi qua điện thoại: <span className="text-red-500">*</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {CALL_RESULTS.map((c) => (
                          <button
                            key={c.key}
                            type="button"
                            onClick={() => patch({ callResult: c.key })}
                            aria-pressed={draft.callResult === c.key}
                            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                              draft.callResult === c.key
                                ? c.key === "agree" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-cta bg-orange-50 text-cta"
                                : "border-line bg-white text-body hover:bg-field"
                            }`}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <label className="flex items-start gap-2 rounded-lg bg-orange-50 p-3 text-xs text-orange-900">
                    <input
                      type="checkbox"
                      checked={draft.pinTechnician}
                      onChange={(e) => patch({ pinTechnician: e.target.checked })}
                      className="mt-0.5 size-4 accent-orange-500"
                    />
                    <span>
                      Ghim KTV này cho đơn hàng <span className="text-orange-700">(Không tự động điều phối lại nếu KTV từ chối)</span>
                    </span>
                  </label>
                  <p className="text-[11px] text-muted">Thời gian phản hồi: 3 phút</p>
                </div>
              )}
            </div>
          </div>
        </label>
      </section>
    </div>
  )
}