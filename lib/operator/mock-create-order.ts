// ---------- Dịch vụ ----------
export type ServiceGroup = "Điện lạnh" | "Điện gia dụng" | "Điện nước" | "Điện tử"
export const SERVICE_GROUPS: ServiceGroup[] = ["Điện lạnh", "Điện gia dụng", "Điện nước", "Điện tử"]

export type Service = { id: string; group: ServiceGroup; name: string; desc: string }

export const INSPECTION_FEE = 100_000

// TODO: thay bằng danh mục thật (lib/api/catalog-read.ts)
export const services: Service[] = [
  { id: "ac-clean", group: "Điện lạnh", name: "Vệ sinh máy lạnh", desc: "Bảo dưỡng định kỳ dàn nóng & dàn lạnh" },
  { id: "ac-repair", group: "Điện lạnh", name: "Sửa máy lạnh", desc: "Khắc phục không mát, chảy nước, báo lỗi" },
  { id: "ac-gas", group: "Điện lạnh", name: "Nạp gas máy lạnh", desc: "Kiểm tra rò rỉ và nạp gas R32, R410A" },
  { id: "ac-install", group: "Điện lạnh", name: "Lắp đặt máy lạnh", desc: "Tháo lắp, di dời vị trí máy lạnh" },
  { id: "fridge", group: "Điện lạnh", name: "Sửa tủ lạnh", desc: "Không đông đá, rò nước, hỏng block" },
  { id: "washer", group: "Điện lạnh", name: "Sửa máy giặt", desc: "Không vắt, kêu rung, rò rỉ nước" },
  { id: "heater", group: "Điện lạnh", name: "Sửa bình nóng lạnh", desc: "Không nóng, nhảy rơ-le chống giật" },
  { id: "fan", group: "Điện lạnh", name: "Sửa quạt / máy hút bụi", desc: "Động cơ yếu, chập mạch, thay tụ" },

  { id: "induction", group: "Điện gia dụng", name: "Sửa bếp từ", desc: "Không nhận nồi, báo lỗi, quạt kêu to" },
  { id: "microwave", group: "Điện gia dụng", name: "Sửa lò vi sóng", desc: "Không nóng, đĩa quay hỏng, tia lửa" },
  { id: "rice-cooker", group: "Điện gia dụng", name: "Sửa nồi cơm điện", desc: "Không nấu chín, không lên nguồn" },
  { id: "air-purifier", group: "Điện gia dụng", name: "Sửa máy lọc không khí", desc: "Quạt yếu, báo thay lọc, mùi lạ" },
  { id: "hood", group: "Điện gia dụng", name: "Sửa máy hút mùi", desc: "Hút yếu, kêu to, rò dầu mỡ" },

  { id: "pipe-leak", group: "Điện nước", name: "Sửa ống nước rò rỉ", desc: "Xử lý rò rỉ đường ống âm tường" },
  { id: "unclog", group: "Điện nước", name: "Thông tắc bồn rửa", desc: "Thông tắc bồn rửa, cống thoát sàn" },
  { id: "socket", group: "Điện nước", name: "Sửa điện ổ cắm", desc: "Chập cháy, mất điện cục bộ, thay ổ" },
  { id: "shower", group: "Điện nước", name: "Thay vòi sen", desc: "Thay vòi sen, sen cây, dây cấp nước" },
  { id: "pump", group: "Điện nước", name: "Lắp đặt máy bơm", desc: "Lắp mới hoặc thay máy bơm tăng áp" },
  { id: "ro", group: "Điện nước", name: "Sửa máy lọc nước RO", desc: "Thay lõi, rò nước, nước yếu" },

  { id: "tv", group: "Điện tử", name: "Sửa TV", desc: "Mất hình, mất tiếng, sọc màn hình" },
  { id: "speaker", group: "Điện tử", name: "Sửa loa & dàn âm thanh", desc: "Rè, mất tiếng, không kết nối" },
  { id: "router", group: "Điện tử", name: "Sửa router / modem", desc: "Mất mạng, sóng yếu, cấu hình lại" },
  { id: "pc", group: "Điện tử", name: "Sửa máy tính để bàn", desc: "Không lên nguồn, treo, nóng máy" },
]

