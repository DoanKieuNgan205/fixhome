import { technicians, type Technician } from "./mock-technicians"

export type Review = { id: string; customer: string; orderCode: string; date: string; rating: number; comment: string }
export type OrderRow = { code: string; customer: string; service: string; device: string; date: string; amount: number }
export type WeekCancel = { label: string; range: string; tech: number; customer: number; system: number }
export type CancelCase = { date: string; code: string; reason: string; outcome: string; valid: boolean }
export type Txn = { id: string; at: string; title: string; ref?: string; amount: number }
export type LogItem = { at: string; action: string; by: string }

export type TechnicianDetail = Technician & {
  email: string
  address: string
  idMasked: string
  idFull: string
  areas: string[]
  radiusKm: number
  specialties: string[]
  joinedAt: string // yyyy-mm-dd
  lastActive: string
  totalCompleted: number
  lifetimeCompletion: number // %
  trustPct: number // %
  ratingDist: number[] // % của 5, 4, 3, 2, 1 sao
  weeks: WeekCancel[]
  cancelCases: CancelCase[]
  orders: OrderRow[]
  reviewList: Review[]
  walletBalance: number // âm = đang nợ
  txns: Txn[]
  account: {
    loginPhone: string
    verified: boolean
    method: string
    lastLogin: string
    passwordChangedAt: string
    sessions: number
  }
  logs: LogItem[]
}

const pad = (n: number) => String(n).padStart(2, "0")
const slug = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d")
    .toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "")
const isoDate = (d: Date) => d.toISOString().slice(0, 10)
const daysBefore = (base: Date, n: number) => new Date(base.getTime() - n * 86_400_000)

const CUSTOMERS = ["Nguyễn Mai Phương", "Vũ Hải Đăng", "Lê Thu Hà", "Phạm Quốc Việt", "Đỗ Tuấn Anh", "Trần Bảo Ngọc", "Hoàng Gia Huy"]
const JOBS = [
  { service: "Điện nước", device: "Máy lọc nước", amount: 350_000 },
  { service: "Điện lạnh", device: "Máy điều hòa", amount: 450_000 },
  { service: "Thiết bị gia dụng", device: "Bếp gas", amount: 550_000 },
  { service: "Điện lạnh", device: "Tủ lạnh", amount: 400_000 },
  { service: "Điện nước", device: "Máy nước nóng", amount: 280_000 },
]

function genOrders(seed: number, count: number, base: Date): OrderRow[] {
  return Array.from({ length: count }, (_, i) => {
    const job = JOBS[(i + seed) % JOBS.length]
    return {
      code: `#HF-${8939 - i * 70 - (seed % 9)}`,
      customer: CUSTOMERS[(i + seed) % CUSTOMERS.length],
      service: job.service,
      device: job.device,
      date: isoDate(daysBefore(base, i * 4)),
      amount: job.amount,
    }
  })
}

function genTxns(seed: number, count: number, base: Date): Txn[] {
  return Array.from({ length: count }, (_, i) => {
    const topup = i % 5 === 0
    const d = daysBefore(base, i * 3)
    return {
      id: `t${seed}-${i}`,
      at: `${isoDate(d)}T${pad(8 + ((i * 5) % 11))}:${pad((i * 17) % 60)}`,
      title: topup ? "Nộp vào ví nhận việc" : "Phí lên đơn dịch vụ",
      ref: topup ? undefined : `Đơn #HF-${8700 - i * 7 - (seed % 10)}`,
      amount: topup ? (2 + (i % 4)) * 100_000 : -(15_000 + ((i * 7) % 8) * 10_000),
    }
  })
}

const SAMPLE_TXNS: Txn[] = [
  { id: "s1", at: "2024-10-15T14:30", title: "Nộp vào ví nhận việc", amount: 450_000 },
  { id: "s2", at: "2024-10-15T11:20", title: "Phí lên đơn dịch vụ", ref: "Đơn #HF-8939", amount: -75_000 },
  { id: "s3", at: "2024-10-14T10:30", title: "Phí lên đơn dịch vụ", ref: "Đơn #HF-8841", amount: -45_000 },
  { id: "s4", at: "2024-10-14T17:20", title: "Phí lên đơn dịch vụ", ref: "Đơn #HF-8847", amount: -95_000 },
  { id: "s5", at: "2024-09-14T17:20", title: "Nộp vào ví nhận việc", amount: 250_000 },
  { id: "s6", at: "2024-09-14T11:20", title: "Phí lên đơn dịch vụ", ref: "Đơn #HF-8715", amount: -15_000 },
  { id: "s7", at: "2024-09-14T10:20", title: "Phí lên đơn dịch vụ", ref: "Đơn #HF-8722", amount: -35_000 },
]

