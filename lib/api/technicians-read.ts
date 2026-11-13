// lib/api/technicians-read.ts
import "server-only"
import { backendGet } from "./backend-get"
import { toTechnician } from "@/lib/admin/technician-utils"
import { toTechnicianDetail } from "@/lib/admin/technician-detail-utils"
import type { ApiTechnician, Paginated } from "./types"

export type TechStatus = "active" | "locked"

export type TechnicianQuery = {
  page?: number
  pageSize?: number
  q?: string
  status?: TechStatus
}

// Giá trị status của KTV (đã thử trong Swagger: active và suspended đều trả 200)
const TECH_STATUS_PARAM: Record<TechStatus, string> = {
  active: "active",
  locked: "suspended",
}

// Dùng cho route xuất CSV: nhận "active" | "locked" từ URL, trả giá trị backend hiểu
export function techStatusParam(v: string | null) {
  return v === "active" || v === "locked" ? TECH_STATUS_PARAM[v] : null
}

// GET /admin/technicians?page=&page_size=&q=&status=
export async function getTechnicians({ page = 1, pageSize = 10, q, status }: TechnicianQuery = {}) {
  const qs = new URLSearchParams({ page: String(page), page_size: String(pageSize) })
  if (q) qs.set("q", q)
  if (status) qs.set("status", TECH_STATUS_PARAM[status])
  const res = await backendGet<Paginated<ApiTechnician>>(`/admin/technicians?${qs}`)
  // Map ở server: không gửi số điện thoại đầy đủ xuống trình duyệt
  return { ...res, items: res.items.map(toTechnician) }
}

// GET /admin/technicians/{technician_id}
export async function getTechnician(id: number) {
  return toTechnicianDetail(await backendGet<ApiTechnician>(`/admin/technicians/${id}`))
}

// Backend chưa có API thống kê: đếm bằng page_size=1 rồi đọc total_items (giống khách hàng)
export async function getTechnicianStats() {
  const count = async (status?: TechStatus) =>
    (await getTechnicians({ pageSize: 1, status })).total_items

  const results = await Promise.allSettled([count(), count("active"), count("locked")])
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error("[getTechnicianStats]", ["total", "active", "locked"][i], r.reason)
    }
  })
  const val = (r: PromiseSettledResult<number>) => (r.status === "fulfilled" ? r.value : null)
  return { total: val(results[0]), active: val(results[1]), locked: val(results[2]) }
}