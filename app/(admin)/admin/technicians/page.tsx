/*import { Suspense } from "react"
import { TechnicianManager } from "@/components/admin/technicians/technician-manager"
import { PageSkeleton } from "@/components/shared/skeletons"

export default function TechniciansPage() {
  return (
    <Suspense fallback={<PageSkeleton stats={3} columns={8} label="Đang tải danh sách kỹ thuật viên…" />}>
      <TechnicianManager />
    </Suspense>
  )
}*/

import { Suspense } from "react"
import { TechnicianManager } from "@/components/admin/technicians/technician-manager"
import { PageSkeleton } from "@/components/shared/skeletons"
//import { getTechnicians, getTechnicianStats } from "@/lib/api/technicians-read"
import { getTechnicians, getTechnicianStats, type TechStatus } from "@/lib/api/technicians-read"
//import type { UiStatus } from "@/lib/admin/customer-utils"

type SP = { page?: string; size?: string; q?: string; tab?: string }

const PAGE_SIZES = [10, 20, 50]

async function TechnicianData({ sp }: { sp: SP }) {
  const page = Math.max(1, Number(sp.page) || 1)
  const pageSize = PAGE_SIZES.includes(Number(sp.size)) ? Number(sp.size) : 10
  const status: TechStatus | undefined =
    sp.tab === "active" || sp.tab === "locked" ? sp.tab : undefined
  const q = sp.q?.trim() || undefined

  try {
    const [list, stats] = await Promise.all([
      getTechnicians({ page, pageSize, q, status }),
      getTechnicianStats(),
    ])
    return (
      <TechnicianManager
        list={list}
        stats={stats}
        query={{ tab: status ?? "all", q: q ?? "", page, pageSize }}
      />
    )
  } catch (e) {
    const code = e instanceof Error ? e.message : "SERVER"
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
        Không tải được danh sách kỹ thuật viên ({code}). Vui lòng thử lại.
      </div>
    )
  }
}

export default async function TechniciansPage({
  searchParams,
}: {
  searchParams: Promise<SP>
}) {
  const sp = await searchParams
  return (
    // key để hiện skeleton mỗi khi đổi tab / trang / từ khóa
    <Suspense
      key={JSON.stringify(sp)}
      fallback={<PageSkeleton stats={3} columns={8} label="Đang tải danh sách kỹ thuật viên…" />}
    >
      <TechnicianData sp={sp} />
    </Suspense>
  )
}