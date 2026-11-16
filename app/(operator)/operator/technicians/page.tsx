import { Suspense } from "react"
import { TechnicianList } from "@/components/operator/technicians/technician-list"
import { PageSkeleton } from "@/components/shared/skeletons"
import { PROFILE_STATUS, parseTab } from "@/lib/admin/operator-application-utils"
import { getApplicationCounts, getTechnicianApplications } from "@/lib/api/operator-technicians-read"

type SP = { status?: string; page?: string; date_from?: string; date_to?: string }

const PAGE_SIZE = 10
const isDate = (v?: string) => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v)

async function Data({ sp }: { sp: SP }) {
  const tab = parseTab(sp.status)
  const page = Math.max(1, Number(sp.page) || 1)
  const dateFrom = isDate(sp.date_from) ? sp.date_from! : ""
  const dateTo = isDate(sp.date_to) ? sp.date_to! : ""

  try {
    const [list, counts] = await Promise.all([
      getTechnicianApplications({
        page,
        pageSize: PAGE_SIZE,
        status: tab === "all" ? undefined : PROFILE_STATUS[tab],
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      }),
      getApplicationCounts(),
    ])
    return (
      <TechnicianList
        list={list}
        counts={counts}
        query={{ tab, page, pageSize: PAGE_SIZE, dateFrom, dateTo }}
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

export default async function OperatorTechniciansPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams
  return (
    <Suspense
      key={JSON.stringify(sp)}
      fallback={<PageSkeleton stats={3} columns={7} label="Đang tải danh sách kỹ thuật viên…" />}
    >
      <Data sp={sp} />
    </Suspense>
  )
}