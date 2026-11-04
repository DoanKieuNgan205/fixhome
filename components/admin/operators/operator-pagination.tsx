"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

type Props = {
  total: number
  currentPage: number
  totalPages: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function OperatorPagination({ total, currentPage, totalPages, pageSize, onPageChange, onPageSizeChange }: Props) {
  const visiblePages = [...new Set([1, currentPage - 1, currentPage, currentPage + 1, totalPages])]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b)

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line/50 px-5 py-4 text-[11px] text-slate-500">
      <div className="flex flex-wrap items-center gap-4">
        <span>Hiển thị {total ? (currentPage - 1) * pageSize + 1 : 0} – {Math.min(currentPage * pageSize, total)} của {total} nhân viên</span>
        <label className="flex items-center gap-2">Số dòng:<select
          aria-label="Số dòng mỗi trang"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded-md bg-indigo-50 px-2 py-2 text-ink">
          {[8, 20, 50].map((size) => <option key={size} value={size}>{size} / trang</option>)}
        </select></label>
      </div>
      <nav aria-label="Phân trang danh sách nhân viên" className="flex items-center gap-1">
        <button
          aria-label="Trang trước"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="rounded-md p-2 hover:bg-field disabled:opacity-30">
          <ChevronLeft className="size-4" />
        </button>
        {visiblePages.map((page, index) => (
          <span key={page} className="inline-flex items-center gap-1">
            {index > 0 && page - visiblePages[index - 1] > 1 && <span className="px-1">…</span>}
            <button
              aria-label={`Trang ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
              onClick={() => onPageChange(page)}
              className={`size-8 rounded-lg ${page === currentPage ? "bg-cta font-semibold text-white" : "text-ink hover:bg-field"}`}
            >
              {page}
            </button>
          </span>
        ))}
        <button
          aria-label="Trang sau"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="rounded-md p-2 hover:bg-field disabled:opacity-30">
          <ChevronRight className="size-4" />
        </button>
      </nav>
    </div>
  )
}
