"use client"

import Link from "next/link"
import { useState } from "react"
import {
  ArrowLeft, BadgeCheck, CalendarDays, Copy, KeyRound, Lock, LockOpen,
  MapPin, Phone, ShieldCheck, Smartphone, Star, UserRound, LifeBuoy,
  ClipboardList, ChevronRight,
} from "lucide-react"
import type { CustomerDetail } from "@/lib/admin/mock-customer-detail"
import { CustomerOrdersTab } from "@/components/admin/customers/customer-orders-tab"

type Tab = "info" | "orders" | "security"

const money = (n: number) => `${n.toLocaleString("vi-VN")} đ`

const formatDate = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split("-")
  return `${d}/${m}/${y}`
}

function age(dob: string) {
  const b = new Date(dob)
  const n = new Date()
  let a = n.getFullYear() - b.getFullYear()
  if (n < new Date(n.getFullYear(), b.getMonth(), b.getDate())) a--
  return a
}

// "1 năm 9 tháng 12 ngày"
function since(iso: string) {
  const from = new Date(iso)
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
  return [y && `${y} năm`, m && `${m} tháng`, `${d} ngày`].filter(Boolean).join(" ")
}

const initials = (name: string) =>
  name.trim().split(/\s+/).slice(-2).map((w) => w[0]).join("").toUpperCase()

const STATUS_BADGE = {
  active: { text: "Đang hoạt động", cls: "bg-emerald-50 text-emerald-600" },
  inactive: { text: "Chưa kích hoạt", cls: "bg-blue-50 text-blue-600" },
  locked: { text: "Đã khóa", cls: "bg-red-50 text-red-500" },
} as const


