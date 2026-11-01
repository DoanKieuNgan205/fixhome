
import { z } from "zod"

export const loginSchema = z.object({
  role: z.enum(["admin", "operator"]),

  username: z
    .string()
    .trim()
    .min(1, "login.err.username")
    .refine(
      (v) => !v.includes("@") || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      "login.err.email",
    ),

  password: z
    .string()
    .min(1, "login.err.password")
    .min(6, "login.err.passwordMin"),

  remember: z.boolean(),
})

export type LoginValues = z.infer<typeof loginSchema>

//admin@fixhome.vn . Mk: Admin@123456