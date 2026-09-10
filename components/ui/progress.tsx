import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  className?: string;
  trackClassName?: string;
  fillClassName?: string;
}

export function Progress({ value, className, trackClassName, fillClassName }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-accent-soft", trackClassName, className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn("h-full rounded-full bg-accent transition-[width] duration-500 ease-out", fillClassName)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
