describe("Clients", () => {
  beforeEach(() => {
    cy.loginFirmus();
  });

  function fillQuoteItemByIndex(index: number, values: {
    description: string;
    quantity: string;
    unitPrice: string;
  }): void {
    cy.contains("label", "Descrição").eq(index).parent().find("input").clear().type(values.description);
    cy.contains("label", "Quantidade").eq(index).parent().find("input").clear().type(values.quantity);
    cy.contains("label", "Preço unitário").eq(index).parent().find("input").clear().type(values.unitPrice);
  }

  it("creates, edits, and deletes a client without related data", () => {
    cy.visit("/");
    cy.clearFirmusStorage();

    cy.visit("/clients");

    cy.contains("h1", "Clientes").should("be.visible");
    cy.contains("Nenhum cliente salvo ainda.").should("be.visible");

    cy.get("#name").clear().type("Cliente Livre");
    cy.get("#whatsapp").clear().type("+55 11 97777-7777");
    cy.get("#email").clear().type("livre@cliente.test");
    cy.get("#city").clear().type("Sao Paulo");
    cy.get("#notes").clear().type("Sem vínculos.");
    cy.contains("button", "Criar cliente").click();

    cy.contains("Salvo.").should("be.visible");

    cy.contains('[data-testid^="client-item-"]', "Cliente Livre")
      .as("clientItem")
      .within(() => {
        cy.get('[data-testid^="client-edit-"]').click();
      });

    cy.contains("h2", "Editar cliente").should("be.visible");
    cy.get("#city").clear().type("Campinas");
    cy.get("#notes").clear().type("Contato atualizado.");
    cy.contains("button", "Salvar alterações").click();

    cy.reload();

    cy.contains('[data-testid^="client-item-"]', "Cliente Livre")
      .should("contain.text", "Campinas")
      .within(() => {
        cy.on("window:confirm", () => true);
        cy.get('[data-testid^="client-delete-"]').click();
      });

    cy.contains("Cliente excluído.").should("be.visible");
    cy.contains('[data-testid^="client-item-"]', "Cliente Livre").should(
      "not.exist"
    );
  });

  it("blocks client deletion when related quotes or charges exist", () => {
    cy.visit("/");
    cy.clearFirmusStorage();

    cy.visit("/clients");
    cy.get("#name").type("Cliente Bloqueado");
    cy.contains("button", "Criar cliente").click();

    cy.visit("/quotes");
    cy.get("#clientId").find("option").contains("Cliente Bloqueado");
    fillQuoteItemByIndex(0, {
      description: "Escopo inicial",
      quantity: "1",
      unitPrice: "150.00",
    });
    cy.contains("button", "Criar orçamento").click();

    cy.visit("/charges");
    cy.get("#clientId").find("option").contains("Cliente Bloqueado");
    cy.get("#amount").clear().type("200.00");
    cy.get("#dueDate").clear().type("2026-04-12");
    cy.contains("button", "Criar cobrança").click();

    cy.visit("/clients");

    cy.contains('[data-testid^="client-item-"]', "Cliente Bloqueado").within(() => {
      cy.on("window:confirm", () => true);
      cy.get('[data-testid^="client-delete-"]').click();
    });

    cy.contains(
      "Este cliente não pode ser excluído porque possui orçamentos ou cobranças vinculados."
    ).should("be.visible");
    cy.contains('[data-testid^="client-item-"]', "Cliente Bloqueado").should(
      "exist"
    );
  });
});

export {};
