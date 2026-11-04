import type { ReactNode } from "react"
import { cn } from "cn"

type Props = {
  children: ReactNode
  label?: string
  className?: string
}

export function SkeletonRegion({ children, label = "Đang tải dữ liệu…", className }: Props) {
  return (
    <div role="status" aria-busy="true" className={cn("w-full", className)}>
      <span className="sr-only">{label}</span>
      <div aria-hidden="true">{children}</div>
    </div>
  )
}
