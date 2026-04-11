import type { EntityId, ISODate } from "@/lib/domain/common";

export type TimelineSubjectType =
  | "businessProfile"
  | "client"
  | "service"
  | "quote"
  | "quoteItem"
  | "charge";

export type TimelineAction = "created" | "updated" | "statusChanged" | "deleted";

export interface TimelineEventMetadata {
  [key: string]: string | number | boolean | null;
}

export interface TimelineEvent {
  id: EntityId;
  subjectType: TimelineSubjectType;
  subjectId: EntityId;
  action: TimelineAction;
  occurredAt: ISODate;
  actor: "system" | "user";
  metadata: TimelineEventMetadata | null;
}
