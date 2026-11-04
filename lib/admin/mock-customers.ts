export type CustomerStatus = "active" | "inactive" | "locked"

export type Customer = {
  id: string
  code: string
  name: string
  phone: string // đã che bớt số cuối
  email: string // đã che bớt
  district: string
  city: string
  createdAt: string // yyyy-mm-dd
  completedOrders: number
  status: CustomerStatus
  vip?: boolean
  cancelWarning?: boolean // hay hủy đơn
}

const base: Customer[] = [
  { id: "1", code: "#CUST-9901", name: "Đỗ Minh Quân", phone: "0934.129.8xx", email: "quan.do***@gmail.com", district: "Hoàng Mai", city: "Hà Nội", createdAt: "2026-11-02", completedOrders: 0, status: "inactive" },
  { id: "2", code: "#CUST-3890", name: "Phạm Quốc Hưng", phone: "0918.442.3xx", email: "hung.pham***@gmail.com", district: "Ba Đình", city: "Hà Nội", createdAt: "2023-11-22", completedOrders: 0, status: "locked" },
  { id: "3", code: "#CUST-4109", name: "Bùi Đình Trọng", phone: "0966.882.1xx", email: "trong.bui***@gmail.com", district: "Hà Đông", city: "Hà Nội", createdAt: "2023-09-18", completedOrders: 1, status: "locked", cancelWarning: true },
  { id: "4", code: "#CUST-5211", name: "Đặng Ngọc Bích", phone: "0944.723.4xx", email: "bich.dang***@gmail.com", district: "Cầu Giấy", city: "Hà Nội", createdAt: "2023-08-02", completedOrders: 12, status: "active" },
  { id: "5", code: "#CUST-6520", name: "Vũ Thị Mai Anh", phone: "0936.559.8xx", email: "maianh***@outlook.com", district: "Nam Từ Liêm", city: "Hà Nội", createdAt: "2023-06-14", completedOrders: 5, status: "active" },
  { id: "6", code: "#CUST-6112", name: "Trịnh Quốc Đạt", phone: "0978.334.6xx", email: "dat.trinh***@gmail.com", district: "Tây Hồ", city: "Hà Nội", createdAt: "2023-05-08", completedOrders: 6, status: "active" },
  { id: "7", code: "#CUST-7740", name: "Trần Quốc Cường", phone: "0912.448.2xx", email: "cuong.tr***@yahoo.com", district: "Đống Đa", city: "Hà Nội", createdAt: "2023-04-20", completedOrders: 8, status: "active" },
  { id: "8", code: "#CUST-8939", name: "Hoàng Thảo My", phone: "0983.456.7xx", email: "my.hoang***@gmail.com", district: "Cầu Giấy", city: "Hà Nội", createdAt: "2023-02-10", completedOrders: 16, status: "active", vip: true },
  { id: "9", code: "#CUST-8821", name: "Nguyễn Mai Phương", phone: "0983.112.5xx", email: "phuong.ng***@gmail.com", district: "Cầu Giấy", city: "Hà Nội", createdAt: "2023-01-15", completedOrders: 18, status: "active", vip: true },
  { id: "10", code: "#CUST-9102", name: "Lê Hoàng Nam", phone: "0905.778.1xx", email: "nam.le***@gmail.com", district: "Thanh Xuân", city: "Hà Nội", createdAt: "2022-11-05", completedOrders: 24, status: "active", vip: true },
]

// ---- Sinh thêm dữ liệu cố định (không random) để thử phân trang ----
const LAST = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Vũ", "Đặng", "Bùi", "Đỗ", "Ngô"]
const MID = ["Văn", "Thị", "Minh", "Quốc", "Thảo", "Ngọc", "Hải", "Mai"]
const FIRST = ["An", "Bình", "Cường", "Dũng", "Hà", "Hương", "Khánh", "Lan", "Nam", "Phúc", "Quân", "Trang"]
const AREAS: [string, string][] = [
  ["Cầu Giấy", "Hà Nội"], ["Hoàng Mai", "Hà Nội"], ["Ba Đình", "Hà Nội"], ["Tây Hồ", "Hà Nội"],
  ["Đống Đa", "Hà Nội"], ["Nam Từ Liêm", "Hà Nội"], ["Thanh Xuân", "Hà Nội"],
]

const slug = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d").toLowerCase().replace(/\s+/g, "")
const pad = (n: number) => String(n).padStart(2, "0")

const generated: Customer[] = Array.from({ length: 40 }, (_, i) => {
  const name = `${LAST[i % 10]} ${MID[i % 8]} ${FIRST[i % 12]}`
  const [district, city] = AREAS[i % AREAS.length]
  const status: CustomerStatus = i % 11 === 0 ? "locked" : i % 7 === 0 ? "inactive" : "active"
  return {
    id: String(100 + i),
    code: `#CUST-${2000 + i * 37}`,
    name,
    phone: `09${pad((i * 13) % 100)}.${100 + ((i * 17) % 900)}.${(i * 7) % 10}xx`,
    email: `${slug(name).slice(0, 8)}***@gmail.com`,
    district,
    city,
    createdAt: `2025-${pad(1 + (i % 12))}-${pad(1 + ((i * 3) % 28))}`,
    completedOrders: status === "active" ? (i * 7) % 25 : 0,
    status,
    vip: status === "active" && i % 9 === 0,
    cancelWarning: status === "locked" && i % 2 === 0,
  }
})

export const customers: Customer[] = [...base, ...generated].sort((a, b) =>
  b.createdAt.localeCompare(a.createdAt),
)

export const areas = Array.from(new Set(customers.map((c) => c.district))).sort()