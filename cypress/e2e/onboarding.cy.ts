describe("Block 33 - Improved onboarding", () => {
  beforeEach(() => {
    cy.loginFirmus();
    cy.visit("/");
    cy.clearFirmusStorage();
  });

  it("shows onboarding guidance for an empty workspace and renders the dedicated route safely", () => {
    cy.visit("/");

    cy.getByTestId("onboarding-card").should("be.visible");
    cy.getByTestId("onboarding-next-step").should("contain.text", "Preencha o perfil da empresa");
    cy.getByTestId("onboarding-card-open-page").click();

    cy.url().should("include", "/onboarding");
    cy.getByTestId("onboarding-page").should("be.visible");
    cy.getByTestId("onboarding-progress-count").should("contain.text", "0/5");
    cy.getByTestId("onboarding-step-business_profile_completed").should("be.visible");
    cy.getByTestId("onboarding-step-first_client_created").should("be.visible");
  });

  it("advances onboarding as real core setup data appears", () => {
    cy.visit("/", {
      onBeforeLoad(win) {
        win.localStorage.setItem("firmus.plan-state", JSON.stringify({ tier: "free" }));
        win.localStorage.setItem(
          "firmus.business-profile",
          JSON.stringify({
            id: "default",
            businessName: "Firmus Studio",
            professionalName: "Ana Souza",
            shortDescription: null,
            city: "São Paulo",
            whatsapp: null,
            logoUrl: null,
            cnpj: null,
            municipalRegistration: null,
            serviceCity: null,
            taxRegime: null,
            createdAt: "2026-04-20T10:00:00.000Z",
            updatedAt: "2026-04-20T10:00:00.000Z",
          })
        );

        win.localStorage.setItem(
          "firmus.clients",
          JSON.stringify([
            {
              id: "client-1",
              name: "Cliente Alpha",
              whatsapp: null,
              email: null,
              city: null,
              notes: null,
              createdAt: "2026-04-20T10:00:00.000Z",
              updatedAt: "2026-04-20T10:00:00.000Z",
            },
          ])
        );

        win.localStorage.setItem(
          "firmus.services",
          JSON.stringify([
            {
              id: "service-1",
              name: "Consultoria mensal",
              description: null,
              basePriceInCents: 150000,
              estimatedDeliveryDays: null,
              isActive: true,
              createdAt: "2026-04-20T10:00:00.000Z",
              updatedAt: "2026-04-20T10:00:00.000Z",
            },
          ])
        );

        win.localStorage.setItem(
          "firmus.quotes",
          JSON.stringify({
            quotes: [
              {
                id: "quote-1",
                clientId: "client-1",
                status: "draft",
                issueDate: "2026-04-20",
                validUntil: null,
                itemIds: ["item-1"],
                subtotalInCents: 150000,
                discountInCents: 0,
                totalInCents: 150000,
                createdAt: "2026-04-20T10:00:00.000Z",
                updatedAt: "2026-04-20T10:00:00.000Z",
              },
            ],
            items: [
              {
                id: "item-1",
                quoteId: "quote-1",
                serviceId: "service-1",
                description: "Consultoria mensal",
                quantity: 1,
                unitPriceInCents: 150000,
                lineTotalInCents: 150000,
                createdAt: "2026-04-20T10:00:00.000Z",
                updatedAt: "2026-04-20T10:00:00.000Z",
              },
            ],
          })
        );
      },
    });

    cy.getByTestId("onboarding-card").should("be.visible");
    cy.getByTestId("onboarding-next-step").should("contain.text", "Registre a primeira cobrança");

    cy.window().then((win) => {
      win.localStorage.setItem(
        "firmus.charges",
        JSON.stringify([
          {
            id: "charge-1",
            clientId: "client-1",
            quoteId: "quote-1",
            amountInCents: 150000,
            dueDate: "2026-04-25T00:00:00.000Z",
            status: "pending",
            createdAt: "2026-04-20T10:00:00.000Z",
            updatedAt: "2026-04-20T10:00:00.000Z",
          },
        ])
      );
      win.dispatchEvent(new StorageEvent("storage"));
    });

    cy.getByTestId("onboarding-next-step").should("contain.text", "Salve um modelo de mensagem");

    cy.visit("/onboarding");
    cy.getByTestId("onboarding-progress-count").should("contain.text", "5/6");
  });

  it("persists dismiss and optional skip behavior safely", () => {
    cy.visit("/");
    cy.getByTestId("onboarding-card-dismiss").click();
    cy.getByTestId("onboarding-card").should("not.exist");

    cy.visit("/onboarding", {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          "firmus.business-profile",
          JSON.stringify({
            id: "default",
            businessName: "Firmus Studio",
            professionalName: "Ana Souza",
            shortDescription: null,
            city: "São Paulo",
            whatsapp: null,
            logoUrl: null,
            cnpj: null,
            municipalRegistration: null,
            serviceCity: null,
            taxRegime: null,
            createdAt: "2026-04-20T10:00:00.000Z",
            updatedAt: "2026-04-20T10:00:00.000Z",
          })
        );
        win.localStorage.setItem(
          "firmus.clients",
          JSON.stringify([
            {
              id: "client-1",
              name: "Cliente Alpha",
              whatsapp: null,
              email: null,
              city: null,
              notes: null,
              createdAt: "2026-04-20T10:00:00.000Z",
              updatedAt: "2026-04-20T10:00:00.000Z",
            },
          ])
        );
        win.localStorage.setItem(
          "firmus.services",
          JSON.stringify([
            {
              id: "service-1",
              name: "Consultoria mensal",
              description: null,
              basePriceInCents: 150000,
              estimatedDeliveryDays: null,
              isActive: true,
              createdAt: "2026-04-20T10:00:00.000Z",
              updatedAt: "2026-04-20T10:00:00.000Z",
            },
          ])
        );
        win.localStorage.setItem(
          "firmus.quotes",
          JSON.stringify({
            quotes: [
              {
                id: "quote-1",
                clientId: "client-1",
                status: "draft",
                issueDate: "2026-04-20",
                validUntil: null,
                itemIds: ["item-1"],
                subtotalInCents: 150000,
                discountInCents: 0,
                totalInCents: 150000,
                createdAt: "2026-04-20T10:00:00.000Z",
                updatedAt: "2026-04-20T10:00:00.000Z",
              },
            ],
            items: [
              {
                id: "item-1",
                quoteId: "quote-1",
                serviceId: "service-1",
                description: "Consultoria mensal",
                quantity: 1,
                unitPriceInCents: 150000,
                lineTotalInCents: 150000,
                createdAt: "2026-04-20T10:00:00.000Z",
                updatedAt: "2026-04-20T10:00:00.000Z",
              },
            ],
          })
        );
        win.localStorage.setItem(
          "firmus.charges",
          JSON.stringify([
            {
              id: "charge-1",
              clientId: "client-1",
              quoteId: "quote-1",
              amountInCents: 150000,
              dueDate: "2026-04-25T00:00:00.000Z",
              status: "pending",
              createdAt: "2026-04-20T10:00:00.000Z",
              updatedAt: "2026-04-20T10:00:00.000Z",
            },
          ])
        );
      },
    });

    cy.getByTestId("onboarding-reopen-dashboard").click();
    cy.getByTestId("onboarding-skip-first_template_created").click();
    cy.getByTestId("onboarding-step-first_template_created").should("not.exist");

    cy.visit("/");
    cy.getByTestId("onboarding-card").should("be.visible");
    cy.getByTestId("onboarding-next-step").should("not.contain.text", "modelo");
  });

  it("keeps plan-aware advanced onboarding coherent on restricted plans", () => {
    cy.visit("/onboarding", {
      onBeforeLoad(win) {
        win.localStorage.setItem("firmus.plan-state", JSON.stringify({ tier: "free" }));
        win.localStorage.setItem(
          "firmus.business-profile",
          JSON.stringify({
            id: "default",
            businessName: "Firmus Studio",
            professionalName: "Ana Souza",
            shortDescription: null,
            city: "São Paulo",
            whatsapp: null,
            logoUrl: null,
            cnpj: "12.345.678/0001-90",
            municipalRegistration: "IM-10",
            serviceCity: "São Paulo",
            taxRegime: "mei",
            createdAt: "2026-04-20T10:00:00.000Z",
            updatedAt: "2026-04-20T10:00:00.000Z",
          })
        );
        win.localStorage.setItem(
          "firmus.clients",
          JSON.stringify([
            {
              id: "client-1",
              name: "Cliente Alpha",
              whatsapp: null,
              email: null,
              city: null,
              notes: null,
              createdAt: "2026-04-20T10:00:00.000Z",
              updatedAt: "2026-04-20T10:00:00.000Z",
            },
          ])
        );
        win.localStorage.setItem(
          "firmus.services",
          JSON.stringify([
            {
              id: "service-1",
              name: "Consultoria mensal",
              description: null,
              basePriceInCents: 150000,
              estimatedDeliveryDays: null,
              isActive: true,
              createdAt: "2026-04-20T10:00:00.000Z",
              updatedAt: "2026-04-20T10:00:00.000Z",
            },
          ])
        );
        win.localStorage.setItem(
          "firmus.quotes",
          JSON.stringify({
            quotes: [
              {
                id: "quote-1",
                clientId: "client-1",
                status: "draft",
                issueDate: "2026-04-20",
                validUntil: null,
                itemIds: ["item-1"],
                subtotalInCents: 150000,
                discountInCents: 0,
                totalInCents: 150000,
                createdAt: "2026-04-20T10:00:00.000Z",
                updatedAt: "2026-04-20T10:00:00.000Z",
              },
            ],
            items: [
              {
                id: "item-1",
                quoteId: "quote-1",
                serviceId: "service-1",
                description: "Consultoria mensal",
                quantity: 1,
                unitPriceInCents: 150000,
                lineTotalInCents: 150000,
                createdAt: "2026-04-20T10:00:00.000Z",
                updatedAt: "2026-04-20T10:00:00.000Z",
              },
            ],
          })
        );
        win.localStorage.setItem(
          "firmus.charges",
          JSON.stringify([
            {
              id: "charge-1",
              clientId: "client-1",
              quoteId: "quote-1",
              amountInCents: 150000,
              dueDate: "2026-04-25T00:00:00.000Z",
              status: "pending",
              createdAt: "2026-04-20T10:00:00.000Z",
              updatedAt: "2026-04-20T10:00:00.000Z",
            },
          ])
        );
      },
    });

    cy.getByTestId("onboarding-checklist").should("be.visible");
    cy.getByTestId("onboarding-step-nfse_ready_or_used").should("not.exist");
    cy.getByTestId("onboarding-step-das_accessed_or_used").should("not.exist");
    cy.getByTestId("onboarding-step-automation_used").should("not.exist");
  });
});

export {};
