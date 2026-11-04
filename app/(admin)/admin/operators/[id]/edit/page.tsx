import { redirect } from "next/navigation"

export default function EditOperatorPage() {
  // Chọn nhân viên từ danh sách thật để mở form xem trước; chưa có API chi tiết.
  redirect("/admin/operators")
}
