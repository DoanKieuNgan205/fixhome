export const stats = [
  { label: "Đơn ngoại lệ", value: 4, tone: "red" },
  { label: "Hồ sơ & nghiệp vụ chờ duyệt", value: 5, tone: "blue" },
  { label: "Hỗ trợ & khiếu nại", value: 7, tone: "purple" },
  { label: "Bảo hành sắp đến hạn", value: 8, tone: "green" },
] as const

export type RequestItem = {
  id: string
  waitMinutes: number
  title: string
  area: string
  customer: string
  note?: string
  estimate?: string
  state: "unhandled" | "processing"
}

export const requests: RequestItem[] = [
  { id: "#TC-9281", waitMinutes: 15, title: "Sửa máy lạnh rò rỉ nước & không lạnh", area: "Quận 7 (P. Tân Phong, TP.HCM)", customer: "Nguyễn Văn Hưng", note: "Khách báo gấp", state: "unhandled" },
  { id: "#TC-9281", waitMinutes: 15, title: "Sửa máy lạnh rò rỉ nước & không lạnh", area: "Quận 7 (P. Tân Phong, TP.HCM)", customer: "Nguyễn Văn Hưng", note: "Khách báo gấp", estimate: "450.000đ", state: "unhandled" },
  { id: "#TC-9280", waitMinutes: 25, title: "Lắp đặt bồn cầu & sửa ống nước rò rỉ", area: "Bình Thạnh (P. 25, TP.HCM)", customer: "Trần Thị Mai", note: "Cần gấp trong 1h", estimate: "320.000đ", state: "processing" },
  { id: "#TC-9278", waitMinutes: 30, title: "Khắc phục chập điện aptomat & kiểm tra đường dây", area: "Quận 1 (P. Đa Kao, TP.HCM)", customer: "Lê Hoàng Long", estimate: "500.000đ", state: "processing" },
  { id: "#TC-9275", waitMinutes: 18, title: "Sửa máy giặt Electrolux kêu to khi vắt & rung lắc", area: "TP. Thủ Đức (P. Thảo Điền)", customer: "Đặng Minh Hải", estimate: "380.000đ", state: "unhandled" },
  { id: "#TC-9271", waitMinutes: 12, title: "Sửa khóa cửa cuốn bị kẹt không đóng được", area: "Quận 3 (P. Võ Thị Sáu, TP.HCM)", customer: "Phạm Bích Ngọc", estimate: "400.000đ", state: "unhandled" },
]

export const onlineTechnicians = [
  { name: "Trần Nhật Nam", rating: 4.9, info: "Điện lạnh · Quận 7", status: "Sẵn sàng nhận", tone: "green" },
  { name: "Lê Hoàng Minh", rating: 4.8, info: "Ống nước · Bình Thạnh", status: "Trống lịch 2h tới", tone: "blue" },
  { name: "Vũ Quang Huy", rating: 5.0, info: "Thợ mộc · Thủ Đức", status: "Sẵn sàng nhận", tone: "green" },
  { name: "Đỗ Khắc Tiến", rating: 4.7, info: "Điện dân dụng · Quận 1", status: "Đang di chuyển", tone: "amber" },
] as const