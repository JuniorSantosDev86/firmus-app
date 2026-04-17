import {
  filterActivityLogs,
  formatActivityLogTimestamp,
  getActivityLogCategoryLabel,
  matchesActivityLogSearch,
  normalizeActivityLogCategoryFilter,
  resolveActivityLogCategoryFromAction,
  resolveActivityLogStatusFromAction,
  sortActivityLogsReverseChronological,
  toActivityLogMessage,
  type ActivityLogEntry,
} from "../../lib/domain/activity-log";

describe("Block 25 - Activity Logs (unit helpers)", () => {
  const sampleEntries: ActivityLogEntry[] = [
    {
      id: "entry-older",
      category: "seguranca",
      action: "auth_login_failure",
      occurredAt: "2026-04-10T10:00:00.000Z",
      status: "falha",
      message: "Login falho.",
      actorType: "anonymous",
      actorLabel: "Tentativa (user@firmus.local)",
    },
    {
      id: "entry-newer",
      category: "privacidade",
      action: "privacy_foundation_review_recorded",
      occurredAt: "2026-04-10T10:01:00.000Z",
      status: "sucesso",
      message: "Revisão de privacidade registrada.",
      actorType: "owner",
      actorLabel: "Operador (owner@firmus.local)",
    },
  ];

  it("maps categories and labels correctly", () => {
    expect(resolveActivityLogCategoryFromAction("auth_login_success")).to.eq("seguranca");
    expect(resolveActivityLogCategoryFromAction("privacy_foundation_review_recorded")).to.eq(
      "privacidade"
    );
    expect(resolveActivityLogCategoryFromAction("automation_rule_created")).to.eq("automacao");
    expect(resolveActivityLogCategoryFromAction("quote_approved")).to.eq("operacao");
    expect(getActivityLogCategoryLabel("seguranca")).to.eq("Segurança");
    expect(normalizeActivityLogCategoryFilter("categoria_invalida")).to.eq("todos");
  });

  it("formats action messages and statuses in a deterministic way", () => {
    expect(toActivityLogMessage("auth_login_failure")).to.eq("Login falho.");
    expect(toActivityLogMessage("automation_rule_enabled")).to.eq("Regra ativada.");
    expect(resolveActivityLogStatusFromAction("private_api_access_denied")).to.eq("falha");
    expect(resolveActivityLogStatusFromAction("auth_logout")).to.eq("sucesso");
    expect(formatActivityLogTimestamp("2026-04-10T10:00:00.000Z")).to.match(/\d{2}\/\d{2}\/\d{2}/);
  });

  it("evaluates text search over meaningful readable fields", () => {
    expect(matchesActivityLogSearch(sampleEntries[0], "login")).to.eq(true);
    expect(matchesActivityLogSearch(sampleEntries[0], "tentativa")).to.eq(true);
    expect(matchesActivityLogSearch(sampleEntries[0], "privacidade")).to.eq(false);
  });

  it("sorts entries in reverse chronological order", () => {
    const sorted = sortActivityLogsReverseChronological(sampleEntries);
    expect(sorted[0].id).to.eq("entry-newer");
    expect(sorted[1].id).to.eq("entry-older");
  });

  it("filters by category and query together", () => {
    const byCategory = filterActivityLogs(sampleEntries, {
      category: "privacidade",
    });
    expect(byCategory).to.have.length(1);
    expect(byCategory[0].id).to.eq("entry-newer");

    const byCategoryAndText = filterActivityLogs(sampleEntries, {
      category: "seguranca",
      query: "user@firmus.local",
    });
    expect(byCategoryAndText).to.have.length(1);
    expect(byCategoryAndText[0].id).to.eq("entry-older");
  });
});

export {};
