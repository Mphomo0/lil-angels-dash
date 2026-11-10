import { cn } from "@/lib/utils";

export function Progress({ value, label, className }: { value: number; label: string; className?: string }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      className={cn("h-2.5 w-full overflow-hidden rounded-full bg-muted", className)}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-green to-[#7fb51a] transition-[width] duration-500"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
