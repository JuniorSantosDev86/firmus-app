export type EntityId = string;
export type ISODate = string;
export type CurrencyInCents = number;

export interface TimestampedEntity {
  createdAt: ISODate;
  updatedAt: ISODate;
}
