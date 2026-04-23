import type { DASRecord } from "@/lib/domain";

import { isDASOverdueByCompetenceMonth } from "@/lib/services/das/das-deadlines";

export type DASCompanionDisplayStatus = DASRecord["status"] | "overdue";

export function isDASRecordOverdue(record: DASRecord, referenceDate: Date = new Date()): boolean {
  return record.status === "pending" && isDASOverdueByCompetenceMonth(record.competenceMonth, referenceDate);
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

  if (status === "paid") {
    return "Pago";
  }

  return "Pendente em atraso";
}
