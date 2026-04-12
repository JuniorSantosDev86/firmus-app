const BASE_URL = "http://localhost:3000";

describe("Home page", () => {
  it("loads and shows entry links", () => {
    cy.visit(BASE_URL);

    cy.contains("h1", "Firmus").should("be.visible");
    cy.contains("The operational copilot for service providers.").should(
      "be.visible"
    );

    cy.contains("a", "Open Business Profile")
      .should("be.visible")
      .and("have.attr", "href", "/business-profile");
    cy.contains("a", "Open Clients")
      .should("be.visible")
      .and("have.attr", "href", "/clients");
    cy.contains("a", "Open Services")
      .should("be.visible")
      .and("have.attr", "href", "/services");
    cy.contains("a", "Open Quotes")
      .should("be.visible")
      .and("have.attr", "href", "/quotes");
  });
});

export {};
