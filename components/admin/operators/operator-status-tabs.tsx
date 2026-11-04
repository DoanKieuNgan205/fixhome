"use client"

import type { OperatorTab } from "./operator-types"

const tabs: { value: OperatorTab; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "Active", label: "Hoạt động" },
  { value: "suspended", label: "Tạm ngưng" },
]

type Props = {
  tab: OperatorTab
  onChange: (tab: OperatorTab) => void
}

export function OperatorStatusTabs({ tab, onChange }: Props) {
  return (
    <div className="flex shrink-0 flex-wrap gap-1" role="group" aria-label="Trạng thái tài khoản">
      {tabs.map(({ value, label }) => (
        <button
          key={value}
          aria-pressed={tab === value}
          onClick={() => onChange(value)}
          className={`rounded-lg px-3 py-2 text-xs transition ${tab === value ? "bg-cta font-semibold text-white" : "text-slate-500 hover:bg-field"}`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
