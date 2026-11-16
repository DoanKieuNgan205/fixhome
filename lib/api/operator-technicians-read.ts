import "server-only"
import { backendGet } from "./backend-get"
import {
  PROFILE_STATUS, SPECIALTY_STATUS, toApplicationRow, toSpecialtyRow, type ReviewTab,
} from "@/lib/admin/operator-application-utils"
import { toTechnicianDetail } from "@/lib/admin/technician-detail-utils"
import type { ApiTechnician, ApiTechnicianSpecialty, Paginated } from "./types"

export type ApplicationQuery = {
  page?: number
  pageSize?: number
  status?: string // giá trị verification_status của backend
  dateFrom?: string // yyyy-MM-dd
  dateTo?: string // yyyy-MM-dd
}

// GET /operator/technician-applications (backend bỏ qua hồ sơ INCOMPLETE)
export async function getTechnicianApplications(
  { page = 1, pageSize = 10, status, dateFrom, dateTo }: ApplicationQuery = {},
) {
  const qs = new URLSearchParams({ page: String(page), page_size: String(pageSize) })
  if (status) qs.set("status", status)
  if (dateFrom) qs.set("date_from", dateFrom)
  if (dateTo) qs.set("date_to", dateTo)
  const res = await backendGet<Paginated<ApiTechnician>>(`/operator/technician-applications?${qs}`)
  return { ...res, items: res.items.map(toApplicationRow) }
}

// GET /operator/technician-applications/{technician_id}
export async function getTechnicianApplication(id: number) {
  return toTechnicianDetail(
    await backendGet<ApiTechnician>(`/operator/technician-applications/${id}`),
  )
}

// Đếm số hồ sơ theo trạng thái (page_size=1 rồi đọc total_items)
export async function getApplicationCounts() {
  const keys: ReviewTab[] = ["all", "pending", "verified", "rejected"]
  const results = await Promise.allSettled(
    keys.map(async (k) =>
      (await getTechnicianApplications({
        pageSize: 1,
        status: k === "all" ? undefined : PROFILE_STATUS[k],
      })).total_items,
    ),
  )
  const counts = {} as Record<ReviewTab, number | null>
  results.forEach((r, i) => {
    if (r.status === "rejected") console.error("[getApplicationCounts]", keys[i], r.reason)
    counts[keys[i]] = r.status === "fulfilled" ? r.value : null
  })
  return counts
}

// GET /operator/technician-specialties (trả mảng, không phân trang) nên lọc và chia trang tại đây.
// Danh sách chuyên môn không có tên KTV, nên lấy tên từ hồ sơ (chỉ cho các dòng của trang hiện tại).
export async function getSpecialtyReview({
  status = "all", page = 1, pageSize = 10, withNames = true,
}: { status?: ReviewTab; page?: number; pageSize?: number; withNames?: boolean }) {
  const all = await backendGet<ApiTechnicianSpecialty[]>("/operator/technician-specialties")

  const is = (s: ApiTechnicianSpecialty, k: Exclude<ReviewTab, "all">) =>
    s.status.toUpperCase() === SPECIALTY_STATUS[k]
  const counts: Record<ReviewTab, number> = {
    all: all.length,
    pending: all.filter((s) => is(s, "pending")).length,
    verified: all.filter((s) => is(s, "verified")).length,
    rejected: all.filter((s) => is(s, "rejected")).length,
  }

  const filtered = (status === "all" ? all : all.filter((s) => is(s, status))).sort((a, b) =>
    (b.created_at ?? "").localeCompare(a.created_at ?? ""),
  )
  const total = filtered.length
  const slice = filtered.slice((page - 1) * pageSize, page * pageSize)

  const names = new Map<number, string>()
  if (withNames) {
    const ids = [...new Set(slice.map((s) => s.technician_id))]
    const res = await Promise.allSettled(
      ids.map((id) => backendGet<ApiTechnician>(`/operator/technician-applications/${id}`)),
    )
    res.forEach((r, i) => {
      if (r.status === "fulfilled") names.set(ids[i], r.value.full_name)
    })
  }

  return {
    items: slice.map((s) => toSpecialtyRow(s, names.get(s.technician_id) ?? null)),
    total_items: total,
    total_pages: Math.max(1, Math.ceil(total / pageSize)),
    counts,
  }
}