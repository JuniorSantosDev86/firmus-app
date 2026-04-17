type ActivityLogsApiResponse = {
  ok: boolean;
  entries: Array<{
    id: string;
    category: string;
    action: string;
    occurredAt: string;
    status: string;
    message: string;
    actorType: string;
    actorLabel: string | null;
  }>;
  totalMatched: number;
  hasMore: boolean;
  limit: number;
};

describe("Block 25 - Activity Logs (integration API)", () => {
  it("protects server-side read access to activity logs", () => {
    cy.logoutFirmus();

    cy.request({
      method: "GET",
      url: "/api/internal/activity-logs",
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property("ok", false);
    });
  });

  it("supports append/read behavior via the audit-backed source", () => {
    const marker = `append-read-${Date.now()}@firmus.local`;

    cy.logoutFirmus();
    cy.request({
      method: "POST",
      url: "/api/auth/login",
      body: {
        username: marker,
        password: "senha-invalida",
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
    });

    cy.loginFirmus();
    cy.request({
      method: "GET",
      url: `/api/internal/activity-logs?q=${encodeURIComponent(marker)}`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(200);
      const payload = response.body as ActivityLogsApiResponse;

      expect(payload.ok).to.eq(true);
      expect(payload.entries.length).to.be.greaterThan(0);
      expect(payload.entries.some((entry) => entry.action === "auth_login_failure")).to.eq(true);
    });
  });

  it("normalizes Block 24 security records into ActivityLogEntry shape", () => {
    cy.loginFirmus();
    cy.request({
      method: "POST",
      url: "/api/internal/privacy-foundation/review",
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(200);
    });

    cy.request({
      method: "GET",
      url: "/api/internal/activity-logs?category=privacidade&limit=5",
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(200);
      const payload = response.body as ActivityLogsApiResponse;

      expect(payload.entries.length).to.be.greaterThan(0);
      expect(payload.entries[0]).to.have.property("id");
      expect(payload.entries[0]).to.have.property("category", "privacidade");
      expect(payload.entries[0]).to.have.property("message");
      expect(payload.entries[0]).to.have.property("occurredAt");
      expect(payload.entries[0]).to.have.property("status");
      expect(payload.entries[0]).to.have.property("actorType");
    });
  });

  it("applies pagination/limit and returns deterministic reverse-chronological data", () => {
    cy.loginFirmus();
    cy.request({
      method: "POST",
      url: "/api/auth/logout",
      followRedirect: false,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(303);
    });
    cy.loginFirmus();

    cy.request({
      method: "GET",
      url: "/api/internal/activity-logs?category=seguranca&limit=1",
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(200);
      const payload = response.body as ActivityLogsApiResponse;

      expect(payload.limit).to.eq(1);
      expect(payload.entries.length).to.be.at.most(1);
      expect(payload.totalMatched).to.be.greaterThan(0);
      expect(payload.hasMore).to.eq(payload.totalMatched > 1);
    });

    cy.request({
      method: "GET",
      url: "/api/internal/activity-logs?limit=20",
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(200);
      const payload = response.body as ActivityLogsApiResponse;
      const times = payload.entries.map((entry) => Date.parse(entry.occurredAt));

      for (let index = 0; index < times.length - 1; index += 1) {
        expect(times[index]).to.be.at.least(times[index + 1]);
      }
    });
  });

  it("retrieves filtered server-side results correctly", () => {
    cy.loginFirmus();
    cy.request({
      method: "GET",
      url: "/api/internal/activity-logs?category=seguranca&q=login",
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(200);
      const payload = response.body as ActivityLogsApiResponse;

      expect(payload.ok).to.eq(true);
      expect(payload.entries.length).to.be.greaterThan(0);
      expect(payload.entries.every((entry) => entry.category === "seguranca")).to.eq(true);
      expect(payload.entries.every((entry) => entry.message.toLowerCase().includes("login"))).to.eq(true);
    });
  });
});

export {};
