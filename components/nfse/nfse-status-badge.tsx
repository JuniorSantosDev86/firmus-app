import type { NFSeIssueStatus } from "@/lib/domain";
import { getNFSeIssueStatusLabel } from "@/lib/services/nfse/nfse-mappers";

const STATUS_CLASSNAMES: Record<NFSeIssueStatus, string> = {
  draft: "firmus-chip-info",
  ready: "firmus-chip-success",
  issued: "firmus-chip-success",
  failed: "firmus-chip-warning",
};

export function NFSeStatusBadge({ status }: { status: NFSeIssueStatus }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_CLASSNAMES[status]}`}
      data-testid={`nfse-status-${status}`}
    >
      {getNFSeIssueStatusLabel(status)}
    </span>
  );
}
