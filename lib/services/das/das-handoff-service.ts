import type { DASRecord } from "@/lib/domain";
import { readDASRecords, upsertDASRecord } from "@/lib/das-storage";

const DEFAULT_DAS_OFFICIAL_CHANNEL_URL =
  "https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/PGMEI.app/Identificacao";

function asNonEmptyString(value: string | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function resolveDASOfficialDestination(record: DASRecord | null): string {
  const customUrl = asNonEmptyString(record?.officialUrl);
  return customUrl ?? DEFAULT_DAS_OFFICIAL_CHANNEL_URL;
}

export type DASOfficialHandoffResult =
  | {
      ok: true;
      record: DASRecord;
      destinationUrl: string;
    }
  | {
      ok: false;
      errorCode: "das_not_found";
      message: string;
    };

export function handoffToDASOfficialChannel(recordId: string): DASOfficialHandoffResult {
  const current = readDASRecords().find((item) => item.id === recordId) ?? null;

  if (!current) {
    return {
      ok: false,
      errorCode: "das_not_found",
      message: "Registro de DAS não encontrado.",
    };
  }

  const occurredAt = new Date().toISOString();
  const status = current.status === "paid_externally" ? "paid_externally" : "handed_off";
  const updatedRecord: DASRecord = {
    ...current,
    status,
    updatedAt: occurredAt,
  };

  upsertDASRecord(updatedRecord);

  return {
    ok: true,
    record: updatedRecord,
    destinationUrl: resolveDASOfficialDestination(updatedRecord),
  };
}
