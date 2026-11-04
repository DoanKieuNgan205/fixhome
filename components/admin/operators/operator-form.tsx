"use client"

import { useState, type FormEvent } from "react"
import type { Operator } from "@/lib/admin/operators"
import type { OperatorValues } from "./operator-types"
import { inputClass, primaryClass } from "./operator-styles"

export function OperatorForm({ operator, operators, onSave, onCancel }: {
  operator?: Operator
  operators: Operator[]
  onSave: (values: OperatorValues) => void
  onCancel: () => void
}) {
  const [error, setError] = useState("")
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const name = String(data.get("name") ?? "").trim()
    const email = String(data.get("email") ?? "").trim().toLowerCase()
    const phone = String(data.get("phone") ?? "").replace(/[\s.]/g, "")
    if (name.length < 2) return setError("Họ tên phải có ít nhất 2 ký tự.")
    if (!/^0\d{9}$/.test(phone)) return setError("Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.")
    if (operators.some((o) => o.id !== operator?.id && (o.email.toLowerCase() === email || o.phone === phone))) return setError("Email hoặc số điện thoại đã được sử dụng.")
    onSave({ name, email, phone })
  }
  return <form onSubmit={submit} className="space-y-4">
    <label className="block space-y-1.5 text-xs font-medium text-ink">
      <span>Họ và tên <span className="text-red-500">*</span></span>
      <input
        autoFocus
        required
        name="name"
        autoComplete="name"
        maxLength={100}
        defaultValue={operator?.name}
        placeholder="Nhập họ và tên"
        className={inputClass} />
    </label>
    <label className="block space-y-1.5 text-xs font-medium text-ink">
      <span>Email <span className="text-red-500">*</span></span>
      <input
        required
        type="email"
        name="email"
        autoComplete="email"
        maxLength={254}
        defaultValue={operator?.email}
        placeholder="nhanvien@fixhome.vn"
        className={inputClass} />
    </label>
    <label className="block space-y-1.5 text-xs font-medium text-ink">
      <span>Số điện thoại <span className="text-red-500">*</span></span>
      <input
        required
        type="tel"
        name="phone"
        autoComplete="tel"
        maxLength={15}
        defaultValue={operator?.phone}
        placeholder="Nhập số điện thoại"
        className={inputClass} />
    </label>
    {error && <p role="alert" className="text-xs text-red-600">
      {error}
    </p>}
    <p className="rounded-lg bg-indigo-50 p-3 text-xs leading-5 text-slate-500">Bản xem trước giao diện. Thông tin chưa được lưu lên hệ thống.</p>
    <div className="flex justify-end gap-2 border-t border-line pt-4">
      <button type="button" onClick={onCancel} className={`${inputClass} w-auto`}>Hủy</button>
      <button type="submit" className={primaryClass}>
        {operator ? "Lưu thay đổi" : "Thêm nhân viên"}
      </button>
    </div>
  </form>
}
