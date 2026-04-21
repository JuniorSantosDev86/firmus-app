import type {
  BusinessProfile,
  NFSeReadinessMissingFieldCode,
  NFSeReadinessResult,
} from "../../domain";

export const NFSE_READINESS_FIELD_LABELS: Record<NFSeReadinessMissingFieldCode, string> = {
  business_name: "Nome da empresa",
  cnpj: "CNPJ",
  municipal_registration: "Inscrição municipal",
  service_city: "Cidade de prestação",
  tax_regime: "Regime tributário",
};

function normalizeDigits(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  return value.replace(/\D/g, "");
}

export function evaluateBusinessProfileNFSeReadiness(
  profile: BusinessProfile | null
): NFSeReadinessResult {
  const missingFields: NFSeReadinessMissingFieldCode[] = [];
  const warnings: string[] = [];

  if (!profile) {
    return {
      isReady: false,
      missingFields: [
        "business_name",
        "cnpj",
        "municipal_registration",
        "service_city",
        "tax_regime",
      ],
      warnings: ["Perfil da empresa ainda não foi preenchido para preparo fiscal."],
    };
  }

  if (profile.businessName.trim().length === 0) {
    missingFields.push("business_name");
  }

  if (!profile.cnpj) {
    missingFields.push("cnpj");
  }

  if (!profile.municipalRegistration) {
    missingFields.push("municipal_registration");
  }

  if (!profile.serviceCity) {
    missingFields.push("service_city");
  }

  if (!profile.taxRegime) {
    missingFields.push("tax_regime");
  }

  const cnpjDigits = normalizeDigits(profile.cnpj);
  if (profile.cnpj && cnpjDigits.length !== 14) {
    warnings.push("CNPJ deve conter 14 dígitos para emissão real posterior.");
  }

  return {
    isReady: missingFields.length === 0,
    missingFields,
    warnings,
  };
}
