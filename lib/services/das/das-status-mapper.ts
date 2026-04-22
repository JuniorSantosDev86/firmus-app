import type { DASRecord } from "@/lib/domain";

import { isDASDueDateOverdue } from "@/lib/services/das/das-deadlines";

export type DASCompanionDisplayStatus = DASRecord["status"] | "overdue";

export function isDASRecordOverdue(record: DASRecord, referenceDate: Date = new Date()): boolean {
  return record.status === "pending" && isDASDueDateOverdue(record.dueDate, referenceDate);
}

export function getDASDisplayStatus(
  record: DASRecord,
  referenceDate: Date = new Date()
): DASCompanionDisplayStatus {
  if (isDASRecordOverdue(record, referenceDate)) {
    return "overdue";
  }

  return record.status;
}

export function getDASDisplayStatusLabel(status: DASCompanionDisplayStatus): string {
  if (status === "pending") {
    return "Pendente";
  }

  if (status === "guided") {
    return "Orientado";
  }

  if (status === "handed_off") {
    return "Encaminhado ao canal oficial";
  }

  if (status === "paid_externally") {
    return "Pago externamente";
  }

  return "Pendente em atraso";
}
