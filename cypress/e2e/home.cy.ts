describe("Home page", () => {
  it("loads and shows key navigation links in Portuguese", () => {
    cy.visit("/");

    cy.contains("p", "O copiloto operacional para prestadores de serviços.").should(
      "be.visible"
    );

    cy.getByTestId("nav-business-profile")
      .should("be.visible")
      .and("have.attr", "href", "/business-profile");
    cy.getByTestId("nav-clients")
      .should("be.visible")
      .and("have.attr", "href", "/clients");
    cy.getByTestId("nav-services")
      .should("be.visible")
      .and("have.attr", "href", "/services");
    cy.getByTestId("nav-quotes")
      .should("be.visible")
      .and("have.attr", "href", "/quotes");
    cy.getByTestId("nav-charges")
      .should("be.visible")
      .and("have.attr", "href", "/charges");
    cy.getByTestId("nav-financial-overview")
      .should("be.visible")
      .and("have.attr", "href", "/financial-overview");
  });
});

export {};
