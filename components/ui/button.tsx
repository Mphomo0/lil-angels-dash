import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-[#3d600c] shadow-sm",
        pink: "bg-pink-ink text-white hover:bg-[#9c2a5e] shadow-sm",
        outline: "border-2 border-border bg-white text-foreground hover:bg-muted",
        ghost: "text-foreground hover:bg-muted",
        soft: "bg-green-soft text-green-ink hover:bg-[#e2efc4]",
        destructive: "bg-red-ink text-white hover:bg-[#962024]",
        link: "text-blue-ink underline-offset-4 hover:underline rounded-none px-0",
      },
      size: {
        default: "h-11 px-5 text-sm",
        sm: "h-9 px-4 text-sm",
        lg: "h-12 px-7 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
