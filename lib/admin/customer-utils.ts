export type UiStatus = "active" | "inactive" | "locked"

// ⚠ Giá trị backend dùng cho tham số ?status=... Kiểm tra trong Swagger rồi sửa tại đây nếu khác
export const STATUS_PARAM: Record<UiStatus, string> = {
  active: "ACTIVE",
  inactive: "INACTIVE",
  locked: "LOCKED",
}

const LOCKED_VALUES = ["LOCKED", "BLOCKED", "BANNED", "SUSPENDED", "DISABLED"]

// Đổi chuỗi trạng thái của backend sang 3 trạng thái của giao diện
export function toUiStatus(raw: string | null | undefined): UiStatus {
  const s = (raw ?? "").toUpperCase()
  if (s === "ACTIVE") return "active"
  if (LOCKED_VALUES.includes(s)) return "locked"
  return "inactive"
}

export const STATUS_LABEL: Record<UiStatus, string> = {
  active: "Hoạt động",
  inactive: "Chưa kích hoạt",
  locked: "Đã khóa",
}

export const STATUS_BADGE: Record<UiStatus, string> = {
  active: "bg-emerald-50 text-emerald-600",
  inactive: "bg-blue-50 text-blue-600",
  locked: "bg-red-50 text-red-500",
}

export function formatDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export const initials = (name: string) =>
  name.trim().split(/\s+/).slice(-2).map((w) => w[0]).join("").toUpperCase() || "?"