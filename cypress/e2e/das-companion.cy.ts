describe("Block 31 - DAS companion and official handoff", () => {
  beforeEach(() => {
    cy.loginFirmus();
    cy.visit("/");
    cy.clearFirmusStorage();
  });

  it("renders safe empty state when no DAS record exists", () => {
    cy.visit("/das");

    cy.getByTestId("das-empty-state").should("be.visible");
    cy.getByTestId("das-official-note").should("contain.text", "canal oficial");
    cy.getByTestId("das-official-link-empty")
      .should("have.attr", "href")
      .and("include", "receita.fazenda.gov.br");
  });

  it("renders DAS snapshot and records official handoff + paid externally actions", () => {
    cy.visit("/das", {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          "firmus.das-records",
          JSON.stringify([
            {
              id: "das-2026-04",
              competence: "2026-04",
              dueDate: "2026-04-20T00:00:00.000Z",
              status: "pending",
              amountInCents: 8450,
              officialUrl: "https://www.gov.br/receitafederal/pt-br",
              createdAt: "2026-04-22T10:00:00.000Z",
              updatedAt: "2026-04-22T10:00:00.000Z",
            },
          ])
        );
      },
    });

    cy.window().then((win) => {
      cy.stub(win, "open").as("windowOpen");
    });

    cy.getByTestId("das-competence").should("contain.text", "2026-04");
    cy.getByTestId("das-status-overdue").should("be.visible");
    cy.getByTestId("das-overdue-warning").should("be.visible");
    cy.getByTestId("das-official-note").should("contain.text", "não processa transações");

    cy.getByTestId("das-official-handoff-action").click();
    cy.get("@windowOpen").should("have.been.calledOnce");
    cy.getByTestId("das-status-handed_off").should("be.visible");
    cy.getByTestId("das-feedback").should("contain.text", "Encaminhamento");

    cy.getByTestId("das-mark-paid-externally-action").click();
    cy.getByTestId("das-status-paid_externally").should("be.visible");
    cy.getByTestId("das-feedback").should("contain.text", "Pagamento externo confirmado");
  });
});

export {};
