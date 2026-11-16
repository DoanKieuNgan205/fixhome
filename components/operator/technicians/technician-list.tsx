"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTransition } from "react"
import {
  REVIEW_TABS, dmyHm, type ApplicationRow, type ReviewTab,
} from "@/lib/admin/operator-application-utils"
import { verificationLabel, verificationTone } from "@/lib/admin/technician-detail-utils"
import { Avatar, Pager } from "../shared/review-ui"

type Query = { tab: ReviewTab; page: number; pageSize: number; dateFrom: string; dateTo: string }

type Props = {
  list: { items: ApplicationRow[]; total_items: number; total_pages: number }
  counts: Record<ReviewTab, number | null>
  query: Query
}

export function TechnicianList({ list, counts, query }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()

  function go(patch: Partial<Query>) {
    const next = { ...query, ...patch }
    const sp = new URLSearchParams()
    if (next.tab !== "all") sp.set("status", next.tab)
    if (next.dateFrom) sp.set("date_from", next.dateFrom)
    if (next.dateTo) sp.set("date_to", next.dateTo)
    if (next.page > 1) sp.set("page", String(next.page))
    const qs = sp.toString()
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }))
  }

  const dateInput =
    "h-9 rounded-lg border border-line bg-white px-3 text-xs text-ink outline-none focus:border-cta"

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink">Danh sách kỹ thuật viên</h1>
        <p className="mt-1 text-xs text-muted">Chỉ gồm KTV đã nộp hồ sơ (không gồm hồ sơ chưa hoàn tất).</p>
      </div>

      <section className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
        <div className="flex gap-6 border-b border-line px-5" role="tablist">
          {REVIEW_TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={query.tab === t.key}
              onClick={() => go({ tab: t.key, page: 1 })}
              className={`-mb-px flex items-center gap-2 border-b-2 py-3.5 text-sm font-semibold transition ${
                query.tab === t.key ? "border-cta text-cta" : "border-transparent text-body hover:text-ink"
              }`}
            >
              {t.label}
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] ${
                  query.tab === t.key ? "bg-orange-50 text-cta" : "bg-field text-muted"
                }`}
              >
                {counts[t.key] ?? "—"}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 p-4 text-xs text-body">
          <label className="flex items-center gap-2">
            Nộp từ ngày
            <input
              type="date"
              value={query.dateFrom}
              onChange={(e) => go({ dateFrom: e.target.value, page: 1 })}
              className={dateInput}
            />
          </label>
          <label className="flex items-center gap-2">
            đến ngày
            <input
              type="date"
              value={query.dateTo}
              onChange={(e) => go({ dateTo: e.target.value, page: 1 })}
              className={dateInput}
            />
          </label>
          {(query.dateFrom || query.dateTo) && (
            <button
              type="button"
              onClick={() => go({ dateFrom: "", dateTo: "", page: 1 })}
              className="font-semibold text-cta hover:underline"
            >
              Xóa lọc ngày
            </button>
          )}
        </div>

        <div className={`overflow-x-auto transition-opacity ${pending ? "opacity-60" : ""}`}>
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-field/60 text-[11px] font-semibold uppercase text-muted">
              <tr>
                <th className="px-5 py-3">Kỹ thuật viên</th>
                <th className="px-3 py-3">SĐT</th>
                <th className="px-3 py-3">Email</th>
                <th className="px-3 py-3">Địa chỉ</th>
                <th className="px-3 py-3">Ngày nộp</th>
                <th className="px-3 py-3">Trạng thái hồ sơ</th>
                <th className="px-3 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {list.items.length === 0 && (
                <tr>
                  <td colSpan={7} className="h-28 text-center text-sm text-muted">
                    Không tìm thấy kỹ thuật viên phù hợp
                  </td>
                </tr>
              )}
              {list.items.map((r) => (
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
                  <td className="px-3 py-3.5 text-xs text-body">{r.email ?? "—"}</td>
                  <td className="max-w-[220px] truncate px-3 py-3.5 text-xs text-body" title={r.address ?? ""}>
                    {r.address ?? "—"}
                  </td>
                  <td className="px-3 py-3.5 text-xs text-body">{dmyHm(r.submittedAt)}</td>
                  <td className="px-3 py-3.5">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${verificationTone(r.status)}`}>
                      {verificationLabel(r.status)}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-right">
                    <Link
                      href={`/operator/technicians/${r.id}`}
                      className="rounded-md border border-line bg-white px-2.5 py-1 text-[11px] font-semibold text-ink hover:bg-field"
                    >
                      Xem hồ sơ
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pager
          page={query.page}
          totalPages={list.total_pages}
          total={list.total_items}
          pageSize={query.pageSize}
          onPage={(p) => go({ page: p })}
        />
      </section>
    </div>
  )
}