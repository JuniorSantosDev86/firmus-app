import type { OutboundChannel, OutboundDispatchResult } from "@/lib/domain/outbound";
import { clipboardAdapter } from "./adapters/clipboard-adapter";
import { emailMailtoAdapter } from "./adapters/email-mailto-adapter";
import { whatsappLinkAdapter } from "./adapters/whatsapp-link-adapter";
import {
  buildOutboundDraft,
  type CreateOutboundDraftInput,
} from "./outbound-draft-builder";
import { isOutboundChannelSupported } from "./outbound-availability";
import { resolveOutboundChannelWithFallback } from "./outbound-fallback";
import { resolveOutboundRecipient, sanitizeOutboundText } from "./outbound-target-resolver";

type DispatchAdapter = {
  dispatch: (draft: ReturnType<typeof buildOutboundDraft>) => OutboundDispatchResult | Promise<OutboundDispatchResult>;
};

const ADAPTERS: Record<OutboundChannel, DispatchAdapter> = {
  whatsapp: whatsappLinkAdapter,
  email: emailMailtoAdapter,
  copy: clipboardAdapter,
};

type DispatchOutboundInput = {
  requestedChannel: OutboundChannel;
  draftInput: Omit<CreateOutboundDraftInput, "channel">;
};

export async function dispatchOutbound(input: DispatchOutboundInput): Promise<OutboundDispatchResult> {
  const normalizedBody = sanitizeOutboundText(input.draftInput.body);
  if (normalizedBody.length === 0) {
    return {
      status: "blocked",
      channel: input.requestedChannel,
      reason: "empty_body",
    };
  }

  const recipient = resolveOutboundRecipient(input.draftInput.recipient);
  const channelResolution = resolveOutboundChannelWithFallback({
    requestedChannel: input.requestedChannel,
    recipient,
    isChannelSupported: isOutboundChannelSupported,
  });

  const draft = buildOutboundDraft({
    ...input.draftInput,
    body: normalizedBody,
    recipient,
    channel: channelResolution.channel,
  });

  const adapter = ADAPTERS[draft.channel];
  const result = await adapter.dispatch(draft);

  if (channelResolution.fallbackReason && result.status === "dispatched") {
    return {
      ...result,
      reason: `fallback_used:${channelResolution.fallbackReason}`,
    };
  }

  return result;
}
