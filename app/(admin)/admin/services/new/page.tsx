import { Suspense } from "react"
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
}