const FIXED_OVERDUE_NOW = Date.UTC(2026, 4, 21, 12, 0, 0);

describe("Block 31 - DAS companion and official handoff", () => {
  beforeEach(() => {
    cy.loginFirmus();
    cy.visit("/");
    cy.clearFirmusStorage();
  });

  it("renders safe empty state when no DAS record exists", () => {
    cy.visit("/das");

    cy.getByTestId("das-empty-state").should("be.visible");
    cy.getByTestId("das-official-note").should("contain.text", "fora do Firmus");
    cy.getByTestId("das-official-link-empty")
      .should("have.attr", "href")
      .and("include", "receita.fazenda.gov.br");
  });

  it("renders DAS records, shows overdue, opens official channel and marks as paid", () => {
    cy.clock(FIXED_OVERDUE_NOW, ["Date"]);

    cy.visit("/das", {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          "firmus.das-records",
          JSON.stringify([
            {
              id: "das-2026-04",
              competenceMonth: "2026-04",
              status: "pending",
              createdAt: "2026-04-22T10:00:00.000Z",
              updatedAt: "2026-04-22T10:00:00.000Z",
            },
          ])
        );
      },
    });

    cy.getByTestId("das-record-list").should("be.visible");
    cy.getByTestId("das-record-das-2026-04").should("be.visible");
    cy.getByTestId("das-competence-das-2026-04").should("contain.text", "04/2026");
    cy.getByTestId("das-status-overdue").should("be.visible");

    cy.getByTestId("das-official-handoff-action-das-2026-04")
      .should("have.attr", "href")
      .and("include", "receita.fazenda.gov.br");

    cy.getByTestId("das-mark-paid-action-das-2026-04").click();
    cy.getByTestId("das-status-paid").should("be.visible");
    cy.getByTestId("das-feedback").should("contain.text", "marcado como pago");
  });
});

export {};
