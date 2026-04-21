describe("Block 29 - NFSe foundation", () => {
  beforeEach(() => {
    cy.loginFirmus();
    cy.visit("/");
    cy.clearFirmusStorage();
  });

  it("shows readiness, prepares draft from paid charge, and renders nfse records", () => {
    cy.visit("/nfse");
    cy.getByTestId("nfse-empty-state").should("be.visible");

    cy.visit("/business-profile");
    cy.getByTestId("nfse-readiness-card").should("be.visible");
    cy.getByTestId("nfse-readiness-state").should("contain.text", "Pendente");
    cy.getByTestId("nfse-missing-fields").should("contain.text", "CNPJ");

    cy.get("#businessName").clear().type("Firmus Studio");
    cy.get("#professionalName").clear().type("Ana Silva");
    cy.get("#serviceCity").clear().type("Sao Paulo");
    cy.contains("button", "Salvar perfil").click();

    cy.getByTestId("nfse-readiness-state").should("contain.text", "Pendente");

    cy.visit("/clients");
    cy.get("#name").clear().type("Cliente NFSe");
    cy.get("#email").clear().type("cliente.nfse@firmus.local");
    cy.contains("button", "Criar cliente").click();

    cy.visit("/charges");
    cy.get("#clientId").select("Cliente NFSe");
    cy.get("#amount").clear().type("350.00");
    cy.get("#dueDate").clear().type("2026-04-30");
    cy.get("#status").select("Pago");
    cy.contains("button", "Criar cobrança").click();

    cy.get('[data-testid^="charge-item-"]').first().within(() => {
      cy.get('[data-testid^="charge-prepare-nfse-"]').click();
      cy.get('[data-testid^="charge-prepare-nfse-feedback-"]').should(
        "contain.text",
        "rascunho"
      );
      cy.get('[data-testid^="charge-prepare-nfse-feedback-"]').should(
        "contain.text",
        "Pendências"
      );
    });

    cy.visit("/nfse");
    cy.getByTestId("nfse-records-panel")
      .find('[data-testid^="nfse-record-"]')
      .should("have.length", 1);
    cy.contains("Cliente NFSe").should("be.visible");
    cy.getByTestId("nfse-readiness-state").should("contain.text", "Pendente");
    cy.getByTestId("nfse-empty-state").should("not.exist");
  });
});

export {};
