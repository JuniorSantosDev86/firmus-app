import type { EntityId, ISODate, TimestampedEntity } from "@/lib/domain/common";

export type TemplateCategory =
  | "quote_followup"
  | "payment_reminder"
  | "approval_prompt"
  | "general";

export interface Template extends TimestampedEntity {
  id: EntityId;
  name: string;
  category: TemplateCategory;
  content: string;
  isActive: boolean;
  createdAt: ISODate;
  updatedAt: ISODate;
}
