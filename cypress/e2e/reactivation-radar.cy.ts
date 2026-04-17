const FIXED_NOW = Date.UTC(2026, 3, 17, 12, 0, 0);
const DAY_IN_MS = 24 * 60 * 60 * 1000;

type ClientFixture = {
  id: string;
  name: string;
  ageInDays?: number;
  updatedDaysAgo?: number;
};

type ChargeFixture = {
  id: string;
  clientId: string;
  status: "pending" | "paid";
  amountInCents: number;
  dueDaysAgo?: number;
  dueInDays?: number;
  updatedDaysAgo: number;
  quoteId?: string;
};

type QuoteFixture = {
  id: string;
  clientId: string;
  status: "draft" | "sent" | "approved" | "rejected" | "expired" | "canceled";
  totalInCents: number;
  updatedDaysAgo: number;
  issueDaysAgo?: number;
  validUntilInDays?: number | null;
  approvedDaysAgo?: number;
};

type ReminderFixture = {
  id: string;
  title: string;
  status: "pending" | "done";
  sourceType: "manual" | "charge" | "quote" | "client_followup" | "automation_rule";
  clientId?: string;
  chargeId?: string;
  quoteId?: string;
  updatedDaysAgo: number;
  dueInDays?: number;
};

function isoFromDaysAgo(daysAgo: number): string {
  return new Date(FIXED_NOW - daysAgo * DAY_IN_MS).toISOString();
}

