import { cn } from "@/lib/utils";

const FIGURES = ["#ff8a3d", "#8e5bd9", "#e5484d", "#93c524", "#ff84bd", "#2f6fd6"];

/** Little row of child figures, like the ones under the Lil Angels logo. */
export function KidsRow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 20" className={cn("h-4 w-auto", className)} aria-hidden>
      {FIGURES.map((c, i) => (
        <g key={c} transform={`translate(${i * 20 + 4} 0)`} fill={c}>
          <circle cx="6" cy="4" r="3.2" />
          <path d={i % 2 ? "M1 9h10l-2 6H3z M3 15h2v4H3z M7 15h2v4H7z" : "M2 8.5 6 7l4 1.5-1 7H3z M0 9l2 1-1 3-1-.5z M12 9l-2 1 1 3 1-.5z"} />
        </g>
      ))}
    </svg>
  );
}

/**
 * Recreation of the Lil Angels wordmark for the demo: black script lettering
 * with a halo and wing. Swap for the real logo file before going live.
 */
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex flex-col items-start leading-none", className)}>
      <span className="relative inline-flex items-end">
        <span className="font-script text-[2.1em] font-bold text-[#111]">Lil Angels</span>
        <svg viewBox="0 0 48 32" className="absolute -right-[0.9em] -top-[0.55em] h-[1.2em] w-auto" aria-hidden>
          <ellipse cx="30" cy="6" rx="11" ry="3.6" fill="none" stroke="#f2b632" strokeWidth="2.4" />
          <path
            d="M6 28c4-10 12-15 22-14-3 2-4 4-4 6 3-2 7-2 10-1-3 1-5 3-5 5 3-1 6 0 8 2-9 4-20 5-31 2z"
            fill="#fff"
            stroke="#2f6fd6"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {!compact && <KidsRow className="mt-0.5 h-[0.7em]" />}
      <span className="sr-only">Lil Angels Daycare and Aftercare Centre</span>
    </span>
  );
}
