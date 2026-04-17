describe("Quotes", () => {
  beforeEach(() => {
    cy.loginFirmus();
  });

  function quoteItemByIndex(index: number) {
    return cy.get("form").find(".firmus-subpanel").eq(index);
  }

  function fillQuoteItemByIndex(index: number, values: {
    description?: string;
    quantity: string;
    unitPrice?: string;
    serviceName?: string;
  }): void {
    if (values.serviceName) {
      quoteItemByIndex(index)
        .contains("label", "Serviço (opcional)")
        .next("select")
        .select(values.serviceName);
    }

    if (values.description !== undefined) {
      quoteItemByIndex(index)
        .contains("label", "Descrição")
        .next("input")
        .clear()
        .type(values.description);
    }

    quoteItemByIndex(index)
      .contains("label", "Quantidade")
      .next("input")
      .clear()
      .type(values.quantity);

    if (values.unitPrice !== undefined) {
      quoteItemByIndex(index)
        .contains("label", "Preço unitário")
        .next("input")
        .clear()
        .type(values.unitPrice);
    }
  }

  it("creates, edits, and deletes a quote with totals and service reuse", () => {
    cy.visit("/");
    cy.clearFirmusStorage();

    cy.visit("/clients");
    cy.get("#name").type("Acme Health");
    cy.contains("button", "Criar cliente").click();

    cy.visit("/services");
    cy.get("#name").type("Pacote SEO");
    cy.get("#description").type("Otimização mensal");
    cy.get("#basePrice").type("50.00");
    cy.contains("button", "Criar serviço").click();

    cy.visit("/quotes");

    cy.contains("h1", "Orçamentos").should("be.visible");
    cy.contains("Nenhum orçamento salvo ainda.").should("be.visible");

    cy.get("#clientId").find("option").contains("Acme Health");

    fillQuoteItemByIndex(0, {
      description: "Sessão estratégica",
      quantity: "2",
      unitPrice: "100.00",
    });
    cy.contains(/R\$\s*200,00/).should("be.visible");

    cy.contains("button", "Adicionar item").click();

    fillQuoteItemByIndex(1, {
      serviceName: "Pacote SEO",
      quantity: "3",
    });
    quoteItemByIndex(1)
      .contains("label", "Descrição")
      .next("input")
      .should("have.value", "Otimização mensal");
    quoteItemByIndex(1)
      .contains("label", "Preço unitário")
      .next("input")
      .should("have.value", "50.00");
    cy.contains(/R\$\s*150,00/).should("be.visible");

    cy.get("#discount").clear().type("25.00");

    cy.contains("Subtotal:").parent().should("contain.text", "350,00");
    cy.contains("Desconto:").parent().should("contain.text", "25,00");
    cy.contains("Total:").parent().should("contain.text", "325,00");

    cy.contains("button", "Criar orçamento").click();
    cy.contains("Salvo.").should("be.visible");

    cy.contains('[data-testid^="quote-item-"]', "Acme Health")
      .should("contain.text", "325,00")
      .within(() => {
        cy.get('[data-testid^="quote-open-public-"]')
          .should("have.attr", "href")
          .and("match", /^\/public\/quotes\/[^/]+$/);
        cy.get('[data-testid^="quote-open-premium-pdf-"]')
          .should("have.attr", "href")
          .and("match", /^\/public\/quotes\/[^/]+\/pdf$/);
        cy.get('[data-testid^="quote-edit-"]').click();
      });

    cy.contains("h2", "Editar orçamento").should("be.visible");
    cy.get("#discount").clear().type("30.00");
    cy.contains("button", "Salvar alterações").click();

    cy.contains('[data-testid^="quote-item-"]', "Acme Health")
      .should("contain.text", "320,00")
      .within(() => {
        cy.on("window:confirm", () => true);
        cy.get('[data-testid^="quote-delete-"]').click();
      });

    cy.contains('[data-testid^="quote-item-"]', "Acme Health").should(
      "not.exist"
    );
  });
});

export {};
