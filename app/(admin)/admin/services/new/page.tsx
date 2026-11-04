/*import { Suspense } from "react"
import { DeviceForm } from "@/components/admin/services/device-form"

async function NewDeviceContent({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  return <DeviceForm mode="create" defaultCategoryId={category} />
}

export default function NewDevicePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  return (
    <>
      <h1 className="text-2xl font-bold text-ink">Thêm thiết bị mới</h1>
      <Suspense fallback={null}>
        <NewDeviceContent searchParams={searchParams} />
      </Suspense>
    </>
  )
}*/

import { Suspense } from "react"
import { DeviceForm } from "@/components/admin/services/device-form"
import { getCategories } from "@/lib/api/catalog-read"

async function NewDeviceContent({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const categories = await getCategories()
  const defaultCategoryId = category && /^\d+$/.test(category) ? Number(category) : undefined

  return <DeviceForm mode="create" categories={categories} defaultCategoryId={defaultCategoryId} />
}

export default function NewDevicePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  return (
    <>
      <h1 className="text-2xl font-bold text-ink">Thêm thiết bị mới</h1>
      <Suspense fallback={null}>
        <NewDeviceContent searchParams={searchParams} />
      </Suspense>
    </>
  )
}