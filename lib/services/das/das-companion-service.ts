import type { DASRecord } from "@/lib/domain";

import {
  createDASRecordIfAbsent,
  markDASRecordAsPaid,
  readDASRecords,
} from "@/lib/storage/das-records";
import { createTimelineEvent } from "@/lib/services/timeline";
import { getDASDueDateFromCompetenceMonth } from "@/lib/services/das/das-deadlines";
import {
  getDASDisplayStatus,
  getDASDisplayStatusLabel,
  type DASCompanionDisplayStatus,
} from "@/lib/services/das/das-status-mapper";

const DAS_OFFICIAL_CHANNEL_URL =
  "https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/PGMEI.app/Identificacao";

export type DASCompanionRecordView = {
  record: DASRecord;
  displayStatus: DASCompanionDisplayStatus;
  displayStatusLabel: string;
  dueDate: string | null;
};

export function getDASOfficialChannelUrl(): string {
  return DAS_OFFICIAL_CHANNEL_URL;
}

export function listDASCompanionRecords(referenceDate: Date = new Date()): DASCompanionRecordView[] {
  return readDASRecords().map((record) => {
    const displayStatus = getDASDisplayStatus(record, referenceDate);
    const dueDate = getDASDueDateFromCompetenceMonth(record.competenceMonth);

    return {
      record,
      displayStatus,
      displayStatusLabel: getDASDisplayStatusLabel(displayStatus),
      dueDate: dueDate ? dueDate.toISOString() : null,
    };
  });
}

export type DASCompanionUpdateResult =
  | {
      ok: true;
      record: DASRecord;
      didChange: boolean;
    }
  | {
      ok: false;
      errorCode: "das_not_found";
      message: string;
    };

export function markDASAsPaid(recordId: string): DASCompanionUpdateResult {
  const current = readDASRecords().find((item) => item.id === recordId);
  if (!current) {
    return {
      ok: false,
      errorCode: "das_not_found",
      message: "Registro de DAS não encontrado.",
    };
  }

  const updated = markDASRecordAsPaid(recordId);
  if (!updated) {
    return {
      ok: false,
      errorCode: "das_not_found",
      message: "Registro de DAS não encontrado.",
    };
  }

  const didChange = current.status !== updated.status;
  if (didChange) {
    createTimelineEvent({
      type: "das_marked_paid",
      entityId: updated.id,
      entityType: "reminder",
      metadata: {
        module: "das",
        competenceMonth: updated.competenceMonth,
        paidAt: updated.paidAt,
      },
    });
  }

  return {
    ok: true,
    record: updated,
    didChange,
  };
}

export function createDASRecordForCompetenceMonth(
  competenceMonth: string
): { record: DASRecord; created: boolean } {
  const result = createDASRecordIfAbsent(competenceMonth);
  if (result.created) {
    createTimelineEvent({
      type: "das_record_created",
      entityId: result.record.id,
      entityType: "reminder",
      metadata: {
        module: "das",
        competenceMonth: result.record.competenceMonth,
      },
    });
  }

  return result;
}

export function recordDASOfficialChannelOpened(recordId: string): DASCompanionUpdateResult {
  const record = readDASRecords().find((item) => item.id === recordId);
  if (!record) {
    return {
      ok: false,
      errorCode: "das_not_found",
      message: "Registro de DAS não encontrado.",
    };
  }

  createTimelineEvent({
    type: "das_official_channel_opened",
    entityId: record.id,
    entityType: "reminder",
    metadata: {
      module: "das",
      competenceMonth: record.competenceMonth,
      destination: DAS_OFFICIAL_CHANNEL_URL,
    },
  });

  return {
    ok: true,
    record,
    didChange: false,
  };
}
