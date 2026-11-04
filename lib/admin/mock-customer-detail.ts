import { customers, type Customer } from "./mock-customers"

export type Address = {
  id: string
  title: string
  isDefault: boolean
  line: string
  tags: string[]
  note?: string
}

export type OrderStatus = "done" | "running" | "cancelled"

export type Order = {
  code: string
  dateTime: string // yyyy-mm-ddThh:mm
  place: string
  service: string
  device: string
  category: string
  techName: string
  techCode: string
  amount: number
  status: OrderStatus
  note?: string
}

export type RecentTech = {
  name: string
  specialty: string
  rating?: number // undefined = chưa đánh giá
  comment: string
}

export type CustomerDetail = Customer & {
  dob: string
  gender: "Nam" | "Nữ"
  phoneVerified: boolean
  segment: string
  totalSpent: number
  stats: { total: number; done: number; cancelled: number; complaints: number; trust: number }
  addresses: Address[]
  orders: Order[]
  technicians: RecentTech[]
  security: { lastLogin: string; device: string; twoFactor: boolean; failedLogins: number }
}

const pad = (n: number) => String(n).padStart(2, "0")

const CATALOG = [
  { service: "Vệ sinh điều hòa", device: "Điều hòa treo tường • 9000 BTU", category: "Điện lạnh" },
  { service: "Sửa tủ lạnh không đông", device: "Tủ lạnh Samsung Inverter 320 Lít", category: "Điện lạnh" },
  { service: "Thay bơm tăng áp", device: "Máy bơm Panasonic 200W", category: "Điện nước" },
  { service: "Sửa máy giặt báo lỗi", device: "Máy giặt LG cửa ngang • 9kg", category: "Điện gia dụng" },
  { service: "Lắp bình nóng lạnh", device: "Bình Ariston 30 Lít", category: "Điện nước" },
  { service: "Sửa bếp từ", device: "Bếp từ đôi Sunhouse", category: "Điện gia dụng" },
  { service: "Thay ổ cắm & aptomat", device: "Hệ thống điện căn hộ", category: "Điện nước" },
  { service: "Bảo dưỡng máy lọc nước", device: "Máy lọc RO 9 lõi", category: "Điện nước" },
]

const TECHS = [
  { name: "KTV Trần Văn Cường", code: "#KTV-HN-8842" },
  { name: "KTV Phạm Văn Quý", code: "#KTV-HN-7621" },
  { name: "KTV Lê Hoàng Nam", code: "#KTV-HN-6204" },
]

function makeOrder(
  i: number,
  place: string,
  dateTime: string,
  status: OrderStatus,
): Order {
  const item = CATALOG[i % CATALOG.length]
  const tech = TECHS[i % TECHS.length]
  return {
    code: `#HF-${7000 - i * 37}`,
    dateTime,
    place,
    service: item.service,
    device: item.device,
    category: item.category,
    techName: tech.name,
    techCode: tech.code,
    amount: status === "cancelled" ? 0 : 250_000 + ((i * 137_000) % 1_900_000),
    status,
    note: status === "cancelled" ? "Khách đổi lịch đột xuất" : undefined,
  }
}

// 6 đơn gần nhất của khách mẫu, giống thiết kế
const SAMPLE_ORDERS: Order[] = [
  {
    code: "#HF-8939", dateTime: "2024-10-15T09:30", place: "Căn hộ Discovery Complex",
    service: "Vệ sinh & Bảo dưỡng điều hòa Daikin Inverter", device: "Phòng khách • 12000 BTU",
    category: "Điện lạnh", techName: "KTV Trần Văn Cường", techCode: "#KTV-HN-8842",
    amount: 450_000, status: "done",
  },
  {
    code: "#HF-8412", dateTime: "2024-06-12T14:15", place: "Căn hộ Discovery Complex",
    service: "Sửa bo mạch & thay van cấp nước Máy giặt Electrolux", device: "UltimateCare 500 • 9kg",
    category: "Điện gia dụng", techName: "KTV Phạm Văn Quý", techCode: "#KTV-HN-7621",
    amount: 890_000, status: "done",
  },
  {
    code: "#HF-7830", dateTime: "2024-03-20T10:00", place: "Căn hộ Discovery Complex",
    service: "Nạp ga R-FW690 & vệ sinh dàn lạnh Tủ lạnh Hitachi", device: "Hitachi Side-by-side 569 Lít",
    category: "Điện lạnh", techName: "KTV Trần Văn Cường", techCode: "#KTV-HN-8842",
    amount: 620_000, status: "done",
  },
  {
    code: "#HF-7105", dateTime: "2024-01-05T16:30", place: "Nhà bố mẹ (Trần Thái Tông)",
    service: "Sửa vòi sen tăng áp & thay lõi lọc nước", device: "Hệ thống lọc RO 3 cấp",
    category: "Điện nước", techName: "KTV Lê Hoàng Nam", techCode: "#KTV-HN-6204",
    amount: 380_000, status: "done",
  },
  {
    code: "#HF-6540", dateTime: "2023-11-18T08:45", place: "Căn hộ Discovery Complex",
    service: "Kiểm tra rò rỉ điện bình nước nóng", device: "Bình nóng lạnh Ariston 30 Lít",
    category: "Điện nước", techName: "KTV Phạm Văn Quý", techCode: "#KTV-HN-7621",
    amount: 0, status: "cancelled", note: "Khách đổi lịch đột xuất",
  },
  {
    code: "#HF-5922", dateTime: "2023-09-02T09:00", place: "Căn hộ Discovery Complex",
    service: "Bảo trì trọn gói điện gia dụng định kỳ", device: "Đo an toàn tải Aptomat & đường điện âm tường",
    category: "Điện gia dụng", techName: "KTV Lê Hoàng Nam", techCode: "#KTV-HN-6204",
    amount: 1_200_000, status: "done",
  },
]

