describe("Business Profile", () => {
  it("creates, edits, and persists the profile", () => {
    cy.visit("/");
    cy.clearFirmusStorage();

    cy.visit("/business-profile");

    cy.contains("h1", "Perfil da empresa").should("be.visible");
    cy.contains("Nenhum perfil da empresa salvo ainda.").should("be.visible");

    cy.get("#businessName").clear().type("Firmus Studio");
    cy.get("#professionalName").clear().type("Ana Silva");
    cy.get("#shortDescription").clear().type("Produto e operação.");
    cy.get("#city").clear().type("Sao Paulo");
    cy.get("#whatsapp").clear().type("+55 11 99999-9999");
    cy.get("#logoUrl").clear().type("https://example.com/logo.png");

    cy.contains("button", "Salvar perfil").click();
    cy.contains("Salvo.").should("be.visible");

    cy.contains("dt", "Nome da empresa")
      .parent()
      .should("contain.text", "Firmus Studio");
    cy.contains("dt", "Nome profissional")
      .parent()
      .should("contain.text", "Ana Silva");

    cy.get("#city").clear().type("Campinas");
    cy.get("#whatsapp").clear().type("+55 11 98888-8888");
    cy.contains("button", "Salvar perfil").click();

    cy.reload();

    cy.contains("dt", "Cidade").parent().should("contain.text", "Campinas");
    cy.contains("dt", "WhatsApp")
      .parent()
      .should("contain.text", "+55 11 98888-8888");
    cy.get("#city").should("have.value", "Campinas");
    cy.get("#whatsapp").should("have.value", "+55 11 98888-8888");
  });
});

export {};
