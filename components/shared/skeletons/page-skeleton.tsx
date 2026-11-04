import { Skeleton } from "@/components/ui/skeleton"
import { FormSkeleton } from "./form-skeleton"
import { SkeletonRegion } from "./skeleton-region"
import { StatsSkeleton } from "./stats-skeleton"
import { TableSkeleton } from "./table-skeleton"

type Props = {
  variant?: "list" | "detail" | "catalog" | "content"
  stats?: 0 | 2 | 3 | 4
  columns?: number
  label?: string
}

export function PageSkeleton({ variant = "list", stats = 3, columns = 6, label }: Props) {
  return (
    <div className="space-y-5">
      <SkeletonRegion label={label ?? "Đang tải trang…"}>
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-8 w-56 max-w-[65%]" />
          <Skeleton className="h-10 w-40 max-w-[30%] rounded-lg" />
        </div>
      </SkeletonRegion>
      {variant === "list" && stats !== 0 && <StatsSkeleton count={stats} />}
      {variant === "detail" ? (
        <div className="grid items-start gap-5 lg:grid-cols-[1fr_2fr]">
          <FormSkeleton fields={3} />
          <FormSkeleton fields={6} />
        </div>
      ) : variant === "catalog" ? (
        <div className="grid items-start gap-5 lg:grid-cols-[360px_1fr]">
          <FormSkeleton fields={4} />
          <TableSkeleton columns={columns} />
        </div>
      ) : variant === "content" ? <FormSkeleton fields={4} /> : <TableSkeleton columns={columns} />}
    </div>
  )
}
