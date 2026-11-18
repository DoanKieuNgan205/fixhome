// lib/admin/orders-read.ts
// Lớp đọc dữ liệu đơn hàng cho admin. Hiện dùng dữ liệu mẫu.
// TODO: khi có API, thay thân hàm bằng backendGet("/admin/repair-orders", ...) và map sang OrderDetail.
import { MOCK_ORDERS, TODAY_COUNT } from "./mock-orders"
import type { OrderDetail, OrderList, OrderStatus } from "./order-types"

export type OrderQuery = {
  q?: string
  status?: OrderStatus
  area?: string
  from?: string // yyyy-mm-dd
  to?: string
  page: number
  pageSize: number
}

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

export function filterOrders(query: Omit<OrderQuery, "page" | "pageSize">): OrderDetail[] {
  const q = query.q ? norm(query.q) : ""
  return MOCK_ORDERS.filter((o) => {
    if (query.status && o.status !== query.status) return false
    if (query.area && o.area !== query.area) return false
    const day = o.scheduledAt.slice(0, 10)
    if (query.from && day < query.from) return false
    if (query.to && day > query.to) return false
    if (q) {
      const hay = norm(`${o.code} ${o.customer.name} ${o.customer.phone} ${o.service} ${o.technician?.name ?? ""}`)
      if (!hay.includes(q)) return false
    }
    return true
  })
}

export async function getOrders(query: OrderQuery): Promise<OrderList> {
  const all = filterOrders(query)
  const start = (query.page - 1) * query.pageSize
  return {
    items: all.slice(start, start + query.pageSize),
    total: all.length,
    totalPages: Math.max(1, Math.ceil(all.length / query.pageSize)),
    todayCount: TODAY_COUNT,
  }
}

export async function getOrder(code: string): Promise<OrderDetail> {
  const o = MOCK_ORDERS.find((x) => x.code === code)
  if (!o) throw new Error("NOT_FOUND")
  return o
}