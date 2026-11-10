import { cn, initials } from "@/lib/utils";

const TONES = [
  "bg-green-soft text-green-ink",
  "bg-pink-soft text-pink-ink",
  "bg-orange-soft text-orange-ink",
  "bg-blue-soft text-blue-ink",
  "bg-purple-soft text-purple-ink",
];

/** Initials avatar. We never show photos of children in the demo. */
export function Avatar({ name, className }: { name: string; className?: string }) {
  const tone = TONES[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % TONES.length];
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-full font-display text-sm font-semibold",
        tone,
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
