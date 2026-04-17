describe("Block 25 - Activity Logs (visible flow)", () => {
  function seedSecurityAndPrivacyActivityTrail(tag: string) {
    cy.logoutFirmus();

    cy.request({
      method: "POST",
      url: "/api/auth/login",
      body: {
        username: `${tag}@firmus.local`,
        password: "senha-invalida",
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
    });

    cy.loginFirmus();

    cy.request({
      method: "POST",
      url: "/api/internal/privacy-foundation/review",
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property("ok", true);
    });
  }

  it("loads the Activity Logs page safely through the internal shell", () => {
    cy.loginFirmus();
    cy.visit("/activity-logs");

    cy.getByTestId("app-shell").should("be.visible");
    cy.getByTestId("activity-logs-page").should("be.visible");
    cy.contains("h1", "Logs de atividade").should("be.visible");
  });

  it("renders a safe empty state when no visible logs match the current query", () => {
    cy.loginFirmus();
    cy.visit(`/activity-logs?q=__sem_resultado_${Date.now()}__`);

    cy.getByTestId("activity-logs-empty-state")
      .should("be.visible")
      .and("contain.text", "Nenhum evento corresponde aos filtros atuais");
  });

  it("renders activity records from the current server-side source", () => {
    seedSecurityAndPrivacyActivityTrail(`activity-render-${Date.now()}`);

    cy.visit("/activity-logs");
    cy.getByTestId("activity-logs-feed").should("be.visible");
    cy.getByTestId("activity-log-item").its("length").should("be.greaterThan", 0);
    cy.getByTestId("activity-log-message").first().should("not.be.empty");
  });

  it("filters by category correctly", () => {
    seedSecurityAndPrivacyActivityTrail(`activity-filter-${Date.now()}`);

    cy.visit("/activity-logs?category=privacidade");
    cy.getByTestId("activity-log-item").its("length").should("be.greaterThan", 0);
    cy.getByTestId("activity-log-category-badge").each(($badge) => {
      expect($badge.text().trim()).to.eq("Privacidade");
    });
  });

  it("searches visible logs by text correctly", () => {
    cy.loginFirmus();

    cy.request({
      method: "POST",
      url: "/api/auth/logout",
      failOnStatusCode: false,
      followRedirect: false,
    }).then((response) => {
      expect(response.status).to.eq(303);
    });

    cy.loginFirmus();
    cy.visit("/activity-logs?q=logout");

    cy.getByTestId("activity-log-item").its("length").should("be.greaterThan", 0);
    cy.getByTestId("activity-log-message").each(($message) => {
      expect($message.text().toLowerCase()).to.include("logout");
    });
  });

  it("preserves reverse chronological ordering", () => {
    seedSecurityAndPrivacyActivityTrail(`activity-order-${Date.now()}`);
    cy.wait(60);
    cy.loginFirmus();

    cy.visit("/activity-logs");
    cy.getByTestId("activity-log-item").then(($items) => {
      const occurredAtValues = [...$items]
        .map((item) => item.getAttribute("data-occurred-at"))
        .filter((value): value is string => Boolean(value));

      expect(occurredAtValues.length).to.be.greaterThan(0);

      for (let index = 0; index < occurredAtValues.length - 1; index += 1) {
        const currentTimestamp = Date.parse(occurredAtValues[index]);
        const nextTimestamp = Date.parse(occurredAtValues[index + 1]);
        expect(currentTimestamp).to.be.at.least(nextTimestamp);
      }
    });
  });

  it("keeps the page protected behind auth", () => {
    cy.logoutFirmus();
    cy.visit("/activity-logs");

    cy.url().should("include", "/login");
    cy.getByTestId("login-page").should("be.visible");
  });

  it("navigation entry to Logs de atividade works correctly", () => {
    cy.viewport(1280, 800);
    cy.loginFirmus();
    cy.visit("/");

    cy.getByTestId("sidebar-nav").should("be.visible");
    cy.getByTestId("nav-activity-logs").should("have.attr", "href", "/activity-logs").click();
    cy.location("pathname").should("eq", "/activity-logs");
    cy.getByTestId("activity-logs-page").should("be.visible");
  });
});

export {};
