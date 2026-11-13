"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowLeft, Lock, LockOpen, Send } from "lucide-react"
import { initials } from "@/lib/admin/customer-utils"
import {
  verificationLabel, verificationTone, type TechnicianDetail,
} from "@/lib/admin/technician-detail-utils"
import { AccountTab, InfoTab, PendingTab, dmyHm } from "./technician-tabs"

type TabKey = "info" | "performance" | "orders" | "reviews" | "wallet" | "account"

const TABS: { key: TabKey; label: string }[] = [
  { key: "info", label: "1. Thông tin" },
  { key: "performance", label: "2. Hiệu suất & Tỷ lệ hủy" },
  { key: "orders", label: "3. Đơn gần đây" },
  { key: "reviews", label: "4. Đánh giá khách" },
  { key: "wallet", label: "5. Công nợ" },
  { key: "account", label: "6. Tài khoản & Nhật ký" },
]

export function TechnicianDetailView({ tech }: { tech: TechnicianDetail }) {
  const [tab, setTab] = useState<TabKey>("info")
  const [notice, setNotice] = useState("")
  const locked = tech.status === "locked"

  // Thông báo tự tắt sau 4 giây
  useEffect(() => {
    if (!notice) return
    const id = setTimeout(() => setNotice(""), 4000)
    return () => clearTimeout(id)
  }, [notice])

  // TODO: các thao tác dưới đây chờ backend có API. Khi có: gọi qua proxy() rồi router.refresh()
  function pending() {
    setNotice("Chức năng này đang chờ backend cung cấp API.")
  }

  function toggleLock() {
    const ok = window.confirm(
      locked ? `Mở khóa tài khoản của "${tech.name}"?` : `Khóa tài khoản của "${tech.name}"?`,
    )
    if (ok) pending()
  }

  function resetPassword() {
    if (window.confirm(`Gửi yêu cầu đặt lại mật khẩu cho "${tech.name}"?`)) pending()
  }

  function revokeSessions() {
    if (window.confirm("Đăng xuất KTV khỏi tất cả thiết bị?")) pending()
  }

  return (
    <div className="space-y-5">
      <Link
        href="/admin/technicians"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink"
      >
        <ArrowLeft className="size-3.5" /> Quay lại danh sách kỹ thuật viên
      </Link>

      {notice && (
        <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
          {notice}
        </p>
      )}

      {/* Đầu hồ sơ */}
      <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-50 text-lg font-bold text-orange-600">
              {tech.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tech.avatarUrl} alt="" className="size-14 object-cover" />
              ) : (
                initials(tech.name)
              )}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-ink">{tech.name}</h1>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                    locked ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  ● {locked ? "Đã khóa" : "Đang hoạt động"}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${verificationTone(tech.verificationStatus)}`}
                >
                  {verificationLabel(tech.verificationStatus)}
                </span>
              </div>
              <div className="mt-1 text-xs text-muted">{tech.code}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleLock}
            className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold ${
              locked
                ? "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                : "border-red-200 bg-red-50 text-red-500 hover:bg-red-100"
            }`}
          >
            {locked ? <LockOpen className="size-3.5" /> : <Lock className="size-3.5" />}
            {locked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
          </button>
        </div>

        {/* Tab */}
        <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4" role="tablist">
          {TABS.map((x) => (
            <button
              key={x.key}
              role="tab"
              aria-selected={tab === x.key}
              onClick={() => setTab(x.key)}
              className={`flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition ${
                tab === x.key ? "bg-cta text-white" : "border border-line text-body hover:bg-field"
              }`}
            >
              {x.label}
            </button>
          ))}
        </div>
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[1fr_340px]">
        {/* Nội dung tab */}
        <div>
          {tab === "info" && <InfoTab t={tech} />}
          {tab === "performance" && (
            <PendingTab
              title="Hiệu suất vận hành & Tỷ lệ hủy"
              need="Cần API thống kê: tổng đơn hoàn thành, tỷ lệ hoàn thành, tỷ lệ hủy theo tuần và lý do KTV hủy."
            />
          )}
          {tab === "orders" && (
            <PendingTab title="Đơn dịch vụ gần đây" need="Cần API danh sách đơn hàng của KTV." />
          )}
          {tab === "reviews" && (
            <PendingTab title="Đánh giá & Nhận xét từ khách hàng" need="Cần API đánh giá của KTV." />
          )}
          {tab === "wallet" && (
            <PendingTab title="Công nợ & ví" need="Cần API ví, công nợ và lịch sử giao dịch của KTV." />
          )}
          {tab === "account" && (
            <AccountTab
              t={tech}
              locked={locked}
              onToggleLock={toggleLock}
              onResetPassword={resetPassword}
              onRevokeSessions={revokeSessions}
            />
          )}
        </div>

        {/* Cột phải: luôn hiển thị */}
        <aside className="space-y-4">
          <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
            <h2 className="text-[10px] font-semibold tracking-wider text-muted">THÔNG TIN NHANH</h2>
            <dl className="mt-3 space-y-2.5 text-xs">
              <Quick label="Mã KTV">{tech.code}</Quick>
              <Quick label="Địa chỉ">{tech.address ?? "—"}</Quick>
              <Quick label="Hồ sơ">{verificationLabel(tech.verificationStatus)}</Quick>
              <Quick label="Trạng thái nhận việc">
                <span className={tech.available && !locked ? "font-semibold text-emerald-600" : "text-muted"}>
                  ● {tech.available && !locked ? "Đang bật (Nhận đơn)" : "Đang tắt"}
                </span>
              </Quick>
              <Quick label="Cập nhật gần nhất">
                {tech.updatedAt ? dmyHm(tech.updatedAt) : "—"}
              </Quick>
              <Quick label="Đánh giá trung bình">—</Quick>
              <Quick label="Đơn tháng này">—</Quick>
              <Quick label="Công nợ tiền mặt">—</Quick>
            </dl>

            <button
              type="button"
              disabled
              title="Chưa có API gửi thông báo"
              className="mt-4 flex h-10 w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 text-sm font-semibold text-blue-600 opacity-50"
            >
              <Send className="size-4" /> Gửi thông báo đến KTV
            </button>
          </section>
        </aside>
      </div>
    </div>
  )
}

function Quick({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="text-right font-semibold text-ink">{children}</dd>
    </div>
  )
}