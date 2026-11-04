import { Suspense } from "react"
import { CustomerManager } from "@/components/admin/customers/customer-manager"

export default function CustomersPage() {
  return (
    <Suspense fallback={<p role="status" className="text-sm text-muted">Đang tải danh sách khách hàng…</p>}>
      <CustomerManager />
    </Suspense>
  )
}
