"use client"

import { useMemo, useState } from "react"
import { Check, History, Search, Send, ShieldCheck, Wrench } from "lucide-react"
import {
  INSPECTION_FEE, SERVICE_GROUPS, money, services, type ServiceGroup, type StepProps,
} from "@/lib/operator/mock-create-order"

const TONES = [
  "bg-blue-50 text-blue-600", "bg-orange-50 text-orange-600", "bg-cyan-50 text-cyan-600", "bg-indigo-50 text-indigo-600",
  "bg-emerald-50 text-emerald-600", "bg-purple-50 text-purple-600", "bg-amber-50 text-amber-600", "bg-green-50 text-green-600",
]

export function StepService({ draft, patch }: StepProps) {
  const selected = services.find((s) => s.id === draft.serviceId)
  const [group, setGroup] = useState<ServiceGroup>(selected?.group ?? "Điện lạnh")
  const [q, setQ] = useState("")

  const list = useMemo(() => {
    const k = q.trim().toLowerCase()
    return services.filter((s) => (k ? `${s.name} ${s.desc}`.toLowerCase().includes(k) : s.group === group))
  }, [group, q])

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-ink">Danh mục dịch vụ khả dụng</h2>
            <p className="mt-0.5 text-xs text-muted">Chọn 1 dịch vụ chính phù hợp với yêu cầu thực tế của khách hàng</p>
          </div>
          <div className="flex h-10 w-full max-w-[260px] items-center gap-2 rounded-lg bg-field px-3 focus-within:ring-2 focus-within:ring-cta/15">
            <Search className="size-4 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm dịch vụ..."
              className="h-full w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2" role="tablist">
          {SERVICE_GROUPS.map((g) => {
            const active = !q && group === g
            return (
              <button
                key={g}
                role="tab"
                aria-selected={active}
                onClick={() => { setGroup(g); setQ("") }}
                className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold ${
                  active ? "bg-slate-900 text-white" : "bg-field text-body hover:bg-slate-200"
                }`}
              >
                {g}
                <span className={`rounded-full px-1.5 text-[10px] ${active ? "bg-orange-500 text-white" : "bg-white text-muted"}`}>
                  {services.filter((s) => s.group === g).length}
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {list.length === 0 && <p className="col-span-full py-6 text-center text-sm text-muted">Không tìm thấy dịch vụ phù hợp</p>}
          {list.map((s, i) => {
            const active = draft.serviceId === s.id
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => patch({ serviceId: s.id })}
                aria-pressed={active}
                className={`relative rounded-xl border p-4 text-left transition ${
                  active ? "border-cta bg-orange-50/50 ring-1 ring-cta" : "border-line bg-white hover:border-slate-300"
                }`}
              >
                {active && (
                  <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-cta text-white">
                    <Check className="size-3" />
                  </span>
                )}
                <span className={`flex size-9 items-center justify-center rounded-lg ${TONES[i % TONES.length]}`}>
                  <Wrench className="size-4" />
                </span>
                <div className="mt-3 text-[13px] font-bold text-ink">{s.name}</div>
                <p className={`mt-1 line-clamp-2 text-[11px] ${active ? "text-cta" : "text-muted"}`}>{s.desc}</p>
                <p className="mt-3 rounded-md bg-field px-2 py-1.5 text-[10px] text-muted">Giá do KTV báo sau khi kiểm tra</p>
              </button>
            )
          })}
        </div>

        <p className="mt-4 flex items-start gap-2 rounded-lg bg-field/70 p-3 text-xs text-body">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-blue-600" />
          <span>
            <b className="text-ink">Chính sách kiểm tra:</b> Phí kiểm tra tại nhà niêm yết {money(INSPECTION_FEE)}. KTV chỉ
            tiến hành sửa sau khi khách chốt báo giá chi tiết.
          </span>
        </p>
      </section>

      {/* TODO: thay số liệu mẫu bằng dữ liệu thật khi có API */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: History, label: "Đơn gần nhất của khách", value: "Vệ sinh máy lạnh (12/03/2024)", tone: "text-blue-600 bg-blue-50" },
          { icon: ShieldCheck, label: "Bảo hành hiện tại", value: "Còn hiệu lực 45 ngày", tone: "text-emerald-600 bg-emerald-50" },
          { icon: Send, label: "Mật độ KTV sẵn sàng", value: "14 thợ trong bán kính 5km", tone: "text-amber-600 bg-amber-50" },
        ].map((c) => (
          <div key={c.label} className="flex items-center gap-3 rounded-xl border border-line bg-white p-4 shadow-sm">
            <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${c.tone}`}>
              <c.icon className="size-4" />
            </span>
            <div>
              <div className="text-[11px] text-muted">{c.label}</div>
              <div className="text-xs font-bold text-ink">{c.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}