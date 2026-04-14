const FIXED_NOW = Date.UTC(2026, 3, 13, 12, 0, 0);

type ClientSeed = {
  id: string;
  name: string;
  whatsapp: string | null;
  email: string | null;
  city: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

const SEEDED_CLIENTS: ClientSeed[] = [
  {
    id: "client-ana",
    name: "Ana Silva",
    whatsapp: null,
    email: "ana@example.com",
    city: "São Paulo",
    notes: null,
    createdAt: "2026-04-01T10:00:00.000Z",
    updatedAt: "2026-04-01T10:00:00.000Z",
  },
];

function seedAssistedInputPrerequisites(win: Window): void {
  win.localStorage.setItem("firmus.clients", JSON.stringify(SEEDED_CLIENTS));
  win.localStorage.setItem("firmus.charges", JSON.stringify([]));
  win.localStorage.setItem("firmus.reminders", JSON.stringify([]));
  win.localStorage.setItem("firmus.timelineEvents", JSON.stringify([]));
}

function readStoredArray<T>(win: Window, key: string): T[] {
  const raw = win.localStorage.getItem(key);
  if (!raw) {
    return [];
  }

  const parsed = JSON.parse(raw) as unknown;
  return Array.isArray(parsed) ? (parsed as T[]) : [];
}

describe("Assisted Input", () => {
  it("loads safely with guidance", () => {
    cy.clock(FIXED_NOW, ["Date"]);

    cy.visit("/assisted-input", {
      onBeforeLoad(win) {
        seedAssistedInputPrerequisites(win);
      },
    });

    cy.contains("h1", "Entrada assistida").should("be.visible");
    cy.contains("p", "Digite uma instrução curta, revise o que foi entendido").should("be.visible");
    cy.contains("h2", "Digite sua instrução").should("be.visible");
    cy.contains("Entrada assistida pronta para interpretar instruções curtas").should("be.visible");
  });

  it("parses reminder-like instruction without creating entity before confirmation", () => {
    cy.clock(FIXED_NOW, ["Date"]);

    cy.visit("/assisted-input", {
      onBeforeLoad(win) {
        seedAssistedInputPrerequisites(win);
      },
    });

    cy.get("textarea").type("Lembrete de follow-up com Ana hoje");
    cy.contains("button", "Interpretar").click();

    cy.contains("h2", "O que entendi").should("be.visible");
    cy.contains("Intento:").should("be.visible");
    cy.contains("Criar lembrete").should("be.visible");
    cy.contains("Ajuste os campos antes de confirmar").should("be.visible");
    cy.contains("label", "Título").should("be.visible");

    cy.window().then((win) => {
      const reminders = readStoredArray(win, "firmus.reminders");
      expect(reminders).to.have.length(0);
    });
  });

  it("parses quote intent in PT-BR with amount, client, title and inferred due date", () => {
    cy.clock(FIXED_NOW, ["Date"]);

    cy.visit("/assisted-input", {
      onBeforeLoad(win) {
        seedAssistedInputPrerequisites(win);
      },
    });

    cy.get("textarea").type(
      "Cria um orçamento de 250 reais para o João, referente a uma manutenção de ar condicionado com vencimento dia 25 próximo"
    );
    cy.contains("button", "Interpretar").click();

    cy.contains("p", "Intento: Criar orçamento").should("be.visible");
    cy.contains("p", "Cliente: João").should("be.visible");
    cy.contains("p", "Valor: R$ 250,00").should("be.visible");
    cy.contains("p", "Vencimento: 2026-04-25").should("be.visible");
    cy.contains("p", "Título: manutenção de ar condicionado").should("be.visible");
    cy.contains("p", /^Confiança:\s+(high|medium)$/).should("be.visible");
    cy.contains("li", "O mês do vencimento foi inferido automaticamente. Confirme antes de criar.").should(
      "be.visible"
    );
    cy.contains("li", "Não identifiquei o valor com segurança.").should("not.exist");
  });

  it("parses charge intent with tomorrow due date", () => {
    cy.clock(FIXED_NOW, ["Date"]);

    cy.visit("/assisted-input", {
      onBeforeLoad(win) {
        seedAssistedInputPrerequisites(win);
      },
    });

    cy.get("textarea").type("Criar cobrança para Ana de R$ 90 com vencimento amanhã");
    cy.contains("button", "Interpretar").click();

    cy.contains("p", "Intento: Criar cobrança").should("be.visible");
    cy.contains("p", "Valor: R$ 90,00").should("be.visible");
    cy.contains("p", "Vencimento: 2026-04-14").should("be.visible");
  });

  it("parses reminder follow-up with today date", () => {
    cy.clock(FIXED_NOW, ["Date"]);

    cy.visit("/assisted-input", {
      onBeforeLoad(win) {
        seedAssistedInputPrerequisites(win);
      },
    });

    cy.get("textarea").type("Lembrete de follow-up com Bruno hoje");
    cy.contains("button", "Interpretar").click();

    cy.contains("p", "Intento: Criar lembrete").should("be.visible");
    cy.contains("p", "Cliente: Bruno").should("be.visible");
    cy.contains("p", "Vencimento: 2026-04-13").should("be.visible");
  });

  it("keeps warnings unique and avoids duplicate-key console errors", () => {
    cy.clock(FIXED_NOW, ["Date"]);

    cy.visit("/assisted-input", {
      onBeforeLoad(win) {
        seedAssistedInputPrerequisites(win);
        cy.spy(win.console, "error").as("consoleError");
      },
    });

    cy.get("textarea").type("Organizar pendências internas da semana");
    cy.contains("button", "Interpretar").click();

    cy.contains("li", "Não identifiquei a intenção com segurança.").should("have.length", 1);

    cy.get("@consoleError").then((consoleError) => {
      const calls = (
        consoleError as unknown as { getCalls: () => Array<{ args: unknown[] }> }
      ).getCalls();
      const duplicateKeyError = calls.some((call) =>
        call.args.some(
          (arg) =>
            typeof arg === "string" &&
            arg.includes("Encountered two children with the same key")
        )
      );

      expect(duplicateKeyError).to.eq(false);
    });
  });

  it("keeps partial parsing for incomplete quote instruction with lower confidence", () => {
    cy.clock(FIXED_NOW, ["Date"]);

    cy.visit("/assisted-input", {
      onBeforeLoad(win) {
        seedAssistedInputPrerequisites(win);
      },
    });

    cy.get("textarea").type("Criar orçamento para João");
    cy.contains("button", "Interpretar").click();

    cy.contains("p", "Intento: Criar orçamento").should("be.visible");
    cy.contains("p", "Cliente: João").should("be.visible");
    cy.contains("p", "Valor: —").should("be.visible");
    cy.contains("p", /^Confiança:\s+(medium|low)$/).should("be.visible");
    cy.contains("li", "Não identifiquei o valor com segurança.").should("be.visible");
  });

  it("does not confuse day-of-month with amount", () => {
    cy.clock(FIXED_NOW, ["Date"]);

    cy.visit("/assisted-input", {
      onBeforeLoad(win) {
        seedAssistedInputPrerequisites(win);
      },
    });

    cy.get("textarea").type("Lembrete de follow-up com Bruno dia 25");
    cy.contains("button", "Interpretar").click();

    cy.contains("p", "Valor: —").should("be.visible");
    cy.contains("p", "Vencimento: 2026-04-25").should("be.visible");
  });

  it("parses charge-like instruction without creating entity before confirmation", () => {
    cy.clock(FIXED_NOW, ["Date"]);

    cy.visit("/assisted-input", {
      onBeforeLoad(win) {
        seedAssistedInputPrerequisites(win);
      },
    });

    cy.get("textarea").type("Criar cobrança para Ana de R$ 250,00 para 15/04/2026");
    cy.contains("button", "Interpretar").click();

    cy.contains("h2", "O que entendi").should("be.visible");
    cy.contains("Intento:").should("be.visible");
    cy.contains("Criar cobrança").should("be.visible");
    cy.contains("Valor:").should("be.visible");
    cy.contains("R$ 250,00").should("be.visible");
    cy.contains("Vencimento:").should("be.visible");
    cy.contains("2026-04-15").should("be.visible");

    cy.window().then((win) => {
      const charges = readStoredArray(win, "firmus.charges");
      expect(charges).to.have.length(0);
    });
  });

  it("shows safe fallback for ambiguous text", () => {
    cy.clock(FIXED_NOW, ["Date"]);

    cy.visit("/assisted-input", {
      onBeforeLoad(win) {
        seedAssistedInputPrerequisites(win);
      },
    });

    cy.get("textarea").type("Organizar pendências internas da semana");
    cy.contains("button", "Interpretar").click();

    cy.contains("h2", "O que entendi").should("be.visible");
    cy.contains("Não consegui interpretar com segurança.").should("be.visible");
    cy.contains("button", "Confirmar criação").should("not.exist");

    cy.window().then((win) => {
      const reminders = readStoredArray(win, "firmus.reminders");
      const charges = readStoredArray(win, "firmus.charges");

      expect(reminders).to.have.length(0);
      expect(charges).to.have.length(0);
    });
  });

  it("confirms reminder creation through real flow", () => {
    cy.clock(FIXED_NOW, ["Date"]);

    cy.visit("/assisted-input", {
      onBeforeLoad(win) {
        seedAssistedInputPrerequisites(win);
      },
    });

    cy.get("textarea").type("Lembrete para Ana hoje");
    cy.contains("button", "Interpretar").click();

    cy.window().then((win) => {
      const reminders = readStoredArray(win, "firmus.reminders");
      expect(reminders).to.have.length(0);
    });

    cy.contains("button", "Confirmar criação").click();
    cy.contains("Lembrete criada com sucesso").should("be.visible");

    cy.window().then((win) => {
      const reminders = readStoredArray<Record<string, unknown>>(win, "firmus.reminders");
      expect(reminders).to.have.length(1);
      expect(reminders[0].title).to.contain("Ana");
      expect(reminders[0].clientId).to.eq("client-ana");
      expect(String(reminders[0].dueDate)).to.contain("2026-04-13");
    });
  });

  it("confirms charge creation through real flow", () => {
    cy.clock(FIXED_NOW, ["Date"]);

    cy.visit("/assisted-input", {
      onBeforeLoad(win) {
        seedAssistedInputPrerequisites(win);
      },
    });

    cy.get("textarea").type("Criar cobrança para Ana de R$ 320,50 para 16/04/2026");
    cy.contains("button", "Interpretar").click();

    cy.window().then((win) => {
      const charges = readStoredArray(win, "firmus.charges");
      expect(charges).to.have.length(0);
    });

    cy.contains("label", "Cliente")
      .parent()
      .find("select")
      .select("Ana Silva");
    cy.contains("button", "Confirmar criação").should("not.be.disabled");
    cy.contains("button", "Confirmar criação").click();
    cy.contains("Cobrança criada com sucesso").should("be.visible");

    cy.window().then((win) => {
      const charges = readStoredArray<Record<string, unknown>>(win, "firmus.charges");
      expect(charges).to.have.length(1);
      expect(charges[0].clientId).to.eq("client-ana");
      expect(charges[0].amountInCents).to.eq(32050);
      expect(String(charges[0].dueDate)).to.contain("2026-04-16");
    });
  });
});

export {};
