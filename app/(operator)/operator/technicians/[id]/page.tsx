import { Suspense } from "react"
import { notFound } from "next/navigation"
import { TechnicianProfile } from "@/components/operator/technicians/technician-profile"
import { PageSkeleton } from "@/components/shared/skeletons"
import { getTechnicianApplication } from "@/lib/api/operator-technicians-read"
import { connection } from "next/server"

async function Content({ params }: { params: Promise<{ id: string }> }) {
  await connection() 
  const { id } = await params
  const techId = Number(id)
  if (!Number.isInteger(techId) || techId <= 0) notFound()

  try {
    const tech = await getTechnicianApplication(techId)
    return <TechnicianProfile tech={tech} />
  } catch (e) {
    const code = e instanceof Error ? e.message : "SERVER"
    if (code === "NOT_FOUND") notFound()
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
        Không tải được hồ sơ kỹ thuật viên ({code}). Vui lòng thử lại.
      </div>
    )
  }
}

export default function OperatorTechnicianPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<PageSkeleton variant="detail" label="Đang tải hồ sơ kỹ thuật viên…" />}>
      <Content params={params} />
    </Suspense>
  )
}