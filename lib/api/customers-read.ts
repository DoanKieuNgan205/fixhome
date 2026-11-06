import "server-only"
import { backendGet } from "./backend-get"
import { STATUS_PARAM, type UiStatus } from "@/lib/admin/customer-utils"
import type { ApiCustomer, Paginated } from "./types"

export type CustomerQuery = {
  page?: number
  pageSize?: number
  q?: string
  status?: UiStatus
}

export function getCustomers({ page = 1, pageSize = 20, q, status }: CustomerQuery = {}) {
  const qs = new URLSearchParams({ page: String(page), page_size: String(pageSize) })
  if (q) qs.set("q", q)
  if (status) qs.set("status", STATUS_PARAM[status])
  return backendGet<Paginated<ApiCustomer>>(`/admin/customers?${qs}`)
}

export const getCustomer = (id: number) => backendGet<ApiCustomer>(`/admin/customers/${id}`)

// Backend chưa có API thống kê: đếm bằng cách gọi danh sách với page_size=1 rồi đọc total_items
export async function getCustomerStats() {
  const count = async (status?: UiStatus) =>
    (await getCustomers({ pageSize: 1, status })).total_items

  const [total, active, locked] = await Promise.allSettled([
    count(),
    count("active"),
    count("locked"),
  ])
  const val = (r: PromiseSettledResult<number>) => (r.status === "fulfilled" ? r.value : null)
  return { total: val(total), active: val(active), locked: val(locked) }
}