import type {
  CurrencyInCents,
  EntityId,
  ISODate,
  TimestampedEntity,
} from "@/lib/domain/common";

export type ChargeStatus = "pending" | "paid";

export interface Charge extends TimestampedEntity {
  id: EntityId;
  clientId: EntityId;
  quoteId?: EntityId;
  status: ChargeStatus;
  amountInCents: CurrencyInCents;
  dueDate: ISODate;
}
