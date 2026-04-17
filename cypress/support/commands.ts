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

Cypress.Commands.add("loginFirmus", () => {
  const username = "owner@firmus.local";
  const password = "firmus-owner-123";

  cy.request({
    method: "POST",
    url: "/api/auth/login",
    body: { username, password },
    failOnStatusCode: false,
  }).then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body).to.have.property("ok", true);
  });
});

Cypress.Commands.add("logoutFirmus", () => {
  cy.request({
    method: "POST",
    url: "/api/auth/logout",
    failOnStatusCode: false,
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      clearFirmusStorage(): Chainable<void>;
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;
      loginFirmus(): Chainable<void>;
      logoutFirmus(): Chainable<void>;
    }
  }
}

export {};
