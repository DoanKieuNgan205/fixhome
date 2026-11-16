"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { ArrowLeft, Check, X } from "lucide-react"
import { InfoTab } from "@/components/admin/technicians/technician-tabs"
import { isPendingProfile } from "@/lib/admin/operator-application-utils"
import {
  verificationLabel, verificationTone, type TechnicianDetail,
} from "@/lib/admin/technician-detail-utils"
import { verifyTechnician } from "@/lib/api/operator-technicians-client"
import { Avatar, ReviewDialog } from "../shared/review-ui"

export function TechnicianProfile({ tech }: { tech: TechnicianDetail }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [mode, setMode] = useState<"approve" | "reject" | null>(null)
  const [notice, setNotice] = useState("")
  const canReview = isPendingProfile(tech.verificationStatus)

  useEffect(() => {
    if (!notice) return
    const id = setTimeout(() => setNotice(""), 4000)
    return () => clearTimeout(id)
  }, [notice])

  async function confirm(reason?: string) {
    if (!mode) return
    await verifyTechnician(Number(tech.id), mode === "approve" ? "APPROVE" : "REJECT", reason)
    setNotice(mode === "approve" ? "Đã duyệt hồ sơ" : "Đã từ chối hồ sơ")
    setMode(null)
    startTransition(() => router.refresh())
  }

  return (
    <div className="space-y-5">
      <Link
        href="/operator/technicians"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink"
      >
        <ArrowLeft className="size-3.5" /> Quay lại danh sách kỹ thuật viên
      </Link>

      {notice && (
        <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
          {notice}
        </p>
      )}

      <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={tech.name} url={tech.avatarUrl} size="size-14" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-ink">{tech.name}</h1>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${verificationTone(tech.verificationStatus)}`}
                >
                  {verificationLabel(tech.verificationStatus)}
                </span>
              </div>
              <div className="mt-1 text-xs text-muted">{tech.code}</div>
            </div>
          </div>

          {canReview && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode("approve")}
                className="flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-4 text-xs font-semibold text-white hover:brightness-95"
              >
                <Check className="size-3.5" /> Duyệt hồ sơ
              </button>
              <button
                type="button"
                onClick={() => setMode("reject")}
                className="flex h-9 items-center gap-1.5 rounded-lg border border-red-200 bg-white px-4 text-xs font-semibold text-red-500 hover:bg-red-50"
              >
                <X className="size-3.5" /> Từ chối
              </button>
            </div>
          )}
        </div>
      </section>

      <InfoTab t={tech} />

      {mode && <ReviewDialog mode={mode} title={tech.name} onConfirm={confirm} onClose={() => setMode(null)} />}
    </div>
  )
}