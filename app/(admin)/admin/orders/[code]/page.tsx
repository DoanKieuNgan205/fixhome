// app/(admin)/admin/orders/[code]/page.tsx
import { Suspense } from "react"
import { notFound } from "next/navigation"
import { OrderDetailView } from "@/components/admin/orders/order-detail"
import { PageSkeleton } from "@/components/shared/skeletons"
import { getOrder } from "@/lib/admin/orders-read"

async function Content({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  try {
    const order = await getOrder(decodeURIComponent(code))
    return <OrderDetailView order={order} />
  } catch (e) {
    const err = e instanceof Error ? e.message : "SERVER"
    if (err === "NOT_FOUND") notFound()
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
        Không tải được chi tiết đơn hàng ({err}). Vui lòng thử lại.
      </div>
    )
  }
}

export default function OrderDetailPage({ params }: { params: Promise<{ code: string }> }) {
  return (
    <Suspense fallback={<PageSkeleton variant="detail" label="Đang tải chi tiết đơn hàng…" />}>
      <Content params={params} />
    </Suspense>
  )
}