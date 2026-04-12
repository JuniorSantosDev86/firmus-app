/// <reference types="cypress" />
/* eslint-disable @typescript-eslint/no-namespace */

Cypress.Commands.add("clearFirmusStorage", () => {
  cy.window().then((win) => {
    Object.keys(win.localStorage)
      .filter((key) => key.startsWith("firmus."))
      .forEach((key) => win.localStorage.removeItem(key));
  });
});

Cypress.Commands.add("getByTestId", (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`);
});

declare global {
  namespace Cypress {
    interface Chainable {
      clearFirmusStorage(): Chainable<void>;
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

export {};
