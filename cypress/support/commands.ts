/// <reference types="cypress" />
/* eslint-disable @typescript-eslint/no-namespace */

Cypress.Commands.add("clearFirmusStorage", () => {
  cy.window().then((win) => {
    Object.keys(win.localStorage)
      .filter((key) => key.startsWith("firmus."))
      .forEach((key) => win.localStorage.removeItem(key));
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      clearFirmusStorage(): Chainable<void>;
    }
  }
}

export {};
