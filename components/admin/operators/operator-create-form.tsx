"use client"

import { useState, type ReactNode } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, LoaderCircle } from "lucide-react"
import { useCreateStaff } from "@/hooks/use-create-staff"
import { useStaffRoles } from "@/hooks/use-staff-roles"
import type { Staff } from "@/lib/api/staff/types"
import { createStaffSchema, type CreateStaffRequest } from "@/lib/validations/staff"
import { inputClass, primaryClass } from "./operator-styles"
import { StaffRoleSelect } from "./staff-role-select"

type Props = {
  onCreated: (staff: Staff) => void
  onPendingChange: (pending: boolean) => void
  onCancel: () => void
}

export function OperatorCreateForm({ onCreated, onPendingChange, onCancel }: Props) {
  const roles = useStaffRoles()
  const creation = useCreateStaff(onCreated, onPendingChange)
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, setError, formState: { errors } } = useForm<CreateStaffRequest>({
    resolver: zodResolver(createStaffSchema),
  })

  async function submit(values: CreateStaffRequest) {
    if (!roles.roles.some((role) => role.id === values.role_id)) {
      setError("role_id", { message: "Vui lòng chọn một vai trò trong danh sách hiện tại." })
      return
    }
    await creation.submit(values)
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4" aria-busy={creation.isSubmitting}>
      <fieldset disabled={creation.isSubmitting} className="space-y-4 disabled:opacity-70">
        <FormField id="staff-name" label="Họ và tên" error={errors.full_name?.message}>
          <input {...register("full_name")} id="staff-name" autoFocus autoComplete="name" maxLength={150} placeholder="Nhập họ và tên" className={inputClass} aria-invalid={!!errors.full_name} aria-describedby="staff-name-error" />
        </FormField>
        <FormField id="staff-email" label="Email" error={errors.email?.message}>
          <input {...register("email")} id="staff-email" type="email" autoComplete="email" maxLength={255} placeholder="nhanvien@fixhome.vn" className={inputClass} aria-invalid={!!errors.email} aria-describedby="staff-email-error" />
        </FormField>
        <FormField id="staff-phone" label="Số điện thoại" error={errors.phone?.message}>
          <input {...register("phone")} id="staff-phone" type="tel" autoComplete="tel" maxLength={16} placeholder="Nhập số điện thoại" className={inputClass} aria-invalid={!!errors.phone} aria-describedby="staff-phone-error" />
        </FormField>
        <FormField id="staff-password" label="Mật khẩu" error={errors.password?.message}>
          <div className="relative">
            <input {...register("password")} id="staff-password" type={showPassword ? "text" : "password"} autoComplete="new-password" maxLength={72} placeholder="Từ 8 đến 72 ký tự" className={`${inputClass} pr-11`} aria-invalid={!!errors.password} aria-describedby="staff-password-error" />
            <button type="button" aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"} aria-pressed={showPassword} onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-2 rounded p-1 text-slate-500 hover:bg-field">
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </FormField>
        <StaffRoleSelect
          roles={roles.roles}
          isLoading={roles.isLoading}
          error={roles.error}
          fieldError={errors.role_id?.message}
          registration={register("role_id", { setValueAs: (value: string) => value ? Number(value) : 0 })}
          onRetry={roles.retry}
        />
      </fieldset>
      {creation.error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-xs text-red-600">{creation.error}</p>}
      <p className="text-xs leading-5 text-slate-500">Tài khoản được tạo cùng nhân viên và có thể đăng nhập ngay với mật khẩu đã đặt.</p>
      <div className="flex justify-end gap-2 border-t border-line pt-4">
        <button type="button" disabled={creation.isSubmitting} onClick={onCancel} className={`${inputClass} w-auto disabled:opacity-50`}>Hủy</button>
        <button type="submit" disabled={creation.isSubmitting || roles.isLoading || !!roles.error || !roles.roles.length} className={`${primaryClass} disabled:cursor-not-allowed disabled:opacity-50`}>
          {creation.isSubmitting && <LoaderCircle className="size-4 animate-spin" />}
          {creation.isSubmitting ? "Đang tạo…" : "Tạo nhân viên"}
        </button>
      </div>
    </form>
  )
}

function FormField({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-medium text-ink">{label} <span className="text-red-500">*</span></label>
      {children}
      <p id={`${id}-error`} role={error ? "alert" : undefined} className="text-xs text-red-600">{error}</p>
    </div>
  )
}
