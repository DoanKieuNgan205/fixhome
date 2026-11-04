import type { z } from "zod"
import { staffListSchema, staffRolesSchema, staffSchema, type StaffListParams } from "./types"
import type { CreateStaffRequest } from "@/lib/validations/staff"
import { buildStaffQuery } from "./query"

const errorMessages: Record<number, string> = {
  401: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  403: "Bạn không có quyền thực hiện thao tác này.",
  400: "Thông tin gửi lên không hợp lệ. Vui lòng kiểm tra lại.",
  409: "Email hoặc số điện thoại đã được sử dụng.",
  422: "Thông tin gửi lên không hợp lệ. Vui lòng kiểm tra lại.",
}

export class StaffApiError extends Error {
  constructor(public readonly status: number, fallback = "Không thể tải danh sách nhân viên. Vui lòng thử lại.") {
    super(errorMessages[status] ?? fallback)
    this.name = "StaffApiError"
  }
}

async function requestStaff<T>(path: string, schema: z.ZodType<T>, options: RequestInit, fallback: string): Promise<T> {
  const response = await fetch(`/api/admin/staff${path}`, {
    ...options,
    cache: "no-store",
  })
  if (!response.ok) throw new StaffApiError(response.status, fallback)
  const payload: unknown = await response.json().catch(() => null)
  const result = schema.safeParse(payload)
  if (!result.success) throw new Error(options.method === "POST"
    ? "Máy chủ đã nhận yêu cầu nhưng phản hồi không hợp lệ. Hãy kiểm tra danh sách trước khi tạo lại."
    : "Dữ liệu nhân viên trả về không đúng định dạng.")
  return result.data
}

export function getStaffList(params: StaffListParams, signal?: AbortSignal) {
  return requestStaff(`?${buildStaffQuery(params)}`, staffListSchema, { method: "GET", signal }, "Không thể tải danh sách nhân viên. Vui lòng thử lại.")
}

export function getStaffRoles(signal?: AbortSignal) {
  return requestStaff("/roles", staffRolesSchema, { method: "GET", signal }, "Không thể tải danh sách vai trò. Vui lòng thử lại.")
}

export function createStaff(values: CreateStaffRequest) {
  return requestStaff("", staffSchema, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  }, "Không thể tạo nhân viên. Vui lòng kiểm tra danh sách trước khi thử lại.")
}
