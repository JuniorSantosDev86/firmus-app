function isoDate(daysFromToday: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + daysFromToday);
  return date.toISOString();
}

describe("Client Detail", () => {
  it("loads valid client detail and renders only related quotes, charges, and timeline", () => {
    cy.visit("/clients/client-1", {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          "firmus.clients",
          JSON.stringify([
            {
              id: "client-1",
              name: "Cliente Alpha",
              whatsapp: "+55 11 90000-0001",
              email: "alpha@cliente.test",
              city: "Sao Paulo",
              notes: "Cliente principal",
              createdAt: isoDate(-10),
              updatedAt: isoDate(-1),
            },
            {
              id: "client-2",
              name: "Cliente Beta",
              whatsapp: "+55 11 90000-0002",
              email: "beta@cliente.test",
              city: "Campinas",
              notes: "Outro cliente",
              createdAt: isoDate(-10),
              updatedAt: isoDate(-1),
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
                status: "sent",
                issueDate: isoDate(-2).slice(0, 10),
                validUntil: isoDate(5).slice(0, 10),
                itemIds: ["qi-1"],
                subtotalInCents: 11100,
                discountInCents: 0,
                totalInCents: 11100,
                createdAt: isoDate(-2),
                updatedAt: isoDate(-1),
              },
              {
                id: "quote-2",
                clientId: "client-2",
                status: "draft",
                issueDate: isoDate(-1).slice(0, 10),
                validUntil: null,
                itemIds: ["qi-2"],
                subtotalInCents: 22200,
                discountInCents: 0,
                totalInCents: 22200,
                createdAt: isoDate(-1),
                updatedAt: isoDate(-1),
              },
            ],
            items: [
              {
                id: "qi-1",
                quoteId: "quote-1",
                serviceId: null,
                description: "Escopo Alpha",
                quantity: 1,
                unitPriceInCents: 11100,
                lineTotalInCents: 11100,
                createdAt: isoDate(-2),
                updatedAt: isoDate(-1),
              },
              {
                id: "qi-2",
                quoteId: "quote-2",
                serviceId: null,
                description: "Escopo Beta",
                quantity: 1,
                unitPriceInCents: 22200,
                lineTotalInCents: 22200,
                createdAt: isoDate(-1),
                updatedAt: isoDate(-1),
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
              amountInCents: 33300,
              dueDate: isoDate(1),
              status: "pending",
              createdAt: isoDate(-2),
              updatedAt: isoDate(-1),
            },
            {
              id: "charge-2",
              clientId: "client-2",
              amountInCents: 44400,
              dueDate: isoDate(1),
              status: "pending",
              createdAt: isoDate(-2),
              updatedAt: isoDate(-1),
            },
          ])
        );

        win.localStorage.setItem(
          "firmus.timelineEvents",
          JSON.stringify([
            {
              id: "t-1",
              type: "client_created",
              timestamp: Date.now() - 3000,
              entityId: "client-1",
              entityType: "client",
            },
            {
              id: "t-2",
              type: "quote_created",
              timestamp: Date.now() - 2000,
              entityId: "quote-1",
              entityType: "quote",
            },
            {
              id: "t-3",
              type: "charge_created",
              timestamp: Date.now() - 1000,
              entityId: "charge-1",
              entityType: "charge",
            },
            {
              id: "t-4",
              type: "service_created",
              timestamp: Date.now() - 500,
              entityId: "service-x",
              entityType: "service",
            },
            {
              id: "t-5",
              type: "quote_created",
              timestamp: Date.now() - 250,
              entityId: "quote-2",
              entityType: "quote",
            },
          ])
        );
      },
    });

    cy.contains("h1", "Cliente Alpha").should("be.visible");

    cy.contains("h2", "Orçamentos relacionados").should("be.visible");
    cy.contains(/R\$\s*111,00/).should("be.visible");
    cy.contains(/R\$\s*222,00/).should("not.exist");

    cy.contains("h2", "Cobranças relacionadas").should("be.visible");
    cy.contains(/R\$\s*333,00/).should("be.visible");
    cy.contains(/R\$\s*444,00/).should("not.exist");

    cy.contains("h2", "Linha do tempo consolidada").should("be.visible");
    cy.contains("Cliente criado").should("be.visible");
    cy.contains("Orçamento criado").should("be.visible");
    cy.contains("Cobrança criada").should("be.visible");
    cy.contains("Serviço •").should("not.exist");
  });

  it("handles invalid client id safely", () => {
    cy.visit("/");
    cy.clearFirmusStorage();

    cy.visit("/clients/invalid-client-id");

    cy.contains("h1", "Cliente não encontrado").should("be.visible");
    cy.contains("Não foi possível encontrar o cliente solicitado.").should(
      "be.visible"
    );
    cy.contains("a", "Voltar para clientes")
      .should("be.visible")
      .and("have.attr", "href", "/clients");
  });
});

export {};
