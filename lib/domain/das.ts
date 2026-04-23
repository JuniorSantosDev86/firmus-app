import type { EntityId, TimestampedEntity } from "@/lib/domain/common";

export type DASRecordStatus = "pending" | "paid";

export interface DASRecord extends TimestampedEntity {
  id: EntityId;
  competenceMonth: string;
  status: DASRecordStatus;
  paidAt?: string;
}
