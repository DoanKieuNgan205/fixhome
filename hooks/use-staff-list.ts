"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getStaffList, StaffApiError } from "@/lib/api/staff/client"
import { buildStaffQuery } from "@/lib/api/staff/query"
import type { StaffListParams, StaffListResponse } from "@/lib/api/staff/types"

type RequestState = {
  key: string
  data?: StaffListResponse
  error?: string
}

export function useStaffList({ page, page_size, q, status }: StaffListParams) {
  const router = useRouter()
  const [request, setRequest] = useState<RequestState | null>(null)
  const [revision, setRevision] = useState(0)
  const query = buildStaffQuery({ page, page_size, q, status })
  const key = `${query}:${revision}`

  useEffect(() => {
    const controller = new AbortController()
    // Debounce tìm kiếm và hủy request cũ khi người dùng đổi điều kiện.
    const timer = setTimeout(async () => {
      try {
        const data = await getStaffList({ page, page_size, q, status }, controller.signal)
        if (controller.signal.aborted) return
        setRequest({ key, data })
      } catch (error) {
        if (controller.signal.aborted) return
        if (error instanceof StaffApiError && error.status === 401) router.replace("/login")
        setRequest({ key, error: error instanceof Error ? error.message : "Không thể kết nối đến máy chủ." })
      }
    }, q ? 300 : 0)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [page, page_size, q, status, key, router])

  const current = request?.key === key ? request : null
  return {
    data: current?.data,
    error: current?.error,
    isLoading: current === null,
    retry: () => setRevision((value) => value + 1),
  }
}
