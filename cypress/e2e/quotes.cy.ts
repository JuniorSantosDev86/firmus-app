const BASE_URL = "http://localhost:3000";

describe("Quotes", () => {
  it("creates a quote with client linkage, manual item, service reuse, totals, discount, and persistence", () => {
    cy.visit(BASE_URL);
    cy.clearFirmusStorage();

    cy.visit(`${BASE_URL}/clients`);
    cy.get("#name").type("Acme Health");
    cy.contains("button", "Create client").click();
    cy.contains("li", "Acme Health").should("be.visible");

    cy.visit(`${BASE_URL}/services`);
    cy.get("#name").type("SEO Package");
    cy.get("#description").type("Monthly SEO optimization");
    cy.get("#basePrice").type("50.00");
    cy.contains("button", "Create service").click();
    cy.contains("li", "SEO Package").should("be.visible");

    cy.visit(`${BASE_URL}/quotes`);

    cy.contains("h1", "Quotes").should("be.visible");
    cy.contains("No quotes saved yet.").should("be.visible");

    cy.get("#clientId")
      .find("option")
      .contains("Acme Health")
      .invoke("val")
      .then((acmeClientId) => {
        expect(acmeClientId, "Acme client option value").to.be.a("string").and.not.be.empty;
        cy.get("#clientId").should("have.value", acmeClientId as string);
      });

    cy.contains("h3", "Quote items")
      .closest("div.space-y-3")
      .find(".rounded-xl")
      .first()
      .as("item1");
    cy.get("@item1").within(() => {
      cy.contains("label", "Description").parent().find("input").type("Manual strategy session");
      cy.contains("label", "Quantity").parent().find("input").clear().type("2");
      cy.contains("label", "Unit price").parent().find("input").clear().type("100.00");
      cy.contains("Line total: $200.00").should("be.visible");
    });

    cy.contains("button", "Add item").click();

    cy.contains("h3", "Quote items")
      .closest("div.space-y-3")
      .find(".rounded-xl")
      .eq(1)
      .as("item2");
    cy.get("@item2").within(() => {
      cy.get("select").select("SEO Package");
      cy.contains("label", "Description")
        .parent()
        .find("input")
        .should("have.value", "Monthly SEO optimization");
      cy.contains("label", "Quantity").parent().find("input").clear().type("3");
      cy.contains("label", "Unit price")
        .parent()
        .find("input")
        .should("have.value", "50.00");
      cy.contains("Line total: $150.00").should("be.visible");
    });

    cy.contains("Subtotal:").parent().should("contain.text", "$350.00");
    cy.get("#discount").clear().type("25.00");
    cy.contains("Discount:").parent().should("contain.text", "$25.00");
    cy.contains("Total:").parent().should("contain.text", "$325.00");

    cy.contains("button", "Create quote").click();
    cy.contains("Saved.").should("be.visible");
    cy.contains("li", "Acme Health").should("contain.text", "$325.00");

    cy.reload();

    cy.contains("li", "Acme Health").should("contain.text", "$325.00");
    cy.contains("li", "Acme Health").within(() => {
      cy.contains("button", "Edit").click();
    });

    cy.contains("h2", "Edit quote").should("be.visible");
    cy.contains("Subtotal:").parent().should("contain.text", "$350.00");
    cy.contains("Discount:").parent().should("contain.text", "$25.00");
    cy.contains("Total:").parent().should("contain.text", "$325.00");
  });
});

export {};
