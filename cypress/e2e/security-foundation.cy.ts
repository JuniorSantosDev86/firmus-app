describe("Block 24 - Security & LGPD Foundation", () => {
  function assertResponsiveInternalNavigationVisible() {
    cy.get("body").should(($body) => {
      const hasDesktopNav = $body.find('[data-testid="sidebar-nav"]:visible').length > 0;
      const hasMobileNav = $body.find('[data-testid="mobile-topbar"]:visible').length > 0;
      expect(hasDesktopNav || hasMobileNav).to.eq(true);
    });
  }

  function clickVisibleLogoutButton() {
    cy.get("body").then(($body) => {
      const mobileLogout = $body.find('[data-testid="logout-button-mobile"]:visible');
      if (mobileLogout.length > 0) {
        cy.wrap(mobileLogout.first()).click();
        return;
      }

      const desktopLogout = $body.find('[data-testid="logout-button"]:visible');
      if (desktopLogout.length > 0) {
        cy.wrap(desktopLogout.first()).click();
        return;
      }

      throw new Error("Nenhum botão de logout visível foi encontrado.");
    });
  }

  it("redirects unauthenticated users from private routes", () => {
    cy.logoutFirmus();
    cy.visit("/clients");
    cy.url().should("include", "/login");
    cy.getByTestId("login-page").should("be.visible");
  });

  it("renders login page and authenticates valid credentials", () => {
    cy.logoutFirmus();
    cy.visit("/login");

    cy.getByTestId("login-form").should("be.visible");
    cy.get("#username").clear().type("owner@firmus.local");
    cy.get("#password").clear().type("firmus-owner-123");
    cy.getByTestId("login-submit").click();

    cy.url().should("not.include", "/login");
    cy.getByTestId("app-shell").should("be.visible");
  });

  it("fails invalid login safely without exposing sensitive details", () => {
    cy.logoutFirmus();
    cy.visit("/login");

    cy.get("#username").clear().type("owner@firmus.local");
    cy.get("#password").clear().type("senha-invalida");
    cy.getByTestId("login-submit").click();

    cy.getByTestId("login-error-message")
      .should("be.visible")
      .and("contain.text", "Não foi possível autenticar");
    cy.getByTestId("login-error-message").should("not.contain.text", "FIRMUS_SESSION_SECRET");
  });

  it("keeps protected internal routes reachable after authentication", () => {
    cy.loginFirmus();
    cy.visit("/clients");
    cy.getByTestId("app-shell").should("be.visible");
    assertResponsiveInternalNavigationVisible();
    cy.contains("h1", "Clientes").should("be.visible");
  });

  it("invalidates private access after logout", () => {
    cy.loginFirmus();
    cy.visit("/");
    clickVisibleLogoutButton();

    cy.visit("/quotes");
    cy.url().should("include", "/login");
    cy.getByTestId("login-page").should("be.visible");
  });

  it("keeps explicit public routes accessible without authentication", () => {
    cy.logoutFirmus();
    cy.visit("/public/bio");
    cy.location("pathname").should("eq", "/public/bio");
    cy.getByTestId("login-page").should("not.exist");

    cy.get("body").should(($body) => {
      const hasReadyPage = $body.find('[data-testid="public-bio-page"]').length > 0;
      const hasNotReadyPage = $body.find('[data-testid="public-bio-not-ready"]').length > 0;
      const hasLoadingPage = $body.find('[data-testid="public-bio-loading"]').length > 0;
      expect(hasReadyPage || hasNotReadyPage || hasLoadingPage).to.eq(true);
    });
  });

  it("keeps public routes isolated from the internal shell", () => {
    cy.logoutFirmus();
    cy.visit("/public/bio");

    cy.getByTestId("sidebar-nav").should("not.exist");
    cy.getByTestId("app-shell").should("not.exist");
  });

  it("protects sensitive privacy review action behind server-side auth boundary", () => {
    cy.logoutFirmus();

    cy.request({
      method: "POST",
      url: "/api/internal/privacy-foundation/review",
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
      expect(response.body?.privacy?.lastReviewedAt).to.be.a("string");
    });
  });

  it("exposes fail-safe bootstrap status for missing mandatory security config", () => {
    cy.logoutFirmus();

    cy.request({
      method: "GET",
      url: "/api/internal/security/bootstrap",
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property("ok", false);
    });

    cy.loginFirmus();

    cy.request({
      method: "GET",
      url: "/api/internal/security/bootstrap",
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property("ok", true);
      expect(response.body).to.have.property("missingMandatoryFailsSafely", true);
    });
  });

  it("records expected security-sensitive audit events", () => {
    cy.logoutFirmus();

    cy.request({
      method: "POST",
      url: "/api/auth/login",
      body: {
        username: "owner@firmus.local",
        password: "senha-invalida",
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
    });

    cy.loginFirmus();
    cy.logoutFirmus();
    cy.loginFirmus();

    cy.request("/api/internal/privacy-foundation/status").then((response) => {
      expect(response.status).to.eq(200);
      const actions = (response.body.securityAudit as Array<{ action: string }>).map(
        (item) => item.action
      );

      expect(actions).to.include("auth_login_failure");
      expect(actions).to.include("auth_login_success");
      expect(actions).to.include("auth_logout");
    });
  });

  it("loads the privacy/LGPD foundation status safely", () => {
    cy.loginFirmus();
    cy.visit("/business-profile");
    cy.getByTestId("privacy-foundation-panel").should("be.visible");
    cy.getByTestId("privacy-foundation-surface-count").should("not.have.text", "0");

    cy.request("/api/internal/privacy-foundation/status").then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body?.privacy?.version).to.eq("block-24-foundation");
      expect(response.body?.privacy?.dataSurfaces?.length).to.be.greaterThan(0);
    });
  });

  it("keeps public/internal route separation without regression", () => {
    cy.loginFirmus();
    cy.visit("/clients");
    cy.getByTestId("app-shell").should("be.visible");
    assertResponsiveInternalNavigationVisible();

    cy.logoutFirmus();
    cy.visit("/public/quotes/invalid-public-quote-id");
    cy.getByTestId("sidebar-nav").should("not.exist");
    cy.getByTestId("public-quote-not-found").should("be.visible");
  });
});

export {};
