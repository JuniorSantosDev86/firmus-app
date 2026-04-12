const BASE_URL = "http://localhost:3000";

describe("Services", () => {
  it("shows empty state, creates a service, edits it, and persists after reload", () => {
    cy.visit(BASE_URL);
    cy.clearFirmusStorage();

    cy.visit(`${BASE_URL}/services`);

    cy.contains("h1", "Services").should("be.visible");
    cy.contains("No services saved yet.").should("be.visible");
    cy.contains("Add your first service to build quotes with a clear and reusable base.").should(
      "be.visible"
    );

    cy.get("#name").clear().type("Landing Page");
    cy.get("#description").clear().type("Single-page website delivery.");
    cy.get("#basePrice").clear().type("1500.00");
    cy.get("#estimatedDeliveryDays").clear().type("7");
    cy.contains("button", "Create service").click();

    cy.contains("Saved.").should("be.visible");
    cy.contains("li", "Landing Page").should("contain.text", "1,500.00");

    cy.contains("li", "Landing Page").within(() => {
      cy.contains("button", "Edit").click();
    });

    cy.contains("h2", "Edit service").should("be.visible");
    cy.get("#basePrice").clear().type("1700.00");
    cy.get("#estimatedDeliveryDays").clear().type("10");
    cy.contains("button", "Save changes").click();

    cy.reload();

    cy.contains("li", "Landing Page").should("contain.text", "1,700.00");
    cy.contains("li", "Landing Page").should("contain.text", "10 days");

    cy.contains("li", "Landing Page").within(() => {
      cy.contains("button", "Edit").click();
    });
    cy.get("#basePrice").should("have.value", "1700.00");
    cy.get("#estimatedDeliveryDays").should("have.value", "10");
  });
});

export {};
