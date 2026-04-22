import type { NFSeRecord } from "@/lib/domain";
import { readNFSeRecords, upsertNFSeRecord } from "@/lib/nfse-storage";
import type { NFSeProvider } from "@/lib/services/nfse/nfse-provider";
import { mapProviderResultToNFSeIssuanceState } from "@/lib/services/nfse/nfse-status-mapper";
import { MockNFSeProvider } from "@/lib/services/nfse/providers/mock-nfse-provider";
import { createTimelineEvent } from "@/lib/services/timeline";

export type NFSeIssuanceErrorCode =
  | "nfse_not_found"
  | "nfse_not_ready"
  | "nfse_already_issued"
  | "nfse_issuance_in_progress";

export type IssueNFSeResult =
  | {
      ok: true;
      record: NFSeRecord;
    }
  | {
      ok: false;
      errorCode: NFSeIssuanceErrorCode;
      message: string;
    };

function getDefaultProvider(): NFSeProvider {
  return new MockNFSeProvider();
}

function isIssuableStatus(status: NFSeRecord["issueStatus"]): boolean {
  return status === "ready" || status === "failed";
}

function buildNotIssuableError(status: NFSeRecord["issueStatus"]): {
  errorCode: NFSeIssuanceErrorCode;
  message: string;
} {
  if (status === "issued") {
    return {
      errorCode: "nfse_already_issued",
      message: "Esta NFSe já foi emitida.",
    };
  }

  if (status === "issuing") {
    return {
      errorCode: "nfse_issuance_in_progress",
      message: "Esta NFSe já está em emissão.",
    };
  }

  return {
    errorCode: "nfse_not_ready",
    message: "A NFSe ainda não está pronta para emissão.",
  };
}

function toProviderInput(record: NFSeRecord) {
  return {
    nfseId: record.id,
    chargeId: record.chargeId,
    amountInCents: record.amountInCents,
    competenceDate: record.competenceDate,
    serviceCity: record.serviceCity,
    description: record.description,
    businessSnapshot: record.businessSnapshot,
    clientSnapshot: record.clientSnapshot,
  };
}

export async function issueNFSeRecord(
  nfseId: string,
  provider: NFSeProvider = getDefaultProvider()
): Promise<IssueNFSeResult> {
  const current = readNFSeRecords().find((record) => record.id === nfseId) ?? null;

  if (!current) {
    return {
      ok: false,
      errorCode: "nfse_not_found",
      message: "Registro de NFSe não encontrado.",
    };
  }

  if (!isIssuableStatus(current.issueStatus)) {
    return {
      ok: false,
      ...buildNotIssuableError(current.issueStatus),
    };
  }

  const issuingAt = new Date().toISOString();
  const issuingRecord: NFSeRecord = {
    ...current,
    issueStatus: "issuing",
    lastError: undefined,
    updatedAt: issuingAt,
  };
  upsertNFSeRecord(issuingRecord);

  const providerResult = await provider.issueNFSe(toProviderInput(issuingRecord));
  const occurredAt = new Date().toISOString();
  const mapped = mapProviderResultToNFSeIssuanceState(providerResult, occurredAt);

  const finalizedRecord: NFSeRecord = {
    ...issuingRecord,
    issueStatus: mapped.issueStatus,
    providerReference: mapped.providerReference,
    documentNumber: mapped.documentNumber,
    issuedAt: mapped.issuedAt,
    lastError: mapped.lastError,
    updatedAt: occurredAt,
  };

  upsertNFSeRecord(finalizedRecord);

  if (mapped.issueStatus === "issued") {
    createTimelineEvent({
      type: "nfse_issued",
      entityId: finalizedRecord.chargeId,
      entityType: "charge",
      metadata: {
        nfseId: finalizedRecord.id,
        issueStatus: finalizedRecord.issueStatus,
        providerReference: finalizedRecord.providerReference,
        documentNumber: finalizedRecord.documentNumber,
      },
    });
  } else {
    createTimelineEvent({
      type: "nfse_issuance_failed",
      entityId: finalizedRecord.chargeId,
      entityType: "charge",
      metadata: {
        nfseId: finalizedRecord.id,
        issueStatus: finalizedRecord.issueStatus,
        lastError: finalizedRecord.lastError,
      },
    });
  }

  return {
    ok: true,
    record: finalizedRecord,
  };
}

