import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap [&_svg]:size-3.5",
  {
    variants: {
      tone: {
        neutral: "bg-muted text-muted-foreground",
        green: "bg-green-soft text-green-ink",
        pink: "bg-pink-soft text-pink-ink",
        orange: "bg-orange-soft text-orange-ink",
        blue: "bg-blue-soft text-blue-ink",
        purple: "bg-purple-soft text-purple-ink",
        red: "bg-red-soft text-red-ink",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export function Badge({
  className,
  tone,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
