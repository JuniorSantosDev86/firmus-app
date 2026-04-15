function isoDate(daysFromToday: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + daysFromToday);
  return date.toISOString();
}

const PRIMARY_PUBLIC_QUOTE_ID = "quote-public-17";
const OPTIONAL_PUBLIC_QUOTE_ID = "quote-public-optional-17";

function assertSummaryValue(label: "Subtotal" | "Desconto" | "Total", value: string): void {
  cy.getByTestId("premium-quote-document")
    .find("dl")
    .contains("dt", label)
    .parent()
    .should("contain.text", value);
}

function seedPublicQuoteStorage(win: Window): { primaryQuoteId: string; optionalFieldsQuoteId: string } {
  const primaryQuoteId = PRIMARY_PUBLIC_QUOTE_ID;
  const optionalFieldsQuoteId = OPTIONAL_PUBLIC_QUOTE_ID;

  win.localStorage.setItem(
    "firmus.business-profile",
    JSON.stringify({
      id: "default",
      businessName: "Firmus Studio",
      professionalName: "Ana Costa",
      shortDescription: "Consultoria e execução de marketing digital.",
      city: "Sao Paulo",
      whatsapp: "+55 11 98888-1111",
      logoUrl: null,
      createdAt: isoDate(-120),
      updatedAt: isoDate(-1),
    })
  );

  win.localStorage.setItem(
    "firmus.clients",
    JSON.stringify([
      {
        id: "client-public-1",
        name: "Clínica Vida",
        whatsapp: "+55 11 97777-2222",
        email: "contato@clinicavida.test",
        city: "Campinas",
        notes: "Cliente premium",
        createdAt: isoDate(-80),
        updatedAt: isoDate(-1),
      },
      {
        id: "client-public-2",
        name: "Cliente Sem Opcionais",
        whatsapp: null,
        email: null,
        city: null,
        notes: null,
        createdAt: isoDate(-60),
        updatedAt: isoDate(-1),
      },
    ])
  );

  win.localStorage.setItem(
    "firmus.quotes",
    JSON.stringify({
      quotes: [
        {
          id: primaryQuoteId,
          clientId: "client-public-1",
          status: "sent",
          issueDate: "2026-03-10",
          validUntil: "2026-03-25",
          itemIds: ["qi-17-1", "qi-17-2"],
          subtotalInCents: 39000,
          discountInCents: 4000,
          totalInCents: 35000,
          createdAt: isoDate(-20),
          updatedAt: isoDate(-1),
        },
        {
          id: optionalFieldsQuoteId,
          clientId: "client-public-2",
          status: "draft",
          issueDate: "2026-03-12",
          validUntil: null,
          itemIds: ["qi-17-3"],
          subtotalInCents: 10000,
          discountInCents: 0,
          totalInCents: 10000,
          createdAt: isoDate(-12),
          updatedAt: isoDate(-1),
        },
      ],
      items: [
        {
          id: "qi-17-1",
          quoteId: primaryQuoteId,
          serviceId: null,
          description: "Planejamento estratégico",
          quantity: 2,
          unitPriceInCents: 12000,
          lineTotalInCents: 24000,
          createdAt: isoDate(-20),
          updatedAt: isoDate(-1),
        },
        {
          id: "qi-17-2",
          quoteId: primaryQuoteId,
          serviceId: null,
          description: "Gestão de campanhas",
          quantity: 3,
          unitPriceInCents: 5000,
          lineTotalInCents: 15000,
          createdAt: isoDate(-20),
          updatedAt: isoDate(-1),
        },
        {
          id: "qi-17-3",
          quoteId: optionalFieldsQuoteId,
          serviceId: null,
          description: "Setup inicial",
          quantity: 1,
          unitPriceInCents: 10000,
          lineTotalInCents: 10000,
          createdAt: isoDate(-12),
          updatedAt: isoDate(-1),
        },
      ],
    })
  );

  return { primaryQuoteId, optionalFieldsQuoteId };
}

function assertInternalShellAbsent(): void {
  cy.getByTestId("app-shell").should("not.exist");
  cy.getByTestId("sidebar-nav").should("not.exist");
  cy.getByTestId("mobile-topbar").should("not.exist");
  cy.getByTestId("top-navigation").should("not.exist");
  cy.getByTestId("nav-dashboard").should("not.exist");
}

