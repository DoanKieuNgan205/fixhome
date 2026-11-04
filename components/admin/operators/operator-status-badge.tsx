import { getStaffStatusLabel } from "@/lib/admin/operators"

const colors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  suspended: "bg-red-100 text-red-600",
}

export function OperatorStatusBadge({ status }: { status: string }) {
  const color = colors[status.toLowerCase()] ?? "bg-slate-100 text-slate-600"
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${color}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {getStaffStatusLabel(status)}
    </span>
  )
}
