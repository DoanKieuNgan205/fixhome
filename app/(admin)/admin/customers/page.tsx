import { Suspense } from "react"
import { CustomerManager } from "@/components/admin/customers/customer-manager"
import { PageSkeleton } from "@/components/shared/skeletons"

export default function CustomersPage() {
  return (
    <Suspense fallback={<PageSkeleton stats={4} columns={8} label="Đang tải danh sách khách hàng…" />}>
      <CustomerManager />
    </Suspense>
  )
}
