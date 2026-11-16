import type { ApiTechnician, ApiTechnicianSpecialty } from "@/lib/api/types"

export type ReviewTab = "all" | "pending" | "verified" | "rejected"
type TabKey = Exclude<ReviewTab, "all">

export const REVIEW_TABS: { key: ReviewTab; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ duyệt" },
  { key: "verified", label: "Đã duyệt" },
  { key: "rejected", label: "Từ chối" },
]

export const parseTab = (v?: string): ReviewTab =>
  v === "pending" || v === "verified" || v === "rejected" ? v : "all"

// Giá trị status của backend. Chỉ chắc chắn có "INCOMPLETE"; các giá trị này là phỏng đoán,
// Chỉnh lại nếu khác sau khi thử trong Swagger.
export const PROFILE_STATUS: Record<TabKey, string> = {
  pending: "PENDING",
  verified: "APPROVED",
  rejected: "REJECTED",
}

export const SPECIALTY_STATUS: Record<TabKey, string> = {
  pending: "PENDING",
  verified: "APPROVED",
  rejected: "REJECTED",
}

export const isPendingProfile = (s: string) => ["PENDING", "SUBMITTED"].includes(s.toUpperCase())
export const isPendingSpecialty = (s: string) => s.toUpperCase() === SPECIALTY_STATUS.pending

export function specialtyLabel(s: string) {
  const k = s.toUpperCase()
  if (k === "PENDING") return "Chờ duyệt"
  if (k === "APPROVED" || k === "VERIFIED") return "Đã duyệt"
  if (k === "REJECTED") return "Từ chối"
  return s
}

export function specialtyTone(s: string) {
  const k = s.toUpperCase()
  if (k === "APPROVED" || k === "VERIFIED") return "bg-emerald-50 text-emerald-600"
  if (k === "REJECTED") return "bg-red-50 text-red-500"
  if (k === "PENDING") return "bg-amber-50 text-amber-700"
  return "bg-field text-body"
}

// Backend trả giờ UTC, đổi sang giờ Việt Nam: 14/11/2026 • 19:04
export function dmyHm(iso: string | null) {
  if (!iso) return "—"
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

function maskPhone(phone: string | null) {
  let d = (phone ?? "").replace(/\D/g, "")
  if (d.startsWith("84") && d.length === 11) d = `0${d.slice(2)}`
  if (d.length === 10) return `${d.slice(0, 4)}.${d.slice(4, 7)}.${d[7]}xx`
  return d.length > 2 ? `${d.slice(0, -2)}xx` : "—"
}

// ---------- Hồ sơ KTV ----------
export type ApplicationRow = {
  id: number
  code: string
  name: string
  avatarUrl: string | null
  phone: string
  email: string | null
  address: string | null
  status: string
  rejectionReason: string | null
  submittedAt: string | null
}

export function toApplicationRow(a: ApiTechnician): ApplicationRow {
  return {
    id: a.id,
    code: `#KTV-${String(a.id).padStart(4, "0")}`, // TODO: thay bằng mã KTV thật khi backend trả về
    name: a.full_name,
    avatarUrl: a.profile?.avatar_url ?? null,
    phone: maskPhone(a.phone),
    email: a.email,
    address: a.profile?.current_address ?? null,
    status: a.profile?.verification_status ?? a.verification_status,
    rejectionReason: a.profile?.verification_rejection_reason ?? a.verification_rejection_reason,
    submittedAt: a.created_at ?? null,
  }
}

// ---------- Chuyên môn (nghiệp vụ) ----------
export type SpecialtyRow = {
  id: number
  technicianId: number
  technicianName: string | null
  categoryId: number
  experienceLevel: string
  acceptAllDevices: boolean
  deviceCount: number
  evidenceUrls: string[]
  status: string
  rejectionReason: string | null
  createdAt: string | null
}

export function toSpecialtyRow(s: ApiTechnicianSpecialty, name: string | null): SpecialtyRow {
  return {
    id: s.id,
    technicianId: s.technician_id,
    technicianName: name,
    categoryId: s.category_id,
    experienceLevel: s.experience_level,
    acceptAllDevices: s.accept_all_devices,
    deviceCount: s.device_type_ids?.length ?? 0,
    evidenceUrls: s.evidence_urls ?? [],
    status: s.status,
    rejectionReason: s.rejection_reason,
    createdAt: s.created_at ?? null,
  }
}