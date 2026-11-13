export type OpStatus = "active" | "suspended" | "locked"

export type OpTech = {
  id: string
  code: string
  name: string
  skills: string[]
  district: string
  city: string
  available: boolean
  rating: number
  status: OpStatus
  statusNote?: string
}

const base: OpTech[] = [
  { id: "1", code: "#KTV-0842", name: "Trần Văn Cường", skills: ["Điện lạnh", "Máy giặt"], district: "Cầu Giấy", city: "Hà Nội", available: true, rating: 4.95, status: "active" },
  { id: "2", code: "#KTV-0618", name: "Lê Hải", skills: ["Điện lạnh", "Điện nước"], district: "Quận 1", city: "TP.HCM", available: true, rating: 4.88, status: "active" },
  { id: "3", code: "#KTV-0925", name: "Phạm Tuấn", skills: ["Điện gia dụng", "Bình nóng lạnh"], district: "Đống Đa", city: "Hà Nội", available: false, rating: 4.76, status: "active" },
  { id: "4", code: "#KTV-0402", name: "Đỗ Minh Quân", skills: ["Điện lạnh", "Máy giặt"], district: "Quận 7", city: "TP.HCM", available: false, rating: 4.3, status: "locked", statusNote: "Vi phạm thu thiếu tiền" },
  { id: "5", code: "#KTV-0755", name: "Bùi Cẩm Tú", skills: ["Thiết bị bếp", "Điện gia dụng"], district: "Ba Đình", city: "Hà Nội", available: true, rating: 4.98, status: "active" },
  { id: "6", code: "#KTV-0511", name: "Nguyễn Văn Nam", skills: ["Điện lạnh", "Hệ thống nước"], district: "Cầu Giấy", city: "Hà Nội", available: false, rating: 4.62, status: "suspended", statusNote: "Chờ đối soát tiền ca" },
  { id: "7", code: "#KTV-0399", name: "Hoàng Quân", skills: ["Máy giặt", "Điện gia dụng"], district: "Bình Thạnh", city: "TP.HCM", available: true, rating: 4.45, status: "active" },
  { id: "8", code: "#KTV-0884", name: "Trần Dũng", skills: ["Điện lạnh", "Máy giặt"], district: "Đống Đa", city: "Hà Nội", available: true, rating: 4.91, status: "active" },
]

// ---- Sinh thêm dữ liệu cố định (không random) để thử phân trang ----
const LAST = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Vũ", "Đặng", "Bùi", "Đỗ", "Ngô"]
const MID = ["Văn", "Minh", "Quốc", "Đình", "Hữu", "Anh", "Thành", "Công"]
const FIRST = ["An", "Bình", "Dũng", "Hải", "Khánh", "Long", "Nam", "Phúc", "Quân", "Sơn", "Tùng", "Việt"]
const SKILL_SETS = [
  ["Điện lạnh", "Máy giặt"],
  ["Điện nước", "Hệ thống nước"],
  ["Điện gia dụng", "Bình nóng lạnh"],
  ["Thiết bị bếp", "Điện gia dụng"],
  ["Máy giặt", "Điện gia dụng"],
  ["Điện lạnh", "Điện nước"],
]
const AREAS: [string, string][] = [
  ["Cầu Giấy", "Hà Nội"], ["Đống Đa", "Hà Nội"], ["Ba Đình", "Hà Nội"], ["Hoàng Mai", "Hà Nội"],
  ["Quận 1", "TP.HCM"], ["Quận 7", "TP.HCM"], ["Bình Thạnh", "TP.HCM"],
]

const generated: OpTech[] = Array.from({ length: 52 }, (_, i) => {
  const [district, city] = AREAS[(i * 3) % AREAS.length]
  const locked = i % 13 === 5
  const suspended = !locked && i % 9 === 4
  return {
    id: String(100 + i),
    code: `#KTV-${String(1000 + ((i * 47) % 900)).padStart(4, "0")}`,
    name: `${LAST[i % LAST.length]} ${MID[(i * 3) % MID.length]} ${FIRST[(i * 5) % FIRST.length]}`,
    skills: SKILL_SETS[i % SKILL_SETS.length],
    district,
    city,
    available: !locked && !suspended && i % 4 !== 3,
    rating: Math.round((4.1 + ((i * 11) % 9) / 10) * 100) / 100,
    status: locked ? "locked" : suspended ? "suspended" : "active",
    statusNote: locked ? "Vi phạm thu thiếu tiền" : suspended ? "Chờ đối soát tiền ca" : undefined,
  }
})

export const opTechnicians: OpTech[] = [...base, ...generated]

// ======================= CHI TIẾT =======================

