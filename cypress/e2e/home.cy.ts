describe("Home page", () => {
  it("renders desktop shell with sidebar navigation", () => {
    cy.viewport(1366, 900);
    cy.visit("/");

    cy.getByTestId("app-shell").should("be.visible");
    cy.getByTestId("sidebar-nav").should("be.visible");
    cy.getByTestId("home-logo-link").should("be.visible");

    cy.getByTestId("nav-dashboard").should("have.attr", "href", "/");
    cy.getByTestId("nav-business-profile").should("have.attr", "href", "/business-profile");
    cy.getByTestId("nav-clients").should("have.attr", "href", "/clients");
    cy.getByTestId("nav-services").should("have.attr", "href", "/services");
    cy.getByTestId("nav-quotes").should("have.attr", "href", "/quotes");
    cy.getByTestId("nav-charges").should("have.attr", "href", "/charges");
    cy.getByTestId("nav-financial-overview").should("have.attr", "href", "/financial-overview");
  });

  it("opens and closes mobile drawer navigation", () => {
    cy.viewport(390, 844);
    cy.visit("/");

    cy.getByTestId("mobile-topbar").should("be.visible");
    cy.getByTestId("mobile-drawer-trigger").should("be.visible").click();
    cy.getByTestId("mobile-drawer").should("be.visible");

    cy.getByTestId("nav-clients-mobile").should("have.attr", "href", "/clients");
    cy.getByTestId("nav-assisted-input-mobile").should("have.attr", "href", "/assisted-input");

    cy.getByTestId("mobile-drawer-close").click();
    cy.getByTestId("mobile-drawer").should("not.exist");
  });

  it("renders recent timeline activity and upcoming actions from real stored data", () => {
    const now = Date.UTC(2026, 3, 14, 12, 0, 0);

    cy.clock(now, ["Date"]);
    cy.visit("/", {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          "firmus.clients",
          JSON.stringify([
            {
              id: "client-1",
              name: "Cliente Torre",
              whatsapp: null,
              email: null,
              city: null,
              notes: null,
              createdAt: "2026-04-01T12:00:00.000Z",
              updatedAt: "2026-04-10T12:00:00.000Z",
            },
          ])
        );

        win.localStorage.setItem(
          "firmus.charges",
          JSON.stringify([
            {
              id: "charge-1",
              clientId: "client-1",
              amountInCents: 22500,
              dueDate: "2026-04-10T00:00:00.000Z",
              status: "pending",
              createdAt: "2026-04-10T12:00:00.000Z",
              updatedAt: "2026-04-10T12:00:00.000Z",
            },
          ])
        );

        win.localStorage.setItem(
          "firmus.reminders",
          JSON.stringify([
            {
              id: "reminder-1",
              title: "Retornar proposta",
              status: "pending",
              sourceType: "manual",
              dueDate: "2026-04-16T00:00:00.000Z",
              createdAt: "2026-04-12T12:00:00.000Z",
              updatedAt: "2026-04-12T12:00:00.000Z",
            },
          ])
        );

        win.localStorage.setItem(
          "firmus.timelineEvents",
          JSON.stringify([
            {
              id: "event-1",
              type: "charge_created",
              timestamp: now - 3000,
              entityId: "charge-1",
              entityType: "charge",
            },
            {
              id: "event-2",
              type: "reminder_created",
              timestamp: now - 1000,
              entityId: "reminder-1",
              entityType: "reminder",
            },
          ])
        );
      },
    });

    cy.getByTestId("dashboard-operational-summary").should("be.visible");
    cy.contains("h2", "Próximas ações").should("be.visible");
    cy.contains("Cobrança: Cliente Torre").should("be.visible");
    cy.contains("Retornar proposta").should("be.visible");

    cy.getByTestId("dashboard-activity-item-event-1").should("be.visible");
    cy.getByTestId("dashboard-activity-item-event-2").should("be.visible");
    cy.contains("Cobrança criada").should("be.visible");
    cy.contains("Lembrete criado").should("be.visible");
  });

  it("keeps major routes reachable inside the new shell", () => {
    cy.viewport(1280, 900);
    cy.visit("/clients");
    cy.getByTestId("app-shell").should("be.visible");
    cy.getByTestId("sidebar-nav").should("be.visible");
    cy.contains("h1", "Clientes").should("be.visible");

    cy.getByTestId("nav-services").click();
    cy.url().should("include", "/services");
    cy.contains("h1", "Serviços").should("be.visible");

    cy.getByTestId("nav-quotes").click();
    cy.url().should("include", "/quotes");
    cy.contains("h1", "Orçamentos").should("be.visible");

    cy.getByTestId("nav-charges").click();
    cy.url().should("include", "/charges");
    cy.contains("h1", "Cobranças").should("be.visible");
  });
});

export {};
