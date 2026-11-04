import type { Staff } from "@/lib/api/staff/types"

export type Operator = {
  id: string
  accountId: number
  employeeCode: string
  name: string
  email: string
  phone: string
  roleName: string
  status: string
  createdAt: string
}

export function toOperator(staff: Staff): Operator {
  return {
    id: String(staff.id),
    accountId: staff.account_id,
    employeeCode: staff.employee_code,
    name: staff.full_name,
    email: staff.email,
    phone: staff.phone,
    roleName: staff.role.name || staff.role.code,
    status: staff.status,
    createdAt: staff.created_at,
  }
}

const statusLabels: Record<string, string> = {
  active: "Hoạt động",
  locked: "Đã khóa",
  suspended: "Tạm ngưng",
  inactive: "Ngừng hoạt động",
}

export function getStaffStatusLabel(status: string): string {
  return statusLabels[status.toLowerCase()] ?? status
}
