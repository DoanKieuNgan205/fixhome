"use client"

import Link from "next/link"
import { useState } from "react"
import {
  ArrowLeft, CalendarDays, ClipboardList, Copy, Info, KeyRound, LifeBuoy,
  Lock, MapPin, Phone, ShieldCheck, UserRound,
} from "lucide-react"
import type { ApiCustomer } from "@/lib/api/types"
import { STATUS_BADGE, STATUS_LABEL, formatDate, initials, toUiStatus } from "@/lib/admin/customer-utils"

type Tab = "info" | "orders" | "security"

// "1 năm 9 tháng 12 ngày"
function since(iso: string) {
  const from = new Date(iso)
  if (Number.isNaN(from.getTime())) return "—"
  const now = new Date()
  let y = now.getFullYear() - from.getFullYear()
  let m = now.getMonth() - from.getMonth()
  let d = now.getDate() - from.getDate()
  if (d < 0) {
    m--
    d += new Date(now.getFullYear(), now.getMonth(), 0).getDate()
  }
  if (m < 0) {
    y--
    m += 12
  }
  return [y > 0 && `${y} năm`, m > 0 && `${m} tháng`, `${Math.max(d, 0)} ngày`].filter(Boolean).join(" ")
}

export function CustomerDetailView({ customer }: { customer: ApiCustomer }) {
  const [tab, setTab] = useState<Tab>("info")
  const [copied, setCopied] = useState(false)

  const st = toUiStatus(customer.status)

  async function copyPhone() {
    try {
      await navigator.clipboard.writeText(customer.phone)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* trình duyệt chặn clipboard: bỏ qua */
    }
  }

  const tabs: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "info", label: "Thông tin", icon: UserRound },
    { key: "orders", label: "Lịch sử đơn", icon: ClipboardList },
    { key: "security", label: "Tài khoản & Bảo mật", icon: ShieldCheck },
  ]

  return (
    <div className="space-y-5">
      <Link
        href="/admin/customers"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink"
      >
        <ArrowLeft className="size-3.5" /> Quay lại danh sách khách hàng
      </Link>

      <div className="grid items-start gap-5 xl:grid-cols-[1fr_340px]">
        {/* ===== Cột trái ===== */}
        <div className="space-y-5">
          <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="flex size-16 items-center justify-center rounded-full bg-indigo-50 text-lg font-bold text-indigo-600 ring-2 ring-emerald-400">
                  {initials(customer.full_name)}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-bold text-ink">{customer.full_name}</h1>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_BADGE[st]}`}>
                      ● {STATUS_LABEL[st]}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-muted">#{customer.id}</div>
                </div>
              </div>

              {/* Backend chưa có API đặt lại mật khẩu / khóa tài khoản */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled
                  title="Chưa có API"
                  className="flex h-9 cursor-not-allowed items-center gap-2 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink opacity-50"
                >
                  <KeyRound className="size-3.5" /> Đặt lại mật khẩu
                </button>
                <button
                  type="button"
                  disabled
                  title="Chưa có API"
                  className="flex h-9 cursor-not-allowed items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-500 opacity-50"
                >
                  <Lock className="size-3.5" /> Khóa tài khoản
                </button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4" role="tablist">
              {tabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={tab === key}
                  onClick={() => setTab(key)}
                  className={`flex h-9 items-center gap-2 rounded-lg px-4 text-xs font-semibold transition ${
                    tab === key ? "bg-cta text-white" : "text-body hover:bg-field"
                  }`}
                >
                  <Icon className="size-3.5" /> {label}
                </button>
              ))}
            </div>
          </section>

          {tab === "info" && (
            <>
              <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
                <h2 className="border-l-4 border-cta pl-2 text-sm font-bold text-ink">
                  Thông tin hồ sơ khách hàng
                </h2>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="HỌ VÀ TÊN" value={customer.full_name} />
                  <Field
                    label="SỐ ĐIỆN THOẠI LIÊN HỆ"
                    value={customer.phone || "—"}
                    action={
                      customer.phone ? (
                        <button
                          type="button"
                          onClick={copyPhone}
                          className="flex items-center gap-1 text-[11px] font-semibold text-cta hover:underline"
                        >
                          <Copy className="size-3" /> {copied ? "Đã chép" : "Sao chép"}
                        </button>
                      ) : undefined
                    }
                  />
                  <Field label="HỘP THƯ ĐIỆN TỬ" value={customer.email || "—"} />
                  <Field label="MÃ TÀI KHOẢN" value={`#${customer.id}`} />
                </div>

                <div className="mt-4 rounded-lg bg-field/60 p-4">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <CalendarDays className="size-3.5" /> NGÀY THAM GIA HỆ THỐNG:
                    </span>
                    <b className="text-ink">{formatDate(customer.created_at)}</b>
                    <span>(Thời gian gắn bó: {since(customer.created_at)})</span>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
                <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
                  <MapPin className="size-4 text-cta" /> Địa chỉ phục vụ
                </h2>
                <div className="mt-4">
                  <NotYet text="Backend chưa có API địa chỉ của khách hàng" />
                </div>
              </section>
            </>
          )}

          {tab === "orders" && (
            <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
              <h2 className="border-l-4 border-cta pl-2 text-sm font-bold text-ink">Lịch sử đơn dịch vụ</h2>
              <div className="mt-4">
                <NotYet text="Backend chưa có API lịch sử đơn của khách hàng" />
              </div>
            </section>
          )}

          {tab === "security" && (
            <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
              <h2 className="border-l-4 border-cta pl-2 text-sm font-bold text-ink">Tài khoản & Bảo mật</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field label="TRẠNG THÁI TÀI KHOẢN" value={STATUS_LABEL[st]} />
                <Field label="TRẠNG THÁI GỐC (BACKEND)" value={customer.status || "—"} />
                <Field label="VAI TRÒ" value={customer.roles.length ? customer.roles.join(", ") : "—"} />
              </div>

              <h3 className="mt-5 text-[11px] font-semibold tracking-wider text-muted">QUYỀN ĐƯỢC CẤP</h3>
              {customer.permissions.length === 0 ? (
                <p className="mt-2 text-xs text-muted">Không có quyền riêng nào</p>
              ) : (
                <div className="mt-2 flex flex-wrap gap-2">
                  {customer.permissions.map((p) => (
                    <span
                      key={p}
                      className="rounded border border-line bg-field/60 px-2 py-1 text-[11px] font-medium text-body"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        {/* ===== Cột phải ===== */}
        <aside className="space-y-5">
          <section className="rounded-xl bg-slate-900 p-5 text-white shadow-sm">
            <div className="text-[11px] font-semibold tracking-wider text-slate-300">TỔNG TÍCH LŨY CHI TIÊU</div>
            <div className="mt-2 text-3xl font-bold">—</div>
            <div className="mt-1 text-[11px] text-slate-400">Chưa có API</div>
          </section>

          <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-ink">Chỉ số vận hành</h2>
            <div className="mt-3">
              <NotYet text="Backend chưa có API thống kê đơn, khiếu nại, KTV phục vụ" />
            </div>

            <div className="mt-5 space-y-2">
              {customer.phone ? (
                <a
                  href={`tel:${customer.phone.replace(/[^\d+]/g, "")}`}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-cta text-sm font-semibold text-white hover:brightness-95"
                >
                  <Phone className="size-4" /> Gọi điện thoại cho khách
                </a>
              ) : null}
              <button
                type="button"
                disabled
                title="Chưa có API"
                className="flex h-10 w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-blue-50 text-sm font-semibold text-blue-600 opacity-50"
              >
                <LifeBuoy className="size-4" /> Tạo yêu cầu hỗ trợ
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

function Field({ label, value, action }: { label: string; value: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-field/60 px-3 py-2.5">
      <div className="text-[10px] font-semibold tracking-wider text-muted">{label}</div>
      <div className="mt-1 flex items-center justify-between gap-2">
        <span className="truncate text-[13px] font-medium text-ink">{value}</span>
        {action}
      </div>
    </div>
  )
}

function NotYet({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-dashed border-slate-300 bg-field/40 p-4 text-xs text-muted">
      <Info className="mt-0.5 size-3.5 shrink-0" />
      <p>{text}</p>
    </div>
  )
}