export type SkillState = "approved" | "pending" | "missing" | "rejected"
export type SkillCard = {
  id: string
  title: string
  subtitle: string
  state: SkillState
  cert?: { name: string; meta: string }
  note?: string
}
export type DocItem = { label: string; state: string }
export type OrderRow = { code: string; customer: string; service: string; date: string; amount: number; status: "done" | "cancelled" }
export type Review = { id: string; customer: string; date: string; rating: number; comment: string }
export type Violation = { id: string; title: string; date: string; orderCode?: string; action: string }

export type OpTechDetail = OpTech & {
  phoneFull: string // chỉ số, vd 0918423901
  email: string
  dob: string
  workAreas: string
  address: string
  updatedAt: string
  joinedAt: string
  approver: string
  internalNote: string
  docs: DocItem[]
  skillCards: SkillCard[]
  orders: OrderRow[]
  reviews: Review[]
  reviewCount: number
  satisfaction: number
  violations: Violation[]
  stats: {
    ratingCount: number
    completion: number
    cancel: number
    heldCash: number
    lastActive: string
    lastOrder: string
    gps: string
  }
}

const slug = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d")
    .toLowerCase().replace(/[^a-z0-9]+/g, "")

export const formatPhone = (d: string) => `${d.slice(0, 4)}.${d.slice(4, 7)}.${d.slice(7)}`
export const maskPhone = (d: string) => `${d.slice(0, 4)}.${d.slice(4, 7)}.xxx`

const SAMPLE_ORDERS: OrderRow[] = [
  { code: "#HF-8939", customer: "Nguyễn Mai Phương", service: "Điện nước • Máy lọc nước", date: "2024-10-15", amount: 350_000, status: "done" },
  { code: "#HF-8841", customer: "Vũ Hải Đăng", service: "Điện lạnh • Máy điều hòa", date: "2024-10-12", amount: 450_000, status: "done" },
  { code: "#HF-8790", customer: "Lê Thu Hà", service: "Thiết bị gia dụng • Bếp gas", date: "2024-10-08", amount: 550_000, status: "done" },
  { code: "#HF-8711", customer: "Phạm Quốc Việt", service: "Điện lạnh • Tủ lạnh", date: "2024-10-02", amount: 400_000, status: "done" },
  { code: "#HF-8650", customer: "Đỗ Tuấn Anh", service: "Điện nước • Máy nước nóng", date: "2024-09-25", amount: 280_000, status: "done" },
]

const SAMPLE_REVIEWS: Review[] = [
  { id: "r1", customer: "Nguyễn Mai Phương", date: "2024-10-15", rating: 5, comment: "Anh Cường đến đúng giờ, bọc giày sàn gỗ rất cẩn thận trước khi vào sửa điều hòa. Rất ưng ý tác phong!" },
  { id: "r2", customer: "Phạm Thu Trang", date: "2024-10-14", rating: 5, comment: "Bắt đúng bệnh máy giặt rung lắc và cấp nước yếu. Thay linh kiện báo giá minh bạch theo bảng giá app." },
  { id: "r3", customer: "Bùi Hoàng Yến", date: "2024-10-12", rating: 5, comment: "Làm việc tận tâm, dọn dẹp sạch sẽ trước khi bàn giao và ký biên bản. Sẽ tiếp tục book lại." },
  { id: "r4", customer: "Trịnh Minh Quân", date: "2024-10-09", rating: 4, comment: "Kỹ năng tốt, chỉ trừ 1 sao vì đến muộn hơn khung giờ hẹn tầm 7 phút do tắc đường Nguyễn Trãi." },
  { id: "r5", customer: "Lê Thanh Thảo", date: "2024-10-04", rating: 5, comment: "Thợ rất lịch sự, giải thích rõ nguyên nhân cuộc nước lạnh và bảo dưỡng dứt điểm." },
]

