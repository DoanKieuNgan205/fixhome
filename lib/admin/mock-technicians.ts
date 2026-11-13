export type TechStatus = "active" | "locked"

export type Technician = {
  id: string
  code: string
  name: string
  phone: string // đã che bớt số cuối
  specialty: string
  group: string // nhóm chuyên môn dùng để lọc
  district: string
  city: string
  available: boolean // đang bật nhận việc
  ordersThisMonth: number
  completionRate: number // %
  cancelByTech: number // % KTV hủy
  cancelByCustomer: number // % khách hủy
  rating: number
  reviews: number
  debt: number // nợ tiền mặt (đồng)
  status: TechStatus
  lockReason?: string
}

export const skillGroups = ["Điện lạnh", "Nước & RO", "Điện gia dụng", "Máy giặt & sấy", "Điện nước"]

// 10 KTV đầu giống thiết kế
const base: Technician[] = [
  { id: "1", code: "#KTV-HN-8842", name: "Trần Văn Cường", phone: "0918.423.8xx", specialty: "Điện lạnh Inverter", group: "Điện lạnh", district: "Cầu Giấy", city: "HN", available: true, ordersThisMonth: 38, completionRate: 94.7, cancelByTech: 2.6, cancelByCustomer: 2.7, rating: 4.95, reviews: 142, debt: 1_250_000, status: "active" },
  { id: "2", code: "#KTV-HN-6204", name: "Lê Hoàng Nam", phone: "0972.115.4xx", specialty: "Thiết bị nước & RO", group: "Nước & RO", district: "Ba Đình", city: "HN", available: true, ordersThisMonth: 44, completionRate: 97.7, cancelByTech: 2.3, cancelByCustomer: 0, rating: 4.9, reviews: 189, debt: 0, status: "active" },
  { id: "3", code: "#KTV-HN-7621", name: "Phạm Văn Quý", phone: "0904.882.3xx", specialty: "Điện gia dụng & Bếp", group: "Điện gia dụng", district: "Cầu Giấy", city: "HN", available: true, ordersThisMonth: 31, completionRate: 93.5, cancelByTech: 6.5, cancelByCustomer: 0, rating: 4.85, reviews: 95, debt: 0, status: "active" },
  { id: "4", code: "#KTV-HN-5109", name: "Nguyễn Đình Trọng", phone: "0936.551.9xx", specialty: "Điện lạnh trung tâm", group: "Điện lạnh", district: "Đống Đa", city: "HN", available: true, ordersThisMonth: 18, completionRate: 88.9, cancelByTech: 5.6, cancelByCustomer: 5.5, rating: 4.65, reviews: 63, debt: 0, status: "active" },
  { id: "5", code: "#KTV-HN-9441", name: "Vũ Minh Tuấn", phone: "0988.223.7xx", specialty: "Máy giặt cửa ngang", group: "Máy giặt & sấy", district: "Nam Từ Liêm", city: "HN", available: true, ordersThisMonth: 29, completionRate: 93.1, cancelByTech: 3.4, cancelByCustomer: 3.5, rating: 4.8, reviews: 151, debt: 680_000, status: "active" },
  { id: "6", code: "#KTV-HN-3320", name: "Đặng Quốc Hùng", phone: "0912.449.1xx", specialty: "Điều hòa VRV/VRF", group: "Điện lạnh", district: "Thanh Xuân", city: "HN", available: false, ordersThisMonth: 0, completionRate: 0, cancelByTech: 0, cancelByCustomer: 0, rating: 4.5, reviews: 0, debt: 0, status: "locked" },
  { id: "7", code: "#KTV-HN-4412", name: "Bùi Anh Tuấn", phone: "0979.664.2xx", specialty: "Điện nước tổng hợp", group: "Điện nước", district: "Hà Đông", city: "HN", available: true, ordersThisMonth: 36, completionRate: 94.4, cancelByTech: 2.8, cancelByCustomer: 2.8, rating: 4.75, reviews: 104, debt: 0, status: "active" },
  { id: "8", code: "#KTV-HN-1288", name: "Hoàng Văn Thái", phone: "0903.771.5xx", specialty: "Điện gia dụng thông minh", group: "Điện gia dụng", district: "Hai Bà Trưng", city: "HN", available: true, ordersThisMonth: 27, completionRate: 81.5, cancelByTech: 14.8, cancelByCustomer: 3.7, rating: 4.35, reviews: 71, debt: 0, status: "active" },
  { id: "9", code: "#KTV-HN-7762", name: "Phan Đình Toàn", phone: "0945.112.8xx", specialty: "Điều hòa Inverter", group: "Điện lạnh", district: "Tây Hồ", city: "HN", available: false, ordersThisMonth: 0, completionRate: 0, cancelByTech: 0, cancelByCustomer: 0, rating: 4.2, reviews: 0, debt: 0, status: "locked", lockReason: "Vi phạm thái độ" },
  { id: "10", code: "#KTV-HN-8819", name: "Đỗ Hữu Thắng", phone: "0983.445.6xx", specialty: "Máy giặt & Sấy", group: "Máy giặt & sấy", district: "Hoàng Mai", city: "HN", available: true, ordersThisMonth: 25, completionRate: 96, cancelByTech: 0, cancelByCustomer: 4, rating: 4.88, reviews: 83, debt: 0, status: "active" },
]