// ---------- Thiết bị & triệu chứng ----------
export type Device = {
  id: string
  name: string
  spec: string
  note: string
  warrantyUntil?: string
  warrantyOrder?: string
}

export const customerDevices: Device[] = [
  { id: "d1", name: "Điều hòa Daikin FTKC35", spec: "1.5HP · Inverter R32", note: "Vệ sinh gần nhất: 12/03/2024", warrantyUntil: "15/12/2026", warrantyOrder: "#HF-7810" },
  { id: "d2", name: "Máy giặt Electrolux EWF-1024", spec: "9kg · Lồng ngang Inverter", note: "Đang hoạt động ổn định" },
]

export const SYMPTOMS = [
  "Không lạnh / Kém lạnh",
  "Chảy nước dàn lạnh",
  "Kêu to / Rung lắc",
  "Không lên nguồn",
  "Đóng đá dàn lạnh",
  "Báo lỗi nhấp nháy đèn",
  "Có mùi hôi khó chịu",
]

export type Priority = "normal" | "high" | "urgent"
export const PRIORITIES: { key: Priority; label: string }[] = [
  { key: "normal", label: "Thường" },
  { key: "high", label: "Ưu tiên cao" },
  { key: "urgent", label: "Gấp (Hỏa tốc)" },
]

// ---------- Khách hàng ----------
export type SavedAddress = { id: string; label: string; address: string; isDefault?: boolean }

export type CustomerProfile = {
  code: string
  name: string
  phone: string
  tier: string
  completedOrders: number
  opNote: string
  activeOrder?: string
  addresses: SavedAddress[]
}

const CUSTOMERS: CustomerProfile[] = [
  {
    code: "CUST-098812",
    name: "Nguyễn Mai Phương",
    phone: "0988123456",
    tier: "VIP Silver",
    completedOrders: 5,
    opNote: "Khách yêu cầu gọi điện trước 15 phút để chuẩn bị thang máy và giữ thú cưng trong phòng.",
    activeOrder: "#HF-8910",
    addresses: [
      { id: "a1", label: "Căn hộ gia đình (Mặc định)", address: "Căn hộ A-1402, tháp Sapphire 1, 12A Nguyễn Hữu Cảnh, P. Tân Phú, Quận 7, TP.HCM", isDefault: true },
      { id: "a2", label: "Nhà riêng (Nhà bố mẹ)", address: "Số 8 ngõ 120 Trần Thái Tông, Cầu Giấy, Hà Nội" },
      { id: "a3", label: "Văn phòng công ty", address: "Tầng 12, Bitexco, 2 Hải Triều, Quận 1, TP.HCM" },
    ],
  },
]

// TODO: thay bằng API tra cứu khách hàng
export function lookupCustomer(phone: string): CustomerProfile | null {
  const d = phone.replace(/\D/g, "")
  return CUSTOMERS.find((c) => c.phone === d) ?? null
}

// ---------- Khung giờ ----------
export type Slot = { id: string; range: string; label: string; techs: number; tone: "best" | "normal" | "low" | "peak" }

export const slots: Slot[] = [
  { id: "s1", range: "10:00 - 11:30", label: "Khung giờ tối ưu", techs: 6, tone: "best" },
  { id: "s2", range: "11:30 - 13:00", label: "Bình thường", techs: 4, tone: "normal" },
  { id: "s3", range: "14:00 - 15:30", label: "Ít KTV có mặt", techs: 2, tone: "low" },
  { id: "s4", range: "16:00 - 17:30", label: "Giờ cao điểm", techs: 4, tone: "peak" },
]

