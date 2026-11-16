import { Check } from "lucide-react"

export const STEPS = ["Chọn dịch vụ", "Mô tả sự cố", "Khách hàng", "Tìm kiếm thợ", "Gán thợ", "Theo dõi"]

export function OrderStepper({ step }: { step: number }) {
  return (
    <ol className="grid grid-cols-6 rounded-xl border border-line bg-white px-4 py-5 shadow-sm">
      {STEPS.map((label, i) => {
        const n = i + 1
        const done = n < step
        const current = n === step
        return (
          <li
            key={label}
            aria-current={current ? "step" : undefined}
            className="relative flex flex-col items-center gap-2 text-center"
          >
            {i < STEPS.length - 1 && (
              <span aria-hidden className={`absolute left-1/2 top-4 h-0.5 w-full ${done ? "bg-emerald-500" : "bg-line"}`} />
            )}
            <span
              className={`relative z-10 flex size-8 items-center justify-center rounded-full text-xs font-bold ${
                done
                  ? "bg-emerald-600 text-white"
                  : current
                    ? "bg-cta text-white shadow-[0_0_0_4px_rgba(249,115,22,0.15)]"
                    : "border border-line bg-field text-muted"
              }`}
            >
              {done ? <Check className="size-4" /> : n}
            </span>
            <span
              className={`text-[11px] font-semibold ${
                done ? "text-emerald-600" : current ? "text-cta" : "text-muted"
              }`}
            >
              {n}. {label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}