import type { EntityId, TimestampedEntity } from "@/lib/domain/common";

export interface BusinessProfile extends TimestampedEntity {
  id: EntityId;
  businessName: string;
  professionalName: string;
  shortDescription: string | null;
  city: string | null;
  whatsapp: string | null;
  logoUrl: string | null;
}
