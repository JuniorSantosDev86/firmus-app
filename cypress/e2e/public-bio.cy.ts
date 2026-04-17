function isoDate(daysFromToday: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + daysFromToday);
  return date.toISOString();
}

function assertInternalShellAbsent(): void {
  cy.getByTestId("app-shell").should("not.exist");
  cy.getByTestId("sidebar-nav").should("not.exist");
  cy.getByTestId("mobile-topbar").should("not.exist");
  cy.getByTestId("top-navigation").should("not.exist");
  cy.getByTestId("nav-dashboard").should("not.exist");
}

describe("Public Bio Link - Block 19", () => {
  it("renders the public bio page with business profile data", () => {
    cy.visit("/", {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          "firmus.business-profile",
          JSON.stringify({
            id: "default",
            businessName: "Firmus Studio",
            professionalName: "Ana Costa",
            shortDescription: "Consultoria para operação comercial de serviços.",
            city: "Sao Paulo",
            whatsapp: "+55 11 98888-1111",
            logoUrl: "https://example.com/logo.png",
            createdAt: isoDate(-120),
            updatedAt: isoDate(-1),
          })
        );
      },
    });

    cy.visit("/public/bio");

    cy.getByTestId("public-bio-page").should("be.visible");
    cy.contains("h1", "Firmus Studio").should("be.visible");
    cy.contains("Ana Costa").should("be.visible");
    cy.contains("Sao Paulo").should("be.visible");
    cy.contains("Consultoria para operação comercial de serviços.").should("be.visible");
    cy.contains("WhatsApp:").should("be.visible");
    cy.contains("Conversar no WhatsApp")
      .should("be.visible")
      .and("have.attr", "href", "https://wa.me/5511988881111");

    assertInternalShellAbsent();
  });

  it("handles missing optional fields safely", () => {
    cy.visit("/", {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          "firmus.business-profile",
          JSON.stringify({
            id: "default",
            businessName: "Firmus Solucoes",
            professionalName: "Lucas Lima",
            shortDescription: null,
            city: null,
            whatsapp: null,
            logoUrl: null,
            createdAt: isoDate(-120),
            updatedAt: isoDate(-1),
          })
        );
      },
    });

    cy.visit("/public/bio");

    cy.getByTestId("public-bio-page").should("be.visible");
    cy.contains("h1", "Firmus Solucoes").should("be.visible");
    cy.contains("Lucas Lima").should("be.visible");
    cy.contains("Contato ainda não informado.").should("be.visible");
    cy.contains("Conversar no WhatsApp").should("not.exist");
    assertInternalShellAbsent();
  });

  it("exposes the internal entry point from business profile", () => {
    cy.loginFirmus();
    cy.visit("/business-profile");
    cy.getByTestId("open-public-bio-link")
      .should("be.visible")
      .and("have.attr", "href", "/public/bio");
  });
});

export {};
