export type Raw = Record<string, unknown>

export const isObj = (v: unknown): v is Raw => !!v && typeof v === "object" && !Array.isArray(v)

function get(o: Raw, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, k) => (isObj(acc) ? acc[k] : undefined), o)
}

// Lấy giá trị đầu tiên có trong danh sách tên field (hỗ trợ "customer.full_name")
export function pick(o: Raw, paths: string[]): unknown {
  for (const p of paths) {
    const v = get(o, p)
    if (v !== undefined && v !== null && v !== "") return v
  }
  return null
}
export const str = (o: Raw, p: string[]) => {
  const v = pick(o, p)
  return v == null ? null : String(v)
}
export const num = (o: Raw, p: string[]) => {
  const v = pick(o, p)
  if (v == null) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}
const bool = (o: Raw, p: string[]) => {
  const v = pick(o, p)
  return typeof v === "boolean" ? v : null
}

// Danh sách có thể là mảng, hoặc object chứa items / data / content
export function listOf(raw: unknown): Raw[] {
  if (Array.isArray(raw)) return raw.filter(isObj)
  if (isObj(raw)) {
    for (const k of ["items", "data", "content", "results"]) {
      const v = raw[k]
      if (Array.isArray(v)) return v.filter(isObj)
    }
  }
  return []
}

export function pageInfo(raw: unknown, len: number) {
  const o = isObj(raw) ? raw : {}
  return {
    total: num(o, ["total_items", "totalElements", "total"]) ?? len,
    pages: num(o, ["total_pages", "totalPages"]) ?? 1,
  }
}

// ---------- Đơn chờ gán thợ ----------
export type QueueOrder = {
  id: number
  code: string
  title: string | null // mô tả sự cố / tên dịch vụ
  customerName: string | null
  customerPhone: string | null
  address: string | null
  area: string | null
  createdAt: string | null // UTC
  expiresAt: string | null
  priority: string | null
  estimate: number | null
  raw: Raw
}

// TODO: đối chiếu tên field với response của manual-assignment và GET /operator/repair-orders/{id}
export function toQueueOrder(o: Raw): QueueOrder | null {
  const id = num(o, ["id", "order_id", "repair_order_id"])
  if (id == null) return null
  const code = str(o, ["code", "order_code", "order_no"])
  return {
    id,
    code: code ? (code.startsWith("#") ? code : `#${code}`) : `#${id}`,
    title: str(o, ["title", "issue_title", "service_name", "category_name", "category.name", "description"]),
    customerName: str(o, ["customer_name", "customer.full_name", "customer.name"]),
    customerPhone: str(o, ["customer_phone", "customer.phone"]),
    address: str(o, ["address", "service_address", "address_text", "location.address"]),
    area: str(o, ["area", "district", "ward", "service_area", "location.district"]),
    createdAt: str(o, ["created_at"]),
    expiresAt: str(o, ["expires_at", "expired_at", "deadline", "manual_deadline"]),
    priority: str(o, ["priority", "urgency"]),
    estimate: num(o, ["estimated_price", "estimate", "expected_amount", "inspection_fee"]),
    raw: o,
  }
}

export const isUrgent = (priority: string | null) => /URGENT|HIGH|EXPRESS|EMERGENCY/i.test(priority ?? "")

// ---------- Thợ tìm được ----------
export type ManualTech = {
  id: number
  name: string
  phone: string | null
  avatarUrl: string | null
  specialty: string | null
  area: string | null
  distance: number | null
  rating: number | null
  available: boolean | null
  raw: Raw
}

// TODO: đối chiếu với response GET .../manual-technicians
export function toManualTech(o: Raw): ManualTech | null {
  const id = num(o, ["technician_id", "id"])
  if (id == null) return null
  return {
    id,
    name: str(o, ["full_name", "name", "technician_name"]) ?? `KTV #${id}`,
    phone: str(o, ["phone", "phone_number"]),
    avatarUrl: str(o, ["avatar_url", "profile.avatar_url"]),
    specialty: str(o, ["specialty", "specialty_name", "category_name", "specialties.0.name"]),
    area: str(o, ["area", "district", "current_address", "profile.current_address"]),
    distance: num(o, ["distance_km", "distance"]),
    rating: num(o, ["rating", "rating_avg", "average_rating"]),
    available: bool(o, ["is_available", "available", "online"]),
    raw: o,
  }
}

// ---------- Trạng thái lời mời với một thợ ----------
export type InviteState = "none" | "waiting" | "declined" | "accepted"

// Suy ra từ danh sách báo giá của đơn (GET .../quotes, gồm cả từ chối và hết hạn).
// TODO: đối chiếu giá trị status thật của báo giá/lời mời.
export function deriveInviteState(quotes: Raw[], techId: number, assumeSent: boolean): InviteState {
  const mine = quotes.filter((q) => num(q, ["technician_id", "technician.id"]) === techId)
  if (mine.length === 0) return assumeSent ? "waiting" : "none"
  const sts = mine.map((q) => (str(q, ["status", "state"]) ?? "").toUpperCase())
  if (sts.some((s) => /SUBMIT|ACCEPT|QUOTED|SELECT/.test(s))) return "accepted"
  if (sts.every((s) => /REJECT|DECLIN|REFUS|EXPIRE|CANCEL/.test(s))) return "declined"
  return "waiting"
}