export function CustomerDetailView({ customer }: { customer: CustomerDetail }) {
  const [tab, setTab] = useState<Tab>("info")
  const [locked, setLocked] = useState(customer.status === "locked")
  const [copied, setCopied] = useState(false)
  //const [showAllOrders, setShowAllOrders] = useState(false)

  const badge = locked ? STATUS_BADGE.locked : STATUS_BADGE[customer.status === "locked" ? "active" : customer.status]
  const { stats } = customer
  //const orders = showAllOrders ? customer.orders : customer.orders.slice(0, 8)

  async function copyPhone() {
    try {
      await navigator.clipboard.writeText(customer.phone)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* trình duyệt chặn clipboard: bỏ qua */
    }
  }

  function toggleLock() {
    const ok = window.confirm(
      locked ? `Mở khóa tài khoản "${customer.name}"?` : `Khóa tài khoản "${customer.name}"?`,
    )
    if (!ok) return
    // TODO: gọi API khóa / mở khóa tài khoản
    setLocked(!locked)
  }

  function resetPassword() {
    if (!window.confirm(`Gửi yêu cầu đặt lại mật khẩu cho "${customer.name}"?`)) return
    // TODO: gọi API đặt lại mật khẩu
    console.log("Reset mật khẩu", customer.id)
  }

  const tabs: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "info", label: "Thông tin", icon: UserRound },
    { key: "orders", label: `Lịch sử đơn (${customer.orders.length})`, icon: ClipboardList },
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
          {/* Đầu hồ sơ */}
          <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="flex size-16 items-center justify-center rounded-full bg-indigo-50 text-lg font-bold text-indigo-600 ring-2 ring-emerald-400">
                  {initials(customer.name)}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-bold text-ink">{customer.name}</h1>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${badge.cls}`}>
                      ● {badge.text}
                    </span>
                    {customer.vip && (
                      <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[11px] font-semibold text-cta">
                        ★ {customer.segment}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted">
                    <span>{customer.code}</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3" /> {customer.district}, {customer.city}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetPassword}
                  className="flex h-9 items-center gap-2 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink hover:bg-field"
                >
                  <KeyRound className="size-3.5" /> Đặt lại mật khẩu
                </button>
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
            </div>

            {/* Tab */}
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

          {/* ===== Tab: Thông tin ===== */}
          {tab === "info" && (
            <>
              <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="border-l-4 border-cta pl-2 text-sm font-bold text-ink">
                    Thông tin hồ sơ khách hàng
                  </h2>
                  {customer.phoneVerified && (
                    <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-600">
                      <BadgeCheck className="size-3" /> Dữ liệu xác thực số điện thoại
                    </span>
                  )}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="HỌ VÀ TÊN" value={customer.name} />
                  <Field
                    label="SỐ ĐIỆN THOẠI LIÊN HỆ"
                    value={customer.phone}
                    action={
                      <button type="button" onClick={copyPhone} className="flex items-center gap-1 text-[11px] font-semibold text-cta hover:underline">
                        <Copy className="size-3" /> {copied ? "Đã chép" : "Sao chép"}
                      </button>
                    }
                  />
                  <Field label="HỘP THƯ ĐIỆN TỬ" value={customer.email} />
                  <Field label="NGÀY SINH" value={`${formatDate(customer.dob)} (${age(customer.dob)} tuổi)`} />
                  <Field label="GIỚI TÍNH" value={customer.gender} />
                </div>

                <div className="mt-4 rounded-lg bg-field/60 p-4">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <CalendarDays className="size-3.5" /> NGÀY THAM GIA HỆ THỐNG:
                    </span>
                    <b className="text-ink">{formatDate(customer.createdAt)}</b>
                    <span>(Thời gian gắn bó: {since(customer.createdAt)})</span>
                  </div>
                  <span className="mt-2 inline-block rounded bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-600">
                    {stats.done >= 10 ? "Khách hàng kỳ cựu" : "Khách hàng mới"}
                  </span>
                </div>
              </section>

              <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
                    <MapPin className="size-4 text-cta" /> Địa chỉ phục vụ
                  </h2>
                  <button type="button" className="flex items-center gap-1 text-xs font-semibold text-cta hover:underline">
                    Xem tất cả địa chỉ <ChevronRight className="size-3.5" />
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {customer.addresses.map((a) => (
                    <div
                      key={a.id}
                      className={`rounded-lg border p-4 ${a.isDefault ? "border-orange-200 bg-orange-50/50" : "border-line bg-field/40"}`}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-ink">{a.title}</span>
                        {a.isDefault && (
                          <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            Mặc định
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-body">{a.line}</p>
                      {a.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-3 text-[11px] font-medium text-cta">
                          {a.tags.map((t) => <span key={t}>● {t}</span>)}
                        </div>
                      )}
                      {a.note && <p className="mt-1 text-[11px] italic text-muted">{a.note}</p>}
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* ===== Tab: Lịch sử đơn ===== */}
          {tab === "orders" && <CustomerOrdersTab orders={customer.orders} />}

          {/* ===== Tab: Tài khoản & Bảo mật ===== */}
          {tab === "security" && (
            <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
              <h2 className="border-l-4 border-cta pl-2 text-sm font-bold text-ink">Tài khoản & Bảo mật</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field label="TRẠNG THÁI TÀI KHOẢN" value={locked ? "Đã khóa" : STATUS_BADGE[customer.status === "locked" ? "active" : customer.status].text} />
                <Field label="XÁC THỰC SỐ ĐIỆN THOẠI" value={customer.phoneVerified ? "Đã xác thực" : "Chưa xác thực"} />
                <Field label="ĐĂNG NHẬP GẦN NHẤT" value={`${formatDate(customer.security.lastLogin)} · ${customer.security.lastLogin.slice(11, 16)}`} />
                <Field label="THIẾT BỊ GẦN NHẤT" value={customer.security.device} />
                <Field label="XÁC THỰC 2 BƯỚC" value={customer.security.twoFactor ? "Đang bật" : "Chưa bật"} />
                <Field label="ĐĂNG NHẬP SAI LIÊN TIẾP" value={`${customer.security.failedLogins} lần`} />
              </div>
              <p className="mt-4 flex items-center gap-2 text-xs text-muted">
                <Smartphone className="size-3.5" /> Thông tin phiên đăng nhập chỉ để quản trị viên tham khảo.
              </p>
            </section>
          )}
        </div>

        {/* ===== Cột phải ===== */}
        <aside className="space-y-5">
          <section className="rounded-xl bg-slate-900 p-5 text-white shadow-sm">
            <div className="text-[11px] font-semibold tracking-wider text-slate-300">TỔNG TÍCH LŨY CHI TIÊU</div>
            <div className="mt-2 text-3xl font-bold">{money(customer.totalSpent)}</div>
          </section>

          <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-ink">Chỉ số vận hành</h2>
              <span className="text-[11px] text-muted">Tỷ lệ tin cậy: <b className="text-ink">{stats.trust}%</b></span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <Stat label="Tổng đơn đặt" value={stats.total} unit="đơn" />
              <Stat
                label="Hoàn thành"
                value={stats.done}
                valueClass="text-emerald-600"
                note={stats.total ? `(${((stats.done / stats.total) * 100).toFixed(1)}%)` : undefined}
              />
              <Stat
                label="Đơn hủy"
                value={stats.cancelled}
                valueClass="text-amber-600"
                note={stats.total ? `(${((stats.cancelled / stats.total) * 100).toFixed(1)}% an toàn)` : undefined}
              />
              <Stat label="Khiếu nại" value={stats.complaints} unit="lần" />
            </div>

            <h3 className="mt-5 text-[11px] font-semibold tracking-wider text-muted">KTV PHỤC VỤ GẦN ĐÂY</h3>
            <div className="mt-2 space-y-2">
              {customer.technicians.map((t) => (
                <div key={t.name} className="rounded-lg border border-line bg-field/40 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-ink">{t.name}</span>
                    {t.rating !== undefined && (
                      <span className="flex text-amber-400" aria-label={`${t.rating} sao`}>
                        {Array.from({ length: t.rating }, (_, i) => (
                          <Star key={i} className="size-3 fill-current" />
                        ))}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted">{t.specialty}</div>
                  <div className="text-[11px] text-body">{t.comment}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-2">
              <a
                href={`tel:${customer.phone.replace(/[^\d]/g, "")}`}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-cta text-sm font-semibold text-white hover:brightness-95"
              >
                <Phone className="size-4" /> Gọi điện thoại cho khách
              </a>
              <button
                type="button"
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-50 text-sm font-semibold text-blue-600 hover:bg-blue-100"
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

function Stat({
  label, value, unit, note, valueClass = "text-ink",
}: { label: string; value: number; unit?: string; note?: string; valueClass?: string }) {
  return (
    <div className="rounded-lg bg-blue-50/50 p-3">
      <div className="text-[11px] text-muted">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className={`text-2xl font-bold ${valueClass}`}>{value}</span>
        {unit && <span className="text-xs text-muted">{unit}</span>}
        {note && <span className="text-[11px] text-muted">{note}</span>}
      </div>
    </div>
  )
}