import type { EntityId, TimestampedEntity } from "@/lib/domain/common";
import type { NFSeTaxRegime } from "@/lib/domain/nfse";

export interface BusinessProfile extends TimestampedEntity {
  id: EntityId;
  businessName: string;
  professionalName: string;
  shortDescription: string | null;
  city: string | null;
  whatsapp: string | null;
  logoUrl: string | null;
  cnpj: string | null;
  municipalRegistration: string | null;
  serviceCity: string | null;
  taxRegime: NFSeTaxRegime | null;
}
