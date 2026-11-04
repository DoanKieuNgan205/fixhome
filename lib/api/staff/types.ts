import { z } from "zod"

export const staffRoleSchema = z.object({
  id: z.number().int(),
  code: z.string(),
  name: z.string(),
})

export const staffRolesSchema = z.array(staffRoleSchema)

export const staffSchema = z.object({
  id: z.number().int(),
  account_id: z.number().int(),
  employee_code: z.string(),
  full_name: z.string(),
  email: z.string(),
  phone: z.string(),
  role: staffRoleSchema,
  status: z.string(),
  created_at: z.string(),
})

export const staffListSchema = z.object({
  items: z.array(staffSchema),
  page: z.number().int().nonnegative(),
  page_size: z.number().int().nonnegative(),
  total_items: z.number().int().nonnegative(),
  total_pages: z.number().int().nonnegative(),
})

export type Staff = z.infer<typeof staffSchema>
export type StaffListResponse = z.infer<typeof staffListSchema>
export type StaffRole = z.infer<typeof staffRoleSchema>

export type StaffListParams = {
  page: number
  page_size: number
  q?: string
  status?: string
}
