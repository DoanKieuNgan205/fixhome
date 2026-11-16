import type { ReviewDecision } from "./types"

async function patch(url: string, decision: ReviewDecision, reason?: string) {
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ decision, reason }),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error ?? "SERVER")
  return data
}

// Duyệt hoặc từ chối hồ sơ KTV
export const verifyTechnician = (id: number, decision: ReviewDecision, reason?: string) =>
  patch(`/api/operator/technicians/${id}/verification`, decision, reason)

// Duyệt hoặc từ chối một chuyên môn
export const reviewSpecialty = (id: number, decision: ReviewDecision, reason?: string) =>
  patch(`/api/operator/technician-specialties/${id}/review`, decision, reason)

const MESSAGES: Record<string, string> = {
  UNAUTHORIZED: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.",
  FORBIDDEN: "Bạn không có quyền thực hiện thao tác này.",
  VALIDATION: "Dữ liệu không hợp lệ. Từ chối cần nhập lý do.",
  CONFLICT: "Hồ sơ đã được xử lý hoặc không còn ở trạng thái chờ duyệt.",
  NOT_FOUND: "Không tìm thấy hồ sơ.",
  NETWORK: "Không kết nối được máy chủ.",
}

export function reviewErrorMessage(e: unknown) {
  const code = e instanceof Error ? e.message : ""
  return MESSAGES[code] ?? "Không thực hiện được, vui lòng thử lại."
}