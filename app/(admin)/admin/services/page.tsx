import { Suspense } from "react"
import { redirect } from "next/navigation"
import { ServiceCatalog } from "@/components/admin/services/service-catalog"
import { getCatalog, type CategoryWithDevices } from "@/lib/api/catalog-read"
import { PageSkeleton } from "@/components/shared/skeletons"

async function Content() {
  let categories: CategoryWithDevices[]
  try {
    categories = await getCatalog()
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") redirect("/login")
    throw e
  }
  const total = categories.reduce((n, c) => n + c.device_types.length, 0)

  return (
    <>
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-ink">Danh mục dịch vụ</h1>
        <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
          <span className="size-1.5 rounded-full bg-amber-500" />
          {total} dịch vụ
        </span>
      </div>
      <ServiceCatalog categories={categories} />
    </>
  )
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<PageSkeleton variant="catalog" label="Đang tải danh mục dịch vụ…" />}>
      <Content />
    </Suspense>
  )
}
