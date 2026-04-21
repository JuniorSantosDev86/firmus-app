import type { OutboundDispatchResult, OutboundDraft } from "@/lib/domain/outbound";
import { isOutboundChannelSupported } from "../outbound-availability";

export function buildClipboardContent(draft: OutboundDraft): string {
  const lines: string[] = [];

  if (draft.subject) {
    lines.push(`Assunto: ${draft.subject}`);
    lines.push("");
  }

  lines.push(draft.body);
  if (draft.ctaUrl) {
    lines.push("");
    lines.push(draft.ctaUrl);
  }

  return lines.join("\n").trim();
}

export const clipboardAdapter = {
  channel: "copy" as const,
  async dispatch(draft: OutboundDraft): Promise<OutboundDispatchResult> {
    if (!isOutboundChannelSupported("copy")) {
      return {
        status: "unsupported",
        channel: "copy",
        reason: "copy_unavailable",
      };
    }

    const content = buildClipboardContent(draft);
    if (content.length === 0) {
      return {
        status: "blocked",
        channel: "copy",
        reason: "empty_content",
      };
    }

    try {
      await navigator.clipboard.writeText(content);
      return {
        status: "dispatched",
        channel: "copy",
      };
    } catch {
      return {
        status: "blocked",
        channel: "copy",
        reason: "copy_failed",
      };
    }
  },
};
