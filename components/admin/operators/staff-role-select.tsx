import type { UseFormRegisterReturn } from "react-hook-form"
import type { StaffRole } from "@/lib/api/staff/types"
import { inputClass } from "./operator-styles"
import { Skeleton } from "@/components/ui/skeleton"
import { SkeletonRegion } from "@/components/shared/skeletons"

type Props = {
  roles: StaffRole[]
  isLoading: boolean
  error?: string
  fieldError?: string
  registration: UseFormRegisterReturn
  onRetry: () => void
}

export function StaffRoleSelect({ roles, isLoading, error, fieldError, registration, onRetry }: Props) {
  return (
    <div className="space-y-1.5">
      <label htmlFor="staff-role" className="text-xs font-medium text-ink">
        Vai trò <span className="text-red-500">*</span>
      </label>
      {isLoading ? (
        <SkeletonRegion label="Đang tải vai trò…">
          <Skeleton className="h-10 w-full rounded-lg" />
        </SkeletonRegion>
      ) : <select
        {...registration}
        id="staff-role"
        defaultValue=""
        disabled={isLoading || !!error || roles.length === 0}
        aria-invalid={!!fieldError}
        aria-describedby="staff-role-message"
        className={inputClass}
      >
        <option value="" disabled>Chọn vai trò</option>
        {roles.map((role) => <option key={role.id} value={role.id}>{role.name || role.code}</option>)}
      </select>}
      <div id="staff-role-message" className="text-xs">
        {error ? (
          <div role="alert" className="flex items-center justify-between gap-2 text-red-600">
            <span>{error}</span>
            <button type="button" onClick={onRetry} className="shrink-0 underline">Thử lại</button>
          </div>
        ) : !isLoading && roles.length === 0 ? (
          <p role="status" className="text-amber-700">Chưa có vai trò được phép gán. Vui lòng kiểm tra lại cấu hình vai trò.</p>
        ) : fieldError ? <p role="alert" className="text-red-600">{fieldError}</p> : null}
      </div>
    </div>
  )
}
