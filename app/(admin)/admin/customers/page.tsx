/*import { CustomerManager } from "@/components/admin/customers/customer-manager"

export default function CustomersPage() {
  return <CustomerManager />
}*/

import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { CustomerManager } from "@/components/admin/customers/customer-manager"
import { getCustomers, getCustomerStats } from "@/lib/api/customers-read"
import { apiErrorMessage } from "@/lib/api/errors"
import type { UiStatus } from "@/lib/admin/customer-utils"

type SearchParams = Promise<Record<string, string | string[] | undefined>>

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

async function Content({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams

  const page = Math.max(1, Number(one(sp.page)) || 1)
  const size = [10, 20, 50].includes(Number(one(sp.size))) ? Number(one(sp.size)) : 20
  const q = (one(sp.q) ?? "").trim()
  const rawStatus = one(sp.status)
  const status = (["active", "inactive", "locked"] as const).find((s) => s === rawStatus) as
    | UiStatus
    | undefined

  try {
    const [data, stats] = await Promise.all([
      getCustomers({ page, pageSize: size, q, status }),
      getCustomerStats(),
    ])
    return <CustomerManager data={data} stats={stats} filters={{ q, status }} />
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") redirect("/login")
    return (
      <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
        <p>{apiErrorMessage(e)}</p>
        <Link href="/admin/customers" className="mt-2 inline-block font-semibold underline">
          Thử lại
        </Link>
      </div>
    )
  }
}

export default function CustomersPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Đang tải danh sách khách hàng...</p>}>
      <Content searchParams={searchParams} />
    </Suspense>
  )
}