import type { Operator } from "@/lib/admin/operators"
import { OperatorStatusBadge } from "./operator-status-badge"
import { primaryClass } from "./operator-styles"

export function OperatorDetails({ operator, onEdit }: { operator: Operator; onEdit: () => void }) {
  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-3 text-sm">
        <dt className="text-muted">Họ và tên</dt>
        <dd className="text-ink">
          {operator.name}
        </dd>
        <dt className="text-muted">Email</dt>
        <dd className="break-all text-ink">
          {operator.email}
        </dd>
        <dt className="text-muted">Số điện thoại</dt>
        <dd>
          {operator.phone}
        </dd>
        <dt className="text-muted">Ngày tạo</dt>
        <dd>
          {Number.isNaN(Date.parse(operator.createdAt)) ? "—" : new Date(operator.createdAt).toLocaleDateString("vi-VN")}
        </dd>
        <dt className="text-muted">Trạng thái</dt>
        <dd>
          <OperatorStatusBadge status={operator.status} />
        </dd>
        <dt className="text-muted">Vai trò</dt>
        <dd>{operator.roleName}</dd>
      </dl>
      <button className={primaryClass} onClick={onEdit}>Chỉnh sửa thông tin</button>
    </div>
  )
}
