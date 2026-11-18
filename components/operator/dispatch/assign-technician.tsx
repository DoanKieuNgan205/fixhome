"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ArrowLeft, Check, Clock, MapPin, Phone, Search, User } from "lucide-react"
import { initials } from "@/lib/admin/customer-utils"
import {
  getOrderQuotes, repairOrderErrorMessage, searchManualTechnicians, sendManualInvitation,
} from "@/lib/api/repair-orders-client"
import {
  deriveInviteState, isUrgent, listOf, toManualTech,
  type InviteState, type ManualTech, type QueueOrder,
} from "@/lib/operator/repair-order-mappers"

type Phase = InviteState | "sending"

const RADIUS = [3, 5, 10, 15]
const select = "h-10 rounded-lg border border-line bg-white px-3 text-xs font-medium text-ink outline-none focus:border-cta"

function Avatar({ t, size = "size-10" }: { t: ManualTech; size?: string }) {
  return (
    <span className={`flex ${size} shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-500 text-xs font-bold text-white`}>
      {t.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={t.avatarUrl} alt="" className={`${size} object-cover`} />
      ) : (
        initials(t.name)
      )}
    </span>
  )
}

function RawDump({ label, data }: { label: string; data: unknown }) {
  return (
    <details className="mt-3 text-[11px] text-muted">
      <summary className="cursor-pointer font-semibold">{label}</summary>
      <pre className="mt-1 max-h-56 overflow-auto rounded-lg bg-slate-900 p-3 text-[10px] text-slate-100">
        {JSON.stringify(data, null, 2)}
      </pre>
    </details>
  )
}

