import { Suspense } from "react"
import { notFound } from "next/navigation"
import { ViolationHandle } from "@/components/operator/violations/violation-handle"
import { getViolation } from "@/lib/operator/mock-violations"

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const v = getViolation(id)
  if (!v) notFound()
  return <ViolationHandle v={v} />
}

export default function ViolationHandlePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Đang tải hồ sơ vi phạm...</p>}>
      <Content params={params} />
    </Suspense>
  )
}