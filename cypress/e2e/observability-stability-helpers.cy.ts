import {
  buildObservabilityHealthReport,
  isSecureStoreBackupEnvelope,
  ObservabilityStabilityError,
  summarizeSecureStoreBackup,
  toControlledObservabilityFailure,
  type SecureStoreBackupEnvelope,
} from "../../lib/domain/observability-stability";

describe("Block 26 - Observability and Stability (unit helpers)", () => {
  it("builds deterministic health summary from signal statuses", () => {
    const report = buildObservabilityHealthReport(
      [
        {
          id: "signal-1",
          label: "Signal 1",
          status: "healthy",
          message: "ok",
        },
        {
          id: "signal-2",
          label: "Signal 2",
          status: "degraded",
          message: "degraded",
        },
      ],
      "2026-04-19T00:00:00.000Z"
    );

    expect(report.status).to.eq("degraded");
    expect(report.summary.healthy).to.eq(1);
    expect(report.summary.degraded).to.eq(1);
    expect(report.generatedAt).to.eq("2026-04-19T00:00:00.000Z");
  });

  it("validates and summarizes backup envelope shape", () => {
    const backup: SecureStoreBackupEnvelope = {
      schema: "firmus.secure-store.backup.v1",
      createdAt: "2026-04-19T00:00:00.000Z",
      store: {
        version: 1,
        auditEvents: [
          {
            id: "record-1",
            action: "auth_login_success",
            actorType: "owner",
            actorId: "owner",
            route: "/api/auth/login",
            metadata: {},
            occurredAt: "2026-04-19T00:00:00.000Z",
          },
        ],
        privacy: {
          lastReviewedAt: "2026-04-19T00:00:00.000Z",
        },
      },
    };

    expect(isSecureStoreBackupEnvelope(backup)).to.eq(true);
    expect(summarizeSecureStoreBackup(backup)).to.deep.eq({
      auditEventCount: 1,
      lastReviewedAt: "2026-04-19T00:00:00.000Z",
    });
    expect(
      isSecureStoreBackupEnvelope({
        schema: "invalid-schema",
      })
    ).to.eq(false);
  });

  it("shapes controlled failures without leaking internal stack details", () => {
    const controlled = toControlledObservabilityFailure(
      new ObservabilityStabilityError(
        "OBS_INVALID_BACKUP_PAYLOAD",
        "Payload inválido para restore.",
        400,
        true
      )
    );

    expect(controlled).to.deep.eq({
      code: "OBS_INVALID_BACKUP_PAYLOAD",
      message: "Payload inválido para restore.",
      recoverable: true,
      status: 400,
    });

    const unexpected = toControlledObservabilityFailure(new Error("boom"));
    expect(unexpected.code).to.eq("OBS_UNEXPECTED");
    expect(unexpected.status).to.eq(500);
    expect(unexpected.recoverable).to.eq(false);
  });
});

export {};
