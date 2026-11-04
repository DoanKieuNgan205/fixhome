import { Skeleton } from "@/components/ui/skeleton"
import { SkeletonRegion } from "./skeleton-region"

export function FormSkeleton({ fields = 5, label }: { fields?: number; label?: string }) {
  return (
    <SkeletonRegion label={label} className="rounded-xl border border-line/60 bg-white p-5">
      <div className="max-w-2xl space-y-5">
        {Array.from({ length: fields }, (_, field) => (
          <div key={field} className="space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className={field === fields - 1 ? "h-24 w-full rounded-lg" : "h-10 w-full rounded-lg"} />
          </div>
        ))}
        <div className="flex justify-end gap-3 border-t border-line pt-4">
          <Skeleton className="h-10 w-20 rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
      </div>
    </SkeletonRegion>
  )
}
