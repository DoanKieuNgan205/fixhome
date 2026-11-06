"use client"

import { useState, type FormEvent } from "react"
import { LoaderCircle } from "lucide-react"
import type { Operator } from "@/lib/admin/operators"
import { useUpdateStaff } from "@/hooks/use-update-staff"
import { updateStaffSchema } from "@/lib/validations/staff"
import { inputClass, primaryClass } from "./operator-styles"

export function OperatorForm({ operator, onSave, onPendingChange, onCancel }: {
  operator: Operator
  onSave: () => void
  onPendingChange: (pending: boolean) => void
  onCancel: () => void
}) {
  const [error, setError] = useState("")
  const update = useUpdateStaff(operator.id, onSave, onPendingChange)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setError("")
    const result = updateStaffSchema.safeParse({
      full_name: String(data.get("name") ?? ""),
      phone: String(data.get("phone") ?? "").replace(/[\s.]/g, ""),
      status: String(data.get("status") ?? ""),
    })
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Thông tin không hợp lệ.")
      return
    }
    await update.submit(result.data)
  }

  const status = operator.status.toLowerCase()
  return <form onSubmit={submit} className="space-y-4" aria-busy={update.isSubmitting}>
    <fieldset disabled={update.isSubmitting} className="space-y-4 disabled:opacity-70">
      <label className="block space-y-1.5 text-xs font-medium text-ink">
        <span>Họ và tên <span className="text-red-500">*</span></span>
        <input autoFocus required name="name" autoComplete="name" maxLength={150} defaultValue={operator.name} placeholder="Nhập họ và tên" className={inputClass} />
      </label>
      <label className="block space-y-1.5 text-xs font-medium text-ink">
        <span>Email</span>
        <input type="email" autoComplete="email" readOnly value={operator.email} className={`${inputClass} bg-slate-50 text-slate-500`} />
        <span className="block text-slate-500">Email không thể thay đổi trong biểu mẫu này.</span>
      </label>
      <label className="block space-y-1.5 text-xs font-medium text-ink">
        <span>Số điện thoại <span className="text-red-500">*</span></span>
        <input required type="tel" name="phone" autoComplete="tel" maxLength={16} defaultValue={operator.phone} placeholder="Nhập số điện thoại" className={inputClass} />
      </label>
      <label className="block space-y-1.5 text-xs font-medium text-ink">
        <span>Trạng thái <span className="text-red-500">*</span></span>
        <select required name="status" defaultValue={["active", "suspended"].includes(status) ? status : ""} className={inputClass}>
          {!["active", "suspended"].includes(status) && <option value="" disabled>Chọn trạng thái</option>}
          <option value="active">Hoạt động</option>
          <option value="suspended">Tạm ngưng</option>
        </select>
      </label>
    </fieldset>
    {(error || update.error) && <p role="alert" className="rounded-lg bg-red-50 p-3 text-xs text-red-600">{error || update.error}</p>}
    <div className="flex justify-end gap-2 border-t border-line pt-4">
      <button type="button" disabled={update.isSubmitting} onClick={onCancel} className={`${inputClass} w-auto disabled:opacity-50`}>Hủy</button>
      <button type="submit" disabled={update.isSubmitting} className={`${primaryClass} disabled:cursor-not-allowed disabled:opacity-50`}>
        {update.isSubmitting && <LoaderCircle className="size-4 animate-spin" />}
        {update.isSubmitting ? "Đang lưu…" : "Lưu thay đổi"}
      </button>
    </div>
  </form>
}
