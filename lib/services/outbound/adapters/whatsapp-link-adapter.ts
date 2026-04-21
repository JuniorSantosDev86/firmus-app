import type { OutboundDispatchResult, OutboundDraft } from "@/lib/domain/outbound";
import { isOutboundChannelSupported } from "../outbound-availability";

function buildWhatsAppBody(draft: OutboundDraft): string {
  return [draft.body, draft.ctaUrl].filter(Boolean).join("\n");
}

export function buildWhatsAppLink(draft: OutboundDraft): string {
  const text = encodeURIComponent(buildWhatsAppBody(draft));
  return `https://wa.me/${draft.recipient.phone}?text=${text}`;
}

export const whatsappLinkAdapter = {
  channel: "whatsapp" as const,
  dispatch(draft: OutboundDraft): OutboundDispatchResult {
    if (!isOutboundChannelSupported("whatsapp")) {
      return {
        status: "unsupported",
        channel: "whatsapp",
        reason: "channel_unavailable",
      };
    }

    if (!draft.recipient.phone) {
      return {
        status: "blocked",
        channel: "whatsapp",
        reason: "missing_phone",
      };
    }

    const resolvedUrl = buildWhatsAppLink(draft);
    window.open(resolvedUrl, "_blank", "noopener,noreferrer");

    return {
      status: "dispatched",
      channel: "whatsapp",
      resolvedUrl,
    };
  },
};
