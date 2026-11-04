"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Operator } from "@/lib/admin/operators"
import type { OperatorAction, OperatorValues } from "./operator-types"
import { OperatorDetails } from "./operator-details"
import { OperatorForm } from "./operator-form"
import { OperatorCreateForm } from "./operator-create-form"
import type { Staff } from "@/lib/api/staff/types"
import { inputClass, primaryClass } from "./operator-styles"

type Props = {
  action: OperatorAction | null
  operators: Operator[]
  onActionChange: (action: OperatorAction | null) => void
  onSave: (values: OperatorValues) => void
  onConfirm: () => void
  onCreated: (staff: Staff) => void
}

function getTitle(action: OperatorAction) {
  switch (action.type) {
    case "create": return "Thêm nhân viên mới"
    case "edit": return "Chỉnh sửa nhân viên"
    case "view": return "Thông tin nhân viên"
    case "reset": return "Đặt lại mật khẩu"
    case "lock": return action.operator.status.toLowerCase() === "suspended" ? "Mở khóa tài khoản" : "Khóa tài khoản"
  }
}

function getConfirmation(action: OperatorAction) {
  if (action.type === "reset") {
    return "Xem trước yêu cầu đặt lại mật khẩu cho nhân viên. Email chưa được gửi trong bản minh họa này."
  }
  if (action.type === "lock" && action.operator.status.toLowerCase() === "suspended") {
    return "Chuyển tài khoản về trạng thái hoạt động trong bản xem trước?"
  }
  return "Chuyển tài khoản sang trạng thái đã khóa trong bản xem trước?"
}

export function OperatorDialog({ action, operators, onActionChange, onSave, onConfirm, onCreated }: Props) {
  const [isCreating, setIsCreating] = useState(false)
  const close = () => { if (!isCreating) onActionChange(null) }

  return (
    <Dialog open={!!action} onOpenChange={(open) => { if (!open) close() }}>
      {action && (
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg" showCloseButton={!isCreating}>
          <DialogHeader>
            <DialogTitle>{getTitle(action)}</DialogTitle>
            <DialogDescription>
              {action.type === "create"
                ? "Nhập thông tin tài khoản và chọn vai trò cho nhân viên mới."
                : `${action.operator.name} · ${action.operator.employeeCode}`}
            </DialogDescription>
          </DialogHeader>

          {action.type === "create" && (
            <OperatorCreateForm onCreated={onCreated} onPendingChange={setIsCreating} onCancel={close} />
          )}

          {action.type === "edit" && (
            <OperatorForm
              key={action.operator.id}
              operator={action.operator}
              operators={operators}
              onSave={onSave}
              onCancel={close}
            />
          )}

          {action.type === "view" && (
            <OperatorDetails
              operator={action.operator}
              onEdit={() => onActionChange({ type: "edit", operator: action.operator })}
            />
          )}

          {(action.type === "lock" || action.type === "reset") && (
            <div className="space-y-5">
              <p className="text-sm leading-6 text-slate-600">{getConfirmation(action)}</p>
              <div className="flex justify-end gap-2">
                <button className={`${inputClass} w-auto`} onClick={close}>Hủy</button>
                <button className={primaryClass} onClick={onConfirm}>Xác nhận</button>
              </div>
            </div>
          )}
        </DialogContent>
      )}
    </Dialog>
  )
}
