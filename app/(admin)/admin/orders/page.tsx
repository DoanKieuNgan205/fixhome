// app/(admin)/admin/orders/page.tsx
import { Suspense } from "react"
import { OrderManager } from "@/components/admin/orders/order-manager"
import { PageSkeleton } from "@/components/shared/skeletons"
import { getOrders } from "@/lib/admin/orders-read"
import type { OrderStatus } from "@/lib/admin/order-types"

type SP = { page?: string; size?: string; q?: string; status?: string; area?: string; from?: string; to?: string }

const PAGE_SIZES = [10, 20, 50]
const STATUSES: OrderStatus[] = ["new", "in_progress", "completed", "cancelled"]
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/

async function OrderData({ sp }: { sp: SP }) {
  const page = Math.max(1, Number(sp.page) || 1)
  const pageSize = PAGE_SIZES.includes(Number(sp.size)) ? Number(sp.size) : 10
  const status = STATUSES.includes(sp.status as OrderStatus) ? (sp.status as OrderStatus) : undefined
  const q = sp.q?.trim() || undefined
  const area = sp.area?.trim() || undefined
  const from = sp.from && ISO_DAY.test(sp.from) ? sp.from : undefined
  const to = sp.to && ISO_DAY.test(sp.to) ? sp.to : undefined

  try {
    const list = await getOrders({ page, pageSize, q, status, area, from, to })
    return (
      <OrderManager
        list={list}
        query={{ q: q ?? "", status: status ?? "", area: area ?? "", from: from ?? "", to: to ?? "", page, pageSize }}
      />
    )
  } catch (e) {
    const code = e instanceof Error ? e.message : "SERVER"
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
        Không tải được danh sách đơn hàng ({code}). Vui lòng thử lại.
      </div>
    )
  }
}

export default async function OrdersPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams
  return (
    <Suspense key={JSON.stringify(sp)} fallback={<PageSkeleton stats={0} columns={8} label="Đang tải danh sách đơn hàng…" />}>
      <OrderData sp={sp} />
    </Suspense>
  )
}