import type { NFSeRecord } from "@/lib/domain";

export type NFSeIssueProviderInput = {
  nfseId: NFSeRecord["id"];
  chargeId: NFSeRecord["chargeId"];
  amountInCents: NFSeRecord["amountInCents"];
  competenceDate: NFSeRecord["competenceDate"];
  serviceCity: NFSeRecord["serviceCity"];
  description: NFSeRecord["description"];
  businessSnapshot: NFSeRecord["businessSnapshot"];
  clientSnapshot: NFSeRecord["clientSnapshot"];
};

export type NFSeIssueProviderSuccessResult = {
  ok: true;
  providerStatus: string;
  protocol: string | null;
  documentNumber: string | null;
  raw?: Record<string, unknown>;
};

export type NFSeIssueProviderFailureResult = {
  ok: false;
  providerStatus: string;
  errorMessage: string;
  raw?: Record<string, unknown>;
};

export type NFSeIssueProviderResult =
  | NFSeIssueProviderSuccessResult
  | NFSeIssueProviderFailureResult;

export interface NFSeProvider {
  issueNFSe(input: NFSeIssueProviderInput): Promise<NFSeIssueProviderResult>;
}

