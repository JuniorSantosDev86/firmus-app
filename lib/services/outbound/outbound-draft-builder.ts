import type { OutboundChannel, OutboundDraft, OutboundMessageKind, OutboundRecipient } from "@/lib/domain/outbound";
import { sanitizeOutboundText } from "./outbound-target-resolver";

export type CreateOutboundDraftInput = {
  kind: OutboundMessageKind;
  channel: OutboundChannel;
  recipient: OutboundRecipient;
  subject?: string;
  body: string;
  ctaUrl?: string;
  metadata?: Record<string, string>;
};

export type QuoteShareDraftContext = {
  quoteId: string;
  clientName: string;
  totalInCents: number;
  publicUrl: string;
  recipient: OutboundRecipient;
};

export type QuoteApprovalDraftContext = {
  quoteId: string;
  clientName: string;
  publicUrl: string;
  recipient: OutboundRecipient;
};

export type ChargeReminderDraftContext = {
  chargeId: string;
  clientName: string;
  amountInCents: number;
  dueDate: string;
  recipient: OutboundRecipient;
};

export type FollowupDraftContext = {
  title: string;
  description?: string;
  recipient: OutboundRecipient;
  metadata?: Record<string, string>;
};

function createOutboundId(): string {
  return `outbound-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function formatMoneyFromCents(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value / 100);
}

export function buildOutboundDraft(input: CreateOutboundDraftInput): OutboundDraft {
  return {
    id: createOutboundId(),
    kind: input.kind,
    channel: input.channel,
    recipient: input.recipient,
    subject: input.subject,
    body: sanitizeOutboundText(input.body),
    ctaUrl: input.ctaUrl,
    metadata: input.metadata,
    createdAt: new Date().toISOString(),
  };
}

export function buildQuoteShareDraftInput(
  context: QuoteShareDraftContext,
  channel: OutboundChannel
): CreateOutboundDraftInput {
  return {
    kind: "quote_share",
    channel,
    recipient: context.recipient,
    subject: `Orçamento ${context.quoteId.slice(0, 8).toUpperCase()}`,
    body: [
      `Olá, ${context.clientName}.`,
      `Segue seu orçamento no valor de ${formatMoneyFromCents(context.totalInCents)}.`,
      "Você pode revisar os detalhes no link abaixo:",
    ].join("\n"),
    ctaUrl: context.publicUrl,
    metadata: {
      quoteId: context.quoteId,
    },
  };
}

export function buildQuoteApprovalDraftInput(
  context: QuoteApprovalDraftContext,
  channel: OutboundChannel
): CreateOutboundDraftInput {
  return {
    kind: "quote_approval",
    channel,
    recipient: context.recipient,
    subject: `Aprovação do orçamento ${context.quoteId.slice(0, 8).toUpperCase()}`,
    body: [
      `Olá, ${context.clientName}.`,
      "Seu orçamento está pronto para aprovação.",
      "Use o link abaixo para revisar e confirmar:",
    ].join("\n"),
    ctaUrl: context.publicUrl,
    metadata: {
      quoteId: context.quoteId,
    },
  };
}

export function buildChargeReminderDraftInput(
  context: ChargeReminderDraftContext,
  channel: OutboundChannel
): CreateOutboundDraftInput {
  return {
    kind: "charge_reminder",
    channel,
    recipient: context.recipient,
    subject: `Lembrete de cobrança ${context.chargeId.slice(0, 8).toUpperCase()}`,
    body: [
      `Olá, ${context.clientName}.`,
      `Este é um lembrete da cobrança de ${formatMoneyFromCents(context.amountInCents)} com vencimento em ${context.dueDate}.`,
      "Se já realizou o pagamento, por favor desconsidere esta mensagem.",
    ].join("\n"),
    metadata: {
      chargeId: context.chargeId,
    },
  };
}

export function buildFollowupDraftInput(
  context: FollowupDraftContext,
  channel: OutboundChannel
): CreateOutboundDraftInput {
  return {
    kind: "followup",
    channel,
    recipient: context.recipient,
    body: [context.title, context.description].filter(Boolean).join("\n"),
    metadata: context.metadata,
  };
}
