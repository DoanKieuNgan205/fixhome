"use client"

import { useState } from "react"
import { useStaffList } from "@/hooks/use-staff-list"
import { toOperator } from "@/lib/admin/operators"
import type { Staff } from "@/lib/api/staff/types"
import type { OperatorAction, OperatorTab, OperatorManagementOptions } from "./operator-types"

export function useOperatorManagement({ initialMode, initialOperator }: OperatorManagementOptions) {
  const [tab, setTab] = useState<OperatorTab>("all")
  const [keyword, setKeyword] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [notice, setNotice] = useState("")
  const [action, setAction] = useState<OperatorAction | null>(() => {
    if (initialMode === "create") return { type: "create" }
    if (initialMode === "edit" && initialOperator) return { type: "edit", operator: initialOperator }
    return null
  })
  const list = useStaffList({
    page,
    page_size: pageSize,
    q: keyword.trim() || undefined,
    status: tab === "all" ? undefined : tab,
  })
  const rows = list.data?.items.map(toOperator) ?? []

  function resetFilters() {
    setKeyword("")
    setTab("all")
    setPage(1)
  }

  function changeFilter(_key: "keyword", value: string) {
    setKeyword(value)
    setPage(1)
  }

  function changeTab(value: OperatorTab) {
    setTab(value)
    setPage(1)
  }

  function changePageSize(value: number) {
    setPageSize(value)
    setPage(1)
  }

  function saveOperator() {
    setNotice("Chưa tích hợp API sửa nhân viên. Thông tin chưa được lưu lên hệ thống.")
    setAction(null)
  }

  function handleCreated(staff: Staff) {
    setNotice(`Đã tạo nhân viên ${staff.full_name} (${staff.employee_code}) và tài khoản đăng nhập.`)
    setAction(null)
    resetFilters()
    list.retry()
  }

  function confirmAction() {
    setNotice("Chưa có API cập nhật tài khoản. Thao tác chưa được gửi lên hệ thống.")
    setAction(null)
  }

  return {
    rows,
    total: list.data?.total_items,
    currentPage: Math.max(1, list.data?.page ?? page),
    totalPages: Math.max(1, list.data?.total_pages ?? 1),
    pageSize: list.data?.page_size || pageSize,
    isLoading: list.isLoading,
    error: list.error,
    retry: list.retry,
    tab, changeTab,
    filters: { keyword }, changeFilter, resetFilters,
    setPage, changePageSize,
    action, setAction, notice, setNotice, saveOperator, confirmAction, handleCreated,
  }
}
