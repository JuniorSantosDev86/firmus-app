import type { EntityId } from "@/lib/domain/common";

export type OutboundChannel = "whatsapp" | "email" | "copy";

export type OutboundMessageKind =
  | "quote_share"
  | "quote_approval"
  | "charge_reminder"
  | "followup"
  | "generic";

export type OutboundRecipient = {
  clientId?: EntityId;
  name?: string;
  phone?: string;
  email?: string;
};

export type OutboundDraft = {
  id: string;
  kind: OutboundMessageKind;
  channel: OutboundChannel;
  recipient: OutboundRecipient;
  subject?: string;
  body: string;
  ctaUrl?: string;
  metadata?: Record<string, string>;
  createdAt: string;
};

export type OutboundDispatchResult = {
  status: "dispatched" | "blocked" | "unsupported";
  channel: OutboundChannel;
  reason?: string;
  resolvedUrl?: string;
};
