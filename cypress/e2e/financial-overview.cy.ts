function isoDate(daysFromToday: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + daysFromToday);
  return date.toISOString();
}

describe("Financial Overview", () => {
  it("shows derived totals for available today, next 7 days, and overdue", () => {
    cy.visit("/financial-overview", {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          "firmus.charges",
          JSON.stringify([
            {
              id: "charge-overdue",
              clientId: "c-1",
              amountInCents: 10000,
              dueDate: isoDate(-1),
              status: "pending",
              createdAt: isoDate(-5),
              updatedAt: isoDate(-1),
            },
            {
              id: "charge-today",
              clientId: "c-1",
              amountInCents: 20000,
              dueDate: isoDate(0),
              status: "pending",
              createdAt: isoDate(-3),
              updatedAt: isoDate(0),
            },
            {
              id: "charge-next-3",
              clientId: "c-1",
              amountInCents: 30000,
              dueDate: isoDate(3),
              status: "pending",
              createdAt: isoDate(-2),
              updatedAt: isoDate(0),
            },
            {
              id: "charge-next-9",
              clientId: "c-1",
              amountInCents: 40000,
              dueDate: isoDate(9),
              status: "pending",
              createdAt: isoDate(-2),
              updatedAt: isoDate(0),
            },
            {
              id: "charge-paid",
              clientId: "c-1",
              amountInCents: 50000,
              dueDate: isoDate(-2),
              status: "paid",
              createdAt: isoDate(-6),
              updatedAt: isoDate(-1),
            },
          ])
        );
      },
    });

    cy.contains("h1", "Visão financeira").should("be.visible");

    cy.getByTestId("overview-available-today").within(() => {
      cy.contains("Disponível hoje").should("be.visible");
      cy.contains(/R\$\s*300,00/).should("be.visible");
    });

    cy.getByTestId("overview-receivable-7-days").within(() => {
      cy.contains("A receber em 7 dias").should("be.visible");
      cy.contains(/R\$\s*300,00/).should("be.visible");
    });

    cy.getByTestId("overview-overdue").within(() => {
      cy.contains("Valor em atraso").should("be.visible");
      cy.contains(/R\$\s*100,00/).should("be.visible");
    });
  });
});

export {};
