import { FormSkeleton } from "@/components/shared/skeletons"
/*import { Suspense } from "react"
import { notFound } from "next/navigation"
import { DeviceForm } from "@/components/admin/services/device-form"
import { devices } from "@/lib/admin/mock-services"

async function EditDeviceContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const device = devices.find((d) => d.id === id)
  if (!device) notFound()
  return <DeviceForm mode="edit" device={device} />
}

export default function EditDevicePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <>
      <h1 className="text-2xl font-bold text-ink">Chỉnh sửa thông tin thiết bị</h1>
      <Suspense fallback={null}>
        <EditDeviceContent params={params} />
      </Suspense>
    </>
  )
}*/

import { Suspense } from "react"
import { notFound } from "next/navigation"
import { DeviceForm } from "@/components/admin/services/device-form"
import { getCategories, getDeviceType } from "@/lib/api/catalog-read"

async function EditDeviceContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^\d+$/.test(id)) notFound()

  const [device, categories] = await Promise.all([
    getDeviceType(Number(id)),
    getCategories(),
  ])
  if (!device) notFound()

  return <DeviceForm mode="edit" device={device} categories={categories} />
}

export default function EditDevicePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <>
      <h1 className="text-2xl font-bold text-ink">Chỉnh sửa thông tin thiết bị</h1>
      <Suspense fallback={<FormSkeleton />}>
        <EditDeviceContent params={params} />
      </Suspense>
    </>
  )
}