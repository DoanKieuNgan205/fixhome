"use client"

import { Search, X } from "lucide-react"
import type { OperatorFiltersState } from "./operator-types"

type Props = {
  filters: OperatorFiltersState
  onChange: (key: keyof OperatorFiltersState, value: string) => void
}

export function OperatorFilters({ filters, onChange }: Props) {
  return (
    <div className="relative w-full lg:w-96">
      <Search className="pointer-events-none absolute left-3 top-3 size-4 text-blue-500" />
      <input
        aria-label="Tìm nhân viên theo tên hoặc mã nhân viên"
        value={filters.keyword}
        onChange={(event) => onChange("keyword", event.target.value)}
        placeholder="Tìm theo tên hoặc mã nhân viên…"
        className="h-10 w-full rounded-lg border border-blue-400 bg-white pl-9 pr-10 text-sm text-ink outline-none transition placeholder:text-slate-400 hover:border-blue-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
      />
      {filters.keyword && (
        <button
          onClick={() => onChange("keyword", "")}
          aria-label="Bỏ từ khóa tìm kiếm"
          className="absolute right-2 top-2 rounded p-1 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
