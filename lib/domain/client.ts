import type { EntityId, TimestampedEntity } from "@/lib/domain/common";

export interface Client extends TimestampedEntity {
  id: EntityId;
  name: string;
  whatsapp: string | null;
  email: string | null;
  city: string | null;
  notes: string | null;
}
