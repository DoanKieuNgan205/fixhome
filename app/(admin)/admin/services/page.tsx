import { ServiceCatalog } from "@/components/admin/services/service-catalog"
import { devices } from "@/lib/admin/mock-services"

export default function ServicesPage() {
  return (
    <>
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-ink">Danh mục dịch vụ</h1>
        <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
          <span className="size-1.5 rounded-full bg-amber-500" />
          {devices.length} dịch vụ
        </span>
      </div>
      <ServiceCatalog />
    </>
  )
}