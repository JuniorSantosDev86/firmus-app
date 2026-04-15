import type { EntityId, ISODate, TimestampedEntity } from "@/lib/domain/common";

export type ReminderStatus = "pending" | "done";

export type ReminderSourceType =
  | "manual"
  | "charge"
  | "quote"
  | "client_followup"
  | "automation_rule";

export interface Reminder extends TimestampedEntity {
  id: EntityId;
  title: string;
  description?: string;
  status: ReminderStatus;
  dueDate?: ISODate;
  clientId?: EntityId;
  chargeId?: EntityId;
  quoteId?: EntityId;
  sourceType: ReminderSourceType;
  sourceRuleId?: EntityId;
  sourceFingerprint?: string;
  completedAt?: ISODate;
}
