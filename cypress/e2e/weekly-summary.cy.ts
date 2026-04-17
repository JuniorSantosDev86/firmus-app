const FIXED_NOW = Date.UTC(2026, 3, 13, 12, 0, 0);
const RANGE_START_ISO = "2026-04-07T00:00:00.000Z";
const RANGE_END_ISO = "2026-04-13T23:59:59.999Z";

function formatDatePtBr(value: string): string {
  return new Date(value).toLocaleDateString("pt-BR");
}

function normalizeText(value: string): string {
  return value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function assertStatCardValue(label: string, expectedValue: string): void {
  cy.contains("article p", label)
    .should("be.visible")
    .closest("article")
    .find("p")
    .eq(1)
    .invoke("text")
    .then((text) => {
      expect(normalizeText(text)).to.eq(expectedValue);
    });
}

function assertChargeSectionAmount(
  sectionTitle: string,
  expectedValue: string
): void {
  cy.contains("h2", sectionTitle)
    .should("be.visible")
    .closest("section")
    .within(() => {
      cy.contains("p", "Valor:")
        .first()
        .invoke("text")
        .then((text) => {
          expect(normalizeText(text)).to.eq(`Valor: ${expectedValue}`);
        });
    });
}

describe("Weekly Summary", () => {
  beforeEach(() => {
    cy.loginFirmus();
  });

  it("renders deterministic summary from controlled stored data", () => {
    cy.clock(FIXED_NOW, ["Date"]);

    cy.visit("/weekly-summary", {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          "firmus.charges",
          JSON.stringify([
            {
              id: "charge-overdue",
              clientId: "client-1",
              amountInCents: 10000,
              dueDate: "2026-04-10T00:00:00.000Z",
              status: "pending",
              createdAt: "2026-04-01T10:00:00.000Z",
              updatedAt: "2026-04-10T10:00:00.000Z",
            },
            {
              id: "charge-due-soon",
              clientId: "client-2",
              amountInCents: 20000,
              dueDate: "2026-04-16T00:00:00.000Z",
              status: "pending",
              createdAt: "2026-04-02T10:00:00.000Z",
              updatedAt: "2026-04-11T10:00:00.000Z",
            },
            {
              id: "charge-paid",
              clientId: "client-3",
              amountInCents: 50000,
              dueDate: "2026-04-09T00:00:00.000Z",
              status: "paid",
              createdAt: "2026-04-03T10:00:00.000Z",
              updatedAt: "2026-04-12T10:00:00.000Z",
            },
          ])
        );

        win.localStorage.setItem(
          "firmus.reminders",
          JSON.stringify([
            {
              id: "reminder-pending",
              title: "Cobrar comprovante",
              status: "pending",
              sourceType: "manual",
              dueDate: "2026-04-14T00:00:00.000Z",
              createdAt: "2026-04-08T09:00:00.000Z",
              updatedAt: "2026-04-12T09:00:00.000Z",
            },
            {
              id: "reminder-done-in-period",
              title: "Enviar recibo",
              status: "done",
              sourceType: "manual",
              completedAt: "2026-04-12T15:00:00.000Z",
              createdAt: "2026-04-07T09:00:00.000Z",
              updatedAt: "2026-04-12T15:00:00.000Z",
            },
          ])
        );

        win.localStorage.setItem(
          "firmus.timelineEvents",
          JSON.stringify([
            {
              id: "event-charge-paid",
              type: "charge_paid",
              entityType: "charge",
              entityId: "charge-paid",
              timestamp: Date.UTC(2026, 3, 12, 11, 0, 0),
            },
            {
              id: "event-reminder-created",
              type: "reminder_created",
              entityType: "reminder",
              entityId: "reminder-pending",
              timestamp: Date.UTC(2026, 3, 12, 10, 0, 0),
            },
            {
              id: "event-charge-created",
              type: "charge_created",
              entityType: "charge",
              entityId: "charge-overdue",
              timestamp: Date.UTC(2026, 3, 11, 9, 0, 0),
            },
          ])
        );
      },
    });

    cy.contains("h1", "Resumo semanal").should("be.visible");
    cy.contains("p", "Período").should("be.visible");
    cy.contains(
      `${formatDatePtBr(RANGE_START_ISO)} até ${formatDatePtBr(RANGE_END_ISO)}`
    ).should("be.visible");
    cy.contains("h2", "Destaques").should("be.visible");
    cy.contains("h2", "Cobranças vencidas").should("be.visible");
    cy.contains("h2", "Cobranças próximas").should("be.visible");
    cy.contains("h2", "Lembretes pendentes").should("be.visible");
    cy.contains("h2", "Lembretes concluídos no período").should("be.visible");
    cy.contains("h2", "Atividade recente").should("be.visible");

    assertStatCardValue("Recebido no período", "R$ 500,00");
    assertStatCardValue("Em aberto", "R$ 300,00");
    assertStatCardValue("Em atraso", "R$ 100,00");
    assertStatCardValue("Lembretes pendentes", "1");
    assertStatCardValue("Lembretes concluídos", "1");

    assertChargeSectionAmount("Cobranças vencidas", "R$ 100,00");
    assertChargeSectionAmount("Cobranças próximas", "R$ 200,00");
    cy.contains("h2", "Lembretes pendentes")
      .parents("section")
      .first()
      .should("contain.text", "Cobrar comprovante");
    cy.contains("h2", "Lembretes concluídos no período")
      .parents("section")
      .first()
      .should("contain.text", "Enviar recibo");
    cy.contains("h2", "Atividade recente")
      .parents("section")
      .first()
      .should("contain.text", "Cobrança marcada como paga")
      .and("contain.text", "Lembrete criado")
      .and("contain.text", "Cobrança criada");
  });

  it("shows safe empty-state behavior when source data is absent", () => {
    cy.clock(FIXED_NOW, ["Date"]);

    cy.visit("/weekly-summary", {
      onBeforeLoad(win) {
        win.localStorage.removeItem("firmus.charges");
        win.localStorage.removeItem("firmus.reminders");
        win.localStorage.removeItem("firmus.timelineEvents");
      },
    });

    cy.contains("h1", "Resumo semanal").should("be.visible");
    cy.contains(
      `${formatDatePtBr(RANGE_START_ISO)} até ${formatDatePtBr(RANGE_END_ISO)}`
    ).should("be.visible");

    assertStatCardValue("Recebido no período", "R$ 0,00");
    assertStatCardValue("Em aberto", "R$ 0,00");
    assertStatCardValue("Em atraso", "R$ 0,00");
    assertStatCardValue("Lembretes pendentes", "0");
    assertStatCardValue("Lembretes concluídos", "0");

    cy.contains("Sem destaques para este período.").should("not.exist");
    cy.contains("Nenhuma cobrança vencida.").should("be.visible");
    cy.contains("Nenhuma cobrança próxima.").should("be.visible");
    cy.contains("Nenhum lembrete pendente.").should("be.visible");
    cy.contains("Nenhum lembrete concluído no período.").should("be.visible");
    cy.contains("Nenhuma atividade recente.").should("be.visible");
  });
});

export {};