// ---------- Kỹ thuật viên ----------
export type Technician = {
  id: string
  code: string
  name: string
  tier: string
  rating: number
  reviews: number
  completion: number
  distanceKm: number
  etaMin: number
  area: string
  tags: string[]
}

export const technicians: Technician[] = [
  { id: "t1", code: "#KTV-8842", name: "Trần Văn Cường", tier: "Bậc 5 · Platinum", rating: 4.95, reviews: 1120, completion: 98.6, distanceKm: 2.1, etaMin: 12, area: "Quận 7", tags: ["Gần nhất (2,1 km)", "Đã từng phục vụ khách này (#HF-7810)"] },
  { id: "t2", code: "#KTV-8815", name: "Lê Tuấn Tú", tier: "Bậc 4", rating: 4.88, reviews: 860, completion: 97.2, distanceKm: 3.2, etaMin: 18, area: "Quận 7", tags: ["Sẵn sàng khung 10:00", "Chuyên sâu: Bo mạch Daikin Inverter, gas R32"] },
  { id: "t3", code: "#KTV-8790", name: "Đỗ Tuấn Anh", tier: "Bậc 4", rating: 4.85, reviews: 640, completion: 96.0, distanceKm: 3.8, etaMin: 20, area: "Quận 7", tags: ["Vừa xong đơn tại Sapphire 1"] },
  { id: "t4", code: "#KTV-8722", name: "Phạm Văn Quý", tier: "Bậc 3", rating: 4.79, reviews: 410, completion: 95.1, distanceKm: 4.2, etaMin: 24, area: "Quận 7 & Nhà Bè", tags: [] },
  { id: "t5", code: "#KTV-8699", name: "Hoàng Minh Trọng", tier: "Bậc 3", rating: 4.75, reviews: 388, completion: 94.4, distanceKm: 4.8, etaMin: 27, area: "Quận 7", tags: ["Dự kiến đến < 5 phút"] },
]

export const offlineTechnicians = [
  { id: "o1", code: "#KTV-8510", name: "Vũ Hải Đăng", distanceKm: 1.8, reason: "Đang nghỉ ăn trưa (Sẵn sàng quay lại lúc 10:30)" },
  { id: "o2", code: "#KTV-8492", name: "Ngô Quang Khải", distanceKm: 2.5, reason: "Tắt nhận việc đột xuất (Gần vị trí khách 8 phút)" },
]

// ---------- Bản nháp đơn ----------
export type AssignMode = "auto" | "manual"
export type CallResult = "" | "agree" | "decline" | "no_answer" | "callback"

export type Draft = {
  serviceId: string | null
  deviceId: string | null
  symptoms: string[]
  description: string
  attachments: string[]
  priority: Priority
  phone: string
  customerName: string
  customer: CustomerProfile | null
  addressId: string | null
  address: string
  addressNote: string
  timeMode: "asap" | "scheduled"
  date: string // yyyy-mm-dd
  slotId: string | null
  technicianId: string | null
  assignMode: AssignMode
  manualReason: string
  callResult: CallResult
  pinTechnician: boolean
}

export const EMPTY_DRAFT: Draft = {
  serviceId: null,
  deviceId: "d1",
  symptoms: [],
  description: "",
  attachments: [],
  priority: "normal",
  phone: "",
  customerName: "",
  customer: null,
  addressId: null,
  address: "",
  addressNote: "",
  timeMode: "asap",
  date: "",
  slotId: "s1",
  technicianId: null,
  assignMode: "auto",
  manualReason: "",
  callResult: "",
  pinTechnician: false,
}

export type StepProps = { draft: Draft; patch: (p: Partial<Draft>) => void }

export const money = (n: number) => `${n.toLocaleString("vi-VN")}đ`

export function describeTime(d: Draft) {
  const range = slots.find((s) => s.id === d.slotId)?.range ?? ""
  if (d.timeMode === "asap") return `Hôm nay, ${range}`
  if (!d.date) return range
  const [y, m, day] = d.date.split("-")
  return `${day}/${m}/${y}, ${range}`
}