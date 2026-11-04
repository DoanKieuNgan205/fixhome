import type { StaffListParams } from "./types"

export function buildStaffQuery(params: StaffListParams): string {
  const query = new URLSearchParams({
    page: String(params.page),
    page_size: String(params.page_size),
  })
  if (params.q?.trim()) query.set("q", params.q.trim())
  if (params.status?.trim()) query.set("status", params.status.trim())
  return query.toString()
}
