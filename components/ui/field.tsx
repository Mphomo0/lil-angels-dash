import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "./label";

/** Label + control + hint + error, wired up with aria-describedby. */
export function Field({
  id,
  label,
  hint,
  error,
  optional,
  className,
  children,
}: {
  id: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: string;
  optional?: boolean;
  className?: string;
  children: React.ReactElement<Record<string, unknown>>;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-error` : undefined;
  const control = React.cloneElement(children, {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": [hintId, errId].filter(Boolean).join(" ") || undefined,
  });
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>
        {label}
        {optional && <span className="ml-1 font-normal text-muted-foreground">(optional)</span>}
      </Label>
      {control}
      {hint && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={errId} className="text-sm font-medium text-red-ink">
          {error}
        </p>
      )}
    </div>
  );
}

/** Group of radio buttons / checkboxes with a visible legend. */
export function Fieldset({
  legend,
  hint,
  error,
  children,
  className,
}: {
  legend: React.ReactNode;
  hint?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <fieldset className={cn("flex flex-col gap-2", className)} aria-invalid={error ? true : undefined}>
      <legend className="mb-1 text-sm font-medium">{legend}</legend>
      {hint && <p className="-mt-1 text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-sm font-medium text-red-ink">{error}</p>}
      {children}
    </fieldset>
  );
}

/** Big tappable radio / checkbox "chip". */
export const Choice = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label: React.ReactNode; description?: React.ReactNode }
>(({ label, description, className, type = "radio", ...props }, ref) => (
  <label
    className={cn(
      "flex cursor-pointer items-start gap-3 rounded-xl border-2 border-border bg-white px-3.5 py-3 transition-colors hover:border-green has-[:checked]:border-green-ink has-[:checked]:bg-green-soft has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-blue-soft",
      className,
    )}
  >
    <input ref={ref} type={type} className="mt-0.5 size-5 shrink-0 accent-[var(--brand-green-ink)]" {...props} />
    <span className="flex flex-col">
      <span className="text-sm font-medium">{label}</span>
      {description && <span className="text-xs text-muted-foreground">{description}</span>}
    </span>
  </label>
));
Choice.displayName = "Choice";
