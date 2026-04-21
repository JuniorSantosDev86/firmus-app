import type { OutboundDispatchResult, OutboundDraft } from "@/lib/domain/outbound";
import { isOutboundChannelSupported } from "../outbound-availability";

function buildEmailBody(draft: OutboundDraft): string {
  return [draft.body, draft.ctaUrl].filter(Boolean).join("\n");
}

export function buildMailtoLink(draft: OutboundDraft): string {
  const params = new URLSearchParams();
  if (draft.subject) {
    params.set("subject", draft.subject);
  }
  params.set("body", buildEmailBody(draft));

  return `mailto:${draft.recipient.email}?${params.toString()}`;
}

export const emailMailtoAdapter = {
  channel: "email" as const,
  dispatch(draft: OutboundDraft): OutboundDispatchResult {
    if (!isOutboundChannelSupported("email")) {
      return {
        status: "unsupported",
        channel: "email",
        reason: "channel_unavailable",
      };
    }

    if (!draft.recipient.email) {
      return {
        status: "blocked",
        channel: "email",
        reason: "missing_email",
      };
    }

    const resolvedUrl = buildMailtoLink(draft);
    window.open(resolvedUrl, "_blank", "noopener,noreferrer");

    return {
      status: "dispatched",
      channel: "email",
      resolvedUrl,
    };
  },
};
