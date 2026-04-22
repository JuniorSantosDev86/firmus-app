import type { DASRecord } from "@/lib/domain";

import { readDASRecords, upsertDASRecord } from "@/lib/das-storage";
import {
  getDASDisplayStatus,
  getDASDisplayStatusLabel,
  isDASRecordOverdue,
  type DASCompanionDisplayStatus,
} from "@/lib/services/das/das-status-mapper";

export type DASCompanionSnapshot = {
  record: DASRecord | null;
  displayStatus: DASCompanionDisplayStatus | null;
  displayStatusLabel: string | null;
  isOverdue: boolean;
};

function getLatestDASRecord(): DASRecord | null {
  return readDASRecords()[0] ?? null;
}

export function getDASCompanionSnapshot(referenceDate: Date = new Date()): DASCompanionSnapshot {
  const record = getLatestDASRecord();

  if (!record) {
    return {
      record: null,
      displayStatus: null,
      displayStatusLabel: null,
      isOverdue: false,
    };
  }

  const displayStatus = getDASDisplayStatus(record, referenceDate);

  return {
    record,
    displayStatus,
    displayStatusLabel: getDASDisplayStatusLabel(displayStatus),
    isOverdue: isDASRecordOverdue(record, referenceDate),
  };
}

export type DASCompanionUpdateResult =
  | {
      ok: true;
      record: DASRecord;
    }
  | {
      ok: false;
      errorCode: "das_not_found";
      message: string;
    };

function updateRecordStatus(recordId: string, status: DASRecord["status"]): DASCompanionUpdateResult {
  const current = readDASRecords().find((item) => item.id === recordId) ?? null;

  if (!current) {
    return {
      ok: false,
      errorCode: "das_not_found",
      message: "Registro de DAS não encontrado.",
    };
  }

  if (current.status === status) {
    return {
      ok: true,
      record: current,
    };
  }

  const updatedRecord: DASRecord = {
    ...current,
    status,
    updatedAt: new Date().toISOString(),
  };

  upsertDASRecord(updatedRecord);

  return {
    ok: true,
    record: updatedRecord,
  };
}

export function markDASAsGuided(recordId: string): DASCompanionUpdateResult {
  return updateRecordStatus(recordId, "guided");
}

export function markDASAsPaidExternally(recordId: string): DASCompanionUpdateResult {
  return updateRecordStatus(recordId, "paid_externally");
}
