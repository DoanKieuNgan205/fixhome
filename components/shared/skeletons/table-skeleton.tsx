import { Skeleton } from "@/components/ui/skeleton"
import { SkeletonRegion } from "./skeleton-region"

type TableRowsProps = {
  rows?: number
  columns?: number
  avatar?: boolean
}

// Dùng trực tiếp trong tbody để giữ cấu trúc HTML hợp lệ.
export function TableRowsSkeleton({ rows = 6, columns = 6, avatar = false }: TableRowsProps) {
  return Array.from({ length: rows }, (_, row) => (
    <tr key={row} aria-hidden="true" className="border-b border-line/50 last:border-0">
      {Array.from({ length: columns }, (_, column) => (
        <td key={column} className="px-4 py-4">
          {column === 0 && avatar ? (
            <div className="flex items-center gap-3">
              <Skeleton className="size-9 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-28 max-w-full" />
                <Skeleton className="h-2.5 w-16" />
              </div>
            </div>
          ) : (
            <Skeleton className={`h-3 ${column === columns - 1 ? "ml-auto w-8" : row % 2 ? "w-3/4" : "w-4/5"}`} />
          )}
        </td>
      ))}
    </tr>
  ))
}

type TableProps = TableRowsProps & { label?: string }

export function TableSkeleton({ rows = 6, columns = 6, avatar = true, label }: TableProps) {
  return (
    <SkeletonRegion label={label} className="overflow-hidden rounded-xl border border-line/60 bg-white">
      <div className="flex justify-between gap-4 border-b border-line/60 p-4">
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-9 w-64 max-w-[45%]" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-field/60">
            <tr>{Array.from({ length: columns }, (_, column) => <th key={column} className="px-4 py-3"><Skeleton className="h-3 w-16" /></th>)}</tr>
          </thead>
          <tbody><TableRowsSkeleton rows={rows} columns={columns} avatar={avatar} /></tbody>
        </table>
      </div>
      <div className="flex justify-between gap-4 border-t border-line/60 p-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-28" />
      </div>
    </SkeletonRegion>
  )
}
