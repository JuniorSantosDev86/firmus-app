import type {
  CurrencyInCents,
  EntityId,
  ISODate,
  TimestampedEntity,
} from "@/lib/domain/common";

export type ChargeStatus = "pending" | "paid" | "overdue" | "canceled";

export interface Charge extends TimestampedEntity {
  id: EntityId;
  clientId: EntityId;
  quoteId: EntityId | null;
  status: ChargeStatus;
  amountInCents: CurrencyInCents;
  dueDate: ISODate;
  paidAt: ISODate | null;
}
