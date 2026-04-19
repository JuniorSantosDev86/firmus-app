import { buildAssistedActionDraft, findClientByText } from "../../lib/assisted-input/draft-builders";
import { validateAssistedActionDraft } from "../../lib/assisted-input/validators";
import { parseTextInputIntent } from "../../lib/services/text-input-parser";

type StoredClient = {
  id: string;
  name: string;
};

describe("Block 27 - Improved Text Parsing (integration flow)", () => {
  beforeEach(() => {
    cy.clock(Date.UTC(2026, 3, 19, 12, 0, 0), ["Date"]);

    window.localStorage.clear();
    window.localStorage.setItem(
      "firmus.clients",
      JSON.stringify([
        {
          id: "client-ana",
          name: "Ana Silva",
          whatsapp: null,
          email: "ana@example.com",
          city: "São Paulo",
          notes: null,
          createdAt: "2026-04-01T10:00:00.000Z",
          updatedAt: "2026-04-01T10:00:00.000Z",
        },
      ])
    );
    window.localStorage.setItem("firmus.charges", JSON.stringify([]));
    window.localStorage.setItem("firmus.quotes", JSON.stringify({ quotes: [], items: [] }));
    window.localStorage.setItem("firmus.reminders", JSON.stringify([]));
    window.localStorage.setItem("firmus.timelineEvents", JSON.stringify([]));
  });

  it("builds confirmable charge draft from parser output", () => {
    const parsedIntent = parseTextInputIntent(
      "Criar cobrança para Ana de R$ 325,90 com vencimento em 2 dias"
    );
    const clients = JSON.parse(window.localStorage.getItem("firmus.clients") ?? "[]") as StoredClient[];
    const matchedClient = findClientByText(
      clients as Parameters<typeof findClientByText>[0],
      parsedIntent.extractedFields.clientNameCandidate
    );
    const draftAction = buildAssistedActionDraft(parsedIntent, matchedClient);
    const draftPayload = draftAction.payload as {
      clientId?: string;
      amountInCents?: number;
      dueDate?: string;
    };
    const validation = validateAssistedActionDraft(draftAction);

    expect(parsedIntent.intentType).to.eq("create_charge");
    expect(parsedIntent.missingFields).to.deep.eq([]);
    expect(draftAction.actionType).to.eq("create_charge");
    expect(draftPayload.clientId).to.eq("client-ana");
    expect(draftPayload.amountInCents).to.eq(32590);
    expect(draftPayload.dueDate).to.eq("2026-04-21");
    expect(validation.canConfirm).to.eq(true);
    expect(validation.warnings).to.deep.eq([]);
  });

  it("blocks confirmation when required quote fields stay missing", () => {
    const parsedIntent = parseTextInputIntent("Criar orçamento para Ana");
    const clients = JSON.parse(window.localStorage.getItem("firmus.clients") ?? "[]") as StoredClient[];
    const matchedClient = findClientByText(
      clients as Parameters<typeof findClientByText>[0],
      parsedIntent.extractedFields.clientNameCandidate
    );
    const draftAction = buildAssistedActionDraft(parsedIntent, matchedClient);
    const validation = validateAssistedActionDraft(draftAction);

    expect(parsedIntent.intentType).to.eq("create_quote");
    expect(parsedIntent.missingFields).to.include("valor");
    expect(parsedIntent.missingFields).to.include("título/contexto");
    expect(draftAction.actionType).to.eq("create_quote");
    expect(validation.canConfirm).to.eq(false);
    expect(validation.warnings).to.include("Informe um valor válido para o orçamento.");
    expect(validation.warnings).to.include(
      "Informe um título ou contexto mínimo para o orçamento."
    );
  });
});

export {};
