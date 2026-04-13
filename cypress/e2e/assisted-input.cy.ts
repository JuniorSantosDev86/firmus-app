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
