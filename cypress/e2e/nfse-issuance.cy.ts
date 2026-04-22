describe("Block 30 - NFSe issuance flow", () => {
  beforeEach(() => {
    cy.loginFirmus();
    cy.visit("/");
    cy.clearFirmusStorage();
  });

  function seedReadyNFSeRecord(recordId: string, chargeId: string) {
    cy.window().then((win) => {
      const now = "2026-04-22T10:00:00.000Z";

      win.localStorage.setItem(
        "firmus.business-profile",
        JSON.stringify({
          id: "default",
          businessName: "Firmus Studio",
          professionalName: "Ana",
          shortDescription: null,
          city: "São Paulo",
          whatsapp: null,
          logoUrl: null,
          cnpj: "12.345.678/0001-90",
          municipalRegistration: "IM-001",
          serviceCity: "São Paulo",
          taxRegime: "mei",
          createdAt: now,
          updatedAt: now,
        })
      );

      win.localStorage.setItem(
        "firmus.nfse-records",
        JSON.stringify([
          {
            id: recordId,
            chargeId,
            clientId: "client-1",
            amountInCents: 35000,
            description: "Consultoria mensal",
            competenceDate: "2026-04-30T00:00:00.000Z",
            serviceCity: "São Paulo",
            issueStatus: "ready",
            serviceSnapshot: {
              source: "charge",
              chargeDueDate: "2026-04-30T00:00:00.000Z",
              description: "Consultoria mensal",
            },
            clientSnapshot: {
              name: "Cliente NFSe",
              email: "cliente.nfse@firmus.local",
              city: "Campinas",
            },
            businessSnapshot: {
              businessName: "Firmus Studio",
              cnpj: "12.345.678/0001-90",
              municipalRegistration: "IM-001",
              serviceCity: "São Paulo",
              taxRegime: "mei",
            },
            createdAt: now,
            updatedAt: now,
          },
        ])
      );
    });
  }

  it("issues NFSe successfully and shows operational result", () => {
    const recordId = "nfse-ready-success";
    seedReadyNFSeRecord(recordId, "charge-success");

    cy.visit("/nfse");
    cy.getByTestId(`nfse-issue-action-${recordId}`).click();

    cy.getByTestId(`nfse-record-${recordId}`).within(() => {
      cy.get('[data-testid="nfse-status-issued"]').should("be.visible");
      cy.get(`[data-testid="nfse-record-document-${recordId}"]`).should("contain.text", "NF-");
      cy.get(`[data-testid="nfse-record-provider-reference-${recordId}"]`).should(
        "contain.text",
        "PROTO-"
      );
      cy.get(`[data-testid="nfse-issue-feedback-${recordId}"]`).should(
        "contain.text",
        "emitida com sucesso"
      );
    });
  });

  it("handles provider failure and shows readable error state", () => {
    const recordId = "nfse-ready-failure";
    seedReadyNFSeRecord(recordId, "charge-failure");

    cy.window().then((win) => {
      win.localStorage.setItem("firmus.nfse.mock-issuance-mode", "failure");
    });

    cy.visit("/nfse");
    cy.getByTestId(`nfse-issue-action-${recordId}`).click();

    cy.getByTestId(`nfse-record-${recordId}`).within(() => {
      cy.get('[data-testid="nfse-status-failed"]').should("be.visible");
      cy.get(`[data-testid="nfse-record-last-error-${recordId}"]`).should(
        "contain.text",
        "Não foi possível emitir a NFSe"
      );
      cy.get(`[data-testid="nfse-issue-feedback-${recordId}"]`).should(
        "contain.text",
        "Não foi possível emitir a NFSe"
      );
    });
  });
});

export {};

