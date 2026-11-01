export const kpis = [
  { label: "DOANH THU", badge: "Tháng này", value: "3.480.000.000 đ", sub: "" },
  { label: "ĐƠN HOÀN THÀNH", badge: "Tháng này", value: "4.820", sub: "đơn" },
  { label: "KTV ĐANG SẴN SÀNG", badge: "Live", value: "98", sub: "/ 1.428 KTV" },
]

export const topTechnicians = [
  { initials: "AN", name: "KTV Nguyễn Văn An", revenue: "3.000.000đ", skill: "Điện lạnh", area: "Q. Cầu Giấy, Hà Nội", tone: "blue" },
  { initials: "BA", name: "KTV Lê Quốc Bảo", revenue: "2.800.000đ", skill: "Sửa đồ gia dụng, máy giặt", area: "Q. Ba Đình, Hà Nội", tone: "amber" },
  { initials: "DA", name: "KTV Trần Hải Đăng", revenue: "2.500.000đ", skill: "Khóa & Cửa cuốn", area: "Q. Nam Từ Liêm, Hà Nội", tone: "rose" },
] as const

export const revenueChart = [
  { day: "01/10", revenue: 85, orders: 130 },
  { day: "07/10", revenue: 95, orders: 140 },
  { day: "14/10", revenue: 108, orders: 150 },
  { day: "21/10", revenue: 118, orders: 165 },
  { day: "28/10", revenue: 128, orders: 178 },
  { day: "Hôm nay", revenue: 135, orders: 188 },
]

export const areas = [
  { code: "KV-HN01", name: "Quận Cầu Giấy, Hà Nội", techs: 38, online: 32, rate: 96.5 },
  { code: "KV-HN03", name: "Quận Nam Từ Liêm, Hà Nội", techs: 22, online: 15, rate: 87.0 },
  { code: "KV-HN05", name: "Quận Hoàng Mai, Hà Nội", techs: 18, online: 11, rate: 78.4 },
]