"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  ClipboardList, FileText, LockOpen, Lock, MapPin, Navigation, Phone, Send,
  ShieldCheck, TriangleAlert, UserRound, Wrench, X, Eye, EyeOff,
} from "lucide-react"
import {
  formatPhone, maskPhone,
  type OpStatus, type OpTechDetail, type SkillCard, type Violation,
} from "@/lib/operator/mock-technicians"
import { initials } from "@/lib/admin/customer-utils"

type TabKey = "info" | "profile" | "orders" | "reviews"
type Dialog = null | "lock" | "violation" | "notify" | { reviewSkill: string }

const money = (n: number) => `${n.toLocaleString("vi-VN")} đ`
const dmy = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split("-")
  return `${d}/${m}/${y}`
}

// "3 năm 7 tháng"
function since(iso: string) {
  const from = new Date(`${iso}T00:00:00`)
  const now = new Date()
  let months = (now.getFullYear() - from.getFullYear()) * 12 + now.getMonth() - from.getMonth()
  if (now.getDate() < from.getDate()) months--
  months = Math.max(months, 0)
  const y = Math.floor(months / 12)
  const m = months % 12
  return [y > 0 && `${y} năm`, m > 0 && `${m} tháng`].filter(Boolean).join(" ") || "Dưới 1 tháng"
}

const STATUS_PILL: Record<OpStatus, { text: string; cls: string }> = {
  active: { text: "Hoạt động", cls: "bg-blue-50 text-blue-600" },
  suspended: { text: "Tạm khóa", cls: "bg-orange-100 text-orange-700" },
  locked: { text: "Đã khóa", cls: "bg-red-50 text-red-500" },
}

const SKILL_BADGE = {
  approved: { text: "Đã duyệt", cls: "bg-emerald-50 text-emerald-600" },
  pending: { text: "Chờ thẩm định", cls: "bg-amber-100 text-amber-700" },
  missing: { text: "Chưa nộp minh chứng", cls: "bg-slate-100 text-slate-600" },
  rejected: { text: "Không đạt", cls: "bg-red-50 text-red-500" },
} as const