describe("Public Premium Quote - Block 17", () => {
  it("renders the public route with canonical quote data and page actions", () => {
    cy.visit("/", {
      onBeforeLoad(win) {
        seedPublicQuoteStorage(win);
      },
    });

    cy.visit(`/public/quotes/${PRIMARY_PUBLIC_QUOTE_ID}`);

    cy.getByTestId("premium-quote-document").should("be.visible");
    cy.contains("h1", "Orçamento").should("be.visible");
    cy.contains("Prestador").should("be.visible");
    cy.contains("Cliente").should("be.visible");
    cy.contains("Firmus Studio").should("be.visible");
    cy.contains("Clínica Vida").should("be.visible");
    cy.contains("Itens do orçamento").should("be.visible");

    cy.contains("Planejamento estratégico")
      .parents("tr")
      .first()
      .should("contain.text", "2")
      .and("contain.text", "R$")
      .and("contain.text", "120,00")
      .and("contain.text", "240,00");

    cy.contains("Gestão de campanhas")
      .parents("tr")
      .first()
      .should("contain.text", "3")
      .and("contain.text", "50,00")
      .and("contain.text", "150,00");

    assertSummaryValue("Subtotal", "390,00");
    assertSummaryValue("Desconto", "40,00");
    assertSummaryValue("Total", "350,00");

    cy.contains(/Emissão:\s*\d{2}\/\d{2}\/\d{4}/).should("be.visible");
    cy.contains(/Validade:\s*\d{2}\/\d{2}\/\d{4}/).should("be.visible");
    cy.getByTestId("premium-quote-document")
      .contains("p", /Status:\s*Enviado/)
      .should("be.visible");

    cy.contains("a", "Versão PDF")
      .should("be.visible")
      .and("have.attr", "href", `/public/quotes/${PRIMARY_PUBLIC_QUOTE_ID}/pdf`);
    cy.contains("button", "Imprimir").should("be.visible");

    assertInternalShellAbsent();
  });

  it("renders the pdf route without page-only controls and keeps data fidelity", () => {
    cy.visit("/", {
      onBeforeLoad(win) {
        seedPublicQuoteStorage(win);
      },
    });

    cy.visit(`/public/quotes/${PRIMARY_PUBLIC_QUOTE_ID}/pdf`);

    cy.getByTestId("premium-quote-document").should("be.visible");
    cy.contains("Firmus Studio").should("be.visible");
    cy.contains("Clínica Vida").should("be.visible");
    cy.contains("Planejamento estratégico").should("be.visible");
    cy.contains("Gestão de campanhas").should("be.visible");

    assertSummaryValue("Subtotal", "390,00");
    assertSummaryValue("Desconto", "40,00");
    assertSummaryValue("Total", "350,00");

    cy.contains("a", "Versão PDF").should("not.exist");
    cy.contains("button", "Imprimir").should("not.exist");

    assertInternalShellAbsent();
  });

  it("handles invalid public quote ids gracefully", () => {
    cy.visit("/", {
      onBeforeLoad(win) {
        seedPublicQuoteStorage(win);
      },
    });

    cy.visit("/public/quotes/invalid-public-quote-id");

    cy.getByTestId("public-quote-not-found").should("be.visible");
    cy.contains("h1", "Orçamento não encontrado").should("be.visible");
    cy.contains("Verifique o link público informado e tente novamente.").should(
      "be.visible"
    );
    cy.contains("Carregando orçamento...").should("not.exist");

    assertInternalShellAbsent();
  });

  it("renders cleanly when optional business/client fields are missing", () => {
    cy.visit("/", {
      onBeforeLoad(win) {
        seedPublicQuoteStorage(win);
        const businessWithoutOptionalFields = {
          id: "default",
          businessName: "Firmus Minimal",
          professionalName: "Responsável Base",
          shortDescription: null,
          city: null,
          whatsapp: null,
          logoUrl: null,
          createdAt: isoDate(-120),
          updatedAt: isoDate(-1),
        };

        win.localStorage.setItem(
          "firmus.business-profile",
          JSON.stringify(businessWithoutOptionalFields)
        );
      },
    });

    cy.visit(`/public/quotes/${OPTIONAL_PUBLIC_QUOTE_ID}`);

    cy.getByTestId("premium-quote-document").should("be.visible");
    cy.contains("Firmus Minimal").should("be.visible");
    cy.contains("Cliente Sem Opcionais").should("be.visible");
    cy.contains("Cidade: —").should("be.visible");
    cy.contains("WhatsApp: —").should("be.visible");
    cy.contains("Email: —").should("be.visible");
    assertSummaryValue("Total", "100,00");

    assertInternalShellAbsent();
  });
});

export {};