function buildOrders(c: Customer, total: number, cancelled: number): Order[] {
  if (c.id === "9") {
    // 13 đơn cũ hơn, từ tháng 8/2023 trở về tháng 2/2023
    const older = Array.from({ length: 13 }, (_, i) =>
      makeOrder(
        i + 6,
        "Căn hộ Discovery Complex",
        `2023-${pad(8 - Math.floor(i / 2))}-${pad(25 - (i % 2) * 10)}T${pad(8 + (i % 8))}:30`,
        "done",
      ),
    )
    return [...SAMPLE_ORDERS, ...older]
  }
  return Array.from({ length: total }, (_, i) =>
    makeOrder(
      i,
      `Nhà riêng (${c.district})`,
      `2026-${pad(Math.max(1, 10 - Math.floor(i / 3)))}-${pad(1 + ((i * 5) % 28))}T${pad(8 + (i % 9))}:00`,
      i >= total - cancelled ? "cancelled" : "done",
    ),
  )
}

export function getCustomerDetail(id: string): CustomerDetail | null {
  const c = customers.find((x) => x.id === id)
  if (!c) return null

  const isSample = c.id === "9"
  const total = isSample ? 19 : c.completedOrders + (c.cancelWarning ? 2 : 0)
  const done = isSample ? 18 : c.completedOrders
  const cancelled = total - done

  return {
    ...c,
    dob: isSample ? "1991-08-14" : `199${Number(c.id) % 10}-0${1 + (Number(c.id) % 9)}-1${Number(c.id) % 10}`,
    gender: isSample ? "Nữ" : Number(c.id) % 2 === 0 ? "Nam" : "Nữ",
    phoneVerified: c.status !== "inactive",
    segment: c.vip ? "VIP Khách Thân Thiết" : "Khách hàng thường",
    totalSpent: isSample ? 14_850_000 : done * 780_000,
    stats: {
      total,
      done,
      cancelled,
      complaints: c.cancelWarning ? 1 : 0,
      trust: total === 0 ? 0 : Math.round((done / total) * 100),
    },
    addresses: [
      {
        id: "a1",
        title: "Tầng 8, Căn 804, Discovery Complex",
        isDefault: true,
        line: `302 Cầu Giấy, Phường Dịch Vọng, Quận ${c.district}, ${c.city}`,
        tags: ["1 Điều hòa Daikin", "1 Máy giặt Electrolux"],
      },
      {
        id: "a2",
        title: "Số 15 ngõ 42 Trần Thái Tông",
        isDefault: false,
        line: `Phường Dịch Vọng Hậu, Quận ${c.district}, ${c.city}`,
        tags: [],
        note: "Chỉ dẫn cho KTV: Nhà 4 tầng cửa cuốn xám, gọi trước 15 phút.",
      },
    ],
    orders: buildOrders(c, total, cancelled),
    technicians: [
      { name: "KTV Phạm Văn Quý", specialty: "Chuyên Điện lạnh dân dụng", rating: 5, comment: "Chuyên nghiệp, tốt" },
      { name: "KTV Trần Văn Cường", specialty: "Chuyên Thiết bị giặt sấy", comment: "Chưa có đánh giá" },
    ],
    security: {
      lastLogin: "2026-11-02T09:12:00",
      device: "iPhone 14 · iOS 17",
      twoFactor: c.vip ?? false,
      failedLogins: c.status === "locked" ? 5 : 0,
    },
  }
}