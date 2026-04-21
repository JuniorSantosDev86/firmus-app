"use client";

import type { OutboundChannel } from "@/lib/domain/outbound";

const CHANNEL_LABELS: Record<OutboundChannel, string> = {
  whatsapp: "WhatsApp",
  email: "Email",
  copy: "Copiar",
};

type OutboundChannelMenuProps = {
  channels: OutboundChannel[];
  value: OutboundChannel;
  onChange: (value: OutboundChannel) => void;
  testId?: string;
};

export function OutboundChannelMenu({
  channels,
  value,
  onChange,
  testId,
}: OutboundChannelMenuProps) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as OutboundChannel)}
      className="h-8 rounded-md border border-[#D4DEE8] bg-white px-2 text-xs text-[#334155]"
      data-testid={testId}
    >
      {channels.map((channel) => (
        <option key={channel} value={channel}>
          {CHANNEL_LABELS[channel]}
        </option>
      ))}
    </select>
  );
}
