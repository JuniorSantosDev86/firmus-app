type HealthApiResponse = {
  ok: boolean;
  health: {
    status: "healthy" | "degraded";
    generatedAt: string;
    summary: {
      healthy: number;
      degraded: number;
    };
    signals: Array<{
      id: string;
      label: string;
      status: "healthy" | "degraded";
      message: string;
    }>;
  };
};

type BackupApiResponse = {
  ok: boolean;
  backup: {
    schema: "firmus.secure-store.backup.v1";
    createdAt: string;
    store: {
      version: 1;
      auditEvents: Array<{
        id: string;
      }>;
      privacy: {
        lastReviewedAt: string | null;
      };
    };
  };
  summary: {
    auditEventCount: number;
    lastReviewedAt: string | null;
  };
};

type RestoreApiResponse = {
  ok: boolean;
  dryRun: boolean;
  restored: boolean;
  summary: {
    auditEventCount: number;
    lastReviewedAt: string | null;
  };
};

describe("Block 26 - Observability and Stability (integration API)", () => {
  it("exposes health signals through a protected internal endpoint", () => {
    cy.logoutFirmus();
    cy.request({
      method: "GET",
      url: "/api/internal/observability/health",
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property("ok", false);
    });

    cy.loginFirmus();
    cy.request("/api/internal/observability/health").then((response) => {
      expect(response.status).to.eq(200);
      const payload = response.body as HealthApiResponse;

      expect(payload.ok).to.eq(true);
      expect(["healthy", "degraded"]).to.include(payload.health.status);
      expect(payload.health.signals.length).to.be.greaterThan(0);
      expect(payload.health.summary.healthy + payload.health.summary.degraded).to.eq(
        payload.health.signals.length
      );
    });
  });

  it("supports backup and restore confidence flow with dry-run verification", () => {
    cy.loginFirmus();

    cy.request("/api/internal/observability/backup").then((response) => {
      expect(response.status).to.eq(200);
      const payload = response.body as BackupApiResponse;
      expect(payload.ok).to.eq(true);
      expect(payload.backup.schema).to.eq("firmus.secure-store.backup.v1");
      const baselineBackup = payload.backup;
      const baselineSummary = payload.summary;

      cy.request({
        method: "POST",
        url: "/api/internal/privacy-foundation/review",
        failOnStatusCode: false,
      }).then((reviewResponse) => {
        expect(reviewResponse.status).to.eq(200);
      });

      cy.request("/api/internal/observability/backup").then((nextBackupResponse) => {
        expect(nextBackupResponse.status).to.eq(200);
        const nextBackupPayload = nextBackupResponse.body as BackupApiResponse;
        expect(nextBackupPayload.summary.auditEventCount).to.be.gte(baselineSummary.auditEventCount);
      });

      cy.request({
        method: "POST",
        url: "/api/internal/observability/restore",
        body: {
          backup: baselineBackup,
          dryRun: true,
        },
        failOnStatusCode: false,
      }).then((dryRunRestoreResponse) => {
        expect(dryRunRestoreResponse.status).to.eq(200);
        const dryRunPayload = dryRunRestoreResponse.body as RestoreApiResponse;
        expect(dryRunPayload.ok).to.eq(true);
        expect(dryRunPayload.dryRun).to.eq(true);
        expect(dryRunPayload.restored).to.eq(false);
      });

      cy.request({
        method: "POST",
        url: "/api/internal/observability/restore",
        body: {
          backup: baselineBackup,
        },
        failOnStatusCode: false,
      }).then((restoreResponse) => {
        expect(restoreResponse.status).to.eq(200);
        const restorePayload = restoreResponse.body as RestoreApiResponse;
        expect(restorePayload.ok).to.eq(true);
        expect(restorePayload.dryRun).to.eq(false);
        expect(restorePayload.restored).to.eq(true);
        expect(restorePayload.summary.auditEventCount).to.eq(baselineSummary.auditEventCount);
        expect(restorePayload.summary.lastReviewedAt).to.eq(baselineSummary.lastReviewedAt);
      });
    });
  });

  it("returns controlled failure payload for invalid restore requests", () => {
    cy.loginFirmus();
    cy.request({
      method: "POST",
      url: "/api/internal/observability/restore",
      body: {
        backup: {
          schema: "invalid-schema",
        },
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property("ok", false);
      expect(response.body?.failure?.code).to.eq("OBS_INVALID_BACKUP_PAYLOAD");
      expect(response.body?.failure?.recoverable).to.eq(true);
    });
  });
});

export {};
