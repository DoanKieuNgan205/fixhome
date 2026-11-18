// lib/admin/order-types.ts
export const AREAS = ["Cầu Giấy", "Ba Đình", "Nam Từ Liêm", "Đống Đa"]

export type OrderStatus = "new" | "in_progress" | "completed" | "cancelled"
export type CashState = "unpaid" | "collected" | "handed_over"

export const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "Mới",
  in_progress: "Đang thực hiện",
  completed: "Đã hoàn thành",
  cancelled: "Đã hủy",
}

export const STATUS_TONE: Record<OrderStatus, string> = {
  new: "bg-blue-50 text-blue-700",
  in_progress: "bg-amber-50 text-amber-700",
  completed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-600",
}

export const CASH_LABEL: Record<CashState, string> = {
  unpaid: "Chưa thu",
  collected: "Đã thu",
  handed_over: "Đã nộp két",
}

export const CASH_TONE: Record<CashState, string> = {
  unpaid: "bg-slate-100 text-slate-600",
  collected: "bg-amber-50 text-amber-700",
  handed_over: "bg-emerald-50 text-emerald-700",
}

// 7 bước của một đơn sửa chữa
export const STEPS = [
  "Mới",
  "Đã phân công",
  "KTV đang đến",
  "Đang kiểm tra",
  "Xác nhận giá",
  "Đang sửa",
  "Hoàn thành",
] as const

export type OrderLine = { name: string; note?: string; badge?: string; amount: number }
export type OrderPhoto = { label: string; caption: string; kind: "before" | "after" | "empty" }
export type OrderEvent = { at: string; title: string; by: string }

export type OrderTechnician = {
  id: string
  name: string
  phone: string
  rating: number
  completedOrders: number
  hub: string
  availability: string
}

export type OrderDetail = {
  code: string
  customer: { name: string; phone: string; address: string; tier: string }
  issue: string
  service: string
  area: string
  scheduledAt: string // ISO
  technician: OrderTechnician | null
  status: OrderStatus
  step: number // 1..7
  stepTimes: string[] // nhãn thời gian mỗi bước đã qua
  lines: OrderLine[]
  quoteFrom: number
  quoteTo: number
  finalPrice: number | null
  cash: CashState
  reconcile: { collected: number; techShare: number; handOver: number; deadline: string; hubName: string } | null
  photos: OrderPhoto[]
  history: OrderEvent[]
}

export type OrderList = { items: OrderDetail[]; total: number; totalPages: number; todayCount: number }

export const money = (n: number | null | undefined) =>
  n == null ? "Đang cập nhật" : `${n.toLocaleString("vi-VN")} đ`

const TZ = "Asia/Ho_Chi_Minh"
export const hm = (iso: string) =>
  new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ })
export const dmy = (iso: string) =>
  new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: TZ })

export function initials(name: string) {
  const p = name.trim().split(/\s+/)
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase()
}