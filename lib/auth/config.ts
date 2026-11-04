export const LOGIN_PATH = "/auth/login"
export const LOGOUT_PATH = "/auth/logout"
export const REFRESH_PATH = "/auth/refresh"

export const COOKIE = {
  access: "access_token",
  refresh: "refresh_token",
  role: "app_role",
  remember: "remember_session",
} as const

export type AppRole = "admin" | "operator"

// Bên trái: role do server trả về. Bên phải: tên dùng trong web.
export const ROLE_MAP: Record<string, AppRole> = {
  ADMIN: "admin",
  OPERATOR: "operator",
}

export const ROLE_HOME: Record<AppRole, string> = {
  admin: "/admin",
  operator: "/operator",
}
