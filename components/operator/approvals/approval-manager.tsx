"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { Check, X } from "lucide-react"
import {
  REVIEW_TABS, dmyHm, isPendingProfile, isPendingSpecialty, specialtyLabel, specialtyTone,
  type ApplicationRow, type ReviewTab, type SpecialtyRow,
} from "@/lib/admin/operator-application-utils"
import { verificationLabel, verificationTone } from "@/lib/admin/technician-detail-utils"
import { reviewSpecialty, verifyTechnician } from "@/lib/api/operator-technicians-client"
import { Avatar, Pager, ReviewDialog } from "../shared/review-ui"

type View = "profiles" | "specialties"
type Paged<T> = { items: T[]; total_items: number; total_pages: number }

type Props = {
  view: View
  tab: ReviewTab
  page: number
  pageSize: number
  counts: Record<ReviewTab, number | null> // số lượng của view đang xem
  pendingProfiles: number | null
  pendingSpecialties: number | null
  profiles: Paged<ApplicationRow> | null
  specialties: Paged<SpecialtyRow> | null
}

type Target = { kind: "profile" | "specialty"; id: number; name: string; mode: "approve" | "reject" }

const th = "px-3 py-3"

export function ApprovalManager({
  view, tab, page, pageSize, counts, pendingProfiles, pendingSpecialties, profiles, specialties,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()
  const [target, setTarget] = useState<Target | null>(null)
  const [notice, setNotice] = useState("")

  useEffect(() => {
    if (!notice) return
    const id = setTimeout(() => setNotice(""), 4000)
    return () => clearTimeout(id)
  }, [notice])

  function go(patch: Partial<{ view: View; tab: ReviewTab; page: number }>) {
    const next = { view, tab, page, ...patch }
    const sp = new URLSearchParams()
    if (next.view !== "profiles") sp.set("view", next.view)
    if (next.tab !== "all") sp.set("status", next.tab)
    if (next.page > 1) sp.set("page", String(next.page))
    const qs = sp.toString()
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }))
  }

  async function confirm(reason?: string) {
    if (!target) return
    const decision = target.mode === "approve" ? "APPROVE" : "REJECT"
    if (target.kind === "profile") await verifyTechnician(target.id, decision, reason)
    else await reviewSpecialty(target.id, decision, reason)
    setNotice(`${target.mode === "approve" ? "Đã duyệt" : "Đã từ chối"}: ${target.name}`)
    setTarget(null)
    startTransition(() => router.refresh())
  }

  const data = view === "profiles" ? profiles : specialties
  const rowsCount = data?.items.length ?? 0

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-ink">Duyệt hồ sơ & nghiệp vụ</h1>
        <div className="flex rounded-lg border border-line bg-white p-0.5" role="tablist">
          {(
            [
              ["profiles", "Hồ sơ KTV", pendingProfiles],
              ["specialties", "Chuyên môn", pendingSpecialties],
            ] as const
          ).map(([k, label, n]) => (
            <button
              key={k}
              role="tab"
              aria-selected={view === k}
              onClick={() => go({ view: k, tab: "all", page: 1 })}
              className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-xs font-semibold ${
                view === k ? "bg-field text-ink" : "text-muted hover:text-ink"
              }`}
            >
              {label}
              {n != null && n > 0 && (
                <span className="rounded-full bg-red-500 px-1.5 text-[10px] text-white">{n}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {notice && (
        <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
          {notice}
        </p>
      )}

      <section className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
        {/* Tab trạng thái */}
        <div className="flex gap-6 border-b border-line px-5" role="tablist">
          {REVIEW_TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => go({ tab: t.key, page: 1 })}
              className={`-mb-px flex items-center gap-2 border-b-2 py-3.5 text-sm font-semibold transition ${
                tab === t.key ? "border-cta text-cta" : "border-transparent text-body hover:text-ink"
              }`}
            >
              {t.label}
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] ${
                  tab === t.key ? "bg-orange-50 text-cta" : "bg-field text-muted"
                }`}
              >
                {counts[t.key] ?? "—"}
              </span>
            </button>
          ))}
        </div>

        <div className={`overflow-x-auto transition-opacity ${pending ? "opacity-60" : ""}`}>
          {view === "profiles" ? (
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-field/60 text-[11px] font-semibold uppercase text-muted">
                <tr>
                  <th className="px-5 py-3">Kỹ thuật viên</th>
                  <th className={th}>SĐT</th>
                  <th className={th}>Địa chỉ</th>
                  <th className={th}>Ngày nộp</th>
                  <th className={th}>Trạng thái</th>
                  <th className={`${th} text-right`}>Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rowsCount === 0 && (
                  <tr>
                    <td colSpan={6} className="h-28 text-center text-sm text-muted">Không có hồ sơ nào</td>
                  </tr>
                )}
                {profiles?.items.map((r) => (
                  <tr key={r.id} className="hover:bg-field/40">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={r.name} url={r.avatarUrl} />
                        <div>
                          <div className="text-[13px] font-semibold text-ink">{r.name}</div>
                          <div className="text-[11px] text-muted">{r.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-xs text-body">{r.phone}</td>
                    <td className="max-w-[240px] truncate px-3 py-3.5 text-xs text-body" title={r.address ?? ""}>
                      {r.address ?? "—"}
                    </td>
                    <td className="px-3 py-3.5 text-xs text-body">{dmyHm(r.submittedAt)}</td>
                    <td className="px-3 py-3.5">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${verificationTone(r.status)}`}>
                        {verificationLabel(r.status)}
                      </span>
                      {r.rejectionReason && (
                        <div className="mt-1 max-w-[200px] truncate text-[11px] text-red-500" title={r.rejectionReason}>
                          {r.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/operator/technicians/${r.id}`}
                          className="rounded-md border border-line bg-white px-2.5 py-1 text-[11px] font-semibold text-ink hover:bg-field"
                        >
                          Xem hồ sơ
                        </Link>
                        {isPendingProfile(r.status) && (
                          <>
                            <button
                              type="button"
                              onClick={() => setTarget({ kind: "profile", id: r.id, name: r.name, mode: "approve" })}
                              className="flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:brightness-95"
                            >
                              <Check className="size-3" /> Duyệt
                            </button>
                            <button
                              type="button"
                              onClick={() => setTarget({ kind: "profile", id: r.id, name: r.name, mode: "reject" })}
                              className="flex items-center gap-1 rounded-md border border-red-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-red-500 hover:bg-red-50"
                            >
                              <X className="size-3" /> Từ chối
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full min-w-[1000px] text-left">
              <thead className="bg-field/60 text-[11px] font-semibold uppercase text-muted">
                <tr>
                  <th className="px-5 py-3">Kỹ thuật viên</th>
                  <th className={th}>Danh mục</th>
                  <th className={th}>Kinh nghiệm</th>
                  <th className={th}>Thiết bị</th>
                  <th className={th}>Minh chứng</th>
                  <th className={th}>Ngày gửi</th>
                  <th className={th}>Trạng thái</th>
                  <th className={`${th} text-right`}>Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rowsCount === 0 && (
                  <tr>
                    <td colSpan={8} className="h-28 text-center text-sm text-muted">Không có chuyên môn nào</td>
                  </tr>
                )}
                {specialties?.items.map((s) => {
                  const name = s.technicianName ?? `KTV #${s.technicianId}`
                  return (
                    <tr key={s.id} className="hover:bg-field/40">
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/operator/technicians/${s.technicianId}`}
                          className="text-[13px] font-semibold text-ink hover:text-cta"
                        >
                          {name}
                        </Link>
                      </td>
                      {/* TODO: đổi sang tên danh mục khi nối với lib/api/catalog-read.ts */}
                      <td className="px-3 py-3.5 text-xs text-body">Danh mục #{s.categoryId}</td>
                      <td className="px-3 py-3.5 text-xs text-body">{s.experienceLevel || "—"}</td>
                      <td className="px-3 py-3.5 text-xs text-body">
                        {s.acceptAllDevices ? "Tất cả thiết bị" : `${s.deviceCount} loại thiết bị`}
                      </td>
                      <td className="px-3 py-3.5 text-xs">
                        {s.evidenceUrls.length === 0 ? (
                          <span className="text-muted">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {s.evidenceUrls.map((u, i) => (
                              <a
                                key={u}
                                href={u}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-cta hover:underline"
                              >
                                Ảnh {i + 1}
                              </a>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3.5 text-xs text-body">{dmyHm(s.createdAt)}</td>
                      <td className="px-3 py-3.5">
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${specialtyTone(s.status)}`}>
                          {specialtyLabel(s.status)}
                        </span>
                        {s.rejectionReason && (
                          <div className="mt-1 max-w-[200px] truncate text-[11px] text-red-500" title={s.rejectionReason}>
                            {s.rejectionReason}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3.5">
                        {isPendingSpecialty(s.status) && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setTarget({ kind: "specialty", id: s.id, name, mode: "approve" })}
                              className="flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:brightness-95"
                            >
                              <Check className="size-3" /> Duyệt
                            </button>
                            <button
                              type="button"
                              onClick={() => setTarget({ kind: "specialty", id: s.id, name, mode: "reject" })}
                              className="flex items-center gap-1 rounded-md border border-red-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-red-500 hover:bg-red-50"
                            >
                              <X className="size-3" /> Từ chối
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        <Pager
          page={page}
          totalPages={data?.total_pages ?? 1}
          total={data?.total_items ?? 0}
          pageSize={pageSize}
          onPage={(p) => go({ page: p })}
        />
      </section>

      {target && (
        <ReviewDialog mode={target.mode} title={target.name} onConfirm={confirm} onClose={() => setTarget(null)} />
      )}
    </div>
  )
}