import {
  getDASOfficialChannelUrl,
  recordDASOfficialChannelOpened,
} from "@/lib/services/das/das-companion-service";

export type DASOfficialHandoffResult =
  | {
      ok: true;
      recordId: string;
      destinationUrl: string;
    }
  | {
      ok: false;
      errorCode: "das_not_found";
      message: string;
    };

export function handoffToDASOfficialChannel(recordId: string): DASOfficialHandoffResult {
  const result = recordDASOfficialChannelOpened(recordId);
  if (!result.ok) {
    return {
      ok: false,
      errorCode: "das_not_found",
      message: "Registro de DAS não encontrado.",
    };
  }

  return {
    ok: true,
    recordId: result.record.id,
    destinationUrl: getDASOfficialChannelUrl(),
  };
}

export function resolveDASOfficialDestination(): string {
  return getDASOfficialChannelUrl();
}
