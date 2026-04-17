const FIXED_NOW = Date.UTC(2026, 3, 10, 12, 0, 0);

describe("Charges", () => {
  beforeEach(() => {
    cy.loginFirmus();
  });

  it("creates, edits, marks as paid, and deletes a charge", () => {
    cy.clock(FIXED_NOW, ["Date"]);

    cy.visit("/");
    cy.clearFirmusStorage();

    cy.visit("/clients");
    cy.get("#name").type("Cliente Cobrança");
    cy.contains("button", "Criar cliente").click();

    cy.visit("/charges");

    cy.contains("h1", "Cobranças").should("be.visible");
    cy.contains("Nenhuma cobrança salva ainda.").should("be.visible");

    cy.get("#amount").clear().type("200.00");
    cy.get("#dueDate").clear().type("2026-04-12");
    cy.contains("button", "Criar cobrança").click();

    cy.contains('[data-testid^="charge-item-"]', "Cliente Cobrança")
      .should("contain.text", "Pendente")
      .within(() => {
        cy.get('[data-testid^="charge-edit-"]').click();
      });

    cy.contains("h2", "Editar cobrança").should("be.visible");
    cy.get("#amount").clear().type("250.00");
    cy.contains("button", "Salvar alterações").click();

    cy.contains('[data-testid^="charge-item-"]', "Cliente Cobrança")
      .should("contain.text", "250,00")
      .within(() => {
        cy.get('[data-testid^="charge-mark-paid-"]').click();
      });

    cy.contains('[data-testid^="charge-item-"]', "Cliente Cobrança")
      .should("contain.text", "Pago")
      .within(() => {
        cy.on("window:confirm", () => true);
        cy.get('[data-testid^="charge-delete-"]').click();
      });

    cy.contains('[data-testid^="charge-item-"]', "Cliente Cobrança").should(
      "not.exist"
    );
  });
});

export {};
