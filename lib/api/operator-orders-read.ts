import "server-only"
import { backendGet } from "./backend-get"
import {
  isObj, listOf, pageInfo, toQueueOrder, type QueueOrder,
} from "@/lib/operator/repair-order-mappers"

// GET /operator/repair-orders/manual-assignment (page bắt đầu từ 1)
export async function getManualQueue(page = 1, pageSize = 10) {
  const raw = await backendGet<unknown>(
    `/operator/repair-orders/manual-assignment?page=${page}&page_size=${pageSize}`,
  )
  const items = listOf(raw).map(toQueueOrder).filter((x): x is QueueOrder => x !== null)
  return { items, ...pageInfo(raw, items.length) }
}

// GET /operator/repair-orders/{id}
export async function getDispatchOrder(id: number) {
  const raw = await backendGet<unknown>(`/operator/repair-orders/${id}`)
  const order = isObj(raw) ? toQueueOrder(raw) : null
  if (!order) throw new Error("NOT_FOUND")
  return order
}