const SAMPLE_ORDERS: OrderRow[] = [
  { code: "#HF-8939", customer: "Nguyễn Mai Phương", service: "Điện nước", device: "Máy lọc nước", date: "2024-10-15", amount: 350_000 },
  { code: "#HF-8841", customer: "Vũ Hải Đăng", service: "Điện lạnh", device: "Máy điều hòa", date: "2024-10-12", amount: 450_000 },
  { code: "#HF-8790", customer: "Lê Thu Hà", service: "Thiết bị gia dụng", device: "Bếp gas", date: "2024-10-08", amount: 550_000 },
  { code: "#HF-8711", customer: "Phạm Quốc Việt", service: "Điện lạnh", device: "Tủ lạnh", date: "2024-10-02", amount: 400_000 },
  { code: "#HF-8650", customer: "Đỗ Tuấn Anh", service: "Điện nước", device: "Máy nước nóng", date: "2024-09-25", amount: 280_000 },
]

export function getTechnicianDetail(id: string): TechnicianDetail | null {
  const t = technicians.find((x) => x.id === id)
  if (!t) return null

  const sample = t.id === "1"
  const n = Number(t.id) || 0
  const hasReviews = t.reviews > 0
  const lifetime = sample ? 98.6 : Math.min(99.5, Math.round((t.completionRate + 2) * 10) / 10)

  const dist =
    sample ? [96, 3, 1, 0, 0]
    : t.rating >= 4.8 ? [92, 6, 2, 0, 0]
    : t.rating >= 4.5 ? [80, 14, 4, 1, 1]
    : [65, 20, 10, 3, 2]

  const debt = t.debt
  const balance = debt > 0 ? -debt : 300_000 + n * 5_000

  return {
    ...t,
    email: sample ? "cuong.tran@homefix.vn" : `${slug(t.name)}@homefix.vn`,
    address: sample
      ? "Số 42 Ngõ 175 Cầu Giấy, Dịch Vọng, Cầu Giấy, Hà Nội"
      : `Số ${(n % 90) + 1} ngõ ${(n % 50) + 1}, ${t.district}, Hà Nội`,
    idMasked: sample ? "001092003●●●" : `0010${String(n % 10)}●●●●●●●`,
    idFull: sample ? "001092003845" : `0010${String((n * 7919) % 100_000_000).padStart(8, "0")}`,
    areas: sample ? ["Quận Cầu Giấy", "Ba Đình", "Nam Từ Liêm"] : [`Quận ${t.district}`],
    radiusKm: sample ? 7 : 5,
    specialties: sample ? ["Điện lạnh Inverter", "Điện nước"] : [t.specialty],
    joinedAt: sample ? "2021-03-15" : `202${n % 5}-0${1 + (n % 9)}-1${n % 9}`,
    lastActive: t.status === "locked" ? "Đã ngừng hoạt động" : t.available ? `${sample ? 12 : 5 + (n % 50)} phút trước` : `${1 + (n % 5)} ngày trước`,
    totalCompleted: sample ? 1428 : t.ordersThisMonth * 36 + 20,
    lifetimeCompletion: lifetime,
    trustPct: sample ? 99.2 : Math.min(99.9, Math.round((lifetime + 0.6) * 10) / 10),
    ratingDist: dist,
    weeks: sample
      ? [
          { label: "Tuần 40", range: "01/10 - 07/10", tech: 1, customer: 1, system: 0 },
          { label: "Tuần 41", range: "08/10 - 14/10", tech: 0, customer: 2, system: 0 },
          { label: "Tuần 42", range: "15/10 - 21/10", tech: 0, customer: 2, system: 0 },
          { label: "Tuần 43", range: "22/10 - Hiện tại", tech: 0, customer: 1, system: 0 },
        ]
      : [40, 41, 42, 43].map((w, i) => ({
          label: `Tuần ${w}`,
          range: ["01/10 - 07/10", "08/10 - 14/10", "15/10 - 21/10", "22/10 - Hiện tại"][i],
          tech: t.ordersThisMonth ? Math.round(t.cancelByTech / 5) : 0,
          customer: t.ordersThisMonth ? Math.round(t.cancelByCustomer / 3) : 0,
          system: 0,
        })),
    cancelCases: sample
      ? [
          { date: "2024-10-18", code: "#HF-8920", reason: "Xe thủng săm trên đường đi chuyển", outcome: "Đã xác minh: Điều phối đã gán lại KTV Phạm Văn Quý", valid: true },
          { date: "2024-09-28", code: "#HF-8512", reason: "Khách không có nhà khi diễn nơi", outcome: "Hợp lệ: Hỗ trợ phí đi lại", valid: true },
        ]
      : t.cancelByTech > 0
        ? [{ date: "2024-10-10", code: `#HF-${8800 + n}`, reason: "Có việc đột xuất, không thể đến", outcome: "Đang chờ vận hành xác minh", valid: false }]
        : [],
    orders: sample ? SAMPLE_ORDERS : genOrders(n, 5, new Date("2024-10-12")),
    reviewList: !hasReviews
      ? []
      : sample
        ? [
            { id: "r1", customer: "Nguyễn Mai Phương", orderCode: "#HF-8939", date: "2024-10-15", rating: 5, comment: "Anh Cường đến đúng giờ, bọc giày cẩn thận trước khi vào sàn gỗ, làm rất sạch sẽ và tận tâm. Tư vấn rõ tình trạng gas lạnh chứ không thu không." },
            { id: "r2", customer: "Vũ Hải Đăng", orderCode: "#HF-8841", date: "2024-10-12", rating: 5, comment: "Thợ tay nghề rất cao, bắt đúng bệnh bo mạch không vẽ vời thêm tiền. Đã kiểm tra vận hành thử 30 phút trước khi thanh toán tiền mặt." },
          ]
        : [
            { id: "r1", customer: CUSTOMERS[n % CUSTOMERS.length], orderCode: `#HF-${8800 + n}`, date: "2024-10-10", rating: 5, comment: "Làm việc nhanh gọn, đúng hẹn và giải thích rõ ràng." },
            { id: "r2", customer: CUSTOMERS[(n + 1) % CUSTOMERS.length], orderCode: `#HF-${8700 + n}`, date: "2024-10-03", rating: 4, comment: "Hài lòng, chỉ đến trễ khoảng 10 phút." },
          ],
    walletBalance: balance,
    txns: sample
      ? [...SAMPLE_TXNS, ...genTxns(n, 17, new Date("2024-08-28"))]
      : genTxns(n, 24, new Date("2024-10-15")),
    account: {
      loginPhone: t.phone,
      verified: t.status === "active",
      method: "Số điện thoại & mật khẩu",
      lastLogin: sample ? "2024-10-15T14:18" : "2024-10-14T09:40",
      passwordChangedAt: "2024-09-20",
      sessions: t.status === "locked" ? 0 : 1,
    },
    logs: [
      { at: "2024-10-15T14:18", action: "Đăng nhập ứng dụng KTV (iPhone 14)", by: "KTV" },
      { at: "2024-10-15T14:30", action: "Nộp tiền vào ví nhận việc", by: "KTV" },
      { at: "2024-10-15T09:05", action: "Bật trạng thái nhận việc", by: "KTV" },
      { at: "2024-10-12T16:40", action: "Hoàn thành đơn #HF-8841", by: "Hệ thống" },
      { at: "2024-10-10T10:00", action: "Cập nhật khu vực hoạt động", by: "Quản trị viên" },
      { at: "2024-09-20T08:30", action: "Đổi mật khẩu đăng nhập", by: "KTV" },
      { at: "2024-09-14T17:20", action: "Nộp tiền vào ví nhận việc", by: "KTV" },
    ],
  }
}