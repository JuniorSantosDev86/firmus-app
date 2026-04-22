import type {
  NFSeIssueProviderInput,
  NFSeIssueProviderResult,
  NFSeProvider,
} from "@/lib/services/nfse/nfse-provider";

const STORAGE_KEY = "firmus.nfse.mock-issuance-mode";

export type MockNFSeIssuanceMode = "success" | "failure";

function readModeFromStorage(): MockNFSeIssuanceMode | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw === "failure" ? "failure" : raw === "success" ? "success" : null;
}

function getMockIssuanceMode(): MockNFSeIssuanceMode {
  const fromStorage = readModeFromStorage();
  if (fromStorage) {
    return fromStorage;
  }

  if (process.env.NEXT_PUBLIC_NFSE_MOCK_ISSUANCE_MODE === "failure") {
    return "failure";
  }

  return "success";
}

function buildStableNumberFromId(value: string): number {
  return value
    .split("")
    .reduce((acc, char) => (acc + char.charCodeAt(0) * 13) % 1_000_000, 0);
}

function buildProtocol(input: NFSeIssueProviderInput): string {
  const value = buildStableNumberFromId(`${input.nfseId}:${input.chargeId}`);
  return `PROTO-${value.toString().padStart(6, "0")}`;
}

function buildDocumentNumber(input: NFSeIssueProviderInput): string {
  const value = buildStableNumberFromId(
    `${input.chargeId}:${input.amountInCents}:${input.competenceDate}`
  );
  return `NF-${value.toString().padStart(6, "0")}`;
}

export function setMockNFSeIssuanceMode(mode: MockNFSeIssuanceMode): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, mode);
}

export function clearMockNFSeIssuanceMode(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

export class MockNFSeProvider implements NFSeProvider {
  async issueNFSe(input: NFSeIssueProviderInput): Promise<NFSeIssueProviderResult> {
    const mode = getMockIssuanceMode();

    if (mode === "failure") {
      return {
        ok: false,
        providerStatus: "rejected",
        errorMessage:
          "Não foi possível emitir a NFSe no provedor configurado. Tente novamente após revisar os dados fiscais.",
        raw: {
          reasonCode: "MOCK_ISSUANCE_REJECTED",
          nfseId: input.nfseId,
        },
      };
    }

    return {
      ok: true,
      providerStatus: "authorized",
      protocol: buildProtocol(input),
      documentNumber: buildDocumentNumber(input),
      raw: {
        receipt: "mock-receipt",
      },
    };
  }
}

