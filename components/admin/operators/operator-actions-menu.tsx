"use client"

import { useRef } from "react"
import { Menu } from "@base-ui/react/menu"
import { Ellipsis, Eye, KeyRound, LockKeyhole, Pencil, UnlockKeyhole } from "lucide-react"
import type { Operator } from "@/lib/admin/operators"
import type { OperatorAction } from "./operator-types"

type Props = {
  operator: Operator
  onAction: (action: OperatorAction) => void
}

export function OperatorActionsMenu({ operator, onAction }: Props) {
  const selectingAction = useRef(false)
  const suspended = operator.status.toLowerCase() === "suspended"
  const actions = [
    { type: "view", label: "Xem chi tiết", icon: Eye },
    { type: "edit", label: "Chỉnh sửa", icon: Pencil },
    { type: "reset", label: "Đặt lại mật khẩu", icon: KeyRound },
    { type: "lock", label: suspended ? "Mở khóa tài khoản" : "Khóa tài khoản", icon: suspended ? UnlockKeyhole : LockKeyhole },
  ] as const

  return (
    <Menu.Root modal={false} onOpenChange={(open) => { if (open) selectingAction.current = false }}>
      <Menu.Trigger
        aria-label={`Thao tác với ${operator.name}`}
        className="inline-flex size-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-indigo-50 hover:text-ink focus-visible:outline-2 focus-visible:outline-blue-500 data-popup-open:bg-indigo-50"
      >
        <Ellipsis className="size-5" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner align="end" sideOffset={6} className="z-40">
          <Menu.Popup
            finalFocus={() => !selectingAction.current}
            className="min-w-52 rounded-xl border border-line bg-white p-1.5 shadow-lg outline-none"
          >
            {actions.map(({ type, label, icon: Icon }) => (
              <Menu.Item
                key={type}
                onClick={() => {
                  selectingAction.current = true
                  onAction({ type, operator })
                }}
                className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs outline-none data-highlighted:bg-indigo-50 ${type === "lock" ? suspended ? "text-emerald-700" : "text-red-600" : "text-slate-600"}`}
              >
                <Icon className="size-4" />
                {label}
              </Menu.Item>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
