"use client"

import { Check, Paperclip, Plus, ShieldCheck, X } from "lucide-react"
import {
  PRIORITIES, SYMPTOMS, customerDevices, services, type StepProps,
} from "@/lib/operator/mock-create-order"

export function StepIssue({ draft, patch, onChangeService }: StepProps & { onChangeService: () => void }) {
  const service = services.find((s) => s.id === draft.serviceId)
  const device = customerDevices.find((d) => d.id === draft.deviceId)

  const toggleSymptom = (s: string) =>
    patch({ symptoms: draft.symptoms.includes(s) ? draft.symptoms.filter((x) => x !== s) : [...draft.symptoms, s] })

  function addFiles(files: FileList | null) {
    if (!files) return
    // TODO: tải tệp lên (app/api/media/upload-intents), hiện chỉ lưu tên tệp
    const names = Array.from(files).map((f) => f.name)
    patch({ attachments: [...draft.attachments, ...names].slice(0, 6) })
  }

  return (
    <section className="space-y-5 rounded-xl border border-line bg-white p-5 shadow-sm">
      <div className="rounded-xl bg-blue-50/60 p-4">
        <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
          <span className="flex size-6 items-center justify-center rounded-md bg-cta text-xs text-white">2</span>
          Mô tả sự cố & Tình trạng thiết bị
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-body">
          Dịch vụ đã chọn:
          <span className="rounded-full bg-cta px-3 py-1 font-semibold text-white">{service?.name ?? "—"}</span>
          <button type="button" onClick={onChangeService} className="font-semibold text-cta hover:underline">
            Thay đổi dịch vụ
          </button>
        </div>
      </div>

      {device?.warrantyUntil && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-orange-50 p-4">
          <p className="flex items-center gap-2 text-xs font-semibold text-orange-800">
            <ShieldCheck className="size-4" />
            Thiết bị còn bảo hành hệ thống đến {device.warrantyUntil} (Đơn {device.warrantyOrder})
          </p>
          <button
            type="button"
            onClick={() => window.alert("Chuyển thành đơn bảo hành sẽ được nối API sau.")} // TODO
            className="rounded-lg bg-cta px-3 py-1.5 text-xs font-semibold text-white hover:brightness-95"
          >
            Chuyển thành đơn bảo hành
          </button>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-ink">Thiết bị liên quan (Đồng bộ từ hồ sơ khách hàng):</h3>
          <span className="text-[11px] text-muted">{customerDevices.length} thiết bị lưu trữ</span>
        </div>
        <div className="mt-2 grid gap-3 sm:grid-cols-3">
          {customerDevices.map((d) => {
            const active = draft.deviceId === d.id
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => patch({ deviceId: d.id })}
                aria-pressed={active}
                className={`relative rounded-xl border p-3 text-left ${
                  active ? "border-cta bg-orange-50/50 ring-1 ring-cta" : "border-line hover:border-slate-300"
                }`}
              >
                {active && (
                  <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-cta text-white">
                    <Check className="size-3" />
                  </span>
                )}
                <div className="pr-6 text-[13px] font-bold text-ink">{d.name}</div>
                <div className="text-[11px] text-muted">{d.spec}</div>
                <div className="mt-2 rounded-md bg-field px-2 py-1 text-[10px] text-muted">{d.note}</div>
              </button>
            )
          })}
          <button
            type="button"
            onClick={() => window.alert("Thêm thiết bị mới sẽ được nối API sau.")} // TODO
            className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 p-3 text-xs font-semibold text-cta hover:bg-orange-50/50"
          >
            <Plus className="size-4" /> Thêm thiết bị mới
            <span className="text-[10px] font-normal text-muted">Hãng, Model, Công suất</span>
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-ink">Triệu chứng phát sinh (Chọn một hoặc nhiều):</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {SYMPTOMS.map((s) => {
            const on = draft.symptoms.includes(s)
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleSymptom(s)}
                aria-pressed={on}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                  on ? "border-orange-200 bg-orange-50 text-orange-700" : "border-blue-100 bg-blue-50/60 text-blue-700 hover:bg-blue-50"
                }`}
              >
                {on && <Check className="size-3" />} {s}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="desc" className="text-xs font-semibold text-ink">
            Mô tả chi tiết triệu chứng của khách hàng <span className="text-red-500">*</span>
          </label>
          <span className="text-[11px] text-muted">{draft.description.length} / 500 ký tự</span>
        </div>
        <textarea
          id="desc"
          value={draft.description}
          onChange={(e) => patch({ description: e.target.value })}
          rows={4}
          maxLength={500}
          placeholder="Ví dụ: Máy lạnh bật 30 phút nhưng chỉ thổi gió thường, không có hơi lạnh..."
          className="mt-1.5 w-full resize-none rounded-lg border border-line p-3 text-sm text-ink outline-none focus:border-cta focus:ring-2 focus:ring-cta/15"
        />
        {draft.description.trim().length > 0 && draft.description.trim().length < 10 && (
          <p className="mt-1 text-[11px] text-red-500">Vui lòng mô tả ít nhất 10 ký tự</p>
        )}
      </div>

      <div>
        <h3 className="text-xs font-semibold text-ink">Hình ảnh / Video thực tế khách gửi qua Zalo</h3>
        <div className="mt-2 flex flex-wrap gap-3">
          {draft.attachments.map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="flex max-w-[200px] items-center gap-2 rounded-lg border border-line bg-field px-3 py-2 text-[11px] text-body"
            >
              <span className="truncate">{name}</span>
              <button
                type="button"
                aria-label={`Xóa ${name}`}
                onClick={() => patch({ attachments: draft.attachments.filter((_, j) => j !== i) })}
              >
                <X className="size-3.5 text-muted hover:text-ink" />
              </button>
            </span>
          ))}
          <label className="flex min-h-[64px] min-w-[220px] flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-blue-200 bg-blue-50/50 p-3 text-xs font-semibold text-blue-600 hover:bg-blue-50">
            <span className="flex items-center gap-1.5"><Paperclip className="size-3.5" /> Thêm tệp đính kèm (Zalo / SMS)</span>
            <span className="text-[10px] font-normal text-muted">Hỗ trợ JPG, PNG, MP4 (Tối đa 25MB)</span>
            <input type="file" multiple accept="image/*,video/mp4" className="hidden" onChange={(e) => addFiles(e.target.files)} />
          </label>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-ink">Mức độ ưu tiên xử lý:</h3>
        <div className="mt-2 inline-flex flex-wrap gap-2 rounded-xl bg-blue-50/60 p-2">
          {PRIORITIES.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => patch({ priority: p.key })}
              aria-pressed={draft.priority === p.key}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold ${
                draft.priority === p.key
                  ? p.key === "urgent" ? "bg-red-500 text-white" : "bg-cta text-white"
                  : "bg-white text-body hover:bg-field"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}