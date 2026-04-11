import type {
  CurrencyInCents,
  EntityId,
  TimestampedEntity,
} from "@/lib/domain/common";

export interface Service extends TimestampedEntity {
  id: EntityId;
  name: string;
  description: string | null;
  basePriceInCents: CurrencyInCents;
  estimatedDeliveryDays: number | null;
  isActive: boolean;
}
