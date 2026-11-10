"use client";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Eye, EyeOff, FileWarning, Lock } from "lucide-react";
import { Select } from "@/components/ui/input";
import { STATUSES } from "@/lib/constants";
import { logActivity, updateStatus } from "@/lib/data";
import { useRole } from "@/lib/role";
import type { Registration, Status } from "@/lib/types";
import { cn, documentProgress, mask } from "@/lib/utils";

const SELECT_TONE: Record<Status, string> = {
  new: "[&_select]:bg-blue-soft [&_select]:text-blue-ink [&_select]:border-blue/40",
  waitlist: "[&_select]:bg-orange-soft [&_select]:text-orange-ink [&_select]:border-orange/50",
  accepted: "[&_select]:bg-purple-soft [&_select]:text-purple-ink [&_select]:border-purple/40",
  enrolled: "[&_select]:bg-green-soft [&_select]:text-green-ink [&_select]:border-green/50",
  declined: "[&_select]:bg-muted [&_select]:text-muted-foreground",
};

/** Status dropdown that looks like a badge. Changing it writes to the activity log. */
export function StatusSelect({ registration, className }: { registration: Registration; className?: string }) {
  const { actor, can } = useRole();
  const onChange = async (s: Status) => {
    await updateStatus(registration.id, s, actor);
    toast.success(`${registration.child.fullName} moved to ${STATUSES.find((x) => x.id === s)?.label}`);
  };
  return (
    <Select
      aria-label={`Status for ${registration.child.fullName} ${registration.child.surname}`}
      value={registration.status}
      disabled={!can("changeStatus")}
      onChange={(e) => onChange(e.target.value as Status)}
      className={cn(
        "w-36 [&_select]:h-9 [&_select]:rounded-full [&_select]:border [&_select]:text-sm [&_select]:font-semibold",
        SELECT_TONE[registration.status],
        className,
      )}
    >
      {STATUSES.map((s) => (
        <option key={s.id} value={s.id}>
          {s.label}
        </option>
      ))}
    </Select>
  );
}

export function DocsIndicator({ registration }: { registration: Registration }) {
  const { received, total, complete } = documentProgress(registration);
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 text-sm font-medium", complete ? "text-green-ink" : "text-orange-ink")}
      title={complete ? "All documents received" : `${total - received} document(s) missing`}
    >
      {complete ? <CheckCircle2 className="size-4" aria-hidden /> : <FileWarning className="size-4" aria-hidden />}
      {received}/{total}
      <span className="sr-only">{complete ? "documents complete" : "documents incomplete"}</span>
    </span>
  );
}

/** Shows a masked value with a reveal button. Revealing is logged (POPIA audit trail). */
export function Masked({ value, label, registrationId }: { value: string; label: string; registrationId: string }) {
  const { can, actor } = useRole();
  const [shown, setShown] = useState(false);
  if (!value) return <span className="text-muted-foreground">—</span>;
  const allowed = can("revealIds");
  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className="font-mono text-sm tracking-wide">{shown ? value : mask(value)}</span>
      {allowed ? (
        <button
          type="button"
          onClick={async () => {
            if (!shown) await logActivity(registrationId, `Revealed ${label}`, actor);
            setShown(!shown);
          }}
          className="inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-blue-ink hover:bg-blue-soft"
          aria-label={shown ? `Hide ${label}` : `Reveal ${label}`}
        >
          {shown ? <EyeOff className="size-3.5" aria-hidden /> : <Eye className="size-3.5" aria-hidden />}
          {shown ? "Hide" : "Reveal"}
        </button>
      ) : (
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground" title="Only admins can reveal this">
          <Lock className="size-3" aria-hidden /> Admin only
        </span>
      )}
    </span>
  );
}

export function Restricted({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-purple/40 bg-purple-soft/50 p-8 text-center">
      <span className="inline-flex size-11 items-center justify-center rounded-full bg-purple-soft text-purple-ink">
        <Lock className="size-5" aria-hidden />
      </span>
      <p className="font-semibold text-purple-ink">{title}</p>
      <p className="max-w-md text-sm text-muted-foreground">
        {children ?? "This is restricted to Admin users. Switch to Admin in the sidebar to see how it looks."}
      </p>
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-semibold">{title}</h1>
        {description && <p className="mt-1 text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
