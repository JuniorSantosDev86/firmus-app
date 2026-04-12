const BASE_URL = "http://localhost:3000";

describe("Business Profile", () => {
  it("creates, edits, and persists the business profile", () => {
    cy.visit(BASE_URL);
    cy.clearFirmusStorage();

    cy.visit(`${BASE_URL}/business-profile`);

    cy.contains("h1", "Business Profile").should("be.visible");
    cy.contains("No business profile saved yet.").should("be.visible");

    cy.get("#businessName").clear().type("Firmus Studio");
    cy.get("#professionalName").clear().type("Ana Silva");
    cy.get("#shortDescription").clear().type("Product design and operations.");
    cy.get("#city").clear().type("Sao Paulo");
    cy.get("#whatsapp").clear().type("+55 11 99999-9999");
    cy.get("#logoUrl").clear().type("https://example.com/logo.png");

    cy.contains("button", "Save profile").click();
    cy.contains("Saved.").should("be.visible");

    cy.contains("dt", "Business name")
      .parent()
      .should("contain.text", "Firmus Studio");
    cy.contains("dt", "Professional name")
      .parent()
      .should("contain.text", "Ana Silva");

    cy.get("#city").clear().type("Campinas");
    cy.get("#whatsapp").clear().type("+55 11 98888-8888");
    cy.contains("button", "Save profile").click();

    cy.reload();

    cy.contains("dt", "City").parent().should("contain.text", "Campinas");
    cy.contains("dt", "WhatsApp")
      .parent()
      .should("contain.text", "+55 11 98888-8888");
    cy.get("#city").should("have.value", "Campinas");
    cy.get("#whatsapp").should("have.value", "+55 11 98888-8888");
  });
});

export {};
