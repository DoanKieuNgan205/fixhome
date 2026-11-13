import { Suspense } from "react"
import { TechnicianList } from "@/components/operator/technicians/technician-list"
import { PageSkeleton } from "@/components/shared/skeletons"

export default function OperatorTechniciansPage() {
  return (
    <Suspense fallback={<PageSkeleton stats={0} columns={5} label="Đang tải danh sách kỹ thuật viên…" />}>
      <TechnicianList />
    </Suspense>
  )
}