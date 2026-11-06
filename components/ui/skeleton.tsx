import { cn } from "cn"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("rounded-md bg-slate-200/70 motion-safe:animate-pulse dark:bg-slate-700/60", className)}
      {...props}
    />
  )
}

export { Skeleton }
