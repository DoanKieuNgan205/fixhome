type Json = Record<string, unknown>
type Params = Record<string, string | number | undefined>

async function call<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    cache: "no-store",
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error ?? "SERVER")
  return data as T
}

const qs = (p: Params = {}) => {
  const s = new URLSearchParams()
  Object.entries(p).forEach(([k, v]) => v !== undefined && v !== "" && s.set(k, String(v)))
  const out = s.toString()
  return out ? `?${out}` : ""
}

const base = "/api/operator/repair-orders"

// GET /operator/repair-orders/{orderId}/manual-technicians
export const searchManualTechnicians = (orderId: number, p?: Params) =>
  call(`${base}/${orderId}/manual-technicians${qs(p)}`)

// POST /operator/repair-orders/{orderId}/manual-invitations
export const sendManualInvitation = (orderId: number, body: Json) =>
  call(`${base}/${orderId}/manual-invitations`, { method: "POST", body: JSON.stringify(body) })

// GET /operator/repair-orders/{id}/quotes (dùng để biết thợ đã phản hồi lời mời chưa)
export const getOrderQuotes = (id: number) => call(`${base}/${id}/quotes`)

const MESSAGES: Record<string, string> = {
  UNAUTHORIZED: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.",
  FORBIDDEN: "Bạn không có quyền thực hiện thao tác này.",
  VALIDATION: "Dữ liệu không hợp lệ, vui lòng kiểm tra lại.",
  CONFLICT: "Đơn đã thay đổi trạng thái, vui lòng tải lại.",
  NOT_FOUND: "Không tìm thấy dữ liệu.",
  NETWORK: "Không kết nối được máy chủ.",
}

export const repairOrderErrorMessage = (e: unknown) =>
  MESSAGES[e instanceof Error ? e.message : ""] ?? "Không thực hiện được, vui lòng thử lại."