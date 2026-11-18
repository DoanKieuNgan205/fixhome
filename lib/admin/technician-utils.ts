//import { STATUS_PARAM } from "@/lib/admin/customer-utils"
import type { ApiTechnician } from "@/lib/api/types"

// Dạng dùng cho bảng. Field chưa có trong API = null, UI hiển thị "—" (không hiện số 0 giả).
export type TechnicianRow = {
  id: string
  code: string
  name: string
  avatarUrl: string | null
  phone: string // đã che bớt số cuối
  available: boolean
  status: "active" | "locked"
  lockReason?: string
  specialty: string | null
  district: string | null
  city: string | null
  ordersThisMonth: number | null
  completionRate: number | null
  cancelByTech: number | null
  cancelByCustomer: number | null
  rating: number | null
  reviews: number | null
  debt: number | null
}

function maskPhone(phone: string | null) {
  let d = (phone ?? "").replace(/\D/g, "")
  if (d.startsWith("84") && d.length === 11) d = `0${d.slice(2)}`
  if (d.length === 10) return `${d.slice(0, 4)}.${d.slice(4, 7)}.${d[7]}xx`
  return d.length > 2 ? `${d.slice(0, -2)}xx` : "—"
}

// Giả định: status KTV dùng cùng enum với khách hàng (STATUS_PARAM.active = giá trị "hoạt động").
// Nếu backend KTV có giá trị khác (vd PENDING, REJECTED) thì chỉnh lại ở đây.
/*function isActive(status: string) {
  return status.toLowerCase() === "active"
}*/

function isActive(status: string | null | undefined) {
  return (status ?? "").toLowerCase() === "active"
}

export function toTechnician(a: ApiTechnician): TechnicianRow {
  const active = isActive(a.status)
  return {
    id: String(a.id),
    code: `#KTV-${String(a.id).padStart(4, "0")}`, // TODO: thay bằng mã KTV thật khi backend trả về
    name: a.full_name,
    avatarUrl: a.profile?.avatar_url ?? null,
    phone: maskPhone(a.phone),
    available: a.is_available,
    status: active ? "active" : "locked",
    lockReason: active ? undefined : a.verification_rejection_reason ?? undefined,
    // TODO: map khi backend có các field này
    specialty: null,
    district: a.profile?.current_address ?? null, // API chỉ có địa chỉ hiện tại + mã phường, chưa có tên quận
    city: null,
    ordersThisMonth: null,
    completionRate: null,
    cancelByTech: null,
    cancelByCustomer: null,
    rating: null,
    reviews: null,
    debt: null,
  }
}