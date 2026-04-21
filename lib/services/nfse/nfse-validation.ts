import type { BusinessProfile, Charge, Client } from "../../domain";

export type NFSeDraftValidationErrorCode =
  | "charge_not_found"
  | "client_not_found"
  | "business_profile_not_found"
  | "charge_must_be_paid"
  | "invalid_amount";

export type NFSeDraftValidationResult = {
  ok: boolean;
  errors: NFSeDraftValidationErrorCode[];
};

export function validateNFSeDraftContext(input: {
  charge: Charge | null;
  client: Client | null;
  businessProfile: BusinessProfile | null;
}): NFSeDraftValidationResult {
  const errors: NFSeDraftValidationErrorCode[] = [];

  if (!input.charge) {
    errors.push("charge_not_found");
  }

  if (!input.client) {
    errors.push("client_not_found");
  }

  if (!input.businessProfile) {
    errors.push("business_profile_not_found");
  }

  if (input.charge && input.charge.status !== "paid") {
    errors.push("charge_must_be_paid");
  }

  if (input.charge && (!Number.isInteger(input.charge.amountInCents) || input.charge.amountInCents <= 0)) {
    errors.push("invalid_amount");
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

export const NFSE_DRAFT_ERROR_LABELS: Record<NFSeDraftValidationErrorCode, string> = {
  charge_not_found: "Cobrança não encontrada.",
  client_not_found: "Cliente da cobrança não encontrado.",
  business_profile_not_found: "Perfil da empresa não encontrado.",
  charge_must_be_paid: "A cobrança precisa estar paga para preparar NFSe.",
  invalid_amount: "A cobrança precisa ter valor maior que zero.",
};
