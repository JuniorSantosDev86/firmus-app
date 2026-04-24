const clearFirmusLocalState = (win: Window) => {
  Object.keys(win.localStorage)
    .filter((key) => key.startsWith("firmus."))
    .forEach((key) => win.localStorage.removeItem(key));
};

describe("Block 34 - MVP hardening", () => {
  it("keeps the readiness route private and shows real blockers with direct navigation", () => {
    cy.logoutFirmus();
    cy.visit("/mvp-readiness", {
      failOnStatusCode: false,
      onBeforeLoad(win) {
        clearFirmusLocalState(win);
      },
    });
    cy.location("pathname").should("eq", "/login");

    cy.loginFirmus();
    cy.visit("/mvp-readiness", {
      onBeforeLoad(win) {
        clearFirmusLocalState(win);
      },
    });

    cy.location("pathname").should("eq", "/mvp-readiness");
    cy.getByTestId("mvp-readiness-page").should("be.visible");
    cy.getByTestId("mvp-readiness-overall-status").should("contain.text", "Beta ainda bloqueado");
    cy.getByTestId("mvp-readiness-blocking-count").should("contain.text", "3");
    cy.getByTestId("mvp-readiness-item-status-onboarding-required-steps").should("contain.text", "Bloqueio");
    cy.getByTestId("mvp-readiness-item-link-onboarding-required-steps")
      .should("have.attr", "href", "/onboarding");
    cy.getByTestId("mvp-readiness-item-link-business-profile-base")
      .should("have.attr", "href", "/business-profile");
    cy.getByTestId("mvp-readiness-item-link-core-operations-seeded")
      .should("have.attr", "href", "/clients");
  });

  it("derives a ready snapshot from a coherent workspace state", () => {
    cy.loginFirmus();
    cy.visit("/mvp-readiness", {
      onBeforeLoad(win) {
        clearFirmusLocalState(win);
        const now = "2026-04-20T10:00:00.000Z";

        win.localStorage.setItem("firmus.plan-state", JSON.stringify({ tier: "pro" }));
        win.localStorage.setItem(
          "firmus.business-profile",
          JSON.stringify({
            id: "default",
            businessName: "Firmus Studio",
            professionalName: "Ana Souza",
            shortDescription: "Operação fiscal e comercial assistida.",
            city: "São Paulo",
            whatsapp: "+55 11 98888-1111",
            logoUrl: null,
            cnpj: "12.345.678/0001-90",
            municipalRegistration: "123456",
            serviceCity: "São Paulo",
            taxRegime: "simples",
            createdAt: now,
            updatedAt: now,
          })
        );
        win.localStorage.setItem(
          "firmus.clients",
          JSON.stringify([
            {
              id: "client-1",
              name: "Cliente Alpha",
              whatsapp: null,
              email: "alpha@cliente.test",
              city: "São Paulo",
              notes: null,
              createdAt: now,
              updatedAt: now,
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
              createdAt: now,
              updatedAt: now,
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
                status: "approved",
                issueDate: "2026-04-20",
                validUntil: "2026-04-30",
                approvedAt: now,
                itemIds: ["item-1"],
                subtotalInCents: 150000,
                discountInCents: 0,
                totalInCents: 150000,
                createdAt: now,
                updatedAt: now,
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
                createdAt: now,
                updatedAt: now,
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
              status: "paid",
              createdAt: now,
              updatedAt: now,
            },
          ])
        );
        win.localStorage.setItem(
          "firmus.templates",
          JSON.stringify([
            {
              id: "template-1",
              name: "Follow-up padrão",
              category: "general",
              content: "Mensagem base.",
              isActive: true,
              createdAt: now,
              updatedAt: now,
            },
          ])
        );
        win.localStorage.setItem(
          "firmus.nfse-records",
          JSON.stringify([
            {
              id: "nfse-1",
              chargeId: "charge-1",
              clientId: "client-1",
              quoteId: "quote-1",
              amountInCents: 150000,
              description: "Consultoria mensal",
              competenceDate: now,
              serviceCity: "São Paulo",
              issueStatus: "issued",
              serviceSnapshot: {
                source: "quote",
                quoteId: "quote-1",
                chargeDueDate: "2026-04-25T00:00:00.000Z",
                description: "Consultoria mensal",
              },
              clientSnapshot: {
                name: "Cliente Alpha",
                email: "alpha@cliente.test",
                city: "São Paulo",
              },
              businessSnapshot: {
                businessName: "Firmus Studio",
                cnpj: "12.345.678/0001-90",
                municipalRegistration: "123456",
                serviceCity: "São Paulo",
                taxRegime: "simples",
              },
              documentNumber: "NF-1001",
              providerReference: "PROTO-123",
              issuedAt: now,
              createdAt: now,
              updatedAt: now,
            },
          ])
        );
        win.localStorage.setItem(
          "firmus.das-records",
          JSON.stringify([
            {
              id: "das-2026-04",
              competenceMonth: "2026-04",
              status: "paid",
              paidAt: now,
              createdAt: now,
              updatedAt: now,
            },
          ])
        );
        win.localStorage.setItem(
          "firmus.automationRules",
          JSON.stringify([
            {
              id: "rule-1",
              name: "Lembrete fiscal",
              isActive: true,
              triggerType: "event",
              triggerConfig: {
                eventType: "quote_approved",
              },
              actionType: "create_reminder_preview",
              actionConfig: {},
              createdAt: now,
              updatedAt: now,
            },
          ])
        );
        win.localStorage.setItem(
          "firmus.automationExecutionLog",
          JSON.stringify([
            {
              fingerprint: "rule-1:quote-1",
              ruleId: "rule-1",
              matchId: "match-1",
              candidateSourceType: "event",
              executedAt: now,
            },
          ])
        );
      },
    });

    cy.getByTestId("mvp-readiness-overall-status").should("contain.text", "Pronto para beta");
    cy.getByTestId("mvp-readiness-blocking-count").should("contain.text", "0");
    cy.getByTestId("mvp-readiness-warning-count").should("contain.text", "0");
    cy.getByTestId("mvp-readiness-item-status-nfse-operational-readiness").should("contain.text", "Pronto");
    cy.getByTestId("mvp-readiness-item-status-das-companion-visibility").should("contain.text", "Pronto");
    cy.getByTestId("mvp-readiness-item-status-public-bio-availability").should("contain.text", "Pronto");
  });
});

export {};
