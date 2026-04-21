import type { OutboundChannel } from "@/lib/domain/outbound";

export function isOutboundChannelSupported(channel: OutboundChannel): boolean {
  if (channel === "copy") {
    return (
      typeof navigator !== "undefined" &&
      !!navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function"
    );
  }

  return typeof window !== "undefined" && typeof window.open === "function";
}
