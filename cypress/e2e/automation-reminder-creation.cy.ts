const FIXED_NOW = Date.UTC(2026, 3, 15, 12, 0, 0);

function seedBaseStorage(win: Window): void {
  win.localStorage.setItem(
    "firmus.clients",
    JSON.stringify([
      {
        id: "client-automation-1",
        name: "Cliente Automação",
        whatsapp: null,
        email: null,
        city: null,
        notes: null,
        createdAt: "2026-04-01T12:00:00.000Z",
        updatedAt: "2026-04-01T12:00:00.000Z",
      },
    ])
  );

  win.localStorage.setItem("firmus.charges", JSON.stringify([]));
  win.localStorage.setItem("firmus.reminders", JSON.stringify([]));
  win.localStorage.setItem("firmus.timelineEvents", JSON.stringify([]));
  win.localStorage.setItem("firmus.automationRules", JSON.stringify([]));
  win.localStorage.setItem("firmus.automationExecutionLog", JSON.stringify([]));
}

describe("Automatic reminder creation", () => {
  beforeEach(() => {
    cy.loginFirmus();
  });

  it("creates real reminders automatically from event-based rules and protects duplicates", () => {
    cy.clock(FIXED_NOW, ["Date"]);

    cy.visit("/automation-rules", {
      onBeforeLoad(win) {
        seedBaseStorage(win);
      },
    });

    cy.getByTestId("automation-rule-name-input").type("Lembrete automático de cobrança criada");
    cy.getByTestId("automation-rule-trigger-type-select").select("event");
    cy.getByTestId("automation-rule-event-type-select").select("charge_created");
    cy.getByTestId("automation-rule-action-type-select").select("create_reminder_candidate");
    cy.getByTestId("automation-rule-create-button").click();

    cy.visit("/charges");
    cy.get("#amount").clear().type("180.00");
    cy.get("#dueDate").clear().type("2026-04-20");
    cy.contains("button", "Criar cobrança").click();

    cy.visit("/reminders");
    cy.contains("Lembrete automático: acompanhar cobrança").should("be.visible");
    cy.get('[data-testid^="reminder-automation-source-"]').should(
      "contain.text",
      "Gerado por automação"
    );
    cy.get('[data-testid^="reminder-item-"]').should("have.length", 1);

    cy.reload();
    cy.contains("Lembrete automático: acompanhar cobrança").should("be.visible");
    cy.get('[data-testid^="reminder-automation-source-"]').should(
      "contain.text",
      "Gerado por automação"
    );
    cy.get('[data-testid^="reminder-item-"]').should("have.length", 1);

    cy.window().then((win) => {
      const remindersRaw = win.localStorage.getItem("firmus.reminders");
      expect(remindersRaw).to.not.equal(null);

      const reminders = JSON.parse(remindersRaw ?? "[]") as Array<Record<string, unknown>>;
      expect(reminders).to.have.length(1);
      expect(reminders[0].sourceType).to.eq("automation_rule");
      expect(String(reminders[0].sourceRuleId ?? "")).to.not.eq("");
      expect(String(reminders[0].sourceFingerprint ?? "")).to.contain(":event:");

      const timelineRaw = win.localStorage.getItem("firmus.timelineEvents");
      expect(timelineRaw).to.not.equal(null);

      const timeline = JSON.parse(timelineRaw ?? "[]") as Array<Record<string, unknown>>;
      const reminderCreatedEvents = timeline.filter((event) => event.type === "reminder_created");
      expect(reminderCreatedEvents).to.have.length(1);
    });

    cy.visit("/automation-rules");
    cy.getByTestId("automation-rules-execute-button").click();
    cy.getByTestId("automation-rules-execution-summary")
      .should("contain.text", "Criados: 0")
      .and("contain.text", "Duplicados: 1");

    cy.window().then((win) => {
      const reminders = JSON.parse(win.localStorage.getItem("firmus.reminders") ?? "[]") as Array<
        Record<string, unknown>
      >;
      expect(reminders).to.have.length(1);

      const timeline = JSON.parse(win.localStorage.getItem("firmus.timelineEvents") ?? "[]") as Array<
        Record<string, unknown>
      >;
      const reminderCreatedEvents = timeline.filter((event) => event.type === "reminder_created");
      expect(reminderCreatedEvents).to.have.length(1);
    });
  });

  it("executes derived-condition matches deterministically and keeps inactive/preview actions as no-op", () => {
    cy.clock(FIXED_NOW, ["Date"]);

    cy.visit("/automation-rules", {
      onBeforeLoad(win) {
        seedBaseStorage(win);

        win.localStorage.setItem(
          "firmus.charges",
          JSON.stringify([
            {
              id: "charge-overdue-1",
              clientId: "client-automation-1",
              amountInCents: 25000,
              dueDate: "2026-04-10T00:00:00.000Z",
              status: "pending",
              createdAt: "2026-04-01T10:00:00.000Z",
              updatedAt: "2026-04-10T10:00:00.000Z",
            },
          ])
        );

        win.localStorage.setItem(
          "firmus.automationRules",
          JSON.stringify([
            {
              id: "rule-derived-candidate-active",
              name: "Derivada ativa que cria lembrete",
              isActive: true,
              triggerType: "derived_condition",
              triggerConfig: { conditionType: "charge_overdue" },
              actionType: "create_reminder_candidate",
              actionConfig: {},
              createdAt: "2026-04-01T12:00:00.000Z",
              updatedAt: "2026-04-01T12:00:00.000Z",
            },
            {
              id: "rule-derived-preview-active",
              name: "Derivada ativa de prévia",
              isActive: true,
              triggerType: "derived_condition",
              triggerConfig: { conditionType: "charge_overdue" },
              actionType: "create_reminder_preview",
              actionConfig: {},
              createdAt: "2026-04-01T12:00:00.000Z",
              updatedAt: "2026-04-01T12:00:00.000Z",
            },
            {
              id: "rule-derived-candidate-inactive",
              name: "Derivada inativa",
              isActive: false,
              triggerType: "derived_condition",
              triggerConfig: { conditionType: "charge_overdue" },
              actionType: "create_reminder_candidate",
              actionConfig: {},
              createdAt: "2026-04-01T12:00:00.000Z",
              updatedAt: "2026-04-01T12:00:00.000Z",
            },
          ])
        );
      },
    });

    cy.getByTestId("automation-rules-execute-button").click();
    cy.getByTestId("automation-rules-execution-summary")
      .should("contain.text", "Criados: 1")
      .and("contain.text", "Duplicados: 0")
      .and("contain.text", "Não executáveis: 1");

    cy.visit("/reminders");
    cy.contains("Lembrete automático: follow-up de cobrança em atraso").should("be.visible");
    cy.get('[data-testid^="reminder-automation-source-"]').should("be.visible");

    cy.window().then((win) => {
      const reminders = JSON.parse(win.localStorage.getItem("firmus.reminders") ?? "[]") as Array<
        Record<string, unknown>
      >;
      expect(reminders).to.have.length(1);
      expect(reminders[0].sourceType).to.eq("automation_rule");

      const timeline = JSON.parse(win.localStorage.getItem("firmus.timelineEvents") ?? "[]") as Array<
        Record<string, unknown>
      >;
      const reminderCreatedEvents = timeline.filter((event) => event.type === "reminder_created");
      expect(reminderCreatedEvents).to.have.length(1);
    });

    cy.visit("/automation-rules");
    cy.getByTestId("automation-rules-execute-button").click();
    cy.getByTestId("automation-rules-execution-summary")
      .should("contain.text", "Criados: 0")
      .and("contain.text", "Duplicados: 1")
      .and("contain.text", "Não executáveis: 1");

    cy.window().then((win) => {
      const reminders = JSON.parse(win.localStorage.getItem("firmus.reminders") ?? "[]") as Array<
        Record<string, unknown>
      >;
      expect(reminders).to.have.length(1);

      const timeline = JSON.parse(win.localStorage.getItem("firmus.timelineEvents") ?? "[]") as Array<
        Record<string, unknown>
      >;
      const reminderCreatedEvents = timeline.filter((event) => event.type === "reminder_created");
      expect(reminderCreatedEvents).to.have.length(1);
    });
  });
});

export {};
