// lib/admin/mock-orders.ts
// Dữ liệu mẫu cho màn hình Quản lý đơn hàng. Khi backend có API đơn hàng cho admin,
// chỉ cần đổi nội dung lib/admin/orders-read.ts, giao diện giữ nguyên.
import type { CashState, OrderDetail, OrderStatus } from "./order-types"

const customers = [
  ["Nguyễn Văn An", "0912.448.2xx"], ["Lê Hoàng Nam", "0935.778.1xx"], ["Đặng Ngọc Bích", "0944.723.4xx"],
  ["Trịnh Quốc Đạt", "0978.334.6xx"], ["Bùi Đình Trọng", "0966.882.1xx"], ["Phạm Quốc Hưng", "0918.442.3xx"],
  ["Hoàng Thảo My", "0983.112.520"],
]
const techs = [
  ["Trần Văn Cường", "TC"], ["Ngô Gia Bảo", "GB"], ["Vũ Hoàng Long", "HL"], ["Lê Tuấn Tú", "TT"], ["Phạm Văn Quý", "PQ"],
]
const services = [
  ["Sửa bo mạch máy giặt Electrolux", "Máy giặt"], ["Vệ sinh & nạp gas tủ lạnh", "Tủ lạnh"], ["Sửa máy rửa bát", "Máy rửa bát"],
  ["Thay lốc tủ đông Sanaky", "Tủ đông"], ["Xử lý rò rỉ nước máy giặt LG", "Máy giặt"], ["Bảo dưỡng bình nóng lạnh", "Bình nóng lạnh"],
  ["Vệ sinh điều hòa Daikin Inverter", "Điều hòa"],
]
const areas = ["Cầu Giấy", "Ba Đình", "Nam Từ Liêm", "Đống Đa"]
const slots = ["14:00", "10:00", "15:30", "08:30", "08:00", "16:45", "11:30"]
const stepPlan: [OrderStatus, number][] = [
  ["in_progress", 4], ["in_progress", 3], ["in_progress", 6], ["in_progress", 5], ["completed", 7],
  ["in_progress", 4], ["new", 1], ["completed", 7], ["cancelled", 2], ["in_progress", 2],
]

function build(i: number): OrderDetail {
  const [cname, cphone] = customers[i % customers.length]
  const [tname, tini] = techs[i % techs.length]
  const [service, device] = services[i % services.length]
  const [status, step] = stepPlan[i % stepPlan.length]
  const day = 15 + (i % 6)
  const code = `HF-${8942 - i * 3}`
  const scheduledAt = `2024-10-${String(day).padStart(2, "0")}T${slots[i % slots.length]}:00+07:00`
  const hasTech = step >= 2
  const finalPrice = step >= 5 ? 1350000 - (i % 3) * 150000 : null
  const cash: CashState = status === "completed" ? (i % 2 ? "collected" : "handed_over") : "unpaid"
  return {
    code,
    customer: {
      name: cname, phone: cphone,
      address: `Số ${40 + i} Ngõ ${175 + i}, P. Dịch Vọng Hậu, Q. ${areas[i % areas.length]}, Hà Nội`,
      tier: i % 2 ? "Khách mới" : "Khách quen (3 đơn)",
    },
    issue: `Thiết bị ${device.toLowerCase()} hoạt động không ổn định, có tiếng ồn bất thường. Cần kiểm tra gấp trong buổi sáng.`,
    service,
    area: areas[i % areas.length],
    scheduledAt,
    technician: hasTech
      ? {
          id: `KTV-0${70 + (i % techs.length)}`, name: i % techs.length === 4 ? "Phạm Văn Quý" : tname,
          phone: "0974.882.120", rating: 4.8, completedOrders: 92, hub: `Hub ${areas[i % areas.length]}`,
          availability: tini === "PQ" ? "Đang sửa tại chỗ" : "Sẵn sàng",
        }
      : null,
    status, step,
    stepTimes: ["09:15 · Đã tiếp nhận", "09:20 · KTV nhận đơn", "09:40 · Di chuyển", "10:05 · Tại nhà khách", "10:25 · Đã có OTP", "10:30 · Hiện tại", ""]
      .map((t, k) => (k < step ? t : "")),
    lines: [
      { name: `Bảo dưỡng ${device.toLowerCase()}`, note: "Dịch vụ bảo dưỡng định kỳ", amount: 350000 },
      { name: "Thay tụ khởi động", note: "Linh kiện chính hãng · bảo hành 6 tháng", badge: "Phát sinh", amount: 900000 },
      { name: "Tiền công", amount: 200000 },
    ],
    quoteFrom: 500000, quoteTo: 600000, finalPrice, cash,
    reconcile: finalPrice
      ? { collected: finalPrice, techShare: Math.round(finalPrice * 0.8) - 40000, handOver: Math.round(finalPrice * 0.2) + 220000, deadline: "20:00 cùng ngày", hubName: `Hub ${areas[i % areas.length]}` }
      : null,
    photos: [
      { label: "Trước khi sửa", caption: "Tem thông số máy & mã lỗi", kind: "before" },
      { label: "Trước khi sửa", caption: "Cụm tụ bị phồng hỏng", kind: "before" },
      { label: "Sau khi sửa #1", caption: "Nghiệm thu chạy thử", kind: step >= 7 ? "after" : "empty" },
      { label: "Sau khi sửa #2", caption: "Bàn giao khách ký", kind: step >= 7 ? "after" : "empty" },
    ],
    history: [
      { at: "09:15", title: "Đơn được tạo và tiếp nhận", by: "Hệ thống" },
      { at: "09:20", title: "Điều phối viên phân công kỹ thuật viên", by: "Nhân viên vận hành" },
      { at: "09:40", title: "Kỹ thuật viên bắt đầu di chuyển", by: "Kỹ thuật viên" },
      { at: "10:05", title: "Kỹ thuật viên đến nhà khách, bắt đầu kiểm tra", by: "Kỹ thuật viên" },
      { at: "10:25", title: "Khách xác nhận báo giá bằng mã OTP", by: "Khách hàng" },
    ].slice(0, Math.max(1, step)),
  }
}

export const MOCK_ORDERS: OrderDetail[] = Array.from({ length: 42 }, (_, i) => build(i))
export const TODAY_COUNT = 384