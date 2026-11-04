import { Suspense } from "react"
import { notFound } from "next/navigation"
import { CustomerDetailView } from "@/components/admin/customers/customer-detail"
import { getCustomerDetail } from "@/lib/admin/mock-customer-detail"
import { PageSkeleton } from "@/components/shared/skeletons"

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const customer = getCustomerDetail(id)
  if (!customer) notFound()
  return <CustomerDetailView customer={customer} />
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<PageSkeleton variant="detail" label="Đang tải thông tin khách hàng…" />}>
      <Content params={params} />
    </Suspense>
  )
}
