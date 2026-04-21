import type { OutboundChannel, OutboundRecipient } from "@/lib/domain/outbound";

export type OutboundFallbackReason = "missing_phone" | "missing_email" | "channel_unavailable";

export type OutboundChannelResolution = {
  channel: OutboundChannel;
  fallbackReason?: OutboundFallbackReason;
};

export function resolveOutboundChannelWithFallback(input: {
  requestedChannel: OutboundChannel;
  recipient: OutboundRecipient;
  isChannelSupported: (channel: OutboundChannel) => boolean;
}): OutboundChannelResolution {
  if (input.requestedChannel === "whatsapp" && !input.recipient.phone) {
    return { channel: "copy", fallbackReason: "missing_phone" };
  }

  if (input.requestedChannel === "email" && !input.recipient.email) {
    return { channel: "copy", fallbackReason: "missing_email" };
  }

  if (!input.isChannelSupported(input.requestedChannel)) {
    if (input.requestedChannel === "copy") {
      return { channel: "copy" };
    }

    return { channel: "copy", fallbackReason: "channel_unavailable" };
  }

  return { channel: input.requestedChannel };
}
