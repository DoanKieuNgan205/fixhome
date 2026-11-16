import type { ReviewDecision } from "./types"

export type ReviewBody = { decision: ReviewDecision; reason?: string }

// Kiểm tra body trước khi gửi backend. Từ chối bắt buộc có lý do.
export function parseReviewBody(raw: unknown): ReviewBody | null {
  if (!raw || typeof raw !== "object") return null
  const { decision, reason } = raw as Record<string, unknown>
  if (decision !== "APPROVE" && decision !== "REJECT") return null
  const r = typeof reason === "string" ? reason.trim() : ""
  if (decision === "REJECT" && !r) return null
  return r ? { decision, reason: r } : { decision }
}