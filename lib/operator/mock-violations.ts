export type Source = "customer" | "system" | "staff"
export type FlagTone = "muted" | "red" | "amber"

export const SOURCE_LABEL: Record<Source, string> = { customer: "Khách báo", system: "Hệ thống", staff: "Nhân viên" }
export const SOURCE_CLS: Record<Source, string> = {
  customer: "bg-orange-50 text-orange-700",
  system: "bg-blue-50 text-blue-700",
  staff: "bg-indigo-50 text-indigo-700",
}

export const VIOLATION_TYPES = [
  "Thu sai giá / Báo giá ngoài ứng dụng",
  "Hủy đơn sát giờ",
  "Thái độ phục vụ",
  "Gian lận hoàn tất đơn",
  "Vật tư không đạt chuẩn an toàn",
  "Nợ tiền mặt quá hạn",
]

export type ViolationCase = {
  id: string
  techCode: string
  techName: string
  techState: "active" | "suspended"
  phone: string
  area: string
  rating: number
  orders: number
  title: string
  flag: string
  flagTone: FlagTone
  orderCode: string
  orderName: string
  source: Source
  type: string
  handled: boolean
  detail: string
  runningOrders: string[]
  heldCash: number
}

const v = (x: Omit<ViolationCase, "handled" | "runningOrders" | "heldCash" | "detail"> & Partial<ViolationCase>): ViolationCase => ({
  handled: false, runningOrders: [], heldCash: 0, detail: "", ...x,
})

