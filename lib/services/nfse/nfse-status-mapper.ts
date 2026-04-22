import type { NFSeIssueProviderResult } from "@/lib/services/nfse/nfse-provider";

export type NFSeMappedIssuanceResult =
  | {
      issueStatus: "issued";
      issuedAt: string;
      documentNumber?: string;
      providerReference?: string;
      lastError?: undefined;
    }
  | {
      issueStatus: "failed";
      issuedAt?: undefined;
      documentNumber?: undefined;
      providerReference?: string;
      lastError: string;
    };

export function mapProviderResultToNFSeIssuanceState(
  result: NFSeIssueProviderResult,
  occurredAt: string
): NFSeMappedIssuanceResult {
  if (result.ok) {
    return {
      issueStatus: "issued",
      issuedAt: occurredAt,
      documentNumber: result.documentNumber ?? undefined,
      providerReference: result.protocol ?? undefined,
      lastError: undefined,
    };
  }

  return {
    issueStatus: "failed",
    providerReference: undefined,
    lastError: result.errorMessage,
  };
}

