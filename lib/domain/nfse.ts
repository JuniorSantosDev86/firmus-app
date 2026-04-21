import type {
  CurrencyInCents,
  EntityId,
  ISODate,
  TimestampedEntity,
} from "@/lib/domain/common";

export type NFSeIssueStatus = "draft" | "ready" | "issued" | "failed";

export type NFSeTaxRegime = "mei" | "simples" | "outro";

export type NFSeBusinessSnapshot = {
  businessName: string;
  cnpj: string | null;
  municipalRegistration: string | null;
  serviceCity: string | null;
  taxRegime: NFSeTaxRegime | null;
};

export type NFSeClientSnapshot = {
  name: string;
  email: string | null;
  city: string | null;
};

export type NFSeServiceSnapshot = {
  source: "charge" | "quote";
  quoteId?: EntityId;
  chargeDueDate: ISODate;
  description: string;
};

export interface NFSeRecord extends TimestampedEntity {
  id: EntityId;
  chargeId: EntityId;
  clientId: EntityId;
  quoteId?: EntityId;
  amountInCents: CurrencyInCents;
  description: string;
  competenceDate: ISODate;
  serviceCity: string;
  issueStatus: NFSeIssueStatus;
  serviceSnapshot: NFSeServiceSnapshot;
  clientSnapshot: NFSeClientSnapshot;
  businessSnapshot: NFSeBusinessSnapshot;
  documentNumber?: string;
  providerReference?: string;
}

export type NFSeReadinessMissingFieldCode =
  | "business_name"
  | "cnpj"
  | "municipal_registration"
  | "service_city"
  | "tax_regime";

export type NFSeReadinessResult = {
  isReady: boolean;
  missingFields: NFSeReadinessMissingFieldCode[];
  warnings: string[];
};