export function TechnicianProfile({ tech }: { tech: OpTechDetail }) {
  const [tab, setTab] = useState<TabKey>("info")
  const [status, setStatus] = useState<OpStatus>(tech.status)
  const [skills, setSkills] = useState<SkillCard[]>(tech.skillCards)
  const [violations, setViolations] = useState<Violation[]>(tech.violations)
  const [note, setNote] = useState(tech.internalNote)
  const [editingNote, setEditingNote] = useState(false)
  const [noteDraft, setNoteDraft] = useState(tech.internalNote)
  const [showPhone, setShowPhone] = useState(false)
  const [dialog, setDialog] = useState<Dialog>(null)
  const [notice, setNotice] = useState("")

  useEffect(() => {
    if (!notice) return
    const id = setTimeout(() => setNotice(""), 4000)
    return () => clearTimeout(id)
  }, [notice])

  const available = status === "active" && tech.available
  const pill = STATUS_PILL[status]
  const needsAttention = skills.some((s) => s.state === "pending" || s.state === "missing")
  const safeCancel = tech.stats.cancel <= 10

  function unlock() {
    if (!window.confirm(`Mở khóa tài khoản của "${tech.name}"?`)) return
    // TODO: gọi API mở khóa tài khoản KTV
    setStatus("active")
    setNotice("Đã mở khóa tài khoản")
  }

  const tabs: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "info", label: "Thông tin", icon: UserRound },
    { key: "profile", label: "Hồ sơ & nghiệp vụ", icon: ShieldCheck },
    { key: "orders", label: "Đơn gần đây", icon: ClipboardList },
    { key: "reviews", label: "Đánh giá & vi phạm", icon: TriangleAlert },
  ]

  return (
    <div className="space-y-5">
      <nav className="flex items-center gap-1.5 text-xs text-muted" aria-label="Breadcrumb">
        <Link href="/operator/technicians" className="hover:text-ink">Danh sách KTV</Link>
        <span>&gt;</span>
        <span className="font-semibold text-ink">{tech.name}</span>
      </nav>

      {notice && (
        <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
          {notice}
        </p>
      )}

      {/* Đầu hồ sơ */}
      <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <span className="flex size-16 items-center justify-center rounded-full bg-orange-50 text-lg font-bold text-orange-600">
                {initials(tech.name)}
              </span>
              <span className={`absolute bottom-0.5 right-0.5 size-3.5 rounded-full ring-2 ring-white ${available ? "bg-emerald-500" : "bg-slate-300"}`} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-ink">{tech.name}</h1>
                <span className="rounded bg-field px-2 py-0.5 text-[11px] font-semibold text-body">{tech.code}</span>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                <span className={`rounded-full px-2.5 py-0.5 ${available ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                  Nhận việc: {available ? "Đang bật" : "Đang tắt"}
                </span>
                <span className={`rounded-full px-2.5 py-0.5 ${pill.cls}`}>Tài khoản: {pill.text}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-1 text-xs text-muted">
                <MapPin className="size-3" /> {tech.district}, {tech.city}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`tel:${tech.phoneFull}`}
              className="flex h-9 items-center gap-2 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink hover:bg-field"
            >
              <Phone className="size-3.5" /> Gọi KTV
            </a>
            <button
              type="button"
              onClick={() => setDialog("violation")}
              className="flex h-9 items-center gap-2 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink hover:bg-field"
            >
              <TriangleAlert className="size-3.5 text-amber-500" /> Ghi nhận vi phạm
            </button>
            {status === "active" ? (
              <button
                type="button"
                onClick={() => setDialog("lock")}
                className="flex h-9 items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-500 hover:bg-red-100"
              >
                <Lock className="size-3.5" /> Tạm khóa / Khóa
              </button>
            ) : (
              <button
                type="button"
                onClick={unlock}
                className="flex h-9 items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-600 hover:bg-emerald-100"
              >
                <LockOpen className="size-3.5" /> Mở khóa
              </button>
            )}
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
                tab === key ? "bg-slate-900 text-white" : "text-body hover:bg-field"
              }`}
            >
              <Icon className="size-3.5" /> {label}
              {key === "profile" && needsAttention && (
                <span className="size-1.5 rounded-full bg-orange-500" aria-label="Có hồ sơ cần xử lý" />
              )}
            </button>
          ))}
        </div>
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          {/* ===== Tab: Thông tin ===== */}
          {tab === "info" && (
            <>
              <Card title="Lý lịch cá nhân" icon={UserRound} right={<span className="text-[11px] text-muted">CẬP NHẬT LẦN CUỐI: {dmy(tech.updatedAt)}</span>}>
                <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                  <Info label="Họ và tên" value={tech.name} />
                  <Info
                    label="Số điện thoại liên hệ"
                    value={
                      <span className="flex flex-wrap items-center gap-2">
                        {showPhone ? formatPhone(tech.phoneFull) : maskPhone(tech.phoneFull)}
                        <button
                          type="button"
                          onClick={() => {
                            // TODO: ghi nhật ký kiểm toán mỗi lần xem số đầy đủ
                            setShowPhone((v) => !v)
                          }}
                          className="flex items-center gap-1 rounded border border-line px-1.5 py-0.5 text-[10px] font-semibold text-cta hover:bg-field"
                        >
                          {showPhone ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                          {showPhone ? "Ẩn SĐT" : "Hiện SĐT"}
                        </button>
                      </span>
                    }
                  />
                  <Info label="Email" value={tech.email} />
                  <Info label="Ngày sinh" value={dmy(tech.dob)} />
                  <Info label="Địa bàn trực & Phân cống chính" value={tech.workAreas} />
                  <Info label="Địa chỉ thường trú" value={tech.address} />
                </div>
              </Card>

              <Card title="Phê duyệt" icon={FileText}>
                <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                  <Info label="Thời gian gia nhập hệ thống" value={`${dmy(tech.joinedAt)} (Đã hợp tác ${since(tech.joinedAt)})`} />
                  <Info
                    label="Nhân viên phê duyệt hồ sơ"
                    value={
                      <span className="flex items-center gap-2">
                        <span className="flex size-6 items-center justify-center rounded-full bg-field text-[10px] font-bold text-body">
                          {initials(tech.approver)}
                        </span>
                        {tech.approver}
                      </span>
                    }
                  />
                </div>

                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/60 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-amber-800">Ghi chú nội bộ vận hành</span>
                    <span className="text-[10px] text-amber-700">Chỉ nội bộ vận hành nhìn thấy</span>
                  </div>
                  {editingNote ? (
                    <div className="mt-2">
                      <textarea
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        rows={4}
                        maxLength={500}
                        className="w-full resize-none rounded-lg border border-line bg-white p-3 text-xs text-ink outline-none focus:border-cta"
                      />
                      <div className="mt-2 flex justify-end gap-2">
                        <button type="button" onClick={() => { setNoteDraft(note); setEditingNote(false) }} className="h-8 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink hover:bg-field">
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            // TODO: gọi API lưu ghi chú nội bộ
                            setNote(noteDraft.trim())
                            setEditingNote(false)
                            setNotice("Đã lưu ghi chú nội bộ")
                          }}
                          className="h-8 rounded-lg bg-cta px-3 text-xs font-semibold text-white hover:brightness-95"
                        >
                          Lưu
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="mt-2 text-xs italic leading-relaxed text-amber-900">
                        {note ? `“${note}”` : "Chưa có ghi chú nào."}
                      </p>
                      <button type="button" onClick={() => setEditingNote(true)} className="mt-2 text-[11px] font-semibold text-cta hover:underline">
                        {note ? "Sửa ghi chú" : "Thêm ghi chú"}
                      </button>
                    </>
                  )}
                </div>
              </Card>
            </>
          )}

          {/* ===== Tab: Hồ sơ & nghiệp vụ ===== */}
          {tab === "profile" && (
            <>
              <Card
                title="1. Thẩm định hồ sơ cá nhân & định danh pháp lý"
                icon={ShieldCheck}
                right={<span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">✓ Đã phê duyệt</span>}
              >
                <button
                  type="button"
                  disabled
                  title="Chưa có API ảnh giấy tờ"
                  className="cursor-not-allowed text-xs font-semibold text-cta opacity-60"
                >
                  Xem chi tiết hồ sơ gốc & ảnh giấy tờ
                </button>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {tech.docs.map((d) => (
                    <div key={d.label} className="rounded-lg border border-line bg-field/40 p-3">
                      <div className="text-xs font-semibold text-ink">{d.label}</div>
                      <span className="mt-1.5 inline-block rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600">
                        {d.state}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="2. Danh mục nghiệp vụ chuyên môn kỹ thuật" icon={Wrench}>
                <div className="grid gap-3 md:grid-cols-2">
                  {skills.map((s) => (
                    <SkillCardView
                      key={s.id}
                      s={s}
                      onReview={() => setDialog({ reviewSkill: s.id })}
                      onRemind={() => {
                        // TODO: gọi API gửi nhắc nhở qua App KTV
                        setNotice(`Đã gửi nhắc nhở bổ sung minh chứng "${s.title}" qua App`)
                      }}
                    />
                  ))}
                </div>
              </Card>
            </>
          )}

          {/* ===== Tab: Đơn gần đây ===== */}
          {tab === "orders" && (
            <Card title={`${tech.orders.length} đơn dịch vụ gần nhất`} icon={ClipboardList}>
              {tech.orders.length === 0 ? (
                <Empty text="Chưa có dữ liệu đơn của kỹ thuật viên này (backend chưa có API)." />
              ) : (
                <div className="overflow-x-auto rounded-lg border border-line">
                  <table className="w-full min-w-[560px] text-left">
                    <thead className="bg-field/60 text-[11px] font-semibold uppercase text-muted">
                      <tr>
                        <th className="px-4 py-3">Mã đơn</th>
                        <th className="px-4 py-3">Khách hàng</th>
                        <th className="px-4 py-3">Dịch vụ</th>
                        <th className="px-4 py-3">Ngày</th>
                        <th className="px-4 py-3 text-right">Chi phí</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {tech.orders.map((o) => (
                        <tr key={o.code} className="hover:bg-field/40">
                          <td className="px-4 py-3 text-xs font-bold text-cta">{o.code}</td>
                          <td className="px-4 py-3 text-xs font-medium text-ink">{o.customer}</td>
                          <td className="px-4 py-3 text-xs text-body">{o.service}</td>
                          <td className="px-4 py-3 text-xs text-body">{dmy(o.date)}</td>
                          <td className="px-4 py-3 text-right text-xs font-bold text-ink">{money(o.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {/* ===== Tab: Đánh giá & vi phạm ===== */}
          {tab === "reviews" && (
            <>
              <Card
                title="Đánh giá trung bình từ khách hàng"
                right={<span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">Độ hài lòng {tech.satisfaction}%</span>}
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-ink">{tech.rating.toFixed(2)}</span>
                  <span className="text-xl text-amber-400">★</span>
                  <span className="text-[11px] text-muted">{tech.reviews.length} đánh giá thực tế gần nhất</span>
                </div>

                {tech.reviews.length === 0 ? (
                  <div className="mt-4"><Empty text="Chưa có đánh giá nào để hiển thị." /></div>
                ) : (
                  <ul className="mt-4 divide-y divide-line">
                    {tech.reviews.map((r) => (
                      <li key={r.id} className="py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-semibold text-ink">{r.customer}</span>
                            <span className="text-xs tracking-tight text-amber-400" aria-label={`${r.rating} sao`}>
                              {"★".repeat(r.rating)}
                              <span className="text-slate-300">{"★".repeat(5 - r.rating)}</span>
                            </span>
                          </div>
                          <span className="text-[11px] text-muted">{dmy(r.date)}</span>
                        </div>
                        <p className="mt-1 text-xs italic leading-relaxed text-body">“{r.comment}”</p>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <Card
                title="Lịch sử vi phạm quy chuẩn"
                icon={TriangleAlert}
                right={<span className="rounded-full bg-field px-2.5 py-1 text-[11px] font-semibold text-body">Tổng {violations.length} vụ</span>}
              >
                {violations.length === 0 ? (
                  <Empty text="Kỹ thuật viên chưa có vi phạm nào." />
                ) : (
                  <ul className="space-y-2">
                    {violations.map((v) => (
                      <li key={v.id} className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-red-100 bg-red-50/50 p-3">
                        <div className="flex items-start gap-2">
                          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-red-500" />
                          <div>
                            <div className="text-xs font-semibold text-ink">{v.title}</div>
                            <div className="text-[11px] text-muted">
                              Ngày ghi nhận: {dmy(v.date)}{v.orderCode ? ` • Đơn hàng ${v.orderCode}` : ""}
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] text-body">
                          Hình thức: <b className="text-ink">{v.action}</b>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </>
          )}
        </div>

        {/* ===== Cột phải (luôn hiển thị) ===== */}
        <aside className="space-y-4">
          <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
                <ShieldCheck className="size-4 text-cta" /> Chỉ số vận hành KTV
              </h2>
              <span className={`size-2 rounded-full ${available ? "bg-emerald-500" : "bg-slate-300"}`} />
            </div>

            <dl className="mt-4 space-y-3">
              <Metric label="Đánh giá trung bình" note={`${tech.stats.ratingCount.toLocaleString("vi-VN")} lượt đánh giá`}>
                <span className="font-bold text-ink">{tech.rating.toFixed(2)} <span className="text-amber-400">★</span></span>
              </Metric>
              <Metric label="Tỷ lệ hoàn thành" note="Đạt chỉ tiêu vận hành">
                <span className="font-bold text-ink">{tech.stats.completion}%</span>
              </Metric>
              <Metric label="Tỷ lệ KTV hủy" note={safeCancel ? "Xanh an toàn (ngưỡng >10%)" : "Vượt ngưỡng cảnh báo (>10%)"}>
                <span className={`font-bold ${safeCancel ? "text-emerald-600" : "text-red-600"}`}>
                  {tech.stats.cancel}% {safeCancel ? "✓" : "!"}
                </span>
              </Metric>
            </dl>

            <div className={`mt-4 rounded-lg border p-4 ${tech.stats.heldCash > 0 ? "border-orange-200 bg-orange-50/70" : "border-emerald-200 bg-emerald-50/60"}`}>
              <div className="text-[11px] font-semibold text-body">Tiền đang giữ chưa nộp</div>
              <div className={`mt-1 text-2xl font-bold ${tech.stats.heldCash > 0 ? "text-orange-600" : "text-emerald-600"}`}>
                {money(tech.stats.heldCash)}
              </div>
              <button
                type="button"
                disabled
                title="Chưa có trang thu tiền"
                className="mt-1 cursor-not-allowed text-[11px] font-semibold text-cta opacity-60"
              >
                Xem công nợ &gt;
              </button>
            </div>

            <div className="mt-4 flex items-start justify-between text-xs">
              <span className="text-muted">Hoạt động gần nhất</span>
              <span className="text-right font-semibold text-ink">
                {tech.stats.lastActive}
                <span className="block text-[10px] font-normal text-muted">Hoàn tất đơn {tech.stats.lastOrder}</span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => setDialog("notify")}
              className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-cta text-sm font-semibold text-white hover:brightness-95"
            >
              <Send className="size-4" /> Gửi thông báo đến App KTV
            </button>
          </section>

          <section className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white p-4 shadow-sm">
            <div>
              <div className="text-[10px] font-semibold tracking-wider text-muted">VỊ TRÍ GPS HIỆN TẠI (APP)</div>
              <div className="mt-1 text-sm font-semibold text-ink">{tech.stats.gps}</div>
            </div>
            <Navigation className="size-4 shrink-0 text-cta" />
          </section>
        </aside>
      </div>

      {/* ===== Hộp thoại ===== */}
      {dialog === "lock" && (
        <LockDialog
          name={tech.name}
          onClose={() => setDialog(null)}
          onConfirm={(mode) => {
            // TODO: gọi API tạm khóa / khóa tài khoản (kèm lý do)
            setStatus(mode)
            setDialog(null)
            setNotice(mode === "suspended" ? "Đã tạm khóa tài khoản" : "Đã khóa tài khoản")
          }}
        />
      )}
      {dialog === "violation" && (
        <ViolationDialog
          onClose={() => setDialog(null)}
          onSave={(v) => {
            // TODO: gọi API ghi nhận vi phạm
            setViolations((list) => [{ ...v, id: `v${Date.now()}`, date: new Date().toISOString().slice(0, 10) }, ...list])
            setDialog(null)
            setTab("reviews")
            setNotice("Đã ghi nhận vi phạm")
          }}
        />
      )}
      {dialog === "notify" && (
        <NotifyDialog
          name={tech.name}
          onClose={() => setDialog(null)}
          onSend={(msg) => {
            // TODO: gọi API gửi thông báo đến App KTV
            console.log("Gửi thông báo", tech.id, msg)
            setDialog(null)
            setNotice(`Đã gửi thông báo đến ${tech.name}`)
          }}
        />
      )}
      {typeof dialog === "object" && dialog !== null && (
        <ReviewSkillDialog
          skill={skills.find((s) => s.id === dialog.reviewSkill)}
          onClose={() => setDialog(null)}
          onDecide={(ok, reason) => {
            // TODO: gọi API duyệt / từ chối nghiệp vụ
            const id = dialog.reviewSkill
            setSkills((list) =>
              list.map((s) => (s.id === id ? { ...s, state: ok ? "approved" : "rejected", note: ok ? undefined : reason } : s)),
            )
            setDialog(null)
            setNotice(ok ? "Đã duyệt nghiệp vụ" : "Đã từ chối nghiệp vụ")
          }}
        />
      )}
    </div>
  )
}

// ---------- thành phần nhỏ ----------
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

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] text-muted">{label}</div>
      <div className="mt-1 text-[13px] font-semibold text-ink">{value}</div>
    </div>
  )
}

function Metric({ label, note, children }: { label: string; note: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 text-xs">
      <div>
        <dt className="text-muted">{label}</dt>
        <dd className="text-[10px] text-muted">{note}</dd>
      </div>
      <div className="text-sm">{children}</div>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-field/40 p-4 text-xs text-muted">{text}</div>
  )
}

function SkillCardView({
  s, onReview, onRemind,
}: { s: SkillCard; onReview: () => void; onRemind: () => void }) {
  const badge = SKILL_BADGE[s.state]
  return (
    <div className="flex flex-col rounded-lg border border-line p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[13px] font-bold text-ink">{s.title}</div>
          <div className="text-[11px] text-muted">{s.subtitle}</div>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.cls}`}>{badge.text}</span>
      </div>

      {s.cert && (
        <div className="mt-3 rounded-md bg-field/60 p-2.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-ink">
            <FileText className="size-3.5 shrink-0 text-muted" /> {s.cert.name}
          </div>
          <div className="mt-0.5 text-[11px] text-muted">{s.cert.meta}</div>
        </div>
      )}
      {s.note && (
        <p className={`mt-3 rounded-md p-2.5 text-[11px] ${s.state === "rejected" ? "bg-red-50 text-red-600" : "bg-field/60 text-body"}`}>
          {s.state === "rejected" ? "Lý do: " : "Ghi chú: "}{s.note}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 pt-3">
        {s.state === "approved" && (
          <button type="button" disabled title="Chưa có API tệp chứng chỉ" className="cursor-not-allowed text-[11px] font-semibold text-cta opacity-60">
            Xem chứng chỉ
          </button>
        )}
        {s.state === "pending" && (
          <>
            <span className="text-[11px] text-muted">Cần phân công kiểm duyệt</span>
            <button type="button" onClick={onReview} className="h-8 rounded-lg bg-cta px-3 text-xs font-semibold text-white hover:brightness-95">
              Thẩm định nghiệp vụ
            </button>
          </>
        )}
        {s.state === "missing" && (
          <button type="button" onClick={onRemind} className="h-8 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink hover:bg-field">
            Gửi nhắc nhở KTV qua App
          </button>
        )}
      </div>
    </div>
  )
}

function Modal({
  title, onClose, children, footer,
}: { title: string; onClose: () => void; children: React.ReactNode; footer: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between px-5 pt-5">
          <h2 className="text-sm font-bold text-ink">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Đóng" className="text-muted hover:text-ink">
            <X className="size-4" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        <div className="flex justify-end gap-2 bg-field/60 px-5 py-3">{footer}</div>
      </div>
    </div>
  )
}

const btnGhost = "h-9 rounded-lg border border-line bg-white px-4 text-xs font-semibold text-ink hover:bg-field"
const btnPrimary = "h-9 rounded-lg bg-cta px-4 text-xs font-semibold text-white hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
const fieldCls = "w-full rounded-lg border border-line bg-white p-3 text-sm text-ink outline-none focus:border-cta focus:ring-2 focus:ring-cta/15"

function LockDialog({
  name, onClose, onConfirm,
}: { name: string; onClose: () => void; onConfirm: (mode: "suspended" | "locked", reason: string) => void }) {
  const [mode, setMode] = useState<"suspended" | "locked">("suspended")
  const [reason, setReason] = useState("")
  return (
    <Modal
      title={`Tạm khóa / Khóa "${name}"`}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className={btnGhost}>Hủy</button>
          <button type="button" disabled={!reason.trim()} onClick={() => onConfirm(mode, reason.trim())} className="h-9 rounded-lg bg-red-500 px-4 text-xs font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50">
            Xác nhận
          </button>
        </>
      }
    >
      <fieldset className="space-y-2">
        <legend className="mb-1 text-xs font-semibold text-body">Hình thức</legend>
        {([
          ["suspended", "Tạm khóa", "Có thể mở lại sau khi xử lý xong (ví dụ đối soát tiền ca)."],
          ["locked", "Khóa tài khoản", "Dùng khi vi phạm nghiêm trọng, ngừng hợp tác."],
        ] as const).map(([v, l, d]) => (
          <label key={v} className={`flex cursor-pointer items-start gap-2 rounded-lg border p-3 ${mode === v ? "border-cta bg-orange-50/50" : "border-line"}`}>
            <input type="radio" name="lock-mode" checked={mode === v} onChange={() => setMode(v)} className="mt-0.5" />
            <span>
              <span className="block text-xs font-semibold text-ink">{l}</span>
              <span className="block text-[11px] text-muted">{d}</span>
            </span>
          </label>
        ))}
      </fieldset>
      <label htmlFor="lock-reason" className="mb-1.5 mt-4 block text-xs font-semibold text-body">
        Lý do <span className="text-red-500">*</span>
      </label>
      <textarea id="lock-reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={3} maxLength={300} className={`${fieldCls} resize-none`} placeholder="Ví dụ: Chờ đối soát tiền ca" />
    </Modal>
  )
}

function ViolationDialog({
  onClose, onSave,
}: { onClose: () => void; onSave: (v: { title: string; orderCode?: string; action: string }) => void }) {
  const [title, setTitle] = useState("")
  const [orderCode, setOrderCode] = useState("")
  const [action, setAction] = useState("Nhắc nhở nội bộ")
  return (
    <Modal
      title="Ghi nhận vi phạm"
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className={btnGhost}>Hủy</button>
          <button type="button" disabled={!title.trim()} onClick={() => onSave({ title: title.trim(), orderCode: orderCode.trim() || undefined, action })} className={btnPrimary}>
            Ghi nhận
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <div>
          <label htmlFor="v-title" className="mb-1.5 block text-xs font-semibold text-body">Nội dung vi phạm <span className="text-red-500">*</span></label>
          <input id="v-title" value={title} onChange={(e) => setTitle(e.target.value)} className={fieldCls} placeholder="Ví dụ: Trễ hẹn 15 phút không báo khách" />
        </div>
        <div>
          <label htmlFor="v-order" className="mb-1.5 block text-xs font-semibold text-body">Mã đơn liên quan (nếu có)</label>
          <input id="v-order" value={orderCode} onChange={(e) => setOrderCode(e.target.value)} className={fieldCls} placeholder="#HF-0000" />
        </div>
        <div>
          <label htmlFor="v-action" className="mb-1.5 block text-xs font-semibold text-body">Hình thức xử lý</label>
          <select id="v-action" value={action} onChange={(e) => setAction(e.target.value)} className={fieldCls}>
            {["Nhắc nhở nội bộ", "Cảnh cáo bằng văn bản", "Phạt tiền", "Tạm khóa tài khoản"].map((a) => <option key={a}>{a}</option>)}
          </select>
        </div>
      </div>
    </Modal>
  )
}

function NotifyDialog({
  name, onClose, onSend,
}: { name: string; onClose: () => void; onSend: (msg: string) => void }) {
  const [msg, setMsg] = useState("")
  return (
    <Modal
      title={`Gửi thông báo đến ${name}`}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className={btnGhost}>Hủy</button>
          <button type="button" disabled={!msg.trim()} onClick={() => onSend(msg.trim())} className={btnPrimary}>Gửi thông báo</button>
        </>
      }
    >
      <label htmlFor="n-msg" className="mb-1.5 block text-xs font-semibold text-body">Nội dung thông báo</label>
      <textarea id="n-msg" value={msg} onChange={(e) => setMsg(e.target.value)} rows={4} maxLength={300} autoFocus className={`${fieldCls} resize-none`} placeholder="Ví dụ: Vui lòng nộp tiền ca trước 18h hôm nay." />
      <div className="mt-1 text-right text-[11px] text-muted">{msg.length}/300</div>
    </Modal>
  )
}

function ReviewSkillDialog({
  skill, onClose, onDecide,
}: { skill?: SkillCard; onClose: () => void; onDecide: (ok: boolean, reason: string) => void }) {
  const [reason, setReason] = useState("")
  if (!skill) return null
  return (
    <Modal
      title={`Thẩm định: ${skill.title}`}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className={btnGhost}>Đóng</button>
          <button
            type="button"
            disabled={!reason.trim()}
            onClick={() => onDecide(false, reason.trim())}
            title="Nhập lý do để từ chối"
            className="h-9 rounded-lg border border-red-200 bg-white px-4 text-xs font-semibold text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Từ chối
          </button>
          <button type="button" onClick={() => onDecide(true, "")} className={btnPrimary}>Duyệt</button>
        </>
      }
    >
      {skill.cert && (
        <div className="mb-3 rounded-md bg-field/60 p-2.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-ink"><FileText className="size-3.5" /> {skill.cert.name}</div>
          <div className="mt-0.5 text-[11px] text-muted">{skill.cert.meta}</div>
        </div>
      )}
      <label htmlFor="s-reason" className="mb-1.5 block text-xs font-semibold text-body">Lý do (bắt buộc khi từ chối)</label>
      <textarea id="s-reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={3} maxLength={300} className={`${fieldCls} resize-none`} />
    </Modal>
  )
}