// ---- Sinh thêm dữ liệu cố định (không random) để thử phân trang ----
const LAST = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Vũ", "Đặng", "Bùi", "Đỗ", "Ngô"]
const MID = ["Văn", "Minh", "Quốc", "Đình", "Hữu", "Anh", "Thành", "Công"]
const FIRST = ["An", "Bình", "Dũng", "Hải", "Khánh", "Long", "Nam", "Phúc", "Quân", "Sơn", "Tùng", "Việt"]
const SKILLS = [
  { group: "Điện lạnh", text: "Điều hòa dân dụng" },
  { group: "Nước & RO", text: "Máy lọc nước RO" },
  { group: "Điện gia dụng", text: "Bếp từ & lò nướng" },
  { group: "Máy giặt & sấy", text: "Máy giặt cửa trên" },
  { group: "Điện nước", text: "Điện nước dân dụng" },
  { group: "Điện lạnh", text: "Tủ lạnh Side by Side" },
]
const AREAS = ["Cầu Giấy", "Ba Đình", "Đống Đa", "Hà Đông", "Tây Hồ", "Nam Từ Liêm", "Thanh Xuân", "Hoàng Mai", "Hai Bà Trưng"]
const LOCK_REASONS = ["Vi phạm thái độ", "Nợ tiền quá hạn", "Vi phạm kỷ luật"]

const pad = (n: number) => String(n).padStart(2, "0")
const r1 = (n: number) => Math.round(n * 10) / 10

const generated: Technician[] = Array.from({ length: 38 }, (_, i) => {
  const locked = i % 9 === 4
  const sk = SKILLS[i % SKILLS.length]
  const highCancel = !locked && i % 11 === 0
  return {
    id: String(100 + i),
    code: `#KTV-HN-${1000 + ((i * 977) % 9000)}`,
    name: `${LAST[i % LAST.length]} ${MID[(i * 3) % MID.length]} ${FIRST[(i * 5) % FIRST.length]}`,
    phone: `09${pad((i * 13) % 100)}.${100 + ((i * 17) % 900)}.${(i * 7) % 10}xx`,
    specialty: sk.text,
    group: sk.group,
    district: AREAS[(i * 5) % AREAS.length],
    city: "HN",
    available: !locked && i % 4 !== 3,
    ordersThisMonth: locked ? 0 : 10 + ((i * 7) % 40),
    completionRate: locked ? 0 : highCancel ? r1(80 + (i % 5)) : r1(Math.min(99.5, 88 + ((i * 53) % 120) / 10)),
    cancelByTech: locked ? 0 : highCancel ? 12.4 : r1(((i * 13) % 60) / 10),
    cancelByCustomer: locked ? 0 : r1(((i * 7) % 70) / 10),
    rating: r1(4.1 + ((i * 11) % 9) / 10),
    reviews: locked ? 0 : 20 + ((i * 17) % 180),
    debt: !locked && i % 5 === 2 ? (1 + (i % 6)) * 250_000 : 0,
    status: locked ? "locked" : "active",
    lockReason: locked ? LOCK_REASONS[i % LOCK_REASONS.length] : undefined,
  }
})

export const technicians: Technician[] = [...base, ...generated]