export const violationCases: ViolationCase[] = [
  v({ id: "1", techCode: "#KTV-0612", techName: "Lê Tuấn Tú", techState: "active", phone: "0984.321.xxx", area: "Quận 1, TP.HCM", rating: 4.82, orders: 124,
    title: "Tự ý yêu cầu khách thanh toán thêm 200.000đ tiền nạp ga ngoài hóa đơn", flag: "Lần đầu vi phạm trong 6 tháng", flagTone: "muted",
    orderCode: "#HF-8919", orderName: "Bảo dưỡng điều hòa", source: "customer", type: "Thu sai giá / Báo giá ngoài ứng dụng",
    detail: "KTV yêu cầu khách thanh toán thêm 200.000đ tiền nạp ga ngoài chi phí đã niêm yết trong đơn hàng #HF-8919. Viết phiếu thu tay không theo quy định. Khách đã phản ánh và gửi ảnh đối chiếu.",
    runningOrders: ["#HF-8920", "#HF-8925"], heldCash: 1_250_000 }),
  v({ id: "2", techCode: "#KTV-0314", techName: "Phạm Tuấn", techState: "active", phone: "0912.440.xxx", area: "Đống Đa, Hà Nội", rating: 4.76, orders: 98,
    title: "Hủy liên tiếp 3 đơn dịch vụ sửa ống nước rò rỉ sát giờ hẹn 20 phút", flag: "Tỷ lệ hoàn thành đơn tụt dưới 82%", flagTone: "red",
    orderCode: "#HF-8924", orderName: "Sửa rò rỉ nước ngầm", source: "system", type: "Hủy đơn sát giờ",
    detail: "Hệ thống ghi nhận KTV hủy liên tiếp 3 đơn sửa ống nước rò rỉ trong vòng 20 phút trước giờ hẹn." }),
  v({ id: "3", techCode: "#KTV-0512", techName: "Nguyễn Văn Nam", techState: "suspended", phone: "0936.775.xxx", area: "Cầu Giấy, Hà Nội", rating: 4.62, orders: 211,
    title: "Không nộp tiền mặt thu hộ khách vượt hạn mức 48 giờ", flag: "Tồn đọng tiền mặt: 4.850.000đ", flagTone: "red",
    orderCode: "#HF-8902", orderName: "Thay aptomat tổng", source: "staff", type: "Nợ tiền mặt quá hạn",
    detail: "KTV đã thu tiền mặt của khách nhưng chưa nộp về hệ thống, vượt hạn mức 48 giờ.", heldCash: 4_850_000 }),
  v({ id: "4", techCode: "#KTV-0188", techName: "Đặng Quốc Bảo", techState: "active", phone: "0905.118.xxx", area: "Bình Thạnh, TP.HCM", rating: 4.41, orders: 76,
    title: "Tranh cãi gay gắt và có thái độ bất lịch sự với khách hàng", flag: "Đã kèm ghi âm cuộc gọi qua tổng đài", flagTone: "muted",
    orderCode: "#HF-8890", orderName: "Sửa máy giặt lồng ngang", source: "customer", type: "Thái độ phục vụ",
    detail: "Khách báo KTV to tiếng, có lời lẽ thiếu tôn trọng khi trao đổi về chi phí. Có ghi âm cuộc gọi qua tổng đài." }),
  v({ id: "5", techCode: "#KTV-0422", techName: "Hoàng Văn Trọng", techState: "active", phone: "0978.220.xxx", area: "Hà Đông, Hà Nội", rating: 4.55, orders: 143,
    title: "Không hoàn thành lắp đặt nhưng vẫn bấm 'Hoàn tất đơn' trên ứng dụng", flag: "GPS check-out cách nhà khách 2.4km", flagTone: "amber",
    orderCode: "#HF-8874", orderName: "Lắp bình nóng lạnh", source: "customer", type: "Gian lận hoàn tất đơn",
    detail: "Khách báo bình nóng lạnh chưa được lắp xong nhưng đơn đã được KTV bấm hoàn tất. GPS check-out cách nhà khách 2.4km." }),
  v({ id: "6", techCode: "#KTV-0809", techName: "Vũ Tuấn Kiệt", techState: "active", phone: "0968.331.xxx", area: "Quận 7, TP.HCM", rating: 4.7, orders: 165,
    title: "Sử dụng vật tư không đạt quy chuẩn an toàn điện HomeFix", flag: "Nguy cơ chập cháy cấp độ 2", flagTone: "red",
    orderCode: "#HF-8855", orderName: "Đi lại hệ thống dây ngầm", source: "staff", type: "Vật tư không đạt chuẩn an toàn",
    detail: "Nhân viên kiểm tra phát hiện KTV dùng dây điện không đạt chuẩn trong hạng mục đi lại dây ngầm." }),
  // ---- đã xử lý ----
  v({ id: "h1", techCode: "#KTV-0277", techName: "Trịnh Văn Hòa", techState: "suspended", phone: "0987.002.xxx", area: "Tây Hồ, Hà Nội", rating: 4.2, orders: 54,
    title: "Báo giá cao gấp 3 lần bảng giá niêm yết", flag: "Đã tạm khóa 15 ngày", flagTone: "muted",
    orderCode: "#HF-8601", orderName: "Sửa tủ lạnh", source: "customer", type: "Thu sai giá / Báo giá ngoài ứng dụng", handled: true }),
  v({ id: "h2", techCode: "#KTV-0355", techName: "Mai Xuân Dũng", techState: "active", phone: "0945.990.xxx", area: "Gò Vấp, TP.HCM", rating: 4.6, orders: 88,
    title: "Đến trễ 40 phút không báo khách", flag: "Đã nhắc nhở nội bộ", flagTone: "muted",
    orderCode: "#HF-8433", orderName: "Vệ sinh điều hòa", source: "customer", type: "Thái độ phục vụ", handled: true }),
  v({ id: "h3", techCode: "#KTV-0120", techName: "Cao Minh Phát", techState: "suspended", phone: "0933.481.xxx", area: "Quận 1, TP.HCM", rating: 3.9, orders: 41,
    title: "Giữ tiền mặt không nộp quá 10 ngày", flag: "Đã khóa vĩnh viễn", flagTone: "red",
    orderCode: "#HF-8120", orderName: "Thay bơm nước", source: "staff", type: "Nợ tiền mặt quá hạn", handled: true }),
]

export const getViolation = (id: string) => violationCases.find((x) => x.id === id) ?? null