import { Suspense } from "react"
import { ApprovalManager } from "@/components/operator/approvals/approval-manager"
import { PageSkeleton } from "@/components/shared/skeletons"
import { PROFILE_STATUS, parseTab } from "@/lib/admin/operator-application-utils"
import {
  getApplicationCounts, getSpecialtyReview, getTechnicianApplications,
} from "@/lib/api/operator-technicians-read"

type SP = { view?: string; status?: string; page?: string }

const PAGE_SIZE = 10

async function Data({ sp }: { sp: SP }) {
  const view = sp.view === "specialties" ? "specialties" : "profiles"
  const tab = parseTab(sp.status)
  const page = Math.max(1, Number(sp.page) || 1)

  try {
    const [appCounts, spec] = await Promise.all([
      getApplicationCounts(),
      getSpecialtyReview({
        status: view === "specialties" ? tab : "all",
        page: view === "specialties" ? page : 1,
        pageSize: PAGE_SIZE,
        withNames: view === "specialties",
      }),
    ])
    const profiles =
      view === "profiles"
        ? await getTechnicianApplications({
            page,
            pageSize: PAGE_SIZE,
            status: tab === "all" ? undefined : PROFILE_STATUS[tab],
          })
        : null

    return (
      <ApprovalManager
        view={view}
        tab={tab}
        page={page}
        pageSize={PAGE_SIZE}
        counts={view === "profiles" ? appCounts : spec.counts}
        pendingProfiles={appCounts.pending}
        pendingSpecialties={spec.counts.pending}
        profiles={profiles}
        specialties={view === "specialties" ? spec : null}
      />
    )
  } catch (e) {
    const code = e instanceof Error ? e.message : "SERVER"
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
        Không tải được danh sách duyệt hồ sơ ({code}). Vui lòng thử lại.
      </div>
    )
  }
}

export default async function TechnicianApprovalsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams
  return (
    <Suspense
      key={JSON.stringify(sp)}
      fallback={<PageSkeleton stats={3} columns={6} label="Đang tải danh sách duyệt hồ sơ…" />}
    >
      <Data sp={sp} />
    </Suspense>
  )
}