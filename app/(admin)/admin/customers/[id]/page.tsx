import { Suspense } from "react"
import { notFound, redirect } from "next/navigation"
import { CustomerDetailView } from "@/components/admin/customers/customer-detail"
import { getCustomer } from "@/lib/api/customers-read"
import { apiErrorMessage } from "@/lib/api/errors"

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^\d+$/.test(id)) notFound()

  try {
    const customer = await getCustomer(Number(id))
    return <CustomerDetailView customer={customer} />
  } catch (e) {
    const code = e instanceof Error ? e.message : ""
    if (code === "NOT_FOUND") notFound()
    if (code === "UNAUTHORIZED") redirect("/login")
    return (
      <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
        {apiErrorMessage(e)}
      </p>
    )
  }
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Đang tải hồ sơ khách hàng...</p>}>
      <Content params={params} />
    </Suspense>
  )
}