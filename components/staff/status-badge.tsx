import { Badge } from "@/components/ui/badge";
import { STATUS_LABEL } from "@/lib/constants";
import type { Status } from "@/lib/types";

export const STATUS_TONE = {
  new: "blue",
  waitlist: "orange",
  accepted: "purple",
  enrolled: "green",
  declined: "neutral",
} as const;

export function StatusBadge({ status }: { status: Status }) {
  return <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>;
}
