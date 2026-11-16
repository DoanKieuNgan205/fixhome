"use client"

import { useMemo, useState } from "react"
import { Check, ChevronDown, Crosshair, Info, Navigation, Phone, Star } from "lucide-react"
import {
  customerDevices, describeTime, offlineTechnicians, services, technicians,
  type StepProps, type Technician,
} from "@/lib/operator/mock-create-order"

type Sort = "distance" | "rating"

function Initials({ name }: { name: string }) {
  const t = name.split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase()
  return (
    <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">
      {t}
    </span>
  )
}

function DispatchMap({ selected }: { selected?: Technician }) {
  // TODO: thay bằng bản đồ thật. Hiện chỉ là hình minh họa vị trí tương đối.
  const spots = [
    { id: "t1", x: 62, y: 22 }, { id: "t2", x: 30, y: 34 }, { id: "t3", x: 70, y: 66 },
    { id: "t4", x: 24, y: 70 }, { id: "t5", x: 82, y: 40 },
  ]
  return (
    <section className="rounded-xl border border-line bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-ink">Bản đồ điều phối thực tế</h2>
          <p className="text-[11px] text-muted">Khu vực phục vụ: Bán kính 5km từ vị trí khách</p>
        </div>
        <Crosshair className="size-4 text-muted" />
      </div>

      <div className="relative mt-3 aspect-square overflow-hidden rounded-xl bg-slate-100 [background-image:linear-gradient(#e2e8f0_1px,transparent_1px),linear-gradient(90deg,#e2e8f0_1px,transparent_1px)] [background-size:32px_32px]">
        <div className="absolute left-1/2 top-1/2 size-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-emerald-400 bg-emerald-50/50" />
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
          <span className="size-4 rounded-full border-2 border-white bg-cta shadow" />
          <span className="mt-1 rounded bg-cta px-1.5 py-0.5 text-[9px] font-semibold text-white">Khách hàng</span>
        </div>
        {spots.map((p) => {
          const on = selected?.id === p.id
          return (
            <span
              key={p.id}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow ${
                on ? "size-5 bg-emerald-700 ring-4 ring-emerald-300" : "size-3.5 bg-emerald-500"
              }`}
            />
          )
        })}
        <ul className="absolute left-2 top-2 space-y-1 rounded-lg bg-white/90 p-2 text-[10px] text-body shadow">
          <li className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-cta" /> Khách hàng (Điểm hẹn)</li>
          <li className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-emerald-500" /> Thợ sẵn sàng ({technicians.length})</li>
          <li className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-amber-400" /> Cần thương lượng ({offlineTechnicians.length})</li>
        </ul>
      </div>

      {selected && (
        <div className="mt-3 flex items-center gap-3 rounded-lg border border-line bg-field/60 p-3">
          <Navigation className="size-4 shrink-0 text-emerald-600" />
          <div className="text-xs">
            <b className="text-ink">{selected.name}</b> <span className="text-muted">(Đang chọn)</span>
            <div className="text-[11px] text-muted">
              {selected.distanceKm.toLocaleString("vi-VN")} km · {selected.etaMin} phút di chuyển
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export function StepTechnician({ draft, patch }: StepProps) {
  const [sort, setSort] = useState<Sort>("distance")
  const [offlineOpen, setOfflineOpen] = useState(true)

  const service = services.find((s) => s.id === draft.serviceId)
  const device = customerDevices.find((d) => d.id === draft.deviceId)
  const list = useMemo(
    () => [...technicians].sort((a, b) => (sort === "distance" ? a.distanceKm - b.distanceKm : b.rating - a.rating)),
    [sort],
  )
  const selected = technicians.find((t) => t.id === draft.technicianId)

  return (
    <div className="space-y-4">
      <section className="grid gap-4 rounded-xl border border-line bg-white p-4 shadow-sm md:grid-cols-4">
        <div>
          <div className="text-[10px] font-semibold tracking-wider text-muted">DỊCH VỤ</div>
          <div className="mt-1 text-sm font-bold text-ink">{service?.name ?? "—"}</div>
          <div className="text-[11px] text-muted">{device ? `${device.name} (${device.spec})` : ""}</div>
          <div className="text-[11px] text-orange-600">{draft.symptoms.slice(0, 2).join(", ")}</div>
        </div>
        <div>
          <div className="text-[10px] font-semibold tracking-wider text-muted">KHÁCH HÀNG</div>
          <div className="mt-1 text-sm font-bold text-ink">{draft.customerName}</div>
          <div className="text-[11px] text-muted">{draft.phone}</div>
        </div>
        <div>
          <div className="text-[10px] font-semibold tracking-wider text-muted">ĐỊA CHỈ PHỤC VỤ</div>
          <div className="mt-1 line-clamp-2 text-xs font-semibold text-ink">{draft.address}</div>
        </div>
        <div>
          <div className="text-[10px] font-semibold tracking-wider text-muted">KHUNG GIỜ HẸN</div>
          <div className="mt-1 text-sm font-bold text-orange-600">{describeTime(draft)}</div>
        </div>
      </section>

      <div className="grid items-start gap-4 xl:grid-cols-[1fr_420px]">
        <div className="space-y-4">
          <section className="rounded-xl border border-line bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
                Thợ phù hợp ({list.length} KTV)
                <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Đạt 5 tiêu chí lọc</span>
              </h2>
              <label className="flex items-center gap-2 text-[11px] text-muted">
                Sắp xếp:
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as Sort)}
                  className="rounded-md border border-line bg-white px-2 py-1 text-xs font-semibold text-ink outline-none"
                >
                  <option value="distance">Khoảng cách gần nhất</option>
                  <option value="rating">Đánh giá cao nhất</option>
                </select>
              </label>
            </div>

            <p className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
              <Check className="size-4" /> Hệ thống đã xác thực: đúng chuyên môn, đang bật nhận việc, trong bán kính phục vụ, không trùng lịch.
            </p>

            <div className="mt-3 space-y-3">
              {list.map((t, i) => {
                const on = draft.technicianId === t.id
                if (i >= 3) {
                  return (
                    <div key={t.id} className="flex items-center justify-between gap-3 rounded-lg border border-line px-4 py-2.5">
                      <div className="text-xs">
                        <b className="text-ink">{t.name}</b> <span className="text-muted">({t.code})</span>
                        <div className="text-[11px] text-muted">
                          {t.rating} <Star className="inline size-3 fill-amber-400 text-amber-400" /> · {t.distanceKm.toLocaleString("vi-VN")} km · {t.area}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => patch({ technicianId: t.id })}
                        className={`rounded-lg px-4 py-1.5 text-xs font-semibold ${
                          on ? "bg-cta text-white" : "border border-line bg-white text-ink hover:bg-field"
                        }`}
                      >
                        {on ? "Đã chọn" : "Chọn"}
                      </button>
                    </div>
                  )
                }
                return (
                  <div
                    key={t.id}
                    className={`rounded-xl border p-4 ${on ? "border-cta bg-orange-50/40 ring-1 ring-cta" : "border-line"}`}
                  >
                    <div className="flex items-start gap-3">
                      <Initials name={t.name} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-ink">{t.name}</span>
                          <span className="text-[11px] text-muted">{t.code}</span>
                          <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">{t.tier}</span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-body">
                          <span className="flex items-center gap-1 font-semibold text-orange-600">
                            <Star className="size-3.5 fill-amber-400 text-amber-400" /> {t.rating} ({t.reviews.toLocaleString("vi-VN")} đánh giá)
                          </span>
                          <span>Tỷ lệ hoàn thành: <b className="text-ink">{t.completion}%</b></span>
                        </div>
                        <div className="mt-1 text-[11px] text-muted">
                          {t.distanceKm.toLocaleString("vi-VN")} km · {t.etaMin} phút di chuyển
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {t.tags.map((tag) => (
                            <span key={tag} className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">{tag}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                          <i className="size-1.5 rounded-full bg-emerald-500" /> Đang nhận việc
                        </span>
                        <button
                          type="button"
                          onClick={() => patch({ technicianId: t.id })}
                          aria-pressed={on}
                          className={`flex items-center gap-1 rounded-lg px-4 py-2 text-xs font-semibold ${
                            on ? "bg-cta text-white" : "border border-line bg-white text-ink hover:bg-field"
                          }`}
                        >
                          {on && <Check className="size-3.5" />} {on ? "Đã chọn" : "Chọn"}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="rounded-xl border border-line bg-white p-4 shadow-sm">
            <button
              type="button"
              onClick={() => setOfflineOpen((v) => !v)}
              aria-expanded={offlineOpen}
              className="flex w-full items-center justify-between"
            >
              <span className="flex items-center gap-2 text-sm font-bold text-ink">
                Đang tắt nhận việc, cần thương lượng ({offlineTechnicians.length} KTV)
                <span className="rounded bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-700">Ngoại lệ</span>
              </span>
              <ChevronDown className={`size-4 text-muted transition ${offlineOpen ? "rotate-180" : ""}`} />
            </button>
            {offlineOpen && (
              <ul className="mt-3 space-y-2">
                {offlineTechnicians.map((o) => (
                  <li key={o.id} className="flex items-center justify-between gap-3 rounded-lg bg-field/70 px-4 py-3">
                    <div className="text-xs">
                      <b className="text-ink">{o.name}</b> <span className="text-muted">({o.code}) · Cách {o.distanceKm.toLocaleString("vi-VN")} km</span>
                      <div className="text-[11px] text-muted">Lý do: {o.reason}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => window.alert("Gọi trao đổi sẽ được nối tổng đài sau.")} // TODO
                      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-field"
                    >
                      <Phone className="size-3.5" /> Gọi trao đổi
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <p className="flex items-start gap-2 rounded-xl bg-blue-50 p-4 text-xs text-blue-800">
            <Info className="mt-0.5 size-4 shrink-0" />
            Nếu sau khi kiểm tra không có thợ phù hợp nhận đơn, hệ thống sẽ tự động chuyển yêu cầu vào Hàng đợi ngoại lệ sau 5 phút để điều phối viên tiếp tục xử lý.
          </p>
        </div>

        <DispatchMap selected={selected} />
      </div>
    </div>
  )
}