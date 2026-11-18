import { Suspense } from "react"
import { DispatchRequestList } from "@/components/operator/dispatch/dispatch-request-list"
import { PageSkeleton } from "@/components/shared/skeletons"
import { getManualQueue } from "@/lib/api/operator-orders-read"

async function Data() {
  try {
    const queue = await getManualQueue(1, 20)
    return <DispatchRequestList orders={queue.items} total={queue.total} />
  } catch (e) {
    const code = e instanceof Error ? e.message : "SERVER"
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
        Không tải được danh sách yêu cầu tìm thợ ({code}). Vui lòng thử lại.
      </div>
    )
  }
}

export default function DispatchPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink">Điều phối KTV</h1>
        <p className="mt-1 text-xs text-muted">Các yêu cầu chưa có thợ nhận, cần nhân viên điều phối xử lý.</p>
      </div>
      <Suspense fallback={<PageSkeleton stats={3} columns={5} label="Đang tải yêu cầu tìm thợ…" />}>
        <Data />
      </Suspense>
    </div>
  )
}