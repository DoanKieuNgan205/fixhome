const MAP: Record<string, string> = {
  UNAUTHORIZED: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại",
  FORBIDDEN: "Tài khoản không có quyền thực hiện thao tác này",
  NOT_FOUND: "Không tìm thấy dữ liệu, có thể đã bị xóa",
  CONFLICT: "Mã hoặc tên đã tồn tại, vui lòng đổi tên khác",
  VALIDATION: "Dữ liệu không hợp lệ, vui lòng kiểm tra lại",
  NETWORK: "Không kết nối được máy chủ, vui lòng thử lại",
  SERVER: "Có lỗi xảy ra, vui lòng thử lại sau",
}

export function apiErrorMessage(e: unknown) {
  const code = e instanceof Error ? e.message : "SERVER"
  return MAP[code] ?? MAP.SERVER
}