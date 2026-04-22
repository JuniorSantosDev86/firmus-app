import type { DASCompanionDisplayStatus } from "@/lib/services/das/das-status-mapper";
import { getDASDisplayStatusLabel } from "@/lib/services/das/das-status-mapper";

const STATUS_CLASSNAMES: Record<DASCompanionDisplayStatus, string> = {
  pending: "firmus-chip-info",
  overdue: "firmus-chip-warning",
  guided: "firmus-chip-info",
  handed_off: "firmus-chip-success",
  paid_externally: "firmus-chip-success",
};

export function DASStatusBadge({ status }: { status: DASCompanionDisplayStatus }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_CLASSNAMES[status]}`}
      data-testid={`das-status-${status}`}
    >
      {getDASDisplayStatusLabel(status)}
    </span>
  );
}
