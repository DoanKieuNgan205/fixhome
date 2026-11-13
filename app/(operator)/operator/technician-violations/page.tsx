import { Suspense } from "react"
import { ViolationList } from "@/components/operator/violations/violation-list"

export default function TechnicianViolationsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Đang tải danh sách vi phạm...</p>}>
      <ViolationList />
    </Suspense>
  )
}