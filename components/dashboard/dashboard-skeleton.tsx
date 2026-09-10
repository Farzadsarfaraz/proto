import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton({ chartCards = 2 }: { chartCards?: 1 | 2 }) {
  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-border-hairline bg-surface-1 p-5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-4 w-28" />
          </div>
        ))}
      </div>

      <div className={chartCards === 1 ? "mt-6 grid grid-cols-1 gap-6" : "mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3"}>
        <div className={chartCards === 1 ? "rounded-[var(--radius-lg)] border border-border-hairline bg-surface-1 p-5" : "rounded-[var(--radius-lg)] border border-border-hairline bg-surface-1 p-5 lg:col-span-2"}>
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-2 h-3 w-28" />
          <Skeleton className="mt-5 h-64 w-full" />
        </div>
        {chartCards === 2 && (
          <div className="rounded-[var(--radius-lg)] border border-border-hairline bg-surface-1 p-5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mx-auto mt-5 size-40 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
}
