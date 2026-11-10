import { Suspense } from "react";
import { StaffShell } from "@/components/staff/shell";

export default function StaffAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex flex-1 items-center justify-center p-10 text-sm text-muted-foreground">Loading…</div>}>
      <StaffShell>{children}</StaffShell>
    </Suspense>
  );
}
