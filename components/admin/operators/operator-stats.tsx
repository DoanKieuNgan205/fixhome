import type { ReactNode } from "react"
import { Activity, IdCard, LockKeyhole } from "lucide-react"

function StatCard({ title, value, unit, icon, iconClass }: {
  title: string; value?: number; unit: string; icon: ReactNode; iconClass: string
}) {
  return (
    <div className="flex min-h-32 flex-col rounded-xl border border-white bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="pt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          {title}
        </p>
        <span className={`rounded-lg p-2 ${iconClass}`}>
          {icon}
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-ink">
          {value ?? "—"}
        </span>
        <span className="text-xs text-slate-500">
          {unit}
        </span>
      </div>
    </div>
  )
}

export function OperatorStats({ total }: { total?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard
        title="Kết quả danh sách"
        value={total}
        unit="nhân sự"
        icon={<IdCard className="size-4" />}
        iconClass="bg-indigo-50 text-slate-500"
      />
      <StatCard
        title="Đang online"
        unit="trực ban"
        icon={<Activity className="size-4" />}
        iconClass="bg-emerald-100 text-emerald-600"
      />
      <StatCard
        title="Tài khoản tạm ngưng"
        unit="tài khoản"
        icon={<LockKeyhole className="size-4" />}
        iconClass="bg-red-100 text-red-600"
      />
    </div>
  )
}
