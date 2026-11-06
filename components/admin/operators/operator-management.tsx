"use client"

import { Plus, X } from "lucide-react"
import { OperatorDialog } from "./operator-dialog"
import { OperatorFilters } from "./operator-filters"
import { OperatorPagination } from "./operator-pagination"
import { OperatorStats } from "./operator-stats"
import { OperatorStatusTabs } from "./operator-status-tabs"
import { primaryClass } from "./operator-styles"
import { OperatorTable } from "./operator-table"
import type { OperatorManagementOptions } from "./operator-types"
import { useOperatorManagement } from "./use-operator-management"

export function OperatorManagement(props: OperatorManagementOptions) {
  const model = useOperatorManagement(props)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-ink">Nhân viên vận hành</h1>
          </div>
        </div>
        <button className={primaryClass} onClick={() => model.setAction({ type: "create" })}>
          <Plus className="size-4" />
          Thêm nhân viên mới
        </button>
      </div>

      <OperatorStats total={model.total} isLoading={model.isLoading} />

      {model.notice && (
        <div role="status" className="flex items-center justify-between gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          {model.notice}
          <button
            aria-label="Đóng thông báo"
            onClick={() => model.setNotice("")}
            className="rounded p-1 hover:bg-blue-100">
            <X className="size-4" />
          </button>
        </div>
      )}

      <section aria-label="Danh sách nhân viên vận hành" className="overflow-hidden rounded-xl border border-line/60 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line/60 px-5 py-4">
          <OperatorStatusTabs tab={model.tab} onChange={model.changeTab} />
          <OperatorFilters filters={model.filters} onChange={model.changeFilter} />
        </div>
        <OperatorTable
          rows={model.rows}
          onAction={model.setAction}
          onClearFilters={model.resetFilters}
          isLoading={model.isLoading}
          error={model.error}
          onRetry={model.retry}
        />
        {model.total !== undefined && <OperatorPagination
          total={model.total}
          currentPage={model.currentPage}
          totalPages={model.totalPages}
          pageSize={model.pageSize}
          onPageChange={model.setPage}
          onPageSizeChange={model.changePageSize}
        />}
      </section>

      <OperatorDialog
        action={model.action}
        operators={model.rows}
        onActionChange={model.setAction}
        onSave={model.saveOperator}
        onConfirm={model.confirmAction}
        onCreated={model.handleCreated}
      />
    </div>
  )
}