function dateInputFromDaysOffset(daysOffset: number): string {
  const date = new Date(FIXED_NOW + daysOffset * DAY_IN_MS);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(
    date.getUTCDate()
  ).padStart(2, "0")}`;
}

function seedRadarStorage(
  win: Window,
  params: {
    clients?: ClientFixture[];
    quotes?: QuoteFixture[];
    charges?: ChargeFixture[];
    reminders?: ReminderFixture[];
    timelineEvents?: Array<Record<string, unknown>>;
  }
): void {
  const clients = (params.clients ?? []).map((client) => ({
    id: client.id,
    name: client.name,
    whatsapp: null,
    email: null,
    city: null,
    notes: null,
    createdAt: isoFromDaysAgo(client.ageInDays ?? 120),
    updatedAt: isoFromDaysAgo(client.updatedDaysAgo ?? Math.max(1, Math.floor((client.ageInDays ?? 120) / 2))),
  }));

  const quotes = (params.quotes ?? []).map((quote) => ({
    id: quote.id,
    clientId: quote.clientId,
    status: quote.status,
    approvedAt: quote.approvedDaysAgo === undefined ? null : isoFromDaysAgo(quote.approvedDaysAgo),
    issueDate: dateInputFromDaysOffset(-(quote.issueDaysAgo ?? quote.updatedDaysAgo)),
    validUntil:
      quote.validUntilInDays === null ? null : dateInputFromDaysOffset(quote.validUntilInDays ?? 7),
    itemIds: [`item-${quote.id}`],
    subtotalInCents: quote.totalInCents,
    discountInCents: 0,
    totalInCents: quote.totalInCents,
    createdAt: isoFromDaysAgo(quote.updatedDaysAgo + 1),
    updatedAt: isoFromDaysAgo(quote.updatedDaysAgo),
  }));

  const quoteItems = (params.quotes ?? []).map((quote) => ({
    id: `item-${quote.id}`,
    quoteId: quote.id,
    serviceId: null,
    description: "Serviço base",
    quantity: 1,
    unitPriceInCents: quote.totalInCents,
    lineTotalInCents: quote.totalInCents,
    createdAt: isoFromDaysAgo(quote.updatedDaysAgo + 1),
    updatedAt: isoFromDaysAgo(quote.updatedDaysAgo),
  }));

  const charges = (params.charges ?? []).map((charge) => ({
    id: charge.id,
    clientId: charge.clientId,
    quoteId: charge.quoteId,
    status: charge.status,
    amountInCents: charge.amountInCents,
    dueDate: isoFromDaysAgo(charge.dueDaysAgo ?? 0 - (charge.dueInDays ?? 0)),
    createdAt: isoFromDaysAgo(charge.updatedDaysAgo + 2),
    updatedAt: isoFromDaysAgo(charge.updatedDaysAgo),
  }));

  const reminders = (params.reminders ?? []).map((reminder) => ({
    id: reminder.id,
    title: reminder.title,
    description: null,
    status: reminder.status,
    sourceType: reminder.sourceType,
    clientId: reminder.clientId,
    chargeId: reminder.chargeId,
    quoteId: reminder.quoteId,
    dueDate:
      reminder.dueInDays === undefined ? undefined : `${dateInputFromDaysOffset(reminder.dueInDays)}T00:00:00.000Z`,
    createdAt: isoFromDaysAgo(reminder.updatedDaysAgo + 1),
    updatedAt: isoFromDaysAgo(reminder.updatedDaysAgo),
    completedAt: reminder.status === "done" ? isoFromDaysAgo(reminder.updatedDaysAgo) : undefined,
  }));

  win.localStorage.setItem("firmus.clients", JSON.stringify(clients));
  win.localStorage.setItem("firmus.quotes", JSON.stringify({ quotes, items: quoteItems }));
  win.localStorage.setItem("firmus.charges", JSON.stringify(charges));
  win.localStorage.setItem("firmus.reminders", JSON.stringify(reminders));
  win.localStorage.setItem("firmus.timelineEvents", JSON.stringify(params.timelineEvents ?? []));
}

describe("Reactivation radar", () => {
  beforeEach(() => {
    cy.loginFirmus();
  });

  it("renders empty state when no eligible candidates exist", () => {
    cy.clock(FIXED_NOW, ["Date"]);

    cy.visit("/reactivation-radar", {
      onBeforeLoad(win) {
        seedRadarStorage(win, {
          clients: [{ id: "client-empty", name: "Cliente recente", ageInDays: 10 }],
        });
      },
    });

    cy.contains("h1", "Radar de reativação").should("be.visible");
    cy.getByTestId("reactivation-radar-empty-state").should("be.visible");
    cy.contains("Nenhuma oportunidade de reativação no momento.").should("be.visible");
  });

  it("surfaces a win-back candidate with prior paid activity and sufficient inactivity", () => {
    cy.clock(FIXED_NOW, ["Date"]);

    cy.visit("/reactivation-radar", {
      onBeforeLoad(win) {
        seedRadarStorage(win, {
          clients: [{ id: "client-win-back", name: "Cliente Win Back", ageInDays: 180 }],
          charges: [
            {
              id: "charge-paid-old",
              clientId: "client-win-back",
              status: "paid",
              amountInCents: 98000,
              updatedDaysAgo: 110,
            },
          ],
        });
      },
    });

    cy.contains("Cliente Win Back").should("be.visible");
    cy.contains("Tipo: Win-back").should("be.visible");
    cy.contains("Motivo: Cliente sem atividade após trabalho pago.").should("be.visible");
    cy.contains("Inatividade: 110 dias").should("be.visible");
  });

  it("surfaces a stalled follow-up candidate when an older quote is stalled", () => {
    cy.clock(FIXED_NOW, ["Date"]);

    cy.visit("/reactivation-radar", {
      onBeforeLoad(win) {
        seedRadarStorage(win, {
          clients: [{ id: "client-stalled", name: "Cliente Follow-up", ageInDays: 150 }],
          quotes: [
            {
              id: "quote-stalled",
              clientId: "client-stalled",
              status: "sent",
              totalInCents: 45000,
              updatedDaysAgo: 40,
            },
          ],
        });
      },
    });

    cy.getByTestId("reactivation-filter-follow-up").click();
    cy.contains("Cliente Follow-up").should("be.visible");
    cy.contains("Tipo: Follow-up").should("be.visible");
    cy.contains("Motivo: Orçamento antigo sem progresso recente.").should("be.visible");
  });

  it("does not surface a client with recent meaningful activity", () => {
    cy.clock(FIXED_NOW, ["Date"]);

    cy.visit("/reactivation-radar", {
      onBeforeLoad(win) {
        seedRadarStorage(win, {
          clients: [{ id: "client-recent", name: "Cliente Recente", ageInDays: 140 }],
          charges: [
            {
              id: "charge-recent-paid",
              clientId: "client-recent",
              status: "paid",
              amountInCents: 30000,
              updatedDaysAgo: 8,
            },
          ],
        });
      },
    });

    cy.contains("Cliente Recente").should("not.exist");
    cy.getByTestId("reactivation-radar-empty-state").should("be.visible");
  });

  it("does not surface a client that already has an active follow-up reminder", () => {
    cy.clock(FIXED_NOW, ["Date"]);

    cy.visit("/reactivation-radar", {
      onBeforeLoad(win) {
        seedRadarStorage(win, {
          clients: [{ id: "client-reminded", name: "Cliente Já Lembrado", ageInDays: 200 }],
          charges: [
            {
              id: "charge-paid-reminded",
              clientId: "client-reminded",
              status: "paid",
              amountInCents: 51000,
              updatedDaysAgo: 120,
            },
          ],
          reminders: [
            {
              id: "reminder-followup-existing",
              title: "Fazer follow-up com cliente",
              status: "pending",
              sourceType: "client_followup",
              clientId: "client-reminded",
              updatedDaysAgo: 2,
            },
          ],
        });
      },
    });

    cy.contains("Cliente Já Lembrado").should("not.exist");
    cy.getByTestId("reactivation-radar-empty-state").should("be.visible");
  });

  it("does not surface active collection/payment follow-up cases", () => {
    cy.clock(FIXED_NOW, ["Date"]);

    cy.visit("/reactivation-radar", {
      onBeforeLoad(win) {
        seedRadarStorage(win, {
          clients: [{ id: "client-collection", name: "Cliente Em Cobrança", ageInDays: 190 }],
          charges: [
            {
              id: "charge-pending-collection",
              clientId: "client-collection",
              status: "pending",
              amountInCents: 62000,
              updatedDaysAgo: 15,
              dueDaysAgo: 5,
            },
          ],
        });
      },
    });

    cy.contains("Cliente Em Cobrança").should("not.exist");
    cy.getByTestId("reactivation-radar-empty-state").should("be.visible");
  });

  it("creates a reminder from the radar item", () => {
    cy.clock(FIXED_NOW, ["Date"]);

    cy.visit("/reactivation-radar", {
      onBeforeLoad(win) {
        seedRadarStorage(win, {
          clients: [{ id: "client-create-reminder", name: "Cliente Reativar", ageInDays: 180 }],
          charges: [
            {
              id: "charge-paid-old-create",
              clientId: "client-create-reminder",
              status: "paid",
              amountInCents: 88000,
              updatedDaysAgo: 100,
            },
          ],
        });
      },
    });

    cy.contains("Cliente Reativar").should("be.visible");
    cy.contains("button", "Criar lembrete de reativação").click();
    cy.getByTestId("reactivation-radar-feedback").should("contain.text", "Lembrete criado com sucesso");
    cy.contains("Cliente Reativar").should("not.exist");

    cy.window().then((win) => {
      const remindersRaw = win.localStorage.getItem("firmus.reminders");
      const reminders = JSON.parse(remindersRaw ?? "[]") as Array<Record<string, unknown>>;
      expect(reminders).to.have.length(1);
      expect(reminders[0].clientId).to.eq("client-create-reminder");
      expect(reminders[0].sourceType).to.eq("client_followup");
      expect(String(reminders[0].sourceFingerprint)).to.contain("reactivation-radar:");
    });
  });

  it("persists created reminder after reload", () => {
    cy.clock(FIXED_NOW, ["Date"]);

    cy.visit("/reactivation-radar", {
      onBeforeLoad(win) {
        seedRadarStorage(win, {
          clients: [{ id: "client-persist", name: "Cliente Persistido", ageInDays: 200 }],
          charges: [
            {
              id: "charge-paid-old-persist",
              clientId: "client-persist",
              status: "paid",
              amountInCents: 73000,
              updatedDaysAgo: 98,
            },
          ],
        });
      },
    });

    cy.contains("button", "Criar lembrete de reativação").click();

    cy.visit("/reminders");
    cy.contains("Reativar cliente: Cliente Persistido").should("be.visible");
    cy.reload();
    cy.contains("Reativar cliente: Cliente Persistido").should("be.visible");
  });

  it("renders deterministically in priority order", () => {
    cy.clock(FIXED_NOW, ["Date"]);

    cy.visit("/reactivation-radar", {
      onBeforeLoad(win) {
        seedRadarStorage(win, {
          clients: [
            { id: "client-win-strong", name: "Cliente Win Forte", ageInDays: 220 },
            { id: "client-win-medium", name: "Cliente Win Medio", ageInDays: 220 },
            { id: "client-followup", name: "Cliente Follow", ageInDays: 220 },
          ],
          charges: [
            {
              id: "charge-win-strong",
              clientId: "client-win-strong",
              status: "paid",
              amountInCents: 120000,
              updatedDaysAgo: 130,
            },
            {
              id: "charge-win-medium",
              clientId: "client-win-medium",
              status: "paid",
              amountInCents: 95000,
              updatedDaysAgo: 90,
            },
          ],
          quotes: [
            {
              id: "quote-followup",
              clientId: "client-followup",
              status: "sent",
              totalInCents: 35000,
              updatedDaysAgo: 45,
            },
          ],
        });
      },
    });

    cy.getByTestId("reactivation-radar-list")
      .find("> li")
      .eq(0)
      .should("contain.text", "Cliente Win Forte")
      .and("contain.text", "Tipo: Win-back");
    cy.getByTestId("reactivation-radar-list")
      .find("> li")
      .eq(1)
      .should("contain.text", "Cliente Win Medio")
      .and("contain.text", "Tipo: Win-back");
    cy.getByTestId("reactivation-radar-list")
      .find("> li")
      .eq(2)
      .should("contain.text", "Cliente Follow")
      .and("contain.text", "Tipo: Follow-up");
  });

  it("supports navigation from radar item to client detail", () => {
    cy.clock(FIXED_NOW, ["Date"]);

    cy.visit("/reactivation-radar", {
      onBeforeLoad(win) {
        seedRadarStorage(win, {
          clients: [{ id: "client-open-route", name: "Cliente Navegacao", ageInDays: 180 }],
          charges: [
            {
              id: "charge-open-route",
              clientId: "client-open-route",
              status: "paid",
              amountInCents: 88000,
              updatedDaysAgo: 101,
            },
          ],
        });
      },
    });

    cy.contains("a", "Abrir cliente").click();
    cy.url().should("include", "/clients/client-open-route");
    cy.contains("h1", "Cliente Navegacao").should("be.visible");
  });
});

export {};
