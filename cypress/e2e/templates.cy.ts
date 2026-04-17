describe("Templates", () => {
  beforeEach(() => {
    cy.loginFirmus();
  });

  it("loads templates screen with safe empty state", () => {
    cy.visit("/");
    cy.clearFirmusStorage();

    cy.visit("/templates");

    cy.contains("h1", "Modelos").should("be.visible");
    cy.contains("h2", "Novo modelo").should("be.visible");
    cy.contains("h2", "Modelos").should("be.visible");
    cy.contains("Nenhum modelo salvo ainda.").should("be.visible");
  });

  it("creates, edits, toggles active state, and persists after reload", () => {
    const templateName = "Follow-up de teste Cypress";
    const updatedTemplateName = "Follow-up atualizado Cypress";
    const templateContent = "Mensagem inicial para aprovação.";
    const updatedTemplateContent = "Mensagem atualizada após revisão.";

    cy.visit("/");
    cy.clearFirmusStorage();

    cy.visit("/templates");

    cy.get("#template-name").clear().type(templateName);
    cy.get("#template-category").select("payment_reminder");
    cy.get("#template-content").clear().type(templateContent);
    cy.contains("button", "Salvar modelo").click();

    cy.contains("h3", "Lembrete de pagamento").should("be.visible");
    cy.contains("li", templateName).as("templateItem");
    cy.get("@templateItem").should("contain.text", "Ativo");

    cy.get("@templateItem").within(() => {
      cy.contains("button", "Editar modelo").click();
    });

    cy.contains("h2", "Editar modelo").should("be.visible");
    cy.get("#template-name").clear().type(updatedTemplateName);
    cy.get("#template-content").clear().type(updatedTemplateContent);
    cy.contains("button", "Atualizar modelo").click();

    cy.contains("li", updatedTemplateName)
      .as("updatedTemplateItem")
      .should("contain.text", updatedTemplateContent);
    cy.contains("li", templateName).should("not.exist");
    cy.contains(updatedTemplateName).should("have.length", 1);

    cy.get("@updatedTemplateItem").within(() => {
      cy.contains("button", "Inativar").click();
    });

    cy.get("@updatedTemplateItem")
      .should("contain.text", "Inativo")
      .within(() => {
        cy.contains("button", "Ativar").should("be.visible");
      });

    cy.reload();

    cy.contains("li", updatedTemplateName)
      .as("persistedTemplateItem")
      .should("contain.text", "Inativo")
      .and("contain.text", updatedTemplateContent)
      .within(() => {
        cy.contains("button", "Ativar").should("be.visible");
      });
  });
});

export {};
