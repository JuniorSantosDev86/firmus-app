const BASE_URL = "http://localhost:3000";

describe("Clients", () => {
  it("shows empty state, creates a client, edits it, and persists after reload", () => {
    cy.visit(BASE_URL);
    cy.clearFirmusStorage();

    cy.visit(`${BASE_URL}/clients`);

    cy.contains("h1", "Clients").should("be.visible");
    cy.contains("No clients saved yet.").should("be.visible");
    cy.contains("Add your first client to start building quotes and follow-ups.").should(
      "be.visible"
    );

    cy.get("#name").clear().type("Acme Health");
    cy.get("#whatsapp").clear().type("+55 11 97777-7777");
    cy.get("#email").clear().type("contact@acme.test");
    cy.get("#city").clear().type("Sao Paulo");
    cy.get("#notes").clear().type("Main decision maker: Julia.");
    cy.contains("button", "Create client").click();

    cy.contains("Saved.").should("be.visible");
    cy.contains("Acme Health").should("be.visible");

    cy.contains("li", "Acme Health").within(() => {
      cy.contains("button", "Edit").click();
    });

    cy.contains("h2", "Edit client").should("be.visible");
    cy.get("#city").clear().type("Campinas");
    cy.get("#notes").clear().type("Updated contact: Carlos.");
    cy.contains("button", "Save changes").click();

    cy.reload();

    cy.contains("li", "Acme Health").should("contain.text", "Campinas");
    cy.contains("li", "Acme Health").within(() => {
      cy.contains("button", "Edit").click();
    });
    cy.get("#city").should("have.value", "Campinas");
    cy.get("#notes").should("have.value", "Updated contact: Carlos.");
  });
});

export {};
