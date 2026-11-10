import { FlaskConical } from "lucide-react";

export function DemoBanner() {
  return (
    <div
      role="note"
      className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-charcoal px-3 py-1.5 text-center text-xs font-medium text-white print:static print:bg-white print:text-charcoal print:border-b"
    >
      <FlaskConical className="size-3.5 shrink-0" aria-hidden />
      <span>Concept demo – sample data only. Nothing you enter leaves this browser.</span>
    </div>
  );
}
