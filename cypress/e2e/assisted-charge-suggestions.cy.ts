const FIXED_NOW = Date.UTC(2026, 3, 13, 12, 0, 0);

function seedEmptySuggestionsState(win: Window): void {
  win.localStorage.setItem("firmus.clients", JSON.stringify([]));
  win.localStorage.setItem("firmus.charges", JSON.stringify([]));
  win.localStorage.setItem("firmus.reminders", JSON.stringify([]));
  win.localStorage.setItem("firmus.quotes", JSON.stringify({ quotes: [], items: [] }));
  win.localStorage.setItem("firmus.timelineEvents", JSON.stringify([]));
  win.localStorage.setItem(
    "firmus.assistedChargeSuggestionState",
    JSON.stringify({ dismissedIds: [], acceptedIds: [] })
  );
}

function seedApprovedQuoteSuggestion(win: Window, quoteId = "quote-1"): void {
  win.localStorage.setItem(
    "firmus.clients",
    JSON.stringify([
      {
        id: "client-ana",
        name: "Ana Silva",
        whatsapp: null,
        email: "ana@example.com",
        city: "São Paulo",
        notes: null,
        createdAt: "2026-03-20T10:00:00.000Z",
        updatedAt: "2026-04-10T10:00:00.000Z",
      },
    ])
  );

  win.localStorage.setItem("firmus.charges", JSON.stringify([]));
  win.localStorage.setItem("firmus.reminders", JSON.stringify([]));
  win.localStorage.setItem(
    "firmus.quotes",
    JSON.stringify({
      quotes: [
        {
          id: quoteId,
          clientId: "client-ana",
          status: "approved",
          issueDate: "2026-04-10",
          validUntil: "2026-04-22",
          itemIds: ["item-1"],
          subtotalInCents: 78000,
          discountInCents: 0,
          totalInCents: 78000,
          createdAt: "2026-04-10T10:00:00.000Z",
          updatedAt: "2026-04-12T10:00:00.000Z",
        },
      ],
      items: [
        {
          id: "item-1",
          quoteId,
          serviceId: null,
          description: "Pacote mensal",
          quantity: 1,
          unitPriceInCents: 78000,
          lineTotalInCents: 78000,
          createdAt: "2026-04-10T10:00:00.000Z",
          updatedAt: "2026-04-12T10:00:00.000Z",
        },
      ],
    })
  );

  win.localStorage.setItem("firmus.timelineEvents", JSON.stringify([]));
  win.localStorage.setItem(
    "firmus.assistedChargeSuggestionState",
    JSON.stringify({ dismissedIds: [], acceptedIds: [] })
  );
}

function readStored<T>(win: Window, key: string): T | null {
  const raw = win.localStorage.getItem(key);
  if (!raw) {
    return null;
  }

  return JSON.parse(raw) as T;
}

describe("Assisted Charge Suggestions", () => {
  it("loads safely", () => {
    cy.clock(FIXED_NOW, ["Date"]);

    cy.visit("/assisted-charge-suggestions", {
      onBeforeLoad(win) {
        seedEmptySuggestionsState(win);
      },
    });

    cy.contains("h1", "Sugestões de cobrança").should("be.visible");
    cy.contains("p", "Revise sugestões derivadas dos dados atuais").should("be.visible");
    cy.contains("h2", "Sugestões abertas").should("be.visible");
  });

  it("renders deterministic open suggestions from controlled data", () => {
    cy.clock(FIXED_NOW, ["Date"]);

    cy.visit("/assisted-charge-suggestions", {
      onBeforeLoad(win) {
        seedApprovedQuoteSuggestion(win);
      },
    });

    cy.contains("Cobrança a partir de orçamento aprovado").should("be.visible");
    cy.contains("Cliente: Ana Silva").should("be.visible");
    cy.contains("Valor sugerido: R$ 780,00").should("be.visible");
    cy.contains("Vencimento sugerido: 22/04/2026").should("be.visible");
    cy.contains("Existe orçamento aprovado sem cobrança vinculada").should("be.visible");
    cy.contains("Motivos").should("be.visible");
    cy.contains("Orçamento aprovado sem cobrança vinculada.").should("be.visible");
    cy.contains("Padrão operacional conhecido detectado.").should("be.visible");
    cy.contains("button", "Criar cobrança").should("be.visible");
    cy.contains("button", "Dispensar").should("be.visible");
  });

  it("accepts a suggestion and creates a real charge", () => {
    cy.clock(FIXED_NOW, ["Date"]);

    cy.visit("/assisted-charge-suggestions", {
      onBeforeLoad(win) {
        seedApprovedQuoteSuggestion(win, "quote-accept");
      },
    });

    cy.contains("button", "Criar cobrança").click();

    cy.contains("Cobrança criada com sucesso").should("be.visible");
    cy.contains("Cobrança a partir de orçamento aprovado").should("not.exist");

    cy.window().then((win) => {
      const charges = readStored<Record<string, unknown>[]>(win, "firmus.charges") ?? [];
      expect(charges).to.have.length(1);
      expect(charges[0].clientId).to.eq("client-ana");
      expect(charges[0].quoteId).to.eq("quote-accept");
      expect(charges[0].amountInCents).to.eq(78000);
      expect(String(charges[0].dueDate)).to.contain("2026-04-22");
    });
  });

  it("dismisses a suggestion without unrelated entity mutation", () => {
    cy.clock(FIXED_NOW, ["Date"]);

    cy.visit("/assisted-charge-suggestions", {
      onBeforeLoad(win) {
        seedApprovedQuoteSuggestion(win, "quote-dismiss");
      },
    });

    cy.contains("button", "Dispensar").click();

    cy.contains("Sugestão dispensada.").should("be.visible");
    cy.contains("Cobrança a partir de orçamento aprovado").should("not.exist");

    cy.window().then((win) => {
      const charges = readStored<Record<string, unknown>[]>(win, "firmus.charges") ?? [];
      const quoteStore = readStored<{ quotes: Record<string, unknown>[] }>(win, "firmus.quotes");

      expect(charges).to.have.length(0);
      expect(quoteStore?.quotes ?? []).to.have.length(1);
      expect(quoteStore?.quotes?.[0]?.id).to.eq("quote-dismiss");
    });
  });

  it("shows safe empty state when source data has no match", () => {
    cy.clock(FIXED_NOW, ["Date"]);

    cy.visit("/assisted-charge-suggestions", {
      onBeforeLoad(win) {
        seedEmptySuggestionsState(win);
      },
    });

    cy.contains("Nenhuma sugestão disponível no momento.").should("be.visible");
    cy.contains("button", "Criar cobrança").should("not.exist");
  });
});

export {};
