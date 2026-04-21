"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { OutboundChannel, OutboundDispatchResult } from "@/lib/domain/outbound";
import type { CreateOutboundDraftInput } from "@/lib/services/outbound/outbound-draft-builder";
import { dispatchOutbound } from "@/lib/services/outbound/outbound-dispatcher";
import { OutboundChannelMenu } from "./outbound-channel-menu";

function toFeedbackMessage(result: OutboundDispatchResult): string {
  if (result.status === "blocked") {
    if (result.reason === "empty_body") return "Envio bloqueado: conteúdo da mensagem ausente.";
    if (result.reason === "missing_phone") return "Envio bloqueado: telefone do cliente ausente.";
    if (result.reason === "missing_email") return "Envio bloqueado: email do cliente ausente.";
    return "Envio bloqueado para este contexto.";
  }

  if (result.status === "unsupported") {
    return "Canal indisponível neste contexto.";
  }

  if (result.reason?.startsWith("fallback_used:")) {
    return "Canal solicitado indisponível ou sem contato. Mensagem copiada para continuidade.";
  }

  if (result.channel === "copy") {
    return "Mensagem copiada com sucesso.";
  }

  return "Canal aberto para envio.";
}

function toFeedbackTone(result: OutboundDispatchResult): string {
  if (result.status === "blocked") {
    return "border-[#F8D3D3] bg-[#FFF5F5] text-[#9F1239]";
  }

  if (result.status === "unsupported") {
    return "border-[#FCE7B2] bg-[#FFF9E8] text-[#92400E]";
  }

  if (result.reason?.startsWith("fallback_used:")) {
    return "border-[#FCE7B2] bg-[#FFF9E8] text-[#92400E]";
  }

  return "border-[#D4EDE3] bg-[#F3FBF7] text-[#166534]";
}

type OutboundActionButtonProps = {
  channels?: OutboundChannel[];
  defaultChannel?: OutboundChannel;
  buttonLabel?: string;
  menuTestId?: string;
  buttonTestId?: string;
  feedbackTestId?: string;
  buildDraftInput: (selectedChannel: OutboundChannel) => Omit<CreateOutboundDraftInput, "channel">;
};

export function OutboundActionButton({
  channels = ["whatsapp", "email", "copy"],
  defaultChannel = "whatsapp",
  buttonLabel = "Enviar",
  menuTestId,
  buttonTestId,
  feedbackTestId,
  buildDraftInput,
}: OutboundActionButtonProps) {
  const firstChannel = channels[0] ?? "copy";
  const [selectedChannel, setSelectedChannel] = useState<OutboundChannel>(
    channels.includes(defaultChannel) ? defaultChannel : firstChannel
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<OutboundDispatchResult | null>(null);

  async function handleDispatch() {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    const result = await dispatchOutbound({
      requestedChannel: selectedChannel,
      draftInput: buildDraftInput(selectedChannel),
    });
    setLastResult(result);
    setIsSubmitting(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <OutboundChannelMenu
          channels={channels}
          value={selectedChannel}
          onChange={setSelectedChannel}
          testId={menuTestId}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 px-3"
          onClick={handleDispatch}
          disabled={isSubmitting}
          data-testid={buttonTestId}
        >
          {isSubmitting ? "Enviando..." : buttonLabel}
        </Button>
      </div>
      {lastResult ? (
        <p
          className={`rounded-md border px-2.5 py-1.5 text-xs ${toFeedbackTone(lastResult)}`}
          data-testid={feedbackTestId}
        >
          {toFeedbackMessage(lastResult)}
        </p>
      ) : null}
    </div>
  );
}
