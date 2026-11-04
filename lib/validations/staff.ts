import { z } from "zod"

export const createStaffSchema = z.object({
  full_name: z.string().trim().min(1, "Vui lòng nhập họ tên.").max(150, "Họ tên tối đa 150 ký tự."),
  email: z.email("Email không hợp lệ.").trim().max(255, "Email tối đa 255 ký tự."),
  phone: z.string().trim().regex(/^\+?[0-9]{9,15}$/, "Số điện thoại gồm 9–15 chữ số, có thể bắt đầu bằng +."),
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự.").max(72, "Mật khẩu tối đa 72 ký tự."),
  role_id: z.number().int().positive("Vui lòng chọn vai trò."),
})

export type CreateStaffRequest = z.infer<typeof createStaffSchema>
