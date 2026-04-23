describe("Block 32 - Feature flags and plan limits", () => {
  function setPlanTier(win: Window, tier: "free" | "plus" | "pro") {
    win.localStorage.setItem("firmus.plan-state", JSON.stringify({ tier }));
  }

  beforeEach(() => {
    cy.loginFirmus();
    cy.visit("/");
    cy.clearFirmusStorage();
  });

  it("renders the plan page safely and persists plan selection", () => {
    cy.visit("/plan");

    cy.contains("h1", "Plano e limites").should("be.visible");
    cy.getByTestId("plan-manager").should("be.visible");
    cy.getByTestId("plan-tier-plus-button").click();

    cy.visit("/nfse");
    cy.getByTestId("nfse-business-snapshot-panel").should("be.visible");
  });

  it("blocks premium fiscal access on free plan with clear PT-BR feedback", () => {
    cy.visit("/nfse", {
      onBeforeLoad(win) {
        setPlanTier(win, "free");
      },
    });

    cy.getByTestId("nfse-plan-blocked")
      .should("contain.text", "Recurso premium")
      .and("contain.text", "Recurso disponível a partir do plano Plus.");
  });

  it("allows the same premium fiscal feature on plus plan", () => {
    cy.visit("/plan");
    cy.getByTestId("plan-tier-plus-button").click();

    cy.visit("/nfse");
    cy.getByTestId("nfse-business-snapshot-panel").should("be.visible");
    cy.getByTestId("nfse-records-panel").should("be.visible");
  });

  it("enforces the template limit and shows upgrade-safe feedback", () => {
    cy.visit("/templates", {
      onBeforeLoad(win) {
        setPlanTier(win, "free");
      },
    });

    cy.get("#template-name").type("Modelo Free 1");
    cy.get("#template-content").type("Mensagem base do primeiro modelo.");
    cy.contains("button", "Salvar modelo").click();

    cy.contains("li", "Modelo Free 1").should("be.visible");
    cy.getByTestId("template-plan-limit").should("contain.text", "1/1");
    cy.getByTestId("template-limit-feedback").should(
      "contain.text",
      "Você atingiu o limite de modelos do seu plano atual."
    );
    cy.contains("button", "Limite atingido").should("be.disabled");
  });

  it("keeps premium automation available when the plan allows it", () => {
    cy.visit("/plan");
    cy.getByTestId("plan-tier-pro-button").click();

    cy.visit("/automation-rules");
    cy.getByTestId("automation-rules-manager").should("be.visible");
    cy.getByTestId("automation-rule-form").should("be.visible");
  });
});

export {};