export function getOperatorTechDetail(id: string): OpTechDetail | null {
  const t = opTechnicians.find((x) => x.id === id)
  if (!t) return null

  const sample = t.id === "1"
  const n = Number(t.id) || 0

  const approved = (i: number, title: string, subtitle: string): SkillCard => ({
    id: `s${i}`, title, subtitle, state: "approved",
    cert: { name: `Chứng chỉ ${title}`, meta: "Ngày cấp: 20/06/2022 • 5 năm kinh nghiệm" },
  })

  const skillCards: SkillCard[] = sample
    ? [
        { id: "s1", title: "Điện lạnh & Điều hòa Inverter", subtitle: "Bậc: Chuyên gia cao cấp", state: "approved", cert: { name: "Chứng chỉ Daikin VRV/VRV Master...", meta: "Ngày cấp: 15/03/2021 • 8 năm kinh nghiệm thực tế" } },
        { id: "s2", title: "Máy giặt & Thiết bị giặt sấy", subtitle: "Bậc: Bậc chuyên sâu", state: "approved", cert: { name: "Electrolux & Panasonic Service P...", meta: "Ngày cấp: 20/06/2022 • 5 năm kinh nghiệm" } },
        { id: "s3", title: "Bình nước nóng & Hệ thống nhiệt", subtitle: "Nhóm thiết bị gia dụng nhiệt", state: "pending", cert: { name: "Chung_chi_Ariston_Pro_Tech.pdf", meta: "Ngày nộp: 12/10/2024 (Chờ 3 ngày) • KTV yêu cầu mở rộng thêm nhóm bình nước nóng gia dụng" } },
        { id: "s4", title: "Điện nước gia dụng tổng hợp", subtitle: "Kỹ thuật điện nước cấp thoát nước", state: "missing", note: "KTV đã chọn nhóm hỗ trợ nhưng chưa tải ảnh chứng chỉ / bằng nghề. Cần bổ sung chứng chỉ cơ cấp nghề hoặc xác nhận 2 năm thâm niên." },
      ]
    : t.skills.map((s, i) => approved(i + 1, s, "Bậc: Chuyên sâu"))

  return {
    ...t,
    phoneFull: sample ? "0918423901" : `09${String((n * 37) % 100).padStart(2, "0")}${String(100000 + ((n * 7919) % 900000))}`,
    email: sample ? "cuong.tran88@gmail.com" : `${slug(t.name)}${n}@gmail.com`,
    dob: sample ? "1990-05-14" : `199${n % 10}-0${1 + (n % 9)}-1${n % 9}`,
    workAreas: sample ? "Cầu Giấy & Đống Đa, TP. Hà Nội" : `${t.district}, ${t.city}`,
    address: sample
      ? "Số 42 Ngõ 175 Phường Cầu Giấy, Quận Cầu Giấy, TP. Hà Nội"
      : `Số ${(n % 90) + 1} ngõ ${(n % 40) + 1}, ${t.district}, ${t.city}`,
    updatedAt: "2024-10-15",
    joinedAt: sample ? "2021-03-15" : `202${n % 5}-0${1 + (n % 9)}-10`,
    approver: sample ? "Lê Hoàng Nam" : "Trần Minh Đức",
    internalNote: sample
      ? "Thợ cứng tay nghề Điện lạnh Inverter, xử lý khéo léo các ca khó của Daikin và Panasonic. Khách hàng đánh giá rất cao thái độ lễ phép và tác phong che chắn cẩn thận trước khi xịt rửa. Ưu tiên phân bổ các ca đường trọn gói chung cư cao cấp."
      : "",
    docs: [
      { label: "CCCD mặt trước & sau", state: "Đã xác thực" },
      { label: "Ảnh chân dung cầm thẻ", state: "Hợp lệ" },
      { label: "Lý lịch tư pháp số 2", state: "Đã nộp bản gốc" },
    ],
    skillCards,
    orders: sample ? SAMPLE_ORDERS : [],
    reviews: sample ? SAMPLE_REVIEWS : [],
    reviewCount: sample ? 1120 : 40 + n * 7,
    satisfaction: sample ? 99.1 : Math.round(Math.min(99.5, 85 + t.rating * 2.8) * 10) / 10,
    violations: sample
      ? [{ id: "v1", title: "Trễ hẹn 15 phút không báo khách", date: "2023-08-12", orderCode: "#HF-4120", action: "Nhắc nhở nội bộ" }]
      : t.status === "locked"
        ? [{ id: "v1", title: "Thu thiếu tiền đơn hàng", date: "2024-09-01", orderCode: `#HF-${4000 + n}`, action: "Khóa tài khoản" }]
        : [],
    stats: {
      ratingCount: sample ? 1120 : 40 + n * 7,
      completion: sample ? 94.7 : Math.round((88 + (n % 10)) * 10) / 10,
      cancel: sample ? 2.6 : Math.round((1 + (n % 9)) * 10) / 10,
      heldCash: sample ? 1_250_000 : n % 4 === 0 ? (1 + (n % 5)) * 250_000 : 0,
      lastActive: sample ? "12 phút trước" : `${5 + (n % 50)} phút trước`,
      lastOrder: sample ? "#HF-8939" : `#HF-${8000 + n}`,
      gps: sample ? "Ngõ 165 Cầu Giấy, Hà Nội" : `${t.district}, ${t.city}`,
    },
  }
}