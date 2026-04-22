import type {
  CurrencyInCents,
  EntityId,
  ISODate,
  TimestampedEntity,
} from "@/lib/domain/common";

export type DASCompanionStatus = "pending" | "guided" | "handed_off" | "paid_externally";

export interface DASRecord extends TimestampedEntity {
  id: EntityId;
  competence: string;
  dueDate: ISODate;
  status: DASCompanionStatus;
  amountInCents?: CurrencyInCents;
  officialUrl?: string;
}
