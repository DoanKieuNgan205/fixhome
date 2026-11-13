import { Suspense } from "react"
import { ApprovalManager } from "@/components/operator/approvals/approval-manager"

export default function TechnicianApprovalsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Đang tải danh sách hồ sơ chờ duyệt...</p>}>
      <ApprovalManager />
    </Suspense>
  )
}