import type {
  CurrencyInCents,
  EntityId,
  ISODate,
  TimestampedEntity,
} from "@/lib/domain/common";

export type QuoteStatus =
  | "draft"
  | "sent"
  | "approved"
  | "rejected"
  | "expired"
  | "canceled";

export interface QuoteItem extends TimestampedEntity {
  id: EntityId;
  quoteId: EntityId;
  serviceId: EntityId | null;
  description: string;
  quantity: number;
  unitPriceInCents: CurrencyInCents;
  lineTotalInCents: CurrencyInCents;
}

export interface Quote extends TimestampedEntity {
  id: EntityId;
  clientId: EntityId;
  status: QuoteStatus;
  issueDate: ISODate;
  validUntil: ISODate | null;
  itemIds: EntityId[];
  subtotalInCents: CurrencyInCents;
  discountInCents: CurrencyInCents;
  totalInCents: CurrencyInCents;
}
