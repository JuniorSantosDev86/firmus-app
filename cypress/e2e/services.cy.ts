describe("Services", () => {
  it("creates, edits, and deletes a service", () => {
    cy.visit("/");
    cy.clearFirmusStorage();

    cy.visit("/services");

    cy.contains("h1", "Serviços").should("be.visible");
    cy.contains("Nenhum serviço salvo ainda.").should("be.visible");

    cy.get("#name").clear().type("Landing Page");
    cy.get("#description").clear().type("Entrega de site one page.");
    cy.get("#basePrice").clear().type("1500.00");
    cy.get("#estimatedDeliveryDays").clear().type("7");
    cy.contains("button", "Criar serviço").click();

    cy.contains('[data-testid^="service-item-"]', "Landing Page")
      .should("contain.text", "1.500,00")
      .within(() => {
        cy.get('[data-testid^="service-edit-"]').click();
      });

    cy.contains("h2", "Editar serviço").should("be.visible");
    cy.get("#basePrice").clear().type("1700.00");
    cy.get("#estimatedDeliveryDays").clear().type("10");
    cy.contains("button", "Salvar alterações").click();

    cy.reload();

    cy.contains('[data-testid^="service-item-"]', "Landing Page")
      .should("contain.text", "1.700,00")
      .and("contain.text", "10 dias")
      .within(() => {
        cy.on("window:confirm", () => true);
        cy.get('[data-testid^="service-delete-"]').click();
      });

    cy.contains('[data-testid^="service-item-"]', "Landing Page").should(
      "not.exist"
    );
  });
});

export {};
