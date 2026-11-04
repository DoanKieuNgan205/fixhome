import { Skeleton } from "@/components/ui/skeleton"
import { SkeletonRegion } from "./skeleton-region"

const grids = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-2 xl:grid-cols-4" }

export function StatsSkeleton({ count = 3 }: { count?: 2 | 3 | 4 }) {
  return (
    <SkeletonRegion label="Đang tải thống kê…">
      <div className={`grid gap-4 ${grids[count]}`}>
        {Array.from({ length: count }, (_, card) => (
          <div key={card} className="min-h-32 rounded-xl border border-line/60 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="mt-1 h-3 w-32 max-w-[70%]" />
              <Skeleton className="size-9 rounded-lg" />
            </div>
            <Skeleton className="mt-3 h-8 w-20" />
          </div>
        ))}
      </div>
    </SkeletonRegion>
  )
}