export function AssignTechnician({ order }: { order: QueueOrder }) {
  const [q, setQ] = useState("")
  const [radius, setRadius] = useState(5)
  const [specialty, setSpecialty] = useState("all")
  const [avail, setAvail] = useState<"all" | "on" | "off">("all")

  const [techs, setTechs] = useState<ManualTech[]>([])
  const [rawTechs, setRawTechs] = useState<unknown>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [selected, setSelected] = useState<ManualTech | null>(null)
  const [phase, setPhase] = useState<Phase>("none")
  const [waitMin, setWaitMin] = useState<number | null>(null)
  const first = useRef(true)

  // Tìm thợ: gọi lại khi đổi từ khóa (debounce 400ms) hoặc bán kính
  useEffect(() => {
    let alive = true
    const delay = first.current ? 0 : 400
    first.current = false
    const id = setTimeout(async () => {
      setLoading(true)
      setError("")
      try {
        // TODO: đối chiếu tên tham số (q, radius_km) với Swagger của manual-technicians
        const raw = await searchManualTechnicians(order.id, { q: q.trim() || undefined, radius_km: radius })
        if (!alive) return
        setRawTechs(raw)
        setTechs(listOf(raw).map(toManualTech).filter((x): x is ManualTech => x !== null))
      } catch (e) {
        if (alive) setError(repairOrderErrorMessage(e))
      } finally {
        if (alive) setLoading(false)
      }
    }, delay)
    return () => { alive = false; clearTimeout(id) }
  }, [order.id, q, radius])

  // Thời gian chờ của đơn
  useEffect(() => {
    if (!order.createdAt) return
    const tick = () => setWaitMin(Math.max(0, Math.floor((Date.now() - new Date(order.createdAt!).getTime()) / 60000)))
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [order.createdAt])

  const specialties = useMemo(
    () => [...new Set(techs.map((t) => t.specialty).filter((s): s is string => !!s))],
    [techs],
  )

  // Bộ lọc chuyên môn / bật tắt chạy tại trình duyệt vì API chỉ lọc theo tên, SĐT, bán kính
  const shown = useMemo(
    () =>
      techs.filter((t) => {
        if (specialty !== "all" && t.specialty !== specialty) return false
        if (avail === "on" && t.available === false) return false
        if (avail === "off" && t.available !== false) return false
        return true
      }),
    [techs, specialty, avail],
  )

  // Kiểm tra phản hồi của thợ qua danh sách báo giá của đơn
  const check = useCallback(
    async (techId: number, assumeSent: boolean) => {
      try {
        const quotes = listOf(await getOrderQuotes(order.id))
        setPhase(deriveInviteState(quotes, techId, assumeSent))
      } catch {
        /* giữ nguyên trạng thái hiện tại */
      }
    },
    [order.id],
  )

  function choose(t: ManualTech) {
    if (phase === "sending" || phase === "waiting" || phase === "accepted") return
    setSelected(t)
    setPhase("none")
    setError("")
    check(t.id, false) // khôi phục trạng thái nếu đã từng gửi lời mời cho thợ này
  }

  // Đang chờ thợ: hỏi lại mỗi 5 giây
  useEffect(() => {
    if (phase !== "waiting" || !selected) return
    const id = setInterval(() => check(selected.id, true), 5000)
    return () => clearInterval(id)
  }, [phase, selected, check])

  async function invite() {
    if (!selected) return
    if (!window.confirm(`Bạn đã trao đổi qua điện thoại với ${selected.name}? Xác nhận gửi đơn cho thợ này.`)) return
    setPhase("sending")
    setError("")
    try {
      // TODO: đối chiếu body của POST manual-invitations (đang giả định technician_id)
      await sendManualInvitation(order.id, { technician_id: selected.id })
      setPhase("waiting")
    } catch (e) {
      setError(repairOrderErrorMessage(e))
      setPhase("none")
    }
  }

  const locked = phase === "sending" || phase === "waiting" || phase === "accepted"
  const urgent = isUrgent(order.priority)

  return (
    <div className="space-y-5">
      <Link href="/operator" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink">
        <ArrowLeft className="size-3.5" /> Danh sách yêu cầu tìm thợ
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-ink">Gán kỹ thuật viên</h1>
        <p className="mt-1 text-xs text-muted">Chọn thợ phù hợp để xử lý đơn {urgent ? "khẩn cấp " : ""}{order.code}.</p>
      </div>

      {/* Thông tin đơn */}
      <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-ink">{order.code}</span>
            <span className="rounded bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600">● Chưa có thợ nhận</span>
          </div>
          {waitMin != null && (
            <span className="flex items-center gap-1 text-xs font-semibold text-orange-600">
              <Clock className="size-3.5" /> Chờ {waitMin} phút
            </span>
          )}
        </div>
        <h2 className="mt-3 text-base font-bold text-ink">{order.title ?? "Yêu cầu sửa chữa"}</h2>
        <div className="mt-3 grid gap-4 border-t border-line pt-3 text-xs sm:grid-cols-2">
          <div className="flex items-start gap-2">
            <User className="mt-0.5 size-4 text-muted" />
            <div>
              <div className="text-[11px] text-muted">Khách hàng</div>
              <div className="font-bold text-ink">{order.customerName ?? "—"}</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 text-muted" />
            <div>
              <div className="text-[11px] text-muted">Khu vực phục vụ</div>
              <div className="font-bold text-ink">{order.area ?? order.address ?? "—"}</div>
            </div>
          </div>
        </div>
        <RawDump label="Dữ liệu thô của đơn (để đối chiếu)" data={order.raw} />
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[1fr_340px]">
        {/* Danh sách thợ */}
        <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink">Kỹ thuật viên phù hợp</h2>
            <span className="rounded-full bg-field px-2 py-0.5 text-[11px] text-muted">
              {loading ? "Đang tải…" : `${shown.length} KTV`}
            </span>
          </div>

          <div className="mt-3 flex h-10 items-center gap-2 rounded-lg border border-line px-3 focus-within:border-cta focus-within:ring-2 focus-within:ring-cta/15">
            <Search className="size-4 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo tên hoặc số điện thoại..."
              className="h-full w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
            />
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className={select} aria-label="Chuyên môn">
              <option value="all">Tất cả chuyên môn</option>
              {specialties.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={radius} onChange={(e) => setRadius(Number(e.target.value))} className={select} aria-label="Bán kính">
              {RADIUS.map((r) => <option key={r} value={r}>Bán kính {r} km từ khách</option>)}
            </select>
            <select value={avail} onChange={(e) => setAvail(e.target.value as typeof avail)} className={select} aria-label="Trạng thái">
              <option value="all">Tất cả trạng thái</option>
              <option value="on">Đang bật nhận việc</option>
              <option value="off">Offline</option>
            </select>
          </div>

          {error && <p role="alert" className="mt-3 text-xs font-medium text-red-600">{error}</p>}

          <ul className="mt-4 space-y-3">
            {!loading && shown.length === 0 && (
              <li className="rounded-lg bg-field/60 p-6 text-center text-sm text-muted">Không tìm thấy kỹ thuật viên phù hợp</li>
            )}
            {shown.map((t) => {
              const on = selected?.id === t.id
              const sub = [t.specialty, t.area].filter(Boolean).join(" · ")
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => choose(t)}
                    aria-pressed={on}
                    disabled={locked && !on}
                    className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${
                      on ? "border-cta bg-orange-50/60 ring-1 ring-cta" : "border-line hover:border-slate-300"
                    } ${locked && !on ? "opacity-50" : ""}`}
                  >
                    <Avatar t={t} size="size-11" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-ink">{t.name}</span>
                        {t.rating != null && <span className="text-xs font-semibold text-orange-600">{t.rating}★</span>}
                      </div>
                      {sub && <div className="truncate text-xs text-body">{sub}</div>}
                      {t.distance != null && (
                        <div className="mt-1 text-[11px] font-medium text-cta">
                          Cách khách {t.distance.toLocaleString("vi-VN")} km
                          {t.distance <= radius ? " · Trong bán kính tìm kiếm" : ""}
                        </div>
                      )}
                    </div>
                    {on ? (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-cta">
                        Đã chọn
                        <span className="flex size-5 items-center justify-center rounded-full bg-cta text-white"><Check className="size-3" /></span>
                      </span>
                    ) : (
                      <span className="size-5 rounded-full border border-slate-300" />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>

          <p className="mt-4 text-[11px] text-muted">Trạng thái sẵn sàng không đồng nghĩa với việc thợ đã nhận đơn.</p>
          <RawDump label="Dữ liệu thô danh sách thợ (để đối chiếu)" data={rawTechs} />
        </section>

        {/* Xác nhận gán thợ */}
        <aside className="space-y-4 xl:sticky xl:top-4">
          <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-ink">Xác nhận gán thợ</h2>

            {selected ? (
              <>
                <div className="mt-3 rounded-xl bg-orange-50 p-4">
                  <div className="text-[10px] font-semibold tracking-wider text-orange-600">KỸ THUẬT VIÊN ĐÃ CHỌN</div>
                  <div className="mt-2 flex items-center gap-3">
                    <Avatar t={selected} />
                    <div>
                      <div className="text-sm font-bold text-ink">{selected.name}</div>
                      <div className="text-[11px] text-body">
                        {[selected.specialty, selected.area].filter(Boolean).join(" · ")}
                        {selected.rating != null ? ` · ${selected.rating}★` : ""}
                      </div>
                    </div>
                  </div>
                  {selected.available != null && (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-body">
                      <i className={`size-1.5 rounded-full ${selected.available ? "bg-emerald-500" : "bg-slate-400"}`} />
                      {selected.available ? "Đang bật app" : "Đang tắt app"}
                    </div>
                  )}
                </div>

                <dl className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <dt className="text-muted">Số điện thoại</dt>
                    <dd className="flex items-center gap-2 font-bold text-ink">
                      {selected.phone ?? "—"}
                      {selected.phone && (
                        <a
                          href={`tel:${selected.phone.replace(/[^\d+]/g, "")}`}
                          aria-label="Gọi thợ"
                          className="flex size-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"
                        >
                          <Phone className="size-3" />
                        </a>
                      )}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted">Mức ưu tiên</dt>
                    <dd className={`font-bold ${urgent ? "text-red-600" : "text-ink"}`}>{urgent ? "Khẩn cấp" : "Thường"}</dd>
                  </div>
                </dl>
              </>
            ) : (
              <p className="mt-3 rounded-lg bg-field/60 p-4 text-center text-xs text-muted">
                Chọn một kỹ thuật viên ở danh sách bên trái
              </p>
            )}

            <div className="mt-4 border-t border-line pt-4">
              {phase === "waiting" ? (
                <button type="button" disabled className="h-11 w-full cursor-not-allowed rounded-lg bg-slate-300 text-sm font-semibold text-white">
                  Đang chờ thợ xác nhận
                </button>
              ) : phase === "declined" ? (
                <button
                  type="button"
                  onClick={() => { setSelected(null); setPhase("none") }}
                  className="h-11 w-full rounded-lg bg-red-600 text-sm font-semibold text-white hover:brightness-95"
                >
                  Thợ đã từ chối
                </button>
              ) : phase === "accepted" ? (
                <button type="button" disabled className="h-11 w-full cursor-default rounded-lg bg-emerald-500 text-sm font-semibold text-white">
                  Đã tiếp nhận đơn hàng
                </button>
              ) : (
                <button
                  type="button"
                  onClick={invite}
                  disabled={!selected || phase === "sending"}
                  className="h-11 w-full rounded-lg bg-cta text-sm font-semibold text-white hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {phase === "sending" ? "Đang gửi…" : "Gửi đơn cho thợ này"}
                </button>
              )}
              <Link href="/operator" className="mt-3 block text-center text-xs font-semibold text-muted hover:text-ink">
                Hủy, quay lại danh sách
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}