"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Select } from "./input";

export const PAGE_SIZES = [10, 25, 50];

/**
 * Client-side pagination. `resetKey` should change whenever filters/search/sort
 * change, which sends the user back to page 1.
 * (With a real database this becomes LIMIT/OFFSET or cursor paging on the server.)
 */
export function usePagination<T>(items: T[], resetKey: string, initialSize = 10) {
  const [size, setSize] = useState(initialSize);
  const [state, setState] = useState({ key: resetKey, page: 1 });
  const totalPages = Math.max(1, Math.ceil(items.length / size));
  const page = Math.min(state.key === resetKey ? state.page : 1, totalPages);
  const start = (page - 1) * size;
  return {
    page,
    size,
    totalPages,
    total: items.length,
    start,
    pageItems: items.slice(start, start + size),
    setPage: (p: number) => setState({ key: resetKey, page: Math.max(1, Math.min(p, totalPages)) }),
    setSize: (s: number) => {
      setSize(s);
      setState({ key: resetKey, page: 1 });
    },
  };
}

/** Page numbers with gaps, e.g. 1 … 4 5 6 … 12 */
function pageList(page: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, page - 1, page, page + 1]);
  const nums = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) out.push("gap");
    out.push(n);
  });
  return out;
}

export function Pagination({
  p,
  label,
  noun = "items",
}: {
  p: ReturnType<typeof usePagination<unknown>>;
  label: string;
  noun?: string;
}) {
  if (p.total === 0) return null;
  const from = p.start + 1;
  const to = Math.min(p.start + p.size, p.total);
  return (
    <nav
      aria-label={label}
      className="flex flex-col flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm md:flex-row"
    >
      <p className="whitespace-nowrap text-muted-foreground" aria-live="polite">
        Showing <strong className="text-foreground">{from}–{to}</strong> of {p.total} {noun}
      </p>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={() => p.setPage(p.page - 1)} disabled={p.page === 1} aria-label="Previous page">
          <ChevronLeft aria-hidden /> <span className="hidden sm:inline">Previous</span>
        </Button>
        {pageList(p.page, p.totalPages).map((n, i) =>
          n === "gap" ? (
            <span key={`gap-${i}`} className="px-1 text-muted-foreground" aria-hidden>
              …
            </span>
          ) : (
            <button
              key={n}
              type="button"
              onClick={() => p.setPage(n)}
              aria-label={`Page ${n}`}
              aria-current={n === p.page ? "page" : undefined}
              className={cn(
                "inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-sm font-medium transition-colors",
                n === p.page ? "bg-green-ink text-white" : "hover:bg-muted",
              )}
            >
              {n}
            </button>
          ),
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => p.setPage(p.page + 1)}
          disabled={p.page === p.totalPages}
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span> <ChevronRight aria-hidden />
        </Button>
      </div>

      <label className="flex items-center gap-2 whitespace-nowrap text-muted-foreground">
        Rows per page
        <Select value={p.size} onChange={(e) => p.setSize(Number(e.target.value))} className="w-24 [&_select]:h-9">
          {PAGE_SIZES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </label>
    </nav>
  );
}
