"use client"

import { useState } from "react"
import {
  Briefcase, Eye, EyeOff, Info, KeyRound, Lock, LockOpen, LogOut, ShieldCheck,
} from "lucide-react"
import {
  genderLabel, verificationLabel, verificationTone, type TechnicianDetail,
} from "@/lib/admin/technician-detail-utils"

// ---------- tiện ích ----------
export const dmy = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split("-")
  return `${d}/${m}/${y}`
}
export const hm = (iso: string) => iso.slice(11, 16)

// Đổi giờ UTC của backend sang giờ Việt Nam
export function dmyHm(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Ho_Chi_Minh",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(d)
      .map((x) => [x.type, x.value]),
  )
  return `${p.day}/${p.month}/${p.year} • ${p.hour}:${p.minute}`
}

const dash = (v: string | null | undefined) => (v && v.trim() ? v : "—")
const maskId = (id: string) =>
  id.length >= 8 ? `${id.slice(0, 3)}${"●".repeat(id.length - 6)}${id.slice(-3)}` : "●".repeat(id.length)

function Card({
  title, icon: Icon, right, children,
}: {
  title: string
  icon?: React.ComponentType<{ className?: string }>
  right?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
          {Icon && <Icon className="size-4 text-cta" />} {title}
        </h2>
        {right}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function Field({ label, value, action }: { label: string; value: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-field/60 px-3 py-2.5">
      <div className="text-[10px] font-semibold tracking-wider text-muted">{label}</div>
      <div className="mt-1 flex items-start justify-between gap-2">
        <span className="break-words text-[13px] font-medium text-ink">{value}</span>
        {action}
      </div>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-dashed border-slate-300 bg-field/40 p-4 text-xs text-muted">
      <Info className="mt-0.5 size-3.5 shrink-0" />
      <p>{text}</p>
    </div>
  )
}

// ---------- Tab 1: Thông tin ----------
export function InfoTab({ t }: { t: TechnicianDetail }) {
  const [showId, setShowId] = useState(false)
  const dial = (t.phone ?? "").replace(/[^\d+]/g, "")
  const gender = genderLabel(t.gender)

  return (
    <div className="space-y-5">
      <Card title="Thông tin cá nhân & Đối tác" icon={Briefcase}>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-3">
            <Field label="HỌ VÀ TÊN" value={t.name} />
            <Field
              label="SỐ ĐIỆN THOẠI LIÊN HỆ"
              value={dash(t.phone)}
              action={
                dial ? (
                  <a href={`tel:${dial}`} className="text-[11px] font-semibold text-cta hover:underline">
                    Gọi nhanh
                  </a>
                ) : null
              }
            />
            <Field label="EMAIL CÔNG VIỆC" value={dash(t.email)} />
            <Field
              label="CCCD / MÃ ĐỊNH DANH"
              value={t.citizenId ? (showId ? t.citizenId : maskId(t.citizenId)) : "—"}
              action={
                t.citizenId ? (
                  <button
                    type="button"
                    onClick={() => setShowId((v) => !v)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-cta hover:underline"
                  >
                    {showId ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                    {showId ? "Ẩn" : "Hiện"}
                  </button>
                ) : null
              }
            />
            <Field label="NGÀY SINH" value={t.dateOfBirth ? dmy(t.dateOfBirth) : "—"} />
            <Field label="GIỚI TÍNH" value={dash(gender)} />
          </div>

          <div className="space-y-3">
            <Field
              label="ĐỊA CHỈ HIỆN TẠI"
              value={t.address ? `${t.address}${t.wardCode ? ` (mã phường ${t.wardCode})` : ""}` : "—"}
            />
            <Field label="NGƯỜI LIÊN HỆ KHẨN CẤP" value={dash(t.emergencyName)} />
            <Field label="QUAN HỆ" value={dash(t.emergencyRelationship)} />
            <Field label="SĐT LIÊN HỆ KHẨN CẤP" value={dash(t.emergencyPhone)} />
            <Field
              label="TRẠNG THÁI HỒ SƠ"
              value={
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${verificationTone(t.verificationStatus)}`}>
                  {verificationLabel(t.verificationStatus)}
                </span>
              }
            />
            {t.verificationRejectionReason && (
              <Field label="LÝ DO TỪ CHỐI" value={t.verificationRejectionReason} />
            )}
            <Field label="NGÀY XÁC MINH" value={t.verifiedAt ? dmy(t.verifiedAt) : "—"} />
          </div>
        </div>

        {/* TODO: chuyên môn, khu vực hoạt động, bán kính, ngày gia nhập chưa có trong API */}
        <p className="mt-4 text-[11px] text-muted">
          Chuyên môn, khu vực hoạt động và ngày gia nhập sẽ hiển thị khi backend cung cấp dữ liệu.
        </p>
      </Card>

      <Card title="Giấy tờ định danh" icon={ShieldCheck}>
        {t.identityMedia.length === 0 ? (
          <Empty text="Chưa có giấy tờ định danh nào được tải lên" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {t.identityMedia.map((m) => (
              <a
                key={m.id}
                href={m.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block overflow-hidden rounded-lg border border-line bg-field/40"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt={m.type} className="h-36 w-full object-cover" />
                <div className="px-3 py-2 text-[11px] font-semibold text-body group-hover:text-cta">{m.type}</div>
              </a>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

// ---------- Các tab chưa có API ----------
export function PendingTab({ title, need }: { title: string; need: string }) {
  return (
    <Card title={title}>
      <Empty text={`Chưa có dữ liệu. ${need} Giao diện sẽ được nối khi backend cung cấp API này.`} />
    </Card>
  )
}

// ---------- Tab 6: Tài khoản & Nhật ký ----------
type AccountProps = {
  t: TechnicianDetail
  locked: boolean
  onToggleLock: () => void
  onResetPassword: () => void
  onRevokeSessions: () => void
}

export function AccountTab({ t, locked, onToggleLock, onResetPassword, onRevokeSessions }: AccountProps) {
  const [sub, setSub] = useState<"account" | "log">("account")

  return (
    <Card
      title="Tài khoản KTV"
      icon={ShieldCheck}
      right={
        <div className="flex rounded-lg border border-line p-0.5" role="tablist">
          {([["account", "Tài khoản"], ["log", "Nhật ký"]] as const).map(([k, l]) => (
            <button
              key={k}
              role="tab"
              aria-selected={sub === k}
              onClick={() => setSub(k)}
              className={`rounded-md px-3 py-1 text-xs font-semibold ${sub === k ? "bg-field text-ink" : "text-muted hover:text-ink"}`}
            >
              {l}
            </button>
          ))}
        </div>
      }
    >
      {sub === "log" ? (
        <Empty text="Chưa có dữ liệu. Cần API nhật ký hoạt động của tài khoản KTV." />
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border border-line p-4">
            <h3 className="text-xs font-bold text-ink">Thông tin đăng nhập</h3>
            <dl className="mt-3 space-y-2 text-xs">
              <Row label="Số điện thoại">{dash(t.phone)}</Row>
              <Row label="Email">{dash(t.email)}</Row>
              <Row label="Mã tài khoản">{t.accountId}</Row>
              <Row label="Trạng thái tài khoản">{t.statusRaw}</Row>
              <Row label="Cập nhật gần nhất">{t.updatedAt ? dmyHm(t.updatedAt) : "—"}</Row>
            </dl>
          </div>

          <div className="rounded-lg border border-line p-4">
            <h3 className="text-xs font-bold text-ink">Bảo mật & phiên đăng nhập</h3>
            <div className="mt-3 space-y-3">
              <ActionRow
                icon={KeyRound}
                title="Mật khẩu đăng nhập"
                note="Gửi yêu cầu đặt lại mật khẩu cho KTV"
                button="Đặt lại mật khẩu"
                onClick={onResetPassword}
              />
              <ActionRow
                icon={LogOut}
                title="Thu hồi phiên đăng nhập"
                note="Yêu cầu KTV đăng nhập lại trên tất cả thiết bị"
                button="Đăng xuất tất cả"
                onClick={onRevokeSessions}
              />
            </div>
          </div>

          <div className="rounded-lg border border-red-100 bg-red-50/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold text-ink">{locked ? "Mở khóa tài khoản KTV" : "Tạm khóa tài khoản KTV"}</h3>
                <p className="mt-0.5 text-[11px] text-muted">
                  {locked
                    ? "KTV sẽ đăng nhập và nhận việc lại được."
                    : "Ngừng quyền đăng nhập, các đơn đang thực hiện cần được chuyển cho KTV khác."}
                </p>
              </div>
              <button
                type="button"
                onClick={onToggleLock}
                className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold ${
                  locked
                    ? "border-emerald-200 bg-white text-emerald-600 hover:bg-emerald-50"
                    : "border-red-200 bg-white text-red-500 hover:bg-red-50"
                }`}
              >
                {locked ? <LockOpen className="size-3.5" /> : <Lock className="size-3.5" />}
                {locked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-ink">{children}</dd>
    </div>
  )
}

function ActionRow({
  icon: Icon, title, note, button, onClick,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  note: string
  button: string
  onClick: () => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 size-4 text-muted" />
        <div>
          <div className="text-xs font-semibold text-ink">{title}</div>
          <div className="text-[11px] text-muted">{note}</div>
        </div>
      </div>
      <button
        type="button"
        onClick={onClick}
        className="h-8 rounded-lg border border-line bg-white px-3 text-[11px] font-semibold text-ink hover:bg-field"
      >
        {button}
      </button>
    </div>
  )
}