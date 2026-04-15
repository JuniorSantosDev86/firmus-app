import type { Quote } from "@/lib/domain";
import { markQuoteAsApproved, readQuoteStore } from "@/lib/quote-storage";
import { createTimelineEvent } from "@/lib/services/timeline";

type QuoteApprovalFailureReason = "not_found" | "not_allowed";

export type QuoteApprovalResult =
  | {
      ok: true;
      outcome: "approved" | "already_approved";
      quote: Quote;
    }
  | {
      ok: false;
      outcome: QuoteApprovalFailureReason;
    };

function normalizePublicId(publicId: string): string {
  return publicId.trim();
}

function isApprovalAllowed(status: Quote["status"]): boolean {
  return status === "draft" || status === "sent";
}

export function approveQuoteByPublicId(publicId: string): QuoteApprovalResult {
  const normalizedPublicId = normalizePublicId(publicId);
  if (normalizedPublicId.length === 0) {
    return {
      ok: false,
      outcome: "not_found",
    };
  }

  const quote = readQuoteStore().quotes.find((item) => item.id === normalizedPublicId) ?? null;
  if (quote === null) {
    return {
      ok: false,
      outcome: "not_found",
    };
  }

  if (quote.status === "approved") {
    return {
      ok: true,
      outcome: "already_approved",
      quote,
    };
  }

  if (!isApprovalAllowed(quote.status)) {
    return {
      ok: false,
      outcome: "not_allowed",
    };
  }

  const approvedQuote = markQuoteAsApproved(quote.id, new Date().toISOString());
  if (approvedQuote === null) {
    return {
      ok: false,
      outcome: "not_found",
    };
  }

  createTimelineEvent({
    type: "quote_approved",
    entityType: "quote",
    entityId: approvedQuote.id,
    metadata: {
      approvedAt: approvedQuote.approvedAt ?? null,
    },
  });

  return {
    ok: true,
    outcome: "approved",
    quote: approvedQuote,
  };
}
