import { Suspense } from "react"
import { notFound } from "next/navigation"
import { AssignTechnician } from "@/components/operator/dispatch/assign-technician"
import { PageSkeleton } from "@/components/shared/skeletons"
import { getDispatchOrder } from "@/lib/api/operator-orders-read"

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const orderId = Number(id)
  if (!Number.isInteger(orderId) || orderId <= 0) notFound()

  try {
    const order = await getDispatchOrder(orderId)
    return <AssignTechnician order={order} />
  } catch (e) {
    const code = e instanceof Error ? e.message : "SERVER"
    if (code === "NOT_FOUND") notFound()
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
        Không tải được đơn hàng ({code}). Vui lòng thử lại.
      </div>
    )
  }
}

export default function DispatchAssignPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<PageSkeleton variant="detail" label="Đang tải thông tin đơn hàng…" />}>
      <Content params={params} />
    </Suspense>
  )
}