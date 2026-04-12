describe("Quotes", () => {
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

    cy.contains("label", "Descrição")
      .first()
      .parents("div.rounded-xl")
      .first()
      .within(() => {
        cy.get("input").eq(0).type("Sessão estratégica");
        cy.get("input").eq(1).clear().type("2");
        cy.get("input").eq(2).clear().type("100.00");
        cy.contains(/R\$\s*200,00/).should("be.visible");
      });

    cy.contains("button", "Adicionar item").click();

    cy.contains("h3", "Itens do orçamento")
      .parents("div.space-y-3")
      .first()
      .find("div.rounded-xl")
      .eq(1)
      .first()
      .within(() => {
        cy.get("select").select("Pacote SEO");
        cy.get("input").eq(0).should("have.value", "Otimização mensal");
        cy.get("input").eq(1).clear().type("3");
        cy.get("input").eq(2).should("have.value", "50.00");
        cy.contains(/R\$\s*150,00/).should("be.visible");
      });

    cy.get("#discount").clear().type("25.00");

    cy.contains("Subtotal:").parent().should("contain.text", "350,00");
    cy.contains("Desconto:").parent().should("contain.text", "25,00");
    cy.contains("Total:").parent().should("contain.text", "325,00");

    cy.contains("button", "Criar orçamento").click();
    cy.contains("Salvo.").should("be.visible");

    cy.contains('[data-testid^="quote-item-"]', "Acme Health")
      .should("contain.text", "325,00")
      .within(() => {
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
