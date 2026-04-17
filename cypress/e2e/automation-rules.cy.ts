const FIXED_NOW = Date.UTC(2026, 3, 15, 12, 0, 0);

describe("Automation rules", () => {
  beforeEach(() => {
    cy.loginFirmus();
  });

  it("creates rules, persists state, toggles activation, and evaluates deterministic matches", () => {
    cy.clock(FIXED_NOW, ["Date"]);

    cy.visit("/automation-rules", {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          "firmus.timelineEvents",
          JSON.stringify([
            {
              id: "event-quote-approved-1",
              type: "quote_approved",
              entityType: "quote",
              entityId: "quote-1",
              timestamp: FIXED_NOW - 1000,
            },
          ])
        );

        win.localStorage.setItem(
          "firmus.charges",
          JSON.stringify([
            {
              id: "charge-overdue-1",
              clientId: "client-1",
              amountInCents: 25000,
              dueDate: "2026-04-10T00:00:00.000Z",
              status: "pending",
              createdAt: "2026-04-01T10:00:00.000Z",
              updatedAt: "2026-04-10T10:00:00.000Z",
            },
          ])
        );
      },
    });

    cy.contains("h1", "Regras de automação").should("be.visible");
    cy.contains("Nenhuma regra criada ainda.").should("be.visible");

    cy.getByTestId("automation-rule-name-input").type("Aviso por orçamento aprovado");
    cy.getByTestId("automation-rule-trigger-type-select").select("event");
    cy.getByTestId("automation-rule-event-type-select").select("quote_approved");
    cy.getByTestId("automation-rule-action-type-select").select("create_reminder_preview");
    cy.getByTestId("automation-rule-create-button").click();

    cy.contains('[data-testid^="automation-rule-item-"]', "Aviso por orçamento aprovado")
      .should("contain.text", "Ativa")
      .and("contain.text", "Evento: Orçamento aprovado");

    cy.getByTestId("automation-rules-evaluate-button").click();
    cy.getByTestId("automation-rules-matches-list")
      .should("contain.text", "Aviso por orçamento aprovado")
      .and("contain.text", "quote_approved");

    cy.reload();
    cy.contains('[data-testid^="automation-rule-item-"]', "Aviso por orçamento aprovado").should(
      "be.visible"
    );

    cy.contains('[data-testid^="automation-rule-item-"]', "Aviso por orçamento aprovado")
      .within(() => {
        cy.contains("button", "Desativar").click();
      })
      .should("contain.text", "Inativa");

    cy.getByTestId("automation-rules-evaluate-button").click();
    cy.getByTestId("automation-rules-empty-matches").should("be.visible");

    cy.getByTestId("automation-rule-name-input").type("Follow-up de cobrança em atraso");
    cy.getByTestId("automation-rule-trigger-type-select").select("derived_condition");
    cy.getByTestId("automation-rule-condition-type-select").select("charge_overdue");
    cy.getByTestId("automation-rule-action-type-select").select("mark_rule_match_for_review");
    cy.getByTestId("automation-rule-create-button").click();

    cy.getByTestId("automation-rules-evaluate-button").click();
    cy.getByTestId("automation-rules-matches-list")
      .should("contain.text", "Follow-up de cobrança em atraso")
      .and("contain.text", "charge_overdue");
  });
});

export {};
