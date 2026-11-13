// lib/admin/technician-detail-utils.ts
import type { ApiTechnician } from "@/lib/api/types"

export type IdentityMedia = { id: number; url: string; type: string }

// Chỉ gồm dữ liệu API hiện có. Các chỉ số vận hành (hiệu suất, đơn, đánh giá, công nợ)
// chưa có API nên chưa nằm trong type này.
export type TechnicianDetail = {
  id: string
  accountId: number
  code: string
  name: string
  avatarUrl: string | null
  phone: string | null
  email: string | null
  status: "active" | "locked"
  statusRaw: string
  available: boolean
  verificationStatus: string
  verificationRejectionReason: string | null
  verifiedAt: string | null
  gender: string | null
  dateOfBirth: string | null
  citizenId: string | null
  address: string | null
  wardCode: string | null
  emergencyName: string | null
  emergencyRelationship: string | null
  emergencyPhone: string | null
  identityMedia: IdentityMedia[]
  updatedAt: string | null
}

export function toTechnicianDetail(a: ApiTechnician): TechnicianDetail {
  const p = a.profile
  return {
    id: String(a.id),
    accountId: a.account_id,
    code: `#KTV-${String(a.id).padStart(4, "0")}`, // TODO: thay bằng mã KTV thật khi backend trả về
    name: a.full_name,
    avatarUrl: p?.avatar_url ?? null,
    phone: a.phone,
    email: a.email,
    status: a.status.toLowerCase() === "active" ? "active" : "locked",
    statusRaw: a.status,
    available: a.is_available,
    verificationStatus: p?.verification_status ?? a.verification_status,
    verificationRejectionReason: p?.verification_rejection_reason ?? a.verification_rejection_reason,
    verifiedAt: p?.verified_at ?? null,
    gender: p?.gender ?? null,
    dateOfBirth: p?.date_of_birth ?? null,
    citizenId: p?.citizen_id ?? null,
    address: p?.current_address ?? null,
    wardCode: p?.current_ward_code ?? null,
    emergencyName: p?.emergency_contact_name ?? null,
    emergencyRelationship: p?.emergency_contact_relationship ?? null,
    emergencyPhone: p?.emergency_contact_phone ?? null,
    identityMedia: (p?.identity_media ?? []).map((m) => ({
      id: m.id,
      url: m.media_url,
      type: m.media_type,
    })),
    updatedAt: a.updated_at ?? null,
  }
}

// Nhãn hiển thị. Giá trị thật của backend chưa đủ, giá trị lạ sẽ hiện nguyên văn.
export function verificationLabel(v: string) {
  const k = v.toUpperCase()
  if (k === "INCOMPLETE") return "Hồ sơ chưa hoàn tất"
  if (k === "PENDING" || k === "SUBMITTED") return "Chờ duyệt"
  if (k === "VERIFIED" || k === "APPROVED") return "Đã xác minh"
  if (k === "REJECTED") return "Bị từ chối"
  return v
}

export function verificationTone(v: string) {
  const k = v.toUpperCase()
  if (k === "VERIFIED" || k === "APPROVED") return "bg-emerald-50 text-emerald-600"
  if (k === "REJECTED") return "bg-red-50 text-red-500"
  if (k === "INCOMPLETE" || k === "PENDING" || k === "SUBMITTED") return "bg-amber-50 text-amber-700"
  return "bg-field text-body"
}

export function genderLabel(g: string | null) {
  if (!g) return null
  const k = g.toUpperCase()
  if (k === "MALE") return "Nam"
  if (k === "FEMALE") return "Nữ"
  if (k === "OTHER") return "Khác"
